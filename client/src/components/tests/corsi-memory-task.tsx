import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ParticipantInfo } from "@shared/schema";
import { generateRandomSequence } from "@/lib/test-utils";

interface CorsiMemoryTaskProps {
  onComplete: (results: any) => void;
  onExit: () => void;
  participantInfo: ParticipantInfo;
}

export default function CorsiMemoryTask({ onComplete, onExit, participantInfo }: CorsiMemoryTaskProps) {
  const [phase, setPhase] = useState<'instructions' | 'test' | 'complete'>('instructions');
  const [sequenceLength, setSequenceLength] = useState(3);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [currentSequence, setCurrentSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [showingSequence, setShowingSequence] = useState(false);
  const [activeBlock, setActiveBlock] = useState(-1);
  const [trialData, setTrialData] = useState<any[]>([]);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [totalTrials, setTotalTrials] = useState(0);
  
  const maxSequenceLength = 9;
  const trialsPerLength = 2;
  const blocksCount = 9;

  const generateSequence = useCallback((length: number) => {
    const sequence: number[] = [];
    while (sequence.length < length) {
      const block = Math.floor(Math.random() * blocksCount);
      if (!sequence.includes(block)) {
        sequence.push(block);
      }
    }
    return sequence;
  }, []);

  const showSequence = useCallback(async (sequence: number[]) => {
    setShowingSequence(true);
    setActiveBlock(-1);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    for (let i = 0; i < sequence.length; i++) {
      setActiveBlock(sequence[i]);
      await new Promise(resolve => setTimeout(resolve, 600));
      setActiveBlock(-1);
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    setShowingSequence(false);
  }, []);

  const startTrial = useCallback(() => {
    const sequence = generateSequence(sequenceLength);
    setCurrentSequence(sequence);
    setUserSequence([]);
    showSequence(sequence);
  }, [sequenceLength, generateSequence, showSequence]);

  const handleBlockClick = (blockId: number) => {
    if (showingSequence) return;
    
    const newUserSequence = [...userSequence, blockId];
    setUserSequence(newUserSequence);
    
    if (newUserSequence.length === currentSequence.length) {
      // Check if sequence is correct
      const correct = newUserSequence.every((block, index) => 
        block === currentSequence[index]
      );
      
      const trial = {
        testType: 'corsi',
        trialNumber: totalTrials + 1,
        stimulus: currentSequence.join('-'),
        response: newUserSequence.join('-'),
        reactionTime: 0, // Not measuring RT for this task
        accuracy: correct ? 1 : 0,
        sequenceLength,
        timestamp: new Date().toISOString(),
      };
      
      setTrialData(prev => [...prev, trial]);
      setTotalTrials(prev => prev + 1);
      
      if (correct) {
        setConsecutiveCorrect(prev => prev + 1);
      } else {
        setConsecutiveCorrect(0);
      }
      
      // Check if we should continue to next trial or next length
      setTimeout(() => {
        setCurrentTrial(prev => prev + 1);
        
        if (currentTrial + 1 >= trialsPerLength) {
          // Move to next sequence length or end test
          if (!correct || consecutiveCorrect < trialsPerLength - 1) {
            // Failed at this length, end test
            setPhase('complete');
          } else if (sequenceLength >= maxSequenceLength) {
            // Reached max length, end test
            setPhase('complete');
          } else {
            // Move to next length
            setSequenceLength(prev => prev + 1);
            setCurrentTrial(0);
          }
        }
      }, 1500);
    }
  };

  useEffect(() => {
    if (phase === 'test' && !showingSequence && userSequence.length === 0) {
      const timer = setTimeout(startTrial, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, currentTrial, sequenceLength, showingSequence, userSequence.length, startTrial]);

  useEffect(() => {
    if (phase === 'complete') {
      const correctTrials = trialData.filter(t => t.accuracy === 1);
      const spanLength = Math.max(...correctTrials.map(t => t.sequenceLength));
      
      const results = {
        testType: 'corsi',
        trialData,
        spanLength,
        totalTrials: trialData.length,
        correctTrials: correctTrials.length,
        participantInfo,
      };
      
      onComplete(results);
    }
  }, [phase, trialData, onComplete, participantInfo]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Corsi Memory Task</h2>
            {phase === 'test' && (
              <div className="flex items-center justify-center space-x-4 mb-4">
                <span className="text-sm text-gray-600">
                  Sequence Length: <span className="font-bold">{sequenceLength}</span>
                </span>
                <span className="text-sm text-gray-600">
                  Trial <span className="font-bold">{currentTrial + 1}</span> of {trialsPerLength}
                </span>
              </div>
            )}
          </div>

          {phase === 'instructions' && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-yellow-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Instructions</h3>
                <p className="text-gray-700 mb-4">
                  You will see a sequence of blocks light up one by one. Your task is to remember the order and click the blocks in the same sequence.
                </p>
                <ul className="text-left text-gray-700 space-y-2 mb-4">
                  <li>• Watch carefully as the blocks light up in sequence</li>
                  <li>• After the sequence ends, click the blocks in the same order</li>
                  <li>• The sequence will start with 3 blocks and get longer if you succeed</li>
                  <li>• You need to get 2 trials correct at each length to continue</li>
                </ul>
              </div>
              <Button 
                onClick={() => setPhase('test')}
                className="bg-primary hover:bg-blue-700"
              >
                Start Test
              </Button>
            </div>
          )}

          {phase === 'test' && (
            <div className="max-w-lg mx-auto">
              <div className="grid grid-cols-3 gap-4 mb-8">
                {Array.from({ length: blocksCount }, (_, i) => (
                  <div
                    key={i}
                    className={`w-20 h-20 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      activeBlock === i
                        ? 'bg-blue-500 border-blue-600'
                        : userSequence.includes(i)
                        ? 'bg-green-200 border-green-400'
                        : 'bg-blue-100 border-blue-300 hover:bg-blue-200'
                    }`}
                    onClick={() => handleBlockClick(i)}
                  />
                ))}
              </div>

              <div className="text-center">
                <div className="mb-4">
                  {showingSequence ? (
                    <p className="text-gray-700">Watch the sequence...</p>
                  ) : (
                    <p className="text-gray-700">
                      Click the blocks in the same order ({userSequence.length}/{currentSequence.length})
                    </p>
                  )}
                </div>
                
                <div className="space-x-4">
                  <Button 
                    variant="outline"
                    onClick={() => showSequence(currentSequence)}
                    disabled={showingSequence}
                  >
                    Replay Sequence
                  </Button>
                  <Button variant="outline" onClick={onExit}>
                    Exit Test
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
