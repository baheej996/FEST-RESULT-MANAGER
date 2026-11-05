import prisma from './db';

export interface ScoreItem {
  entryId: string;
  institutionId: string;
  chestNo: string;
  status: 'REGISTERED' | 'PERFORMED' | 'ABSENT' | 'DISQUALIFIED' | 'WITHHELD';
  marks: number[]; // Array of marks from judge 1, 2, 3...
}

export interface CalculationResult {
  entryId: string;
  totalScore: number;
  finalScore: number;
  percentage: number;
  rank: number;
  position: '1st' | '2nd' | '3rd' | 'None';
  grade: 'A' | 'B' | 'C' | 'None';
  positionPoints: number;
  gradePoints: number;
  totalPoints: number;
  isTied: boolean;
  status: string;
}

export interface GradeTier {
  grade: string;
  minPercentage: number;
  points: number;
}

export interface PositionPointMap {
  [position: string]: number; // "1": 5, "2": 3, "3": 1
}

/**
 * Calculates score for an entry based on scoring method
 */
export function aggregateScores(
  marks: number[],
  maxMarks: number,
  method: string = 'AVERAGE'
): { totalScore: number; finalScore: number; percentage: number } {
  if (!marks || marks.length === 0) {
    return { totalScore: 0, finalScore: 0, percentage: 0 };
  }

  const validMarks = marks.filter((m) => typeof m === 'number' && !isNaN(m));
  if (validMarks.length === 0) {
    return { totalScore: 0, finalScore: 0, percentage: 0 };
  }

  const total = validMarks.reduce((sum, val) => sum + val, 0);

  let finalScore = 0;
  if (method === 'TOTAL') {
    finalScore = total;
    const maxPossible = maxMarks * validMarks.length;
    const percentage = maxPossible > 0 ? (finalScore / maxPossible) * 100 : 0;
    return {
      totalScore: Number(total.toFixed(2)),
      finalScore: Number(finalScore.toFixed(2)),
      percentage: Number(percentage.toFixed(2)),
    };
  } else if (method === 'DROP_HIGH_LOW' && validMarks.length >= 3) {
    const minVal = Math.min(...validMarks);
    const maxVal = Math.max(...validMarks);
    const trimmedSum = total - minVal - maxVal;
    finalScore = trimmedSum / (validMarks.length - 2);
  } else {
    // Default AVERAGE
    finalScore = total / validMarks.length;
  }

  const percentage = maxMarks > 0 ? (finalScore / maxMarks) * 100 : 0;

  return {
    totalScore: Number(total.toFixed(2)),
    finalScore: Number(finalScore.toFixed(2)),
    percentage: Number(percentage.toFixed(2)),
  };
}

/**
 * Evaluates Grade tier based on percentage and program grade boundaries
 */
export function determineGrade(
  percentage: number,
  boundaries: GradeTier[]
): { grade: 'A' | 'B' | 'C' | 'None'; gradePoints: number } {
  // Sort descending by minPercentage
  const sorted = [...boundaries].sort((a, b) => b.minPercentage - a.minPercentage);
  for (const tier of sorted) {
    if (percentage >= tier.minPercentage) {
      return {
        grade: tier.grade as 'A' | 'B' | 'C',
        gradePoints: tier.points,
      };
    }
  }
  return { grade: 'None', gradePoints: 0 };
}

/**
 * Processes all entries for a program and assigns Ranks, Positions, Grades, and Points
 */
export function calculateProgramResults(
  entries: ScoreItem[],
  maxMarks: number,
  scoringMethod: string,
  positionPointsMap: PositionPointMap,
  gradeBoundaries: GradeTier[],
  tiePolicy: 'SHARED' | 'SPLIT' | 'MANUAL' = 'SHARED'
): CalculationResult[] {
  // 1. Compute aggregate scores for all entries
  const evaluated = entries.map((entry) => {
    if (entry.status !== 'PERFORMED' && entry.status !== 'REGISTERED') {
      return {
        entryId: entry.entryId,
        totalScore: 0,
        finalScore: 0,
        percentage: 0,
        status: entry.status,
        hasScore: false,
      };
    }

    const { totalScore, finalScore, percentage } = aggregateScores(
      entry.marks,
      maxMarks,
      scoringMethod
    );

    return {
      entryId: entry.entryId,
      totalScore,
      finalScore,
      percentage,
      status: entry.status,
      hasScore: entry.marks.length > 0 && finalScore > 0,
    };
  });

  // 2. Separate active performers from absentees/disqualified
  const activeEntries = evaluated.filter((e) => e.hasScore && e.status === 'PERFORMED');
  const nonActiveEntries = evaluated.filter((e) => !e.hasScore || e.status !== 'PERFORMED');

  // 3. Sort active performers descending by finalScore
  activeEntries.sort((a, b) => b.finalScore - a.finalScore);

  // 4. Assign ranks, positions, and grades
  const results: CalculationResult[] = [];
  let currentRank = 1;

  for (let i = 0; i < activeEntries.length; i++) {
    const item = activeEntries[i];

    // Determine if tied with previous
    const isTiedWithPrev = i > 0 && activeEntries[i - 1].finalScore === item.finalScore;
    const isTiedWithNext =
      i < activeEntries.length - 1 && activeEntries[i + 1].finalScore === item.finalScore;
    const isTied = isTiedWithPrev || isTiedWithNext;

    if (i > 0 && !isTiedWithPrev) {
      currentRank = tiePolicy === 'SHARED' ? currentRank + 1 : i + 1;
    }

    // Assign position
    let positionText: '1st' | '2nd' | '3rd' | 'None' = 'None';
    let posPts = 0;

    if (currentRank === 1) {
      positionText = '1st';
      posPts = positionPointsMap['1'] || 5;
    } else if (currentRank === 2) {
      positionText = '2nd';
      posPts = positionPointsMap['2'] || 3;
    } else if (currentRank === 3) {
      positionText = '3rd';
      posPts = positionPointsMap['3'] || 1;
    }

    // Determine Grade
    const { grade, gradePoints } = determineGrade(item.percentage, gradeBoundaries);

    // Total points for candidate = Position Points + Grade Points
    const totalPoints = posPts + gradePoints;

    results.push({
      entryId: item.entryId,
      totalScore: item.totalScore,
      finalScore: item.finalScore,
      percentage: item.percentage,
      rank: currentRank,
      position: positionText,
      grade,
      positionPoints: posPts,
      gradePoints,
      totalPoints,
      isTied,
      status: 'NORMAL',
    });
  }

  // 5. Append non-active entries
  for (const item of nonActiveEntries) {
    results.push({
      entryId: item.entryId,
      totalScore: 0,
      finalScore: 0,
      percentage: 0,
      rank: 999,
      position: 'None',
      grade: 'None',
      positionPoints: 0,
      gradePoints: 0,
      totalPoints: 0,
      isTied: false,
      status: item.status || 'ABSENT',
    });
  }

  return results;
}

