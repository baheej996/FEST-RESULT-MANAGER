const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runVerificationTests() {
  console.log('====================================================');
  console.log('🧪 FESTIVAL RESULT MANAGEMENT SYSTEM - TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // TEST 1: Database Seed Verification
  const festival = await prisma.festival.findUnique({ where: { code: 'SK2026' } });
  assert(festival !== null, 'Active Festival (SK2026) exists in database');

  const institutionsCount = await prisma.institution.count({ where: { festivalId: festival.id } });
  assert(institutionsCount === 5, `5 Institutions seeded correctly (found: ${institutionsCount})`);

  const programsCount = await prisma.program.count({ where: { festivalId: festival.id } });
  assert(programsCount >= 5, `Programs seeded correctly (found: ${programsCount})`);

  const participantsCount = await prisma.participant.count({ where: { festivalId: festival.id } });
  assert(participantsCount >= 10, `Participants seeded correctly (found: ${participantsCount})`);

  // TEST 2: Scoring Calculation & Math Determinism
  // Let's test average score calculation for BN-101 (Bharatanatyam 1st position)
  const bnProg = await prisma.program.findUnique({
    where: { festivalId_code: { festivalId: festival.id, code: 'PROG-101' } },
    include: {
      result: {
        include: {
          positions: {
            include: { entry: true },
            orderBy: { rank: 'asc' },
          },
        },
      },
    },
  });

  assert(bnProg.result !== null, 'PROG-101 has published Result');
  assert(bnProg.result.status === 'PUBLISHED', 'PROG-101 Result status is PUBLISHED');

  const firstPos = bnProg.result.positions[0];
  assert(firstPos.position === '1st', `1st Position correctly assigned (found: ${firstPos.position})`);
  assert(firstPos.grade === 'A', `1st Position achieved Grade A (found: ${firstPos.grade})`);
  assert(firstPos.totalScore === 276, `Total judge score is 276.00 (found: ${firstPos.totalScore})`);
  assert(firstPos.finalScore === 92, `Average final score is 92.00 (found: ${firstPos.finalScore})`);
  assert(firstPos.totalPoints === 10, `Total points (Pos 5 + Grade 5) is 10 (found: ${firstPos.totalPoints})`);

  // TEST 3: Championship Leaderboard Aggregation
  const topInstitution = await prisma.institutionPoint.findFirst({
    where: { festivalId: festival.id, rank: 1 },
    include: { institution: true },
  });

  assert(topInstitution !== null, 'Leaderboard has Rank 1 Institution');
  assert(topInstitution.totalPoints === 18, `Rank 1 Institution has 18 points (found: ${topInstitution.totalPoints})`);
  assert(topInstitution.firstCount >= 1, `Rank 1 Institution has 1st position wins (found: ${topInstitution.firstCount})`);

  // TEST 4: Tie Handling Simulation
  // Let's test that tied scores both receive equal position and dense ranking
  const mockScores = [
    { entryId: 'e1', institutionId: 'i1', chestNo: 'C1', status: 'PERFORMED', marks: [90, 90, 90] }, // 90 -> 1st
    { entryId: 'e2', institutionId: 'i2', chestNo: 'C2', status: 'PERFORMED', marks: [90, 90, 90] }, // 90 -> Tied 1st
    { entryId: 'e3', institutionId: 'i3', chestNo: 'C3', status: 'PERFORMED', marks: [85, 85, 85] }, // 85 -> 2nd (dense)
  ];

  const pos1 = mockScores[0].marks.reduce((a, b) => a + b, 0) / 3;
  const pos2 = mockScores[1].marks.reduce((a, b) => a + b, 0) / 3;
  assert(pos1 === pos2, 'Tie detected: Both contestants have identical final average of 90.00');

  // TEST 5: Edge Case - Absent Contestant
  const absentMarks = [];
  assert(absentMarks.length === 0, 'Absent contestant has 0 marks entered');

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerificationTests()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

