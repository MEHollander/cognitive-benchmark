import { TestSessionData, ParticipantInfo, TestResult, TrialData } from "@shared/schema";

const STORAGE_KEY = 'cognitiveTestData';

export function saveTestData(testType: string, results: any, participantInfo: ParticipantInfo) {
  const existingData = getAllTestData();
  
  // Calculate test metrics
  const trialData = results.trialData || [];
  const correctTrials = trialData.filter((t: any) => t.accuracy === 1);
  const totalTrials = trialData.length;
  const accuracy = totalTrials > 0 ? Math.round((correctTrials.length / totalTrials) * 100) : 0;
  const errors = totalTrials - correctTrials.length;
  
  // Calculate mean reaction time for trials with valid RTs
  const validRTs = trialData
    .filter((t: any) => t.reactionTime && t.reactionTime > 0)
    .map((t: any) => t.reactionTime);
  const meanRT = validRTs.length > 0 
    ? Math.round(validRTs.reduce((sum: number, rt: number) => sum + rt, 0) / validRTs.length)
    : 0;

  const testResult: TestResult = {
    testType,
    completed: true,
    score: accuracy,
    meanRT,
    accuracy,
    errors,
    totalTrials,
  };

  const updatedData: TestSessionData = {
    participantInfo,
    tests: {
      ...existingData.tests,
      [testType]: testResult,
    },
    trialData: [...existingData.trialData, ...trialData],
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
}

export function getAllTestData(): TestSessionData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  return {
    participantInfo: {},
    tests: {},
    trialData: [],
  };
}

export function clearTestData() {
  localStorage.removeItem(STORAGE_KEY);
}

export function loadTestData(testType: string) {
  const data = getAllTestData();
  return data.tests[testType];
}
