/**
 * Create matches, score them, make Saudi Arabia win.
 */
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, getDocs, collection, deleteDoc, writeBatch, updateDoc as upd } from 'firebase/firestore'

const firebaseConfig = { apiKey: 'AIzaSyA8Txx0EDjGqSZdx-l8ru_dH2E', authDomain: 'nkhbat-alnujoom.firebaseapp.com', databaseURL: 'https://nkhbat-alnujoom-default-rtdb.asia-southeast1.firebasedatabase.app', projectId: 'nkhbat-alnujoom', storageBucket: 'nkhbat-alnujoom.firebasestorage.app', messagingSenderId: '309990493425', appId: '1:309990493425:web:b3f09955052a1651446d50' }

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const teamIds = {
  'السعودية': '26b2acf4-b751-4b9f-925f-62fe573ad735',
  'الأرجنتين': '66e54040-73f8-4d2b-b959-667604b23846',
  'المغرب': 'df9a8c72-4304-4c61-bc23-650a20cac602',
  'إسبانيا': '1eb4c3e8-0010-47d4-ab23-7ba78bb92a66',
  'البرازيل': 'b679055d-9290-46f2-8fb5-3e4917b5667c',
  'إنجلترا': '68d2ed29-1a6d-4e2b-a4b1-cc6daa09a6c3',
  'اليابان': '796c4b79-59e3-4f51-9b1c-fc330687913b',
  'البرتغال': '112cfb4e-a216-4c70-adf5-a72d8a9d407a',
  'فرنسا': 'b9238264-9ce2-4c58-9ac5-d14d55acf784',
  'ألمانيا': '3e4cdd05-8fd0-4ea8-aea9-170e6586d1e1',
  'السنغال': 'b78b0335-f9fb-4430-86da-ac178048ba0e',
  'هولندا': 'c6b09d68-93de-4717-b9ce-79a89933182a',
}

const playerNames = {
  'السعودية': ['سالم الدوسري', 'فراس البريكان', 'محمد كنو', 'سعود عبدالحميد', 'حسن كادش', 'علي البليهي', 'موسى الجبالي', 'ناصر الدوسري', 'عبدالله الحمدان', 'أيمن يحيى', 'محمد العويس'],
  'الأرجنتين': ['ميسي', 'ألفاريز', 'مارتينيز', 'دي ماريا', 'دي بول', 'فيرنانديز', 'أوتامندي', 'روميرو', 'مولينا', 'إيميليانو م.', 'غارناتشو'],
  'المغرب': ['أشرف حكيمي', 'حكيم زياش', 'عبدالصمد الزلزولي', 'سفيان أمرابط', 'نصير مزراوي', 'إلياس بن صغير', 'يوسف النصيري', 'عز الدين أوناحي', 'غانم سايس', 'منير المحمدي', 'بدر بانون'],
  'إسبانيا': ['لامين يامال', 'نيكو ويليامز', 'بيدري', 'غافي', 'رودري', 'كارفاخال', 'لابورت', 'أوناي سيمون', 'موراتا', 'داني أولمو', 'كوكوريلا'],
  'البرازيل': ['نيمار', 'فينيسيوس ج.', 'رودريغو', 'رافينيا', 'كاسيميرو', 'باكيتا', 'ماركينيوس', 'إيدرسون', 'داني ألفيس', 'غابرييل خيسوس', 'ريتشارليسون'],
  'إنجلترا': ['هاري كين', 'بوكايو ساكا', 'فيل فودين', 'بيلينغهام', 'ديكلان رايس', 'ميسون ماونت', 'كايل ووكر', 'جون ستونز', 'بيكفورد', 'راشفورد', 'جاك غريليش'],
  'اليابان': ['تاكيفوسا كوبو', 'كاورو ميتوما', 'كامادا', 'تايكي إيتو', 'واكو إندو', 'هيديماسا موريتا', 'ميوشي', 'مايا يوشيدا', 'شويتشي غوندا', 'جونيا إيتو', 'ريكي هاراكاوا'],
  'البرتغال': ['كريستيانو ر.', 'برونو ف.', 'برناردو س.', 'رافائيل لياو', 'جواو كانسيلو', 'ديوغو جوتا', 'روبن دياز', 'فيتينيا', 'ديوغو كوستا', 'نونو مينديز', 'باولو ب.'],
  'فرنسا': ['كيليان مبابي', 'غريزمان', 'ديمبيلي', 'تشواميني', 'كامافينغا', 'تيو هيرنانديز', 'جول كوندي', 'مايك مينيان', 'جيرو', 'كولو مواني', 'رابيو'],
  'ألمانيا': ['توني كروس', 'موسيالا', 'فيرتز', 'غوندوغان', 'كيميش', 'ليروي ساني', 'كافيرتز', 'روديغر', 'نيكلاس زوله', 'تير شتيغن', 'شلوتربيك'],
  'السنغال': ['ساديو ماني', 'إسماعيلا سار', 'كوليبالي', 'إدريسا غاي', 'كوياتي', 'نامباليس ميندي', 'عبدو ديالو', 'بونا سار', 'إدوارد ميندي', 'جاكسون', 'ب. ماتار سار'],
  'هولندا': ['فان ديك', 'ممفيس ديباي', 'فرينكي دي يونغ', 'غاكبو', 'تجان ريمس', 'دومفريس', 'ناثان أكي', 'فريمبونغ', 'بروبي', 'فيرتيمان', 'فيربروغين'],
}

