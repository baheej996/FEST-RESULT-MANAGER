const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Festival Result Management System database...');

  // 1. Create Default Users
  const passwordHash = await bcrypt.hash('admin123', 10);
  const progAdminHash = await bcrypt.hash('program123', 10);
  const judgeHash = await bcrypt.hash('judge123', 10);
  const verifierHash = await bcrypt.hash('verifier123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@festival.org' },
    update: {},
    create: {
      name: 'Dr. K. R. Namboodiri (Festival Director)',
      email: 'admin@festival.org',
      username: 'superadmin',
      passwordHash: passwordHash,
      role: 'SUPER_ADMIN',
      phone: '+91 98470 12345'
    }
  });

  const progAdmin = await prisma.user.upsert({
    where: { email: 'program@festival.org' },
    update: {},
    create: {
      name: 'Prof. Anitha Varma',
      email: 'program@festival.org',
      username: 'progadmin',
      passwordHash: progAdminHash,
      role: 'PROGRAM_ADMIN',
      phone: '+91 98470 23456'
    }
  });

  const judgeUser = await prisma.user.upsert({
    where: { email: 'judge@festival.org' },
    update: {},
    create: {
      name: 'Kalamandalam Radhika (Chief Judge)',
      email: 'judge@festival.org',
      username: 'judge01',
      passwordHash: judgeHash,
      role: 'JUDGE',
      phone: '+91 98470 34567'
    }
  });

  const verifierUser = await prisma.user.upsert({
    where: { email: 'verifier@festival.org' },
    update: {},
    create: {
      name: 'Sri. Manoj Kumar (Scrutiny Convener)',
      email: 'verifier@festival.org',
      username: 'verifier01',
      passwordHash: verifierHash,
      role: 'VERIFIER',
      phone: '+91 98470 45678'
    }
  });

  console.log('Created Users: Super Admin, Program Admin, Judge, Verifier');

  // 2. Create Festival
  const festival = await prisma.festival.upsert({
    where: { code: 'SK2026' },
    update: {},
    create: {
      name: 'Sahodaya Kalotsav 2026',
      code: 'SK2026',
      year: 2026,
      startDate: new Date('2026-11-10T09:00:00Z'),
      endDate: new Date('2026-11-14T18:00:00Z'),
      venue: 'Silver Hills Central School, Kozhikode',
      description: 'The premier annual cultural and arts festival of CBSE Sahodaya School Complex.',
      status: 'ACTIVE',
      isPublished: true
    }
  });

  console.log(`Created Festival: ${festival.name}`);

  // 3. Create Institutions
  const institutionsData = [
    { code: 'SCH-101', name: 'Silver Hills Public School', district: 'Kozhikode', category: 'Senior Secondary', contactPerson: 'Fr. Mathew CMI', contactPhone: '+91 495 2730123' },
    { code: 'SCH-102', name: "Bhavan's Vidya Mandir, Girinagar", district: 'Ernakulam', category: 'Senior Secondary', contactPerson: 'Smt. Sunitha Nair', contactPhone: '+91 484 2314567' },
    { code: 'SCH-103', name: 'Chinmaya Vidyalaya, Kolazhy', district: 'Thrissur', category: 'Senior Secondary', contactPerson: 'Sri. Gopalakrishnan', contactPhone: '+91 487 2200111' },
    { code: 'SCH-104', name: 'Devagiri CMI Public School', district: 'Kozhikode', category: 'Senior Secondary', contactPerson: 'Fr. Johny CMI', contactPhone: '+91 495 2355444' },
    { code: 'SCH-105', name: 'Army Public School', district: 'Kannur', category: 'Senior Secondary', contactPerson: 'Maj. S. K. Sharma', contactPhone: '+91 497 2701234' }
  ];

  const institutions = [];
  for (const inst of institutionsData) {
    const created = await prisma.institution.upsert({
      where: { festivalId_code: { festivalId: festival.id, code: inst.code } },
      update: {},
      create: { ...inst, festivalId: festival.id }
    });
    institutions.push(created);
  }

  // 4. Create Categories
  const categoriesData = [
    { code: 'CAT-STG', name: 'Stage Arts', sortOrder: 1 },
    { code: 'CAT-LIT', name: 'Literary', sortOrder: 2 },
    { code: 'CAT-MUS', name: 'Music', sortOrder: 3 },
    { code: 'CAT-FINE', name: 'Fine Arts', sortOrder: 4 }
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const created = await prisma.programCategory.upsert({
      where: { festivalId_code: { festivalId: festival.id, code: cat.code } },
      update: {},
      create: { ...cat, festivalId: festival.id }
    });
    categories[cat.code] = created;
  }

  // 5. Create Programs
  const programsData = [
    {
      code: 'PROG-101',
      name: 'Bharatanatyam',
      categoryId: categories['CAT-STG'].id,
      type: 'INDIVIDUAL',
      section: 'Category 3 (Classes 8-10)',
      maxMarks: 100,
      judgeCount: 3,
      scoringMethod: 'AVERAGE',
      status: 'PUBLISHED',
      positionPoints: JSON.stringify({ "1": 5, "2": 3, "3": 1 }),
      gradeBoundaries: JSON.stringify([
        { grade: 'A', minPercentage: 70, points: 5 },
        { grade: 'B', minPercentage: 60, points: 3 },
        { grade: 'C', minPercentage: 50, points: 1 }
      ]),
      tiePolicy: 'SHARED'
    },
    {
      code: 'PROG-102',
      name: 'Mohiniyattam',
      categoryId: categories['CAT-STG'].id,
      type: 'INDIVIDUAL',
      section: 'Category 4 (Classes 11-12)',
      maxMarks: 100,
      judgeCount: 3,
      scoringMethod: 'AVERAGE',
      status: 'READY_FOR_MARKS',
      positionPoints: JSON.stringify({ "1": 5, "2": 3, "3": 1 }),
      gradeBoundaries: JSON.stringify([
        { grade: 'A', minPercentage: 70, points: 5 },
        { grade: 'B', minPercentage: 60, points: 3 },
        { grade: 'C', minPercentage: 50, points: 1 }
      ]),
      tiePolicy: 'SHARED'
    },
    {
      code: 'PROG-103',
      name: 'English Elocution',
      categoryId: categories['CAT-LIT'].id,
      type: 'INDIVIDUAL',
      section: 'Category 4 (Classes 11-12)',
      maxMarks: 100,
      judgeCount: 3,
      scoringMethod: 'AVERAGE',
      status: 'PUBLISHED',
      positionPoints: JSON.stringify({ "1": 5, "2": 3, "3": 1 }),
      gradeBoundaries: JSON.stringify([
        { grade: 'A', minPercentage: 70, points: 5 },
        { grade: 'B', minPercentage: 60, points: 3 },
        { grade: 'C', minPercentage: 50, points: 1 }
      ]),
      tiePolicy: 'SHARED'
    },
    {
      code: 'PROG-104',
      name: 'Classical Music (Carnatic)',
      categoryId: categories['CAT-MUS'].id,
      type: 'INDIVIDUAL',
      section: 'Category 3 (Classes 8-10)',
      maxMarks: 100,
      judgeCount: 3,
      scoringMethod: 'AVERAGE',
      status: 'MARKS_ENTERED',
      positionPoints: JSON.stringify({ "1": 5, "2": 3, "3": 1 }),
      gradeBoundaries: JSON.stringify([
        { grade: 'A', minPercentage: 70, points: 5 },
        { grade: 'B', minPercentage: 60, points: 3 },
        { grade: 'C', minPercentage: 50, points: 1 }
      ]),
      tiePolicy: 'SHARED'
    },
    {
      code: 'PROG-105',
      name: 'Folk Dance (Group)',
      categoryId: categories['CAT-STG'].id,
      type: 'GROUP',
      section: 'Category 3 & 4 (Classes 8-12)',
      maxMarks: 100,
      judgeCount: 3,
      scoringMethod: 'AVERAGE',
      status: 'SCHEDULED',
      positionPoints: JSON.stringify({ "1": 10, "2": 6, "3": 2 }),
      gradeBoundaries: JSON.stringify([
        { grade: 'A', minPercentage: 70, points: 10 },
        { grade: 'B', minPercentage: 60, points: 6 },
        { grade: 'C', minPercentage: 50, points: 2 }
      ]),
      tiePolicy: 'SHARED'
    }
  ];

  const programs = {};
  for (const prog of programsData) {
    const created = await prisma.program.upsert({
      where: { festivalId_code: { festivalId: festival.id, code: prog.code } },
      update: {},
      create: { ...prog, festivalId: festival.id }
    });
    programs[prog.code] = created;
  }

  // 6. Create Participants
  const participantsData = [
    { reg: 'REG-2001', name: 'Ananya Ramesh', instIdx: 0, cat: 'Senior', cls: 'Class 10', gen: 'Female' },
    { reg: 'REG-2002', name: 'Devika Menon', instIdx: 1, cat: 'Senior', cls: 'Class 9', gen: 'Female' },
    { reg: 'REG-2003', name: 'Malavika Krishnan', instIdx: 2, cat: 'Senior', cls: 'Class 10', gen: 'Female' },
    { reg: 'REG-2004', name: 'Nandana S. Kumar', instIdx: 3, cat: 'Senior', cls: 'Class 10', gen: 'Female' },
    { reg: 'REG-2005', name: 'Aadhya Varma', instIdx: 4, cat: 'Senior', cls: 'Class 9', gen: 'Female' },

    { reg: 'REG-2006', name: 'Siddharth Iyer', instIdx: 0, cat: 'Senior', cls: 'Class 12', gen: 'Male' },
    { reg: 'REG-2007', name: 'Rhea George', instIdx: 1, cat: 'Senior', cls: 'Class 11', gen: 'Female' },
    { reg: 'REG-2008', name: 'Adithya Pradeep', instIdx: 2, cat: 'Senior', cls: 'Class 12', gen: 'Male' },
    { reg: 'REG-2009', name: 'Naveen Joseph', instIdx: 3, cat: 'Senior', cls: 'Class 11', gen: 'Male' },
    { reg: 'REG-2010', name: 'Tanvi Nair', instIdx: 4, cat: 'Senior', cls: 'Class 12', gen: 'Female' }
  ];

  const participants = [];
  for (const p of participantsData) {
    const created = await prisma.participant.upsert({
      where: { festivalId_registrationNo: { festivalId: festival.id, registrationNo: p.reg } },
      update: {},
      create: {
        festivalId: festival.id,
        institutionId: institutions[p.instIdx].id,
        registrationNo: p.reg,
        name: p.name,
        category: p.cat,
        gradeClass: p.cls,
        gender: p.gen
      }
    });
    participants.push(created);
  }

  // 7. Create Competition Entries for PROG-101 (Bharatanatyam)
  const entries101 = [];
  for (let i = 0; i < 5; i++) {
    const entry = await prisma.competitionEntry.upsert({
      where: { programId_chestNo: { programId: programs['PROG-101'].id, chestNo: `BN-10${i + 1}` } },
      update: {},
      create: {
        programId: programs['PROG-101'].id,
        institutionId: institutions[i].id,
        chestNo: `BN-10${i + 1}`,
        status: 'PERFORMED'
      }
    });
    await prisma.entryMember.upsert({
      where: { entryId_participantId: { entryId: entry.id, participantId: participants[i].id } },
      update: {},
      create: { entryId: entry.id, participantId: participants[i].id, isLeader: true }
    });
    entries101.push(entry);
  }

  // 8. Add Marks for PROG-101 (3 Judges)
  // Scores crafted realistically:
  // BN-101: 92, 94, 90 -> Avg 92.00 (1st, Grade A)
  // BN-102: 88, 86, 89 -> Avg 87.67 (2nd, Grade A)
  // BN-103: 82, 85, 84 -> Avg 83.67 (3rd, Grade A)
  // BN-104: 76, 78, 77 -> Avg 77.00 (None, Grade A)
  // BN-105: 64, 66, 68 -> Avg 66.00 (None, Grade B)
  const scores101 = [
    [92, 94, 90],
    [88, 86, 89],
    [82, 85, 84],
    [76, 78, 77],
    [64, 66, 68]
  ];

  for (let eIdx = 0; eIdx < entries101.length; eIdx++) {
    for (let jIdx = 0; jIdx < 3; jIdx++) {
      await prisma.mark.upsert({
        where: { entryId_judgeIndex: { entryId: entries101[eIdx].id, judgeIndex: jIdx + 1 } },
        update: {},
        create: {
          entryId: entries101[eIdx].id,
          judgeIndex: jIdx + 1,
          mark: scores101[eIdx][jIdx],
          isDraft: false,
          enteredByUserId: judgeUser.id
        }
      });
    }
  }

  // 9. Create Published Result for PROG-101
  const result101 = await prisma.result.upsert({
    where: { programId: programs['PROG-101'].id },
    update: {},
    create: {
      programId: programs['PROG-101'].id,
      status: 'PUBLISHED',
      verifiedByUserId: verifierUser.id,
      verifiedAt: new Date('2026-11-10T14:30:00Z'),
      publishedAt: new Date('2026-11-10T15:00:00Z'),
      notes: 'All 5 contestants performed. Verified and approved.'
    }
  });

  const positions101 = [
    { rank: 1, pos: '1st', grade: 'A', posPts: 5, grdPts: 5, tot: 276, avg: 92.00, pct: 92.00 },
    { rank: 2, pos: '2nd', grade: 'A', posPts: 3, grdPts: 5, tot: 263, avg: 87.67, pct: 87.67 },
    { rank: 3, pos: '3rd', grade: 'A', posPts: 1, grdPts: 5, tot: 251, avg: 83.67, pct: 83.67 },
    { rank: 4, pos: 'None', grade: 'A', posPts: 0, grdPts: 5, tot: 231, avg: 77.00, pct: 77.00 },
    { rank: 5, pos: 'None', grade: 'B', posPts: 0, grdPts: 3, tot: 198, avg: 66.00, pct: 66.00 }
  ];

  for (let i = 0; i < entries101.length; i++) {
    const p = positions101[i];
    await prisma.resultPosition.upsert({
      where: { entryId: entries101[i].id },
      update: {},
      create: {
        resultId: result101.id,
        entryId: entries101[i].id,
        totalScore: p.tot,
        finalScore: p.avg,
        percentage: p.pct,
        rank: p.rank,
        position: p.pos,
        grade: p.grade,
        positionPoints: p.posPts,
        gradePoints: p.grdPts,
        totalPoints: p.posPts + p.grdPts
      }
    });
  }

  // 10. Entries and Result for PROG-103 (English Elocution - Published)
  const entries103 = [];
  for (let i = 0; i < 5; i++) {
    const entry = await prisma.competitionEntry.upsert({
      where: { programId_chestNo: { programId: programs['PROG-103'].id, chestNo: `EL-20${i + 1}` } },
      update: {},
      create: {
        programId: programs['PROG-103'].id,
        institutionId: institutions[i].id,
        chestNo: `EL-20${i + 1}`,
        status: 'PERFORMED'
      }
    });
    await prisma.entryMember.upsert({
      where: { entryId_participantId: { entryId: entry.id, participantId: participants[i + 5].id } },
      update: {},
      create: { entryId: entry.id, participantId: participants[i + 5].id, isLeader: true }
    });
    entries103.push(entry);
  }

  // Scores for PROG-103:
  // EL-202 (Bhavan's): 95, 96, 94 -> Avg 95.00 (1st, Grade A)
  // EL-201 (Silver Hills): 91, 89, 90 -> Avg 90.00 (2nd, Grade A)
  // EL-204 (Devagiri): 86, 88, 87 -> Avg 87.00 (3rd, Grade A)
  // EL-203 (Chinmaya): 80, 81, 79 -> Avg 80.00 (None, Grade A)
  // EL-205 (Army PS): 72, 74, 70 -> Avg 72.00 (None, Grade A)
  const scores103 = [
    [91, 89, 90], // EL-201
    [95, 96, 94], // EL-202
    [80, 81, 79], // EL-203
    [86, 88, 87], // EL-204
    [72, 74, 70]  // EL-205
  ];

  for (let eIdx = 0; eIdx < entries103.length; eIdx++) {
    for (let jIdx = 0; jIdx < 3; jIdx++) {
      await prisma.mark.upsert({
        where: { entryId_judgeIndex: { entryId: entries103[eIdx].id, judgeIndex: jIdx + 1 } },
        update: {},
        create: {
          entryId: entries103[eIdx].id,
          judgeIndex: jIdx + 1,
          mark: scores103[eIdx][jIdx],
          isDraft: false,
          enteredByUserId: judgeUser.id
        }
      });
    }
  }

  const result103 = await prisma.result.upsert({
    where: { programId: programs['PROG-103'].id },
    update: {},
    create: {
      programId: programs['PROG-103'].id,
      status: 'PUBLISHED',
      verifiedByUserId: verifierUser.id,
      verifiedAt: new Date('2026-11-10T16:45:00Z'),
      publishedAt: new Date('2026-11-10T17:00:00Z'),
      notes: 'Speech timings adhered to. Result officially published.'
    }
  });

  const positions103 = [
    { entryIdx: 1, rank: 1, pos: '1st', grade: 'A', posPts: 5, grdPts: 5, tot: 285, avg: 95.00, pct: 95.00 },
    { entryIdx: 0, rank: 2, pos: '2nd', grade: 'A', posPts: 3, grdPts: 5, tot: 270, avg: 90.00, pct: 90.00 },
    { entryIdx: 3, rank: 3, pos: '3rd', grade: 'A', posPts: 1, grdPts: 5, tot: 261, avg: 87.00, pct: 87.00 },
    { entryIdx: 2, rank: 4, pos: 'None', grade: 'A', posPts: 0, grdPts: 5, tot: 240, avg: 80.00, pct: 80.00 },
    { entryIdx: 4, rank: 5, pos: 'None', grade: 'A', posPts: 0, grdPts: 5, tot: 216, avg: 72.00, pct: 72.00 }
  ];

  for (const p of positions103) {
    await prisma.resultPosition.upsert({
      where: { entryId: entries103[p.entryIdx].id },
      update: {},
      create: {
        resultId: result103.id,
        entryId: entries103[p.entryIdx].id,
        totalScore: p.tot,
        finalScore: p.avg,
        percentage: p.pct,
        rank: p.rank,
        position: p.pos,
        grade: p.grade,
        positionPoints: p.posPts,
        gradePoints: p.grdPts,
        totalPoints: p.posPts + p.grdPts
      }
    });
  }

  // 11. Materialize Initial Institution Points Leaderboard
  // SCH-101 (Silver Hills): 10 pts (BN: 1st 5+5=10) + 8 pts (EL: 2nd 3+5=8) = 18 pts
  // SCH-102 (Bhavan's): 8 pts (BN: 2nd 3+5=8) + 10 pts (EL: 1st 5+5=10) = 18 pts (Tied on pts, 1st count 1 vs 1)
  // SCH-103 (Chinmaya): 6 pts (BN: 3rd 1+5=6) + 5 pts (EL: None 0+5=5) = 11 pts
  // SCH-104 (Devagiri): 5 pts (BN: None 0+5=5) + 6 pts (EL: 3rd 1+5=6) = 11 pts
  // SCH-105 (Army PS): 3 pts (BN: None 0+3=3) + 5 pts (EL: None 0+5=5) = 8 pts
  const pointsSummary = [
    { instIdx: 0, pts: 18.0, fst: 1, snd: 1, trd: 0, grdA: 2, rank: 1 },
    { instIdx: 1, pts: 18.0, fst: 1, snd: 1, trd: 0, grdA: 2, rank: 1 },
    { instIdx: 3, pts: 11.0, fst: 0, snd: 0, trd: 1, grdA: 2, rank: 3 },
    { instIdx: 2, pts: 11.0, fst: 0, snd: 0, trd: 1, grdA: 2, rank: 4 },
    { instIdx: 4, pts: 8.0, fst: 0, snd: 0, trd: 0, grdA: 1, rank: 5 }
  ];

  for (const ps of pointsSummary) {
    await prisma.institutionPoint.upsert({
      where: { festivalId_institutionId: { festivalId: festival.id, institutionId: institutions[ps.instIdx].id } },
      update: {
        totalPoints: ps.pts,
        firstCount: ps.fst,
        secondCount: ps.snd,
        thirdCount: ps.trd,
        gradeACount: ps.grdA,
        rank: ps.rank
      },
      create: {
        festivalId: festival.id,
        institutionId: institutions[ps.instIdx].id,
        totalPoints: ps.pts,
        firstCount: ps.fst,
        secondCount: ps.snd,
        thirdCount: ps.trd,
        gradeACount: ps.grdA,
        rank: ps.rank
      }
    });
  }

  // 12. Also create entries for PROG-102 (Mohiniyattam - Ready for marks) so operators can test live mark entry
  for (let i = 0; i < 5; i++) {
    await prisma.competitionEntry.upsert({
      where: { programId_chestNo: { programId: programs['PROG-102'].id, chestNo: `MY-30${i + 1}` } },
      update: {},
      create: {
        programId: programs['PROG-102'].id,
        institutionId: institutions[i].id,
        chestNo: `MY-30${i + 1}`,
        status: 'REGISTERED'
      }
    });
  }

  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

