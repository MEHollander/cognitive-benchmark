export function generateRandomSequence<T>(items: T[], count: number): T[] {
  const sequence: T[] = [];
  for (let i = 0; i < count; i++) {
    sequence.push(items[Math.floor(Math.random() * items.length)]);
  }
  return sequence;
}

export function calculateTestMetrics(trialData: any[]) {
  if (trialData.length === 0) {
    return {
      totalTrials: 0,
      correctTrials: 0,
      accuracy: 0,
      meanRT: 0,
      errors: 0,
    };
  }

  const correctTrials = trialData.filter(t => t.accuracy === 1);
  const totalTrials = trialData.length;
  const accuracy = Math.round((correctTrials.length / totalTrials) * 100);
  const errors = totalTrials - correctTrials.length;
  
  // Calculate mean RT for correct trials with valid reaction times
  const validRTs = correctTrials
    .filter(t => t.reactionTime && t.reactionTime > 0)
    .map(t => t.reactionTime);
  
  const meanRT = validRTs.length > 0 
    ? Math.round(validRTs.reduce((sum, rt) => sum + rt, 0) / validRTs.length)
    : 0;

  return {
    totalTrials,
    correctTrials: correctTrials.length,
    accuracy,
    meanRT,
    errors,
  };
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
