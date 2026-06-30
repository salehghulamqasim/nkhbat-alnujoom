/**
 * Bulk import script for Nkhbat Al-Nujoom QA stress test
 * Creates 12 World Cup teams, players with photos, then matches
 */
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, collection, getDocs, deleteDoc, writeBatch } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDMSYOaEsRy8G7HAnIojGqVFh-JTb4dH2E",
  authDomain: "nkhbat-alnujoom.firebaseapp.com",
  databaseURL: "https://nkhbat-alnujoom-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nkhbat-alnujoom",
  storageBucket: "nkhbat-alnujoom.firebasestorage.app",
  messagingSenderId: "309990493425",
  appId: "1:309990493425:web:b3f09955052a1651446d50"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Simple colored PNG as base64 for team logos (green)
const TEAM_LOGO_B64 = "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAABL0lEQVR4nO3SIQEAIBDAwE9BGoLRHmIgduL8xGadfema3wEYAANgAAyAATAABsAAGAADYAAMgAEwAAbAABgAA2AADIABMAAGwAAYAANgAAyAATAABsAAGAADYAAMgAEwAAbAABgAA2CAOAPEGSDOAHEGiDNAnAHiDBBngDgDxBkgzgBxBogzQJwB4gwQZ4A4A8QZIM4AcQaIM0CcAeIMEGeAOAPEGSDOAHEGiDNAnAHiDBBngDgDxBkgzgBxBogzQJwB4gwQZ4A4A8QZIM4AcQaIM0CcAeIMEGeAOAPEGSDOAHEGiDNAnAHiDBBngDgDxBkgzgBxBogzQJwB4gwQZ4A4A8QZIM4AcQaIM0CcAeIMEGeAOAPEGSDOAHEGiDNAnAHiDBBngDgDxBkgzgBxD9qVRq+AFWODAAAAAElFTkSuQmCC"

// Player photo (blue)
const PLAYER_PHOTO_B64 = "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAmElEQVR4nO3QMREAIBDAsJeDHMTiD2RkoEP2Xmftc382OkBrgA7QGqADtAboAK0BOkBrgA7QGqADtAboAK0BOkBrgA7QGqADtAboAK0BOkBrgA7QGqADtAboAK0BOkBrgA7QGqADtAboAK0BOkBrgA7QGqADtAboAK0BOkBrgA7QGqADtAboAK0BOkBrgA7QGqADtAboAO0BRcCx//EfmEAAAAAASUVORK5CYII="

const teams = [
  { name: 'السعودية', manager: 'هيرفي رينارد', group: 'أ' },
  { name: 'الأرجنتين', manager: 'ليونيل سكالوني', group: 'أ' },
  { name: 'المغرب', manager: 'وليد الركراكي', group: 'أ' },
  { name: 'البرازيل', manager: 'دوريفال جونيور', group: 'ب' },
  { name: 'إنجلترا', manager: 'غاريث ساوثغيت', group: 'ب' },
  { name: 'اليابان', manager: 'هاجيمي موريياسو', group: 'ب' },
  { name: 'فرنسا', manager: 'ديدييه ديشان', group: 'ج' },
  { name: 'ألمانيا', manager: 'يوليان ناغلسمان', group: 'ج' },
  { name: 'السنغال', manager: 'أليو سيسي', group: 'ج' },
  { name: 'إسبانيا', manager: 'لويس دي لا فوينتي', group: 'د' },
  { name: 'البرتغال', manager: 'روبرتو مارتينيز', group: 'د' },
  { name: 'هولندا', manager: 'رونالد كومان', group: 'د' },
]

