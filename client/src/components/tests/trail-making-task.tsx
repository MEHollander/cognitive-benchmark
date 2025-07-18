import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ParticipantInfo } from "@shared/schema";

interface TrailMakingTaskProps {
  onComplete: (results: any) => void;
  onExit: () => void;
  participantInfo: ParticipantInfo;
}

interface Point {
  id: number;
  x: number;
  y: number;
  connected: boolean;
}

export default function TrailMakingTask({ onComplete, onExit, participantInfo }: TrailMakingTaskProps) {
  const [phase, setPhase] = useState<'instructions' | 'test' | 'complete'>('instructions');
  const [points, setPoints] = useState<Point[]>([]);
  const [currentTarget, setCurrentTarget] = useState(1);
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [errors, setErrors] = useState(0);
  const [path, setPath] = useState<{x: number, y: number}[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Generate random points
  const generatePoints = useCallback(() => {
    const newPoints: Point[] = [];
    const canvasWidth = 800;
    const canvasHeight = 600;
    const margin = 50;
    
    for (let i = 1; i <= 10; i++) {
      let x, y;
      let attempts = 0;
      
      do {
        x = margin + Math.random() * (canvasWidth - 2 * margin);
        y = margin + Math.random() * (canvasHeight - 2 * margin);
        attempts++;
      } while (
        attempts < 100 && 
        newPoints.some(point => 
          Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2) < 60
        )
      );
      
      newPoints.push({
        id: i,
        x,
        y,
        connected: false,
      });
    }
    
    setPoints(newPoints);
  }, []);

  // Draw canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw path
    if (path.length > 1) {
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    }
    
    // Draw points
    points.forEach(point => {
      const isTarget = point.id === currentTarget;
      const isConnected = point.connected;
      
      // Circle
      ctx.beginPath();
      ctx.arc(point.x, point.y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = isConnected ? '#10B981' : isTarget ? '#EF4444' : '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = isTarget ? '#EF4444' : '#6B7280';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Number
      ctx.fillStyle = isConnected ? '#FFFFFF' : '#000000';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(point.id.toString(), point.x, point.y);
    });
  }, [points, currentTarget, path]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (phase === 'test' && startTime > 0) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [phase, startTime]);

  // Draw canvas effect
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Initialize points when test starts
  useEffect(() => {
    if (phase === 'test') {
      generatePoints();
      setStartTime(Date.now());
      setCurrentTarget(1);
      setErrors(0);
      setPath([]);
    }
  }, [phase, generatePoints]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (phase !== 'test') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedPoint = points.find(point => 
      Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2) <= 20
    );
    
    if (clickedPoint) {
      if (clickedPoint.id === currentTarget) {
        // Correct target
        setPoints(prev => 
          prev.map(p => 
            p.id === clickedPoint.id ? { ...p, connected: true } : p
          )
        );
        setPath(prev => [...prev, { x: clickedPoint.x, y: clickedPoint.y }]);
        
        if (currentTarget === 10) {
          // Test complete
          const completionTime = Date.now() - startTime;
          setPhase('complete');
          
          const results = {
            testType: 'trails',
            completionTime,
            errors,
            participantInfo,
            trialData: [{
              testType: 'trails',
              trialNumber: 1,
              stimulus: 'trail_making_a',
              response: 'completed',
              reactionTime: completionTime,
              accuracy: errors === 0 ? 1 : 0,
              errors,
              timestamp: new Date().toISOString(),
            }]
          };
          
          onComplete(results);
        } else {
          setCurrentTarget(prev => prev + 1);
        }
      } else {
        // Wrong target
        setErrors(prev => prev + 1);
      }
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Trail Making Task</h2>
            <p className="text-gray-600">Part A: Connect numbers 1-25 in ascending order</p>
            {phase === 'test' && (
              <div className="mt-4">
                <div className="flex justify-center space-x-8 text-sm text-gray-600">
                  <span>Time: <span className="font-mono text-lg">{formatTime(elapsedTime)}</span></span>
                  <span>Next: <span className="font-bold text-red-600">{currentTarget}</span></span>
                  <span>Errors: <span className="font-bold">{errors}</span></span>
                </div>
              </div>
            )}
          </div>

          {phase === 'instructions' && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-purple-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Instructions</h3>
                <p className="text-gray-700 mb-4">
                  You will see numbered circles scattered across the screen. Your task is to connect them in numerical order (1 → 2 → 3 → ... → 10) as quickly and accurately as possible.
                </p>
                <ul className="text-left text-gray-700 space-y-2 mb-4">
                  <li>• Click on circle "1" first, then "2", then "3", and so on</li>
                  <li>• Work as quickly as possible while maintaining accuracy</li>
                  <li>• If you click the wrong number, you'll get an error but can continue</li>
                  <li>• Try to draw straight lines between consecutive numbers</li>
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
            <div className="flex flex-col items-center">
              <div className="relative bg-gray-50 rounded-lg border-2 border-gray-200 mb-4">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="cursor-crosshair"
                  onClick={handleCanvasClick}
                />
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Click each number in order. Currently looking for: <strong>{currentTarget}</strong>
                </p>
                <Button variant="outline" onClick={onExit}>
                  Exit Test
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
