import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateQFPairings, getKnockoutWinner, generateKoId } from '../utils/knockoutUtils'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'

const getIsTest = () => {
  return typeof globalThis !== 'undefined' && (
    globalThis.__vitest_environment__ || 
    typeof globalThis.vi !== 'undefined' || 
    globalThis.process?.env?.NODE_ENV === 'test'
  ) && !globalThis.__RUN_INTEGRATION_TESTS__
}

const saveToFirestore = async (state) => {
  if (getIsTest()) return
  try {
    await setDoc(doc(db, 'settings', 'knockout'), {
      step: state.step,
      qualifiedTeams: state.qualifiedTeams,
      knockoutMatches: state.knockoutMatches,
      champion: state.champion,
    })
  } catch (err) {
    console.error('[KnockoutStore] save error:', err)
  }
}

/**
 * Zustand store for the Knockout Stage.
 * Persisted to localStorage & synchronized with Firestore settings/knockout.
 * Key: 'nkhbat-knockout-v1'
 *
 * step:
 *   0 = initial / group stage not complete
 *   1 = qualified teams review
 *   2 = QF pairings review (pre-confirm)
 *   3 = active knockout match management
 */
export const useKnockoutStore = create(
  persist(
    (set, get) => {
      const setAndSync = (updater) => {
        set(updater)
        saveToFirestore(get())
      }

      return {
        step: 3,
        qualifiedTeams: [],   // [{seed, teamId, name, logo, color, group, pts, gd, gf, qualifyType}]
        knockoutMatches: [],  // KO match objects (all rounds stored here)
        champion: null,       // teamId of tournament champion after Final
        unsub: null,

        // ─── Realtime Firebase Sync ───────────────────────────────────────
        listenToFirestore: () => {
          if (getIsTest()) return
          if (get().unsub) return

          const unsub = onSnapshot(
            doc(db, 'settings', 'knockout'),
            (snapshot) => {
              if (snapshot.exists()) {
                const data = snapshot.data()
                set({
                  step: data.step ?? 3,
                  qualifiedTeams: data.qualifiedTeams || [],
                  knockoutMatches: data.knockoutMatches || [],
                  champion: data.champion || null,
                })
              }
            },
            (err) => {
              console.error('[KnockoutStore] listen error:', err)
            }
          )
          set({ unsub })
        },

        cleanup: () => {
          const { unsub } = get()
          if (unsub) {
            unsub()
            set({ unsub: null })
          }
        },

        // ─── Step management ──────────────────────────────────────────────

        /**
         * Initialize knockout with computed qualified teams → go to step 1.
         * Resets any previous state.
         */
        initKnockout: (qualifiedTeams) => {
          setAndSync({
            step: 1,
            qualifiedTeams,
            knockoutMatches: [],
            champion: null,
          })
        },

        /**
         * Replace a qualified team at a given index (admin manual override).
         * Accepts a full team object: {teamId, name, logo, color, group, pts, gd, gf}
         */
        replaceQualifiedTeam: (index, teamData) => {
          setAndSync((state) => {
            const updated = state.qualifiedTeams.map((t, i) => {
              if (i === index) {
                return { ...t, ...teamData, seed: t.seed }
              }
              if (teamData.teamId && t.teamId === teamData.teamId) {
                return {
                  ...t,
                  teamId: null,
                  name: '',
                  logo: null,
                  color: null,
                  group: '',
                  pts: 0,
                  gd: 0,
                  gf: 0,
                  qualifyType: 'manual',
                }
              }
              return t
            })
            return { qualifiedTeams: updated }
          })
        },

        /**
         * Generate QF pairings from current qualified teams → go to step 2.
         */
        goToStep2: () => {
          const { qualifiedTeams } = get()
          const qfMatches = generateQFPairings(qualifiedTeams)
          setAndSync({ step: 2, knockoutMatches: qfMatches })
        },

        /** Go back to step 1 (qualified teams review). */
        goToStep1: () => setAndSync({ step: 1 }),

        /**
         * Update a QF match while in the pre-confirm step 2.
         */
        updatePreConfirmMatch: (id, changes) => {
          setAndSync((state) => ({
            knockoutMatches: state.knockoutMatches.map((m) =>
              m.id === id ? { ...m, ...changes } : m
            ),
          }))
        },

        /**
         * Confirm the bracket → move to step 3 (active management).
         */
        confirmBracket: () => setAndSync({ step: 3 }),

        /** Hard reset — wipes all knockout state back to step 3. */
        resetKnockout: () => {
          setAndSync({
            step: 3,
            qualifiedTeams: [],
            knockoutMatches: [],
            champion: null,
          })
        },

        // ─── Match operations (step 3) ────────────────────────────────────

        /** Update schedule (date/time/venue) of any KO match. */
        updateKOMatchSchedule: (id, { date, time, venue }) => {
          setAndSync((state) => ({
            knockoutMatches: state.knockoutMatches.map((m) =>
              m.id === id ? { ...m, date, time, venue: (venue || '').trim() } : m
            ),
          }))
        },

        /** Update teams and/or schedule fields on any KO match. */
        updateKOMatch: (id, changes) => {
          setAndSync((state) => ({
            knockoutMatches: state.knockoutMatches.map((m) =>
              m.id === id ? { ...m, ...changes } : m
            ),
          }))
        },

        /** Mark a match as live (status → 'live'). */
        setKOMatchLive: (id) => {
          setAndSync((state) => ({
            knockoutMatches: state.knockoutMatches.map((m) =>
              m.id === id
                ? {
                    ...m,
                    status: 'live',
                    result: {
                      scoreA: 0,
                      scoreB: 0,
                      penaltyWinner: null,
                      scorers: [],
                      yellowCards: [],
                      redCards: [],
                    },
                  }
                : m
            ),
          }))
        },

        /** Update live score (in-progress, does not complete the match). */
        updateKOLiveScore: (id, { scoreA, scoreB }) => {
          setAndSync((state) => ({
            knockoutMatches: state.knockoutMatches.map((m) =>
              m.id === id
                ? {
                    ...m,
                    result: {
                      ...(m.result || {}),
                      scoreA: Number(scoreA) || 0,
                      scoreB: Number(scoreB) || 0,
                    },
                  }
                : m
            ),
          }))
        },

        /** Postpone a match. */
        postponeKOMatch: (id) => {
          setAndSync((state) => ({
            knockoutMatches: state.knockoutMatches.map((m) =>
              m.id === id ? { ...m, status: 'postponed', result: null } : m
            ),
          }))
        },

        /** Restore a postponed match to scheduled. */
        restoreKOMatch: (id) => {
          setAndSync((state) => ({
            knockoutMatches: state.knockoutMatches.map((m) =>
              m.id === id ? { ...m, status: 'scheduled', result: null } : m
            ),
          }))
        },

        /**
         * Save a match result (status → 'completed').
         * Automatically creates the next round when all matches in the current round finish.
         */
        saveKOResult: (id, result) => {
          setAndSync((state) => {
            // Apply result to the match
            const updatedMatches = state.knockoutMatches.map((m) =>
              m.id === id
                ? {
                    ...m,
                    status: 'completed',
                    result: {
                      scoreA: Number(result.scoreA) || 0,
                      scoreB: Number(result.scoreB) || 0,
                      penaltyWinner: result.penaltyWinner || null,
                      scorers: result.scorers || [],
                      yellowCards: result.yellowCards || [],
                      redCards: result.redCards || [],
                    },
                  }
                : m
            )

            let nextMatches = [...updatedMatches]
            let champion = state.champion

            // ── Auto-progression: QF → SF ───────────────────────────────
            const qfMatches = nextMatches.filter((m) => m.round === 'QF')
            const sfMatches = nextMatches.filter((m) => m.round === 'SF')

            if (
              qfMatches.length === 4 &&
              qfMatches.every((m) => m.status === 'completed') &&
              sfMatches.length === 0
            ) {
              const qfWinners = qfMatches
                .sort((a, b) => a.matchLabel.localeCompare(b.matchLabel))
                .map((m) => getKnockoutWinner(m))

              if (qfWinners.every(Boolean)) {
                // SF1: W_QF1 vs W_QF4  |  SF2: W_QF2 vs W_QF3
                nextMatches = [
                  ...nextMatches,
                  {
                    id: generateKoId(),
                    round: 'SF',
                    matchLabel: 'SF 1',
                    teamA: qfWinners[0],
                    teamB: qfWinners[3],
                    date: '', time: '', venue: '',
                    status: 'scheduled', result: null,
                  },
                  {
                    id: generateKoId(),
                    round: 'SF',
                    matchLabel: 'SF 2',
                    teamA: qfWinners[1],
                    teamB: qfWinners[2],
                    date: '', time: '', venue: '',
                    status: 'scheduled', result: null,
                  },
                ]
              }
            }

            // ── Auto-progression: SF → Final ────────────────────────────
            const updatedSFs = nextMatches.filter((m) => m.round === 'SF')
            const finalMatches = nextMatches.filter((m) => m.round === 'F')

            if (
              updatedSFs.length === 2 &&
              updatedSFs.every((m) => m.status === 'completed') &&
              finalMatches.length === 0
            ) {
              const sfWinners = updatedSFs
                .sort((a, b) => a.matchLabel.localeCompare(b.matchLabel))
                .map((m) => getKnockoutWinner(m))

              if (sfWinners.every(Boolean)) {
                nextMatches = [
                  ...nextMatches,
                  {
                    id: generateKoId(),
                    round: 'F',
                    matchLabel: 'النهائي',
                    teamA: sfWinners[0],
                    teamB: sfWinners[1],
                    date: '', time: '', venue: '',
                    status: 'scheduled', result: null,
                  },
                ]
              }
            }

            // ── Champion detection ───────────────────────────────────────
            const updatedFinals = nextMatches.filter((m) => m.round === 'F')
            if (updatedFinals.length === 1 && updatedFinals[0].status === 'completed') {
              champion = getKnockoutWinner(updatedFinals[0])
            }

            return { knockoutMatches: nextMatches, champion }
          })
        },

        /** Manually add a knockout match. */
        addKOMatch: (matchData) => {
          const newMatch = {
            id: generateKoId(),
            round: matchData.round || 'QF',
            matchLabel: matchData.matchLabel || matchData.round || 'QF',
            teamA: matchData.teamA || '',
            teamB: matchData.teamB || '',
            date: matchData.date || '',
            time: matchData.time || '',
            venue: matchData.venue || '',
            status: 'scheduled',
            result: null,
          }
          setAndSync((state) => ({
            knockoutMatches: [...state.knockoutMatches, newMatch],
            step: 3,
          }))
        },

        /** Delete a knockout match by ID. */
        deleteKOMatch: (id) => {
          setAndSync((state) => ({
            knockoutMatches: state.knockoutMatches.filter((m) => m.id !== id),
          }))
        },

        /** Simulate full tournament matches with mock data */
        simulateKnockoutData: (existingTeams = []) => {
          // Use existing teams if they exist and are at least 8, otherwise use mock teams
          let teamsList = existingTeams;
          if (!teamsList || teamsList.length < 8) {
            teamsList = [
              { id: 'mock-team-1', name: 'نادي النخبة FC', logo: null, color: '#3b82f6' },
              { id: 'mock-team-2', name: 'النجوم الرياضي', logo: null, color: '#eab308' },
              { id: 'mock-team-3', name: 'الاتحاد العربي', logo: null, color: '#22c55e' },
              { id: 'mock-team-4', name: 'هلال نجد', logo: null, color: '#06b6d4' },
              { id: 'mock-team-5', name: 'شباب الرياض', logo: null, color: '#f97316' },
              { id: 'mock-team-6', name: 'الأهلي القاهري', logo: null, color: '#ef4444' },
              { id: 'mock-team-7', name: 'فرسان مكة', logo: null, color: '#a855f7' },
              { id: 'mock-team-8', name: 'نمور جدة', logo: null, color: '#18181b' },
            ];
          }

          const qt = teamsList.slice(0, 8).map((t, idx) => ({
            seed: idx + 1,
            teamId: t.id,
            name: t.name,
            logo: t.logo || null,
            color: t.color || '#3b82f6',
            group: 'A',
            pts: 9,
            gd: 5,
            gf: 6,
            qualifyType: 'direct',
          }));

          const matches = [
            // QFs
            {
              id: 'sim-qf1',
              round: 'QF',
              matchLabel: 'QF 1',
              teamA: teamsList[0].id,
              teamB: teamsList[7].id,
              date: '2026-07-02',
              time: '17:00',
              venue: 'الملعب الرئيسي',
              status: 'completed',
              result: { scoreA: 3, scoreB: 1, penaltyWinner: null, scorers: [] }
            },
            {
              id: 'sim-qf2',
              round: 'QF',
              matchLabel: 'QF 2',
              teamA: teamsList[1].id,
              teamB: teamsList[6].id,
              date: '2026-07-02',
              time: '20:30',
              venue: 'ملعب النجوم',
              status: 'completed',
              result: { scoreA: 2, scoreB: 2, penaltyWinner: teamsList[1].id, scorers: [] }
            },
            {
              id: 'sim-qf3',
              round: 'QF',
              matchLabel: 'QF 3',
              teamA: teamsList[2].id,
              teamB: teamsList[5].id,
              date: '2026-07-03',
              time: '17:00',
              venue: 'الملعب الرئيسي',
              status: 'completed',
              result: { scoreA: 1, scoreB: 0, penaltyWinner: null, scorers: [] }
            },
            {
              id: 'sim-qf4',
              round: 'QF',
              matchLabel: 'QF 4',
              teamA: teamsList[3].id,
              teamB: teamsList[4].id,
              date: '2026-07-03',
              time: '20:30',
              venue: 'ملعب النجوم',
              status: 'completed',
              result: { scoreA: 0, scoreB: 2, penaltyWinner: null, scorers: [] }
            },
            // SFs
            {
              id: 'sim-sf1',
              round: 'SF',
              matchLabel: 'SF 1',
              teamA: teamsList[0].id, // Winner QF1
              teamB: teamsList[4].id, // Winner QF4 (Team 5)
              date: '2026-07-05',
              time: '19:00',
              venue: 'الملعب الرئيسي',
              status: 'completed',
              result: { scoreA: 2, scoreB: 1, penaltyWinner: null, scorers: [] }
            },
            {
              id: 'sim-sf2',
              round: 'SF',
              matchLabel: 'SF 2',
              teamA: teamsList[1].id, // Winner QF2
              teamB: teamsList[2].id, // Winner QF3
              date: '2026-07-05',
              time: '21:30',
              venue: 'الملعب الرئيسي',
              status: 'live',
              result: { scoreA: 1, scoreB: 1, penaltyWinner: null, scorers: [] }
            },
            // Final
            {
              id: 'sim-final',
              round: 'F',
              matchLabel: 'النهائي',
              teamA: teamsList[0].id, // Winner SF1
              teamB: '', // Waiting for SF2 winner
              date: '2026-07-08',
              time: '20:00',
              venue: 'الملعب الرئيسي',
              status: 'scheduled',
              result: null
            }
          ];

          setAndSync({
            step: 3,
            qualifiedTeams: qt,
            knockoutMatches: matches,
            champion: null
          });
        },
      }
    },
    {
      name: 'nkhbat-knockout-v1',
      partialize: (state) => ({
        step: state.step,
        qualifiedTeams: state.qualifiedTeams,
        knockoutMatches: state.knockoutMatches,
        champion: state.champion,
      }),
    }
  )
)
