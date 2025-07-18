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
  const [averageRT, setAverageRT] = useState(0);
  const [waitTimeout, setWaitTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const totalTrials = 50;

  const startTrial = useCallback(() => {
    if (currentTrial >= totalTrials) {
      setPhase('complete');
      return;
    }

    setPhase('waiting');
    
    // Random delay between 1-4 seconds
    const delay = 1000 + Math.random() * 3000;
    const timeout = setTimeout(() => {
      setPhase('stimulus');
      setTrialStartTime(performance.now());
    }, delay);
    
    setWaitTimeout(timeout);
  }, [currentTrial, totalTrials]);

  const handleResponse = useCallback(() => {
    if (phase === 'waiting') {
      // Too early response
      if (waitTimeout) {
        clearTimeout(waitTimeout);
        setWaitTimeout(null);
      }
      setPhase('response');
      setTimeout(() => {
        setCurrentTrial(prev => prev + 1);
      }, 1500);
      return;
    }

    if (phase !== 'stimulus') return;

    const reactionTime = performance.now() - trialStartTime;
    
    const trial = {
      testType: 'reaction',
      trialNumber: currentTrial + 1,
      stimulus: 'green_circle',
      response: 'spacebar',
      reactionTime: Math.round(reactionTime),
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
    setTimeout(() => {
      setCurrentTrial(prev => prev + 1);
    }, 1000);
  }, [phase, trialStartTime, currentTrial, trialData, waitTimeout]);

  useEffect(() => {
    if (phase === 'waiting' || phase === 'stimulus') {
      const timer = setTimeout(startTrial, phase === 'response' ? 1500 : 0);
      return () => clearTimeout(timer);
    }
  }, [phase, currentTrial, startTrial]);

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
                  A gray circle will appear on the screen. When it turns <strong>green</strong>, press the spacebar as quickly as possible.
                </p>
                <p className="text-gray-700 mb-4">
                  Wait for the circle to turn green before responding. If you respond too early, the trial will restart.
                </p>
                <div className="flex justify-center space-x-8 mb-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm">Wait...</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-2"></div>
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
                <div 
                  className={`w-20 h-20 rounded-full transition-colors duration-200 ${
                    phase === 'stimulus' ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              </div>
              
              <div className="text-center mb-4 h-8">
                {phase === 'waiting' && (
                  <p className="text-gray-600">Wait for green...</p>
                )}
                {phase === 'stimulus' && (
                  <p className="text-green-600 font-semibold">Press SPACEBAR NOW!</p>
                )}
                {phase === 'response' && currentTrial > 0 && (
                  <p className="text-blue-600">Response recorded</p>
                )}
              </div>

              <p className="text-gray-600 mb-4">
                Press <kbd className="bg-gray-200 px-3 py-1 rounded">SPACEBAR</kbd> when the circle turns green
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
        </CardContent>
      </Card>
    </div>
  );
}