const playerNames = {
  'السعودية': ['سالم الدوسري', 'فراس البريكان', 'محمد كنو', 'سعود عبدالحميد', 'حسن كادش', 'علي البليهي', 'موسى الجبالي', 'ناصر الدوسري', 'عبدالله الحمدان', 'أيمن يحيى', 'محمد العويس'],
  'الأرجنتين': ['ليونيل ميسي', 'خوليان ألفاريز', 'لوتارو مارتينيز', 'أنجيل دي ماريا', 'رودريغو دي بول', 'إينزو فيرنانديز', 'نيكولاس أوتامندي', 'كريستيان روميرو', 'ناهويل مولينا', 'إيميليانو مارتينيز', 'أليخاندرو غارناتشو'],
  'المغرب': ['أشرف حكيمي', 'حكيم زياش', 'عبدالصمد الزلزولي', 'سفيان أمرابط', 'نصير مزراوي', 'إلياس بن صغير', 'يوسف النصيري', 'عز الدين أوناحي', 'غانم سايس', 'منير المحمدي', 'بدر بانون'],
  'البرازيل': ['نيمار', 'فينيسيوس جونيور', 'رودريغو', 'رافينيا', 'كاسيميرو', 'لوكاس باكيتا', 'ماركينيوس', 'إيدرسون', 'داني ألفيس', 'غابرييل خيسوس', 'ريتشارليسون'],
  'إنجلترا': ['هاري كين', 'بوكايو ساكا', 'فيل فودين', 'جود بيلينغهام', 'ديكلان رايس', 'ميسون ماونت', 'كايل ووكر', 'جون ستونز', 'جوردان بيكفورد', 'ماركوس راشفورد', 'جاك غريليش'],
  'اليابان': ['تاكيفوسا كوبو', 'كاورو ميتوما', 'دايتشي كامادا', 'تايكي إيتو', 'واكو إندو', 'هيديماسا موريتا', 'كوجي ميوشي', 'مايا يوشيدا', 'شويتشي غوندا', 'جونيا إيتو', 'ريكي هاراكاوا'],
  'فرنسا': ['كيليان مبابي', 'أنطوان غريزمان', 'عثمان ديمبيلي', 'أوريليان تشواميني', 'إدواردو كامافينغا', 'تيو هيرنانديز', 'جول كوندي', 'مايك مينيان', 'أوليفييه جيرو', 'راندال كولو مواني', 'أدريان رابيو'],
  'ألمانيا': ['توني كروس', 'جمال موسيالا', 'فلوريان فيرتز', 'إيلكاي غوندوغان', 'جوشوا كيميش', 'ليروي ساني', 'كاي هافيرتز', 'أنطونيو روديغر', 'نيكلاس زوله', 'مارك أندريه تير شتيغن', 'نيكو شلوتربيك'],
  'السنغال': ['ساديو ماني', 'إسماعيلا سار', 'كاليدو كوليبالي', 'إدريسا غاي', 'شيخو كوياتي', 'نامباليس ميندي', 'عبدو ديالو', 'بونا سار', 'إدوارد ميندي', 'نيكولاس جاكسون', 'بابي ماتار سار'],
  'إسبانيا': ['لامين يامال', 'نيكو ويليامز', 'بيدري', 'غافي', 'رودري', 'داني كارفاخال', 'إيميرك لابورت', 'أوناي سيمون', 'ألفارو موراتا', 'داني أولمو', 'مارك كوكوريلا'],
  'البرتغال': ['كريستيانو رونالدو', 'برونو فيرنانديز', 'برناردو سيلفا', 'رافائيل لياو', 'جواو كانسيلو', 'ديوغو جوتا', 'روبن دياز', 'فيتينيا', 'ديوغو كوستا', 'نونو مينديز', 'باولو بيرناردو'],
  'هولندا': ['فيرجيل فان ديك', 'ممفيس ديباي', 'فرينكي دي يونغ', 'كودي غاكبو', 'تجان ريمس', 'دينزل دومفريس', 'ناثان أكي', 'جيريمي فريمبونغ', 'براين بروبي', 'جويل فيرتمان', 'بارت فيربروغين'],
}

const groups = ['أ', 'ب', 'ج', 'د']

async function createTeams() {
  const teamIds = {}
  
  for (const t of teams) {
    const id = crypto.randomUUID()
    const players = (playerNames[t.name] || ['لاعب1', 'لاعب2', 'لاعب3', 'لاعب4', 'لاعب5', 'لاعب6', 'لاعب7', 'لاعب8', 'لاعب9', 'لاعب10', 'لاعب11']).map((name, i) => ({
      id: `player-${i}-${name}`,
      name,
      photo: PLAYER_PHOTO_B64,
    }))
    
    await setDoc(doc(db, 'teams', id), {
      id,
      name: t.name,
      manager: t.manager,
      group: t.group,
      logo: TEAM_LOGO_B64,
      players,
      createdAt: new Date().toISOString(),
    })
    
    teamIds[t.name] = id
    console.log(`  ✅ ${t.name} → ${id} (${players.length} players)`)
  }
  
  return teamIds
}

async function deleteExistingTeams() {
  const snapshot = await getDocs(collection(db, 'teams'))
  let count = 0
  for (const d of snapshot.docs) {
    await deleteDoc(doc(db, 'teams', d.id))
    count++
  }
  if (count > 0) console.log(`  🗑️ Deleted ${count} existing teams`)
  return count
}

async function main() {
  console.log('=== Starting bulk import ===\n')
  
  // Step 1: Delete existing teams
  console.log('Step 1: Clearing existing data...')
  await deleteExistingTeams()
  
  // Step 2: Create 12 teams
  console.log('Step 2: Creating 12 World Cup teams...')
  const teamIds = await createTeams()
  
  console.log('\n=== Import complete ===')
  console.log(`✅ ${Object.keys(teamIds).length} teams created`)
  console.log('\nTeam IDs for reference:')
  for (const [name, id] of Object.entries(teamIds)) {
    console.log(`  ${name}: ${id}`)
  }
}

main().catch(console.error)
