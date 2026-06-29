import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateQFPairings, getKnockoutWinner, generateKoId } from '../utils/knockoutUtils'

/**
 * Zustand store for the Knockout Stage.
 * Persisted to localStorage only — never writes to Firebase.
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
    (set, get) => ({
      step: 0,
      qualifiedTeams: [],   // [{seed, teamId, name, logo, color, group, pts, gd, gf, qualifyType}]
      knockoutMatches: [],  // KO match objects (all rounds stored here)
      champion: null,       // teamId of tournament champion after Final

      // ─── Step management ──────────────────────────────────────────────

      /**
       * Initialize knockout with computed qualified teams → go to step 1.
       * Resets any previous state.
       */
      initKnockout: (qualifiedTeams) => {
        set({
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
        set((state) => {
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
        set({ step: 2, knockoutMatches: qfMatches })
      },

      /** Go back to step 1 (qualified teams review). */
      goToStep1: () => set({ step: 1 }),

      /**
       * Update a QF match while in the pre-confirm step 2.
       */
      updatePreConfirmMatch: (id, changes) => {
        set((state) => ({
          knockoutMatches: state.knockoutMatches.map((m) =>
            m.id === id ? { ...m, ...changes } : m
          ),
        }))
      },

      /**
       * Confirm the bracket → move to step 3 (active management).
       */
      confirmBracket: () => set({ step: 3 }),

      /** Hard reset — wipes all knockout state back to step 0. */
      resetKnockout: () => {
        set({
          step: 0,
          qualifiedTeams: [],
          knockoutMatches: [],
          champion: null,
        })
      },

      // ─── Match operations (step 3) ────────────────────────────────────

      /** Update schedule (date/time/venue) of any KO match. */
      updateKOMatchSchedule: (id, { date, time, venue }) => {
        set((state) => ({
          knockoutMatches: state.knockoutMatches.map((m) =>
            m.id === id ? { ...m, date, time, venue: (venue || '').trim() } : m
          ),
        }))
      },

      /** Update teams and/or schedule fields on any KO match. */
      updateKOMatch: (id, changes) => {
        set((state) => ({
          knockoutMatches: state.knockoutMatches.map((m) =>
            m.id === id ? { ...m, ...changes } : m
          ),
        }))
      },

      /** Mark a match as live (status → 'live'). */
      setKOMatchLive: (id) => {
        set((state) => ({
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
        set((state) => ({
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
        set((state) => ({
          knockoutMatches: state.knockoutMatches.map((m) =>
            m.id === id ? { ...m, status: 'postponed', result: null } : m
          ),
        }))
      },

      /** Restore a postponed match to scheduled. */
      restoreKOMatch: (id) => {
        set((state) => ({
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
        set((state) => {
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
        set((state) => ({ knockoutMatches: [...state.knockoutMatches, newMatch] }))
      },

      /** Delete a knockout match by ID. */
      deleteKOMatch: (id) => {
        set((state) => ({
          knockoutMatches: state.knockoutMatches.filter((m) => m.id !== id),
        }))
      },
    }),
    {
      name: 'nkhbat-knockout-v1',
    }
  )
)
