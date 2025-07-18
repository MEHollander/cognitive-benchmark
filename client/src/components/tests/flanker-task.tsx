import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ParticipantInfo } from "@shared/schema";
import { generateRandomSequence, calculateTestMetrics } from "@/lib/test-utils";

interface FlankerTaskProps {
  onComplete: (results: any) => void;
  onExit: () => void;
  participantInfo: ParticipantInfo;
}

type FlankerStimulus = {
  display: string;
  target: 'left' | 'right';
  type: 'congruent' | 'incongruent';
};

const stimuli: FlankerStimulus[] = [
  { display: '← ← ← ← ←', target: 'left', type: 'congruent' },
  { display: '→ → → → →', target: 'right', type: 'congruent' },
  { display: '→ → ← → →', target: 'left', type: 'incongruent' },
  { display: '← ← → ← ←', target: 'right', type: 'incongruent' },
];

export default function FlankerTask({ onComplete, onExit, participantInfo }: FlankerTaskProps) {
  const [phase, setPhase] = useState<'instructions' | 'practice' | 'test' | 'complete'>('instructions');
  const [currentTrial, setCurrentTrial] = useState(0);
  const [currentStimulus, setCurrentStimulus] = useState<FlankerStimulus | null>(null);
  const [trialData, setTrialData] = useState<any[]>([]);
  const [showStimulus, setShowStimulus] = useState(false);
  const [trialStartTime, setTrialStartTime] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isPractice, setIsPractice] = useState(false);
  
  const totalTrials = 80;
  const practiceTrials = 10;
  const [stimulusSequence, setStimulusSequence] = useState<FlankerStimulus[]>([]);

  useEffect(() => {
    // Generate randomized stimulus sequence
    const sequence = generateRandomSequence(stimuli, totalTrials);
    setStimulusSequence(sequence);
  }, []);

  const startTrial = useCallback(() => {
    if (currentTrial >= (isPractice ? practiceTrials : totalTrials)) {
      if (isPractice) {
        setPhase('test');
        setCurrentTrial(0);
        setIsPractice(false);
        return;
      } else {
        setPhase('complete');
        return;
      }
    }

    const stimulus = isPractice 
      ? stimuli[currentTrial % stimuli.length]
      : stimulusSequence[currentTrial];
    
    setCurrentStimulus(stimulus);
    setShowStimulus(true);
    setTrialStartTime(performance.now());
    setFeedback('');
  }, [currentTrial, isPractice, stimulusSequence]);

  const handleResponse = useCallback((response: 'left' | 'right') => {
    if (!currentStimulus || !showStimulus) return;

    const reactionTime = performance.now() - trialStartTime;
    const correct = response === currentStimulus.target;
    
    const trial = {
      testType: 'flanker',
      trialNumber: currentTrial + 1,
      stimulus: currentStimulus.display,
      response: response,
      reactionTime: Math.round(reactionTime),
      accuracy: correct ? 1 : 0,
      stimulusType: currentStimulus.type,
      timestamp: new Date().toISOString(),
    };

    if (!isPractice) {
      setTrialData(prev => [...prev, trial]);
    }

    // Show feedback
    setFeedback(correct ? 'Correct!' : 'Incorrect');
    setShowStimulus(false);

    // Next trial after delay
    setTimeout(() => {
      setCurrentTrial(prev => prev + 1);
      setFeedback('');
    }, isPractice ? 1000 : 500);
  }, [currentStimulus, showStimulus, trialStartTime, currentTrial, isPractice]);

  useEffect(() => {
    if (phase === 'practice' || phase === 'test') {
      const timer = setTimeout(startTrial, 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, currentTrial, startTrial]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (phase !== 'practice' && phase !== 'test') return;
      if (!showStimulus) return;

      if (e.key === 'ArrowLeft') {
        handleResponse('left');
      } else if (e.key === 'ArrowRight') {
        handleResponse('right');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase, showStimulus, handleResponse]);

  useEffect(() => {
    if (phase === 'complete') {
      const metrics = calculateTestMetrics(trialData);
      onComplete({
        testType: 'flanker',
        trialData,
        metrics,
        participantInfo,
      });
    }
  }, [phase, trialData, onComplete, participantInfo]);

  const progress = phase === 'practice' 
    ? (currentTrial / practiceTrials) * 100
    : (currentTrial / totalTrials) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Eriksen Flanker Task</h2>
            {(phase === 'practice' || phase === 'test') && (
              <div className="flex items-center justify-center space-x-4 mb-4">
                <span className="text-sm text-gray-600">
                  {isPractice ? 'Practice ' : ''}Trial {currentTrial} of {isPractice ? practiceTrials : totalTrials}
                </span>
                <div className="w-48">
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            )}
          </div>

          {phase === 'instructions' && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Instructions</h3>
                <p className="text-gray-700 mb-4">
                  You will see arrows pointing left or right. Focus on the <strong>center arrow</strong> and respond as quickly and accurately as possible:
                </p>
                <div className="flex justify-center space-x-8 mb-4">
                  <div className="text-center">
                    <div className="bg-white rounded p-3 mb-2 text-2xl">←</div>
                    <p className="text-sm">Press <kbd className="bg-gray-200 px-2 py-1 rounded">←</kbd></p>
                  </div>
                  <div className="text-center">
                    <div className="bg-white rounded p-3 mb-2 text-2xl">→</div>
                    <p className="text-sm">Press <kbd className="bg-gray-200 px-2 py-1 rounded">→</kbd></p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Example: For ← ← ← ← ←, press the left arrow key</p>
              </div>
              <Button 
                onClick={() => {
                  setPhase('practice');
                  setIsPractice(true);
                  setCurrentTrial(0);
                }}
                className="bg-primary hover:bg-blue-700"
              >
                Start Practice
              </Button>
            </div>
          )}

          {(phase === 'practice' || phase === 'test') && (
            <div>
              <div className="text-center mb-8">
                {showStimulus && currentStimulus && (
                  <div className="text-6xl font-mono mb-4">{currentStimulus.display}</div>
                )}
                {!showStimulus && !feedback && (
                  <div className="text-6xl font-mono mb-4 text-gray-300">+ + + + +</div>
                )}
                <p className="text-sm text-gray-600">Focus on the center arrow</p>
              </div>
              
              <div className="text-center mb-4 h-8">
                {feedback && (
                  <span className={`text-lg font-medium ${
                    feedback === 'Correct!' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {feedback}
                  </span>
                )}
              </div>

              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={onExit}>
                  Exit Test
                </Button>
              </div>
              
              {isPractice && currentTrial >= practiceTrials && (
                <div className="text-center mt-4">
                  <p className="text-gray-600 mb-4">Practice complete! Ready to start the main test?</p>
                  <Button 
                    onClick={() => {
                      setPhase('test');
                      setIsPractice(false);
                      setCurrentTrial(0);
                    }}
                    className="bg-primary hover:bg-blue-700"
                  >
                    Start Main Test
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