const groups = { أ: ['السعودية', 'الأرجنتين', 'المغرب', 'إسبانيا'], ب: ['البرازيل', 'إنجلترا', 'اليابان', 'البرتغال'], ج: ['فرنسا', 'ألمانيا', 'السنغال', 'هولندا'] }

function roundRobinPairs(teams) {
  const pairs = []
  for (let i = 0; i < teams.length; i++) for (let j = i + 1; j < teams.length; j++) pairs.push([teams[i], teams[j]])
  return pairs
}

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)] }

async function main() {
  // Step 1: Update team groups
  console.log('Step 1: Updating team groups to 3 groups of 4...')
  for (const [group, teamNames] of Object.entries(groups)) {
    for (const name of teamNames) {
      await upd(doc(db, 'teams', teamIds[name]), { group })
    }
    console.log(`  Group ${group}: ${teamNames.join(', ')}`)
  }

  // Step 2: Clear existing matches
  console.log('\nStep 2: Clearing existing matches...')
  const snap = await getDocs(collection(db, 'matches'))
  for (const d of snap.docs) await deleteDoc(doc(db, 'matches', d.id))
  console.log(`  Deleted ${snap.docs.length} matches`)

  // Step 3: Create round-robin matches
  console.log('\nStep 3: Creating 18 group matches...')
  const dates = ['2026-06-20', '2026-06-21', '2026-06-22', '2026-06-23', '2026-06-24', '2026-06-25']
  const times = ['18:00', '20:00', '22:00']
  const venues = ['ملعب الملك فهد', 'مدينة الرياض الرياضية', 'ملعب الأمير فيصل', 'استاد الملك عبدالله', 'ملعب الملك سعود', 'استاد جوهرة']

  let matchIdx = 0
  const createdMatches = []
  const batch = writeBatch(db)

  for (const [group, teamNames] of Object.entries(groups)) {
    const pairs = roundRobinPairs(teamNames)
    pairs.forEach(([teamA, teamB], idx) => {
      const id = crypto.randomUUID()
      const match = {
        id, group, teamA: teamIds[teamA], teamB: teamIds[teamB],
        date: dates[matchIdx % dates.length], time: times[idx % times.length],
        venue: venues[matchIdx % venues.length], status: 'scheduled', result: null,
      }
      batch.set(doc(db, 'matches', id), match)
      createdMatches.push({ ...match, aName: teamA, bName: teamB })
      matchIdx++
    })
  }
  await batch.commit()
  console.log(`  ✅ ${createdMatches.length} matches created`)

  // Step 4: Score the matches
  console.log('\nStep 4: Scoring all matches...')

  const matchScores = [
    // Group أ — Saudi Arabia wins!  
    [4, 1], [3, 0], [5, 2],  // السعودية vs الأرجنتين, المغرب, إسبانيا
    [2, 1], [1, 1], [2, 0],  // الأرجنتين vs المغرب, إسبانيا | المغرب vs إسبانيا
    // Group ب
    [2, 2], [3, 1], [1, 0],
    [3, 0], [2, 1], [1, 0],
    // Group ج
    [1, 1], [3, 0], [2, 1],
    [2, 0], [3, 2], [1, 1],
  ]

  for (let i = 0; i < createdMatches.length; i++) {
    const m = createdMatches[i]
    const [scoreA, scoreB] = matchScores[i]
    const scorers = []

    for (let g = 0; g < scoreA; g++) scorers.push({ player: rnd(playerNames[m.aName]), teamId: m.teamA, minute: Math.floor(Math.random() * 89) + 1 })
    for (let g = 0; g < scoreB; g++) scorers.push({ player: rnd(playerNames[m.bName]), teamId: m.teamB, minute: Math.floor(Math.random() * 89) + 1 })
    
    const yellows = []
    for (let c = 0; c < Math.floor(Math.random() * 3); c++) yellows.push({ player: rnd(playerNames[m.aName]), teamId: m.teamA, minute: Math.floor(Math.random() * 89) + 1, type: 'yellow' })
    for (let c = 0; c < Math.floor(Math.random() * 3); c++) yellows.push({ player: rnd(playerNames[m.bName]), teamId: m.teamB, minute: Math.floor(Math.random() * 89) + 1, type: 'yellow' })

    const reds = []
    if (Math.random() > 0.85) reds.push({ player: rnd(playerNames[m.aName]), teamId: m.teamA, minute: Math.floor(Math.random() * 89) + 1, type: 'red' })
    if (Math.random() > 0.85) reds.push({ player: rnd(playerNames[m.bName]), teamId: m.teamB, minute: Math.floor(Math.random() * 89) + 1, type: 'red' })

    await upd(doc(db, 'matches', m.id), {
      status: 'completed',
      result: { scoreA, scoreB, scorers, yellowCards: yellows, redCards: reds },
    })
  }

  // Print results
  console.log('\n📊 === TOURNAMENT RESULTS ===')
  console.log('')
  console.log('Group أ:')
  console.log('  السعودية 4-1 الأرجنتين')
  console.log('  السعودية 3-0 المغرب')
  console.log('  السعودية 5-2 إسبانيا')
  console.log('  الأرجنتين 2-1 المغرب')
  console.log('  الأرجنتين 1-1 إسبانيا')
  console.log('  المغرب 2-0 إسبانيا')
  console.log('')
  console.log('Group ب:')
  console.log('  البرازيل 2-2 إنجلترا')
  console.log('  البرازيل 3-1 اليابان')
  console.log('  البرازيل 1-0 البرتغال')
  console.log('  إنجلترا 3-0 اليابان')
  console.log('  إنجلترا 2-1 البرتغال')
  console.log('  اليابان 1-0 البرتغال')
  console.log('')
  console.log('Group ج:')
  console.log('  فرنسا 1-1 ألمانيا')
  console.log('  فرنسا 3-0 السنغال')
  console.log('  فرنسا 2-1 هولندا')
  console.log('  ألمانيا 2-0 السنغال')
  console.log('  ألمانيا 3-2 هولندا')
  console.log('  السنغال 1-1 هولندا')
  console.log('')
  console.log('🏆 السعودية wins Group أ with 3 wins (9pts)!')

  // Verify count
  console.log(`\n✅ ${matchScores.length} matches scored successfully`)
}

main().catch(console.error)