/**
 * Recalculates and updates the global institution points leaderboard for a festival
 */
export async function recalculateFestivalLeaderboard(festivalId: string): Promise<void> {
  // 1. Get all published results for this festival
  const publishedPrograms = await prisma.program.findMany({
    where: {
      festivalId,
      status: 'PUBLISHED',
      result: {
        status: 'PUBLISHED',
      },
    },
    include: {
      result: {
        include: {
          positions: {
            include: {
              entry: true,
            },
          },
        },
      },
    },
  });

  // 2. Fetch all institutions for this festival
  const institutions = await prisma.institution.findMany({
    where: { festivalId },
  });

  // 3. Initialize points tally map
  const institutionMap = new Map<
    string,
    {
      totalPoints: number;
      firstCount: number;
      secondCount: number;
      thirdCount: number;
      gradeACount: number;
    }
  >();

  for (const inst of institutions) {
    institutionMap.set(inst.id, {
      totalPoints: 0,
      firstCount: 0,
      secondCount: 0,
      thirdCount: 0,
      gradeACount: 0,
    });
  }

  // 4. Accumulate points from every published result position
  for (const prog of publishedPrograms) {
    if (!prog.result) continue;
    for (const pos of prog.result.positions) {
      const instId = pos.entry.institutionId;
      const current = institutionMap.get(instId);
      if (!current) continue;

      current.totalPoints += pos.totalPoints;
      if (pos.position === '1st') current.firstCount += 1;
      else if (pos.position === '2nd') current.secondCount += 1;
      else if (pos.position === '3rd') current.thirdCount += 1;

      if (pos.grade === 'A') current.gradeACount += 1;
    }
  }

  // 5. Sort institutions according to festival championship ranking rules
  const rankedList = Array.from(institutionMap.entries()).map(([institutionId, stats]) => ({
    institutionId,
    ...stats,
  }));

  rankedList.sort((a, b) => {
    // 1st: Total Points
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    // Tie-breaker 1: 1st Position Count
    if (b.firstCount !== a.firstCount) return b.firstCount - a.firstCount;
    // Tie-breaker 2: 2nd Position Count
    if (b.secondCount !== a.secondCount) return b.secondCount - a.secondCount;
    // Tie-breaker 3: 3rd Position Count
    if (b.thirdCount !== a.thirdCount) return b.thirdCount - a.thirdCount;
    // Tie-breaker 4: Grade A Count
    return b.gradeACount - a.gradeACount;
  });

  // 6. Update database atomically
  let rank = 1;
  for (let i = 0; i < rankedList.length; i++) {
    const item = rankedList[i];
    if (i > 0) {
      const prev = rankedList[i - 1];
      const isIdentical =
        prev.totalPoints === item.totalPoints &&
        prev.firstCount === item.firstCount &&
        prev.secondCount === item.secondCount &&
        prev.thirdCount === item.thirdCount &&
        prev.gradeACount === item.gradeACount;
      if (!isIdentical) {
        rank = i + 1;
      }
    }

    await prisma.institutionPoint.upsert({
      where: {
        festivalId_institutionId: {
          festivalId,
          institutionId: item.institutionId,
        },
      },
      update: {
        totalPoints: Number(item.totalPoints.toFixed(2)),
        firstCount: item.firstCount,
        secondCount: item.secondCount,
        thirdCount: item.thirdCount,
        gradeACount: item.gradeACount,
        rank,
      },
      create: {
        festivalId,
        institutionId: item.institutionId,
        totalPoints: Number(item.totalPoints.toFixed(2)),
        firstCount: item.firstCount,
        secondCount: item.secondCount,
        thirdCount: item.thirdCount,
        gradeACount: item.gradeACount,
        rank,
      },
    });
  }
}

