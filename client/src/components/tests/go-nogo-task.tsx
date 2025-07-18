import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ParticipantInfo } from "@shared/schema";
import { generateRandomSequence, calculateTestMetrics } from "@/lib/test-utils";

interface GoNoGoTaskProps {
  onComplete: (results: any) => void;
  onExit: () => void;
  participantInfo: ParticipantInfo;
}

type GoNoGoStimulus = {
  letter: string;
  type: 'go' | 'nogo';
};

const stimuli: GoNoGoStimulus[] = [
  { letter: 'A', type: 'go' },
  { letter: 'B', type: 'go' },
  { letter: 'C', type: 'go' },
  { letter: 'D', type: 'go' },
  { letter: 'E', type: 'go' },
  { letter: 'F', type: 'go' },
  { letter: 'G', type: 'go' },
  { letter: 'H', type: 'go' },
  { letter: 'I', type: 'go' },
  { letter: 'J', type: 'go' },
  { letter: 'K', type: 'go' },
  { letter: 'L', type: 'go' },
  { letter: 'M', type: 'go' },
  { letter: 'N', type: 'go' },
  { letter: 'O', type: 'go' },
  { letter: 'P', type: 'go' },
  { letter: 'Q', type: 'go' },
  { letter: 'R', type: 'go' },
  { letter: 'S', type: 'go' },
  { letter: 'T', type: 'go' },
  { letter: 'U', type: 'go' },
  { letter: 'V', type: 'go' },
  { letter: 'W', type: 'go' },
  { letter: 'Y', type: 'go' },
  { letter: 'Z', type: 'go' },
  { letter: 'X', type: 'nogo' }, // X is the no-go stimulus
];

export default function GoNoGoTask({ onComplete, onExit, participantInfo }: GoNoGoTaskProps) {
  const [phase, setPhase] = useState<'instructions' | 'practice' | 'test' | 'complete'>('instructions');
  const [currentTrial, setCurrentTrial] = useState(0);
  const [currentStimulus, setCurrentStimulus] = useState<GoNoGoStimulus | null>(null);
  const [trialData, setTrialData] = useState<any[]>([]);
  const [showStimulus, setShowStimulus] = useState(false);
  const [trialStartTime, setTrialStartTime] = useState(0);
  const [responded, setResponded] = useState(false);
  const [isPractice, setIsPractice] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  
  const totalTrials = 100;
  const practiceTrials = 20;
  const nogoPercentage = 0.25; // 25% no-go trials
  const [stimulusSequence, setStimulusSequence] = useState<GoNoGoStimulus[]>([]);

  useEffect(() => {
    // Generate randomized stimulus sequence with 25% no-go trials
    const goStimuli = stimuli.filter(s => s.type === 'go');
    const nogoStimuli = stimuli.filter(s => s.type === 'nogo');
    
    const sequence: GoNoGoStimulus[] = [];
    const nogoCount = Math.floor(totalTrials * nogoPercentage);
    const goCount = totalTrials - nogoCount;
    
    // Add go trials
    for (let i = 0; i < goCount; i++) {
      sequence.push(goStimuli[Math.floor(Math.random() * goStimuli.length)]);
    }
    
    // Add no-go trials
    for (let i = 0; i < nogoCount; i++) {
      sequence.push(nogoStimuli[0]); // Always use 'X' for no-go
    }
    
    // Shuffle the sequence
    for (let i = sequence.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
    }
    
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
      ? stimuli[Math.floor(Math.random() * stimuli.length)]
      : stimulusSequence[currentTrial];
    
    setCurrentStimulus(stimulus);
    setShowStimulus(true);
    setTrialStartTime(performance.now());
    setResponded(false);
    
    // Hide stimulus after 1 second and wait for response window
    setTimeout(() => {
      setShowStimulus(false);
      
      // End trial after response window (1.5 seconds total)
      setTimeout(() => {
        if (!responded && currentStimulus) {
          // No response recorded
          const correct = currentStimulus.type === 'nogo';
          
          if (!isPractice) {
            const trial = {
              testType: 'gonogo',
              trialNumber: currentTrial + 1,
              stimulus: currentStimulus.letter,
              response: 'no_response',
              reactionTime: null,
              accuracy: correct ? 1 : 0,
              stimulusType: currentStimulus.type,
              timestamp: new Date().toISOString(),
            };
            
            setTrialData(prev => [...prev, trial]);
          }
        }
        
        setCurrentTrial(prev => prev + 1);
      }, 500);
    }, 1000);
  }, [currentTrial, isPractice, stimulusSequence, responded, currentStimulus]);

  const handleResponse = useCallback(() => {
    if (!currentStimulus || responded) return;

    const reactionTime = performance.now() - trialStartTime;
    const correct = currentStimulus.type === 'go';
    setResponded(true);
    
    if (!isPractice) {
      const trial = {
        testType: 'gonogo',
        trialNumber: currentTrial + 1,
        stimulus: currentStimulus.letter,
        response: 'spacebar',
        reactionTime: Math.round(reactionTime),
        accuracy: correct ? 1 : 0,
        stimulusType: currentStimulus.type,
        timestamp: new Date().toISOString(),
      };
      
      setTrialData(prev => [...prev, trial]);
    }
  }, [currentStimulus, trialStartTime, currentTrial, isPractice, responded]);

  useEffect(() => {
    if (phase === 'practice' || phase === 'test') {
      const timer = setTimeout(startTrial, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, currentTrial, startTrial]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (phase !== 'practice' && phase !== 'test') return;
      if (!showStimulus) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleResponse();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase, showStimulus, handleResponse]);

  useEffect(() => {
    if (trialData.length > 0) {
      const correctTrials = trialData.filter(t => t.accuracy === 1).length;
      const acc = Math.round((correctTrials / trialData.length) * 100);
      setAccuracy(acc);
    }
  }, [trialData]);

  useEffect(() => {
    if (phase === 'complete') {
      const metrics = calculateTestMetrics(trialData);
      onComplete({
        testType: 'gonogo',
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Go No-Go Task</h2>
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
              <div className="bg-red-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Instructions</h3>
                <p className="text-gray-700 mb-4">
                  Letters will appear on the screen one at a time. Your task is to respond quickly to most letters, but withhold your response when you see the letter <strong>X</strong>.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-700 mb-2">GO Trials</h4>
                    <p className="text-sm text-gray-600">
                      Press <kbd className="bg-gray-200 px-2 py-1 rounded">SPACEBAR</kbd> when you see any letter <strong>except X</strong>
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="font-semibold text-red-700 mb-2">NO-GO Trials</h4>
                    <p className="text-sm text-gray-600">
                      Do <strong>NOT</strong> press anything when you see the letter <strong>X</strong>
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  Respond as quickly and accurately as possible. Each letter appears for only 1 second.
                </p>
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
            <div className="max-w-lg mx-auto text-center">
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-6">
                {showStimulus && currentStimulus && (
                  <div className="text-8xl font-bold">{currentStimulus.letter}</div>
                )}
                {!showStimulus && (
                  <div className="text-4xl text-gray-400">+</div>
                )}
              </div>
              
              <div className="text-center mb-4 h-8">
                {showStimulus && currentStimulus && (
                  <p className="text-gray-600">
                    {currentStimulus.type === 'go' ? 'Press SPACEBAR' : 'Do NOT respond'}
                  </p>
                )}
              </div>

              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Accuracy: <span className="font-semibold">{accuracy}%</span>
                </p>
              </div>

              <Button variant="outline" onClick={onExit}>
                Exit Test
              </Button>
              
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
