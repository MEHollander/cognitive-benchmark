import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ParticipantInfo } from "@shared/schema";
import { calculateTestMetrics } from "@/lib/test-utils";

interface ReactionTimeTaskProps {
  onComplete: (results: any) => void;
  onExit: () => void;
  participantInfo: ParticipantInfo;
}

export default function ReactionTimeTask({ onComplete, onExit, participantInfo }: ReactionTimeTaskProps) {
  const [phase, setPhase] = useState<'instructions' | 'waiting' | 'stimulus' | 'response' | 'complete'>('instructions');
  const [currentTrial, setCurrentTrial] = useState(0);
  const [trialData, setTrialData] = useState<any[]>([]);
  const [trialStartTime, setTrialStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [averageRT, setAverageRT] = useState(0);
  const [falseStarts, setFalseStarts] = useState(0);
  const [waitTimeout, setWaitTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [timerDisplay, setTimerDisplay] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  const totalTrials = 50;
  const interTrialDelay = 2000; // 2 seconds between trials

  const startTrial = useCallback(() => {
    if (currentTrial >= totalTrials) {
      setPhase('complete');
      return;
    }

    setPhase('waiting');
    setShowTimer(false);
    setReactionTime(null);
    
    // Random delay between 1-5 seconds
    const delay = 1000 + Math.random() * 4000;
    const timeout = setTimeout(() => {
      const stimulusStartTime = performance.now();
      setPhase('stimulus');
      setTrialStartTime(stimulusStartTime);
      setShowTimer(true);
      setTimerDisplay(0);
      
      // Update timer display in real time
      const interval = setInterval(() => {
        const elapsed = performance.now() - stimulusStartTime;
        setTimerDisplay(Math.floor(elapsed));
      }, 10);
      setTimerInterval(interval);
    }, delay);
    
    setWaitTimeout(timeout);
  }, [currentTrial, totalTrials]);

  const handleResponse = useCallback(() => {
    if (phase === 'waiting') {
      // Too early response - restart this trial
      if (waitTimeout) {
        clearTimeout(waitTimeout);
        setWaitTimeout(null);
      }
      setPhase('response');
      setReactionTime(null);
      setFalseStarts(prev => prev + 1);
      
      // Record false start as trial data
      const trial = {
        testType: 'reaction',
        trialNumber: currentTrial + 1,
        stimulus: 'false_start',
        response: 'spacebar',
        reactionTime: -1,
        accuracy: 0,
        timestamp: new Date().toISOString(),
      };
      
      setTrialData(prev => [...prev, trial]);
      
      // Wait for inter-trial delay then restart same trial  
      setTimeout(() => {
        startTrial();
      }, interTrialDelay);
      return;
    }

    if (phase !== 'stimulus') return;

    const rt = performance.now() - trialStartTime;
    setReactionTime(Math.round(rt));
    setShowTimer(false);
    
    // Clear timer interval
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    const trial = {
      testType: 'reaction',
      trialNumber: currentTrial + 1,
      stimulus: 'timer_target',
      response: 'spacebar',
      reactionTime: Math.round(rt),
      accuracy: 1,
      timestamp: new Date().toISOString(),
    };

    const newTrialData = [...trialData, trial];
    setTrialData(newTrialData);

    // Update average RT
    const validRTs = newTrialData.map(t => t.reactionTime).filter(rt => rt > 0);
    const avgRT = validRTs.reduce((sum, rt) => sum + rt, 0) / validRTs.length;
    setAverageRT(Math.round(avgRT));

    setPhase('response');
    
    // Wait for inter-trial delay then start next trial
    setTimeout(() => {
      const nextTrial = currentTrial + 1;
      setCurrentTrial(nextTrial);
      if (nextTrial < totalTrials) {
        startTrial();
      } else {
        setPhase('complete');
      }
    }, interTrialDelay);
  }, [phase, trialStartTime, currentTrial, trialData, waitTimeout, interTrialDelay, startTrial, timerInterval, totalTrials]);

  // Effect to start first trial only
  useEffect(() => {
    if (phase === 'instructions') return;
    
    if (currentTrial === 0) {
      // Start first trial
      const timer = setTimeout(startTrial, 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, currentTrial, startTrial]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (waitTimeout) clearTimeout(waitTimeout);
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [waitTimeout, timerInterval]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleResponse();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleResponse]);

  useEffect(() => {
    if (phase === 'complete') {
      const metrics = calculateTestMetrics(trialData);
      onComplete({
        testType: 'reaction',
        trialData,
        metrics,
        participantInfo,
      });
    }
  }, [phase, trialData, onComplete, participantInfo]);

  const progress = (currentTrial / totalTrials) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Simple Reaction Time Task</h2>
            {phase !== 'instructions' && phase !== 'complete' && (
              <div className="flex items-center justify-center space-x-4 mb-4">
                <span className="text-sm text-gray-600">
                  Trial {currentTrial + 1} of {totalTrials}
                </span>
                <div className="w-48">
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            )}
          </div>

          {phase === 'instructions' && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Instructions</h3>
                <p className="text-gray-700 mb-4">
                  A plus sign (+) will appear on the screen. After a random delay, a <strong>timer</strong> will start counting up in milliseconds. Press the spacebar as quickly as possible when the timer appears.
                </p>
                <p className="text-gray-700 mb-4">
                  Wait for the timer to appear before responding. If you respond too early, the trial will restart. The timer freezes at your reaction time.
                </p>
                <div className="flex justify-center space-x-8 mb-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold text-gray-600">+</span>
                    </div>
                    <p className="text-sm">Wait...</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <span className="text-xs font-mono text-red-600">000ms</span>
                    </div>
                    <p className="text-sm">Press <kbd className="bg-gray-200 px-2 py-1 rounded">SPACE</kbd></p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => {
                  setPhase('waiting');
                  startTrial();
                }}
                className="bg-primary hover:bg-blue-700"
              >
                Start Test
              </Button>
            </div>
          )}

          {(phase === 'waiting' || phase === 'stimulus' || phase === 'response') && (
            <div className="max-w-lg mx-auto text-center">
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-6">
                {phase === 'waiting' && (
                  <div className="text-6xl font-bold text-gray-600">+</div>
                )}
                {phase === 'stimulus' && showTimer && (
                  <div className="text-4xl font-mono font-bold text-red-600">
                    {timerDisplay} ms
                  </div>
                )}
                {phase === 'response' && (
                  <div className="text-4xl font-mono font-bold text-blue-600">
                    {reactionTime ? `${reactionTime} ms` : 'Too Early!'}
                  </div>
                )}
              </div>
              
              <div className="text-center mb-4 h-8">
                {phase === 'waiting' && (
                  <p className="text-gray-600">Wait for the timer...</p>
                )}
                {phase === 'stimulus' && showTimer && (
                  <p className="text-red-600 font-semibold">Press SPACEBAR NOW!</p>
                )}
                {phase === 'response' && reactionTime && (
                  <p className="text-blue-600">Reaction Time: {reactionTime} ms</p>
                )}
                {phase === 'response' && !reactionTime && (
                  <p className="text-red-600">Too early! Get ready...</p>
                )}
              </div>

              <p className="text-gray-600 mb-4">
                Press <kbd className="bg-gray-200 px-3 py-1 rounded">SPACEBAR</kbd> when the timer appears
              </p>
              
              <div className="text-center mb-4">
                <span className="text-lg font-semibold text-gray-700">
                  Average RT: <span className="text-primary">{averageRT || '--'} ms</span>
                </span>
              </div>

              <Button variant="outline" onClick={onExit}>
                Exit Test
              </Button>
            </div>
          )}

          {phase === 'complete' && (
            <div className="max-w-lg mx-auto text-center">
              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <h3 className="text-2xl font-bold text-green-900 mb-4">Test Complete!</h3>
                <p className="text-green-700 mb-4">
                  You have successfully completed the Simple Reaction Time Task.
                </p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-white rounded p-3">
                    <div className="font-semibold">Valid Trials</div>
                    <div className="text-2xl">{trialData.filter(t => t.accuracy === 1).length}</div>
                  </div>
                  <div className="bg-white rounded p-3">
                    <div className="font-semibold">Average RT</div>
                    <div className="text-2xl">{averageRT} ms</div>
                  </div>
                  <div className="bg-white rounded p-3">
                    <div className="font-semibold">False Starts</div>
                    <div className="text-2xl">{falseStarts}</div>
                  </div>
                </div>
              </div>
              <Button 
                onClick={onExit}
                className="bg-primary hover:bg-blue-700"
              >
                Return to Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
