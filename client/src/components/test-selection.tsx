import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeftRight, 
  Timer, 
  Route, 
  Grid3X3, 
  Hand,
  BarChart3 
} from "lucide-react";
import { ParticipantInfo } from "@shared/schema";
import { getAllTestData } from "@/lib/test-data";

interface TestSelectionProps {
  participantInfo: ParticipantInfo;
}

const tests = [
  {
    id: 'flanker',
    name: 'Eriksen Flanker Task',
    category: 'Attention',
    categoryColor: 'bg-blue-100 text-blue-800',
    icon: ArrowLeftRight,
    iconBg: 'bg-blue-100',
    iconColor: 'text-primary',
    description: 'Measures selective attention and cognitive control by responding to target arrows while ignoring distractors.',
    duration: '~5 minutes',
  },
  {
    id: 'reaction',
    name: 'Simple Reaction Time',
    category: 'Speed',
    categoryColor: 'bg-green-100 text-green-800',
    icon: Timer,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    description: 'Measures basic processing speed by responding as quickly as possible to visual stimuli.',
    duration: '~3 minutes',
  },
  {
    id: 'trails',
    name: 'Trail Making Task',
    category: 'Executive',
    categoryColor: 'bg-purple-100 text-purple-800',
    icon: Route,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    description: 'Assesses visual scanning, processing speed, and cognitive flexibility by connecting numbered sequences.',
    duration: '~3 minutes',
  },
  {
    id: 'corsi',
    name: 'Corsi Memory Task',
    category: 'Memory',
    categoryColor: 'bg-yellow-100 text-yellow-800',
    icon: Grid3X3,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    description: 'Evaluates visuospatial working memory by reproducing sequences of block positions.',
    duration: '~8 minutes',
  },
  {
    id: 'gonogo',
    name: 'Go No-Go Task',
    category: 'Inhibition',
    categoryColor: 'bg-red-100 text-red-800',
    icon: Hand,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    description: 'Measures response inhibition and impulse control by responding to targets while withholding responses to non-targets.',
    duration: '~5 minutes',
  },
];

export default function TestSelection({ participantInfo }: TestSelectionProps) {
  const [, setLocation] = useLocation();
  const [testProgress, setTestProgress] = useState<Record<string, string>>({});

  useEffect(() => {
    const sessionData = getAllTestData();
    const progress: Record<string, string> = {};
    
    tests.forEach(test => {
      const testResult = sessionData?.tests[test.id];
      if (testResult?.completed) {
        progress[test.id] = 'Completed';
      } else {
        progress[test.id] = 'Not Started';
      }
    });
    
    setTestProgress(progress);
  }, []);

  const handleStartTest = (testId: string) => {
    setLocation(`/test/${testId}`);
  };

  const completedTests = Object.values(testProgress).filter(status => status === 'Completed').length;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cognitive Assessment Battery</h2>
        <p className="text-gray-600">Complete the following cognitive tests. Each test includes practice trials and clear instructions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <Card key={test.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className={`${test.iconBg} rounded-lg p-3 mr-4`}>
                  <test.icon className={`${test.iconColor} text-xl`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
                  <Badge variant="secondary" className={test.categoryColor}>
                    {test.category}
                  </Badge>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">{test.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{test.duration}</span>
                <Button 
                  onClick={() => handleStartTest(test.id)}
                  className="bg-primary hover:bg-blue-700 text-white"
                >
                  Start Test
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Progress Overview */}
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardContent className="p-6">
            <div className="text-center">
              <BarChart3 className="text-gray-400 text-2xl mb-3 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Progress Overview</h3>
              <p className="text-gray-500 text-sm mb-4">
                Complete all tests to view comprehensive results and download your data.
              </p>
              <div className="space-y-2">
                {tests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between bg-white rounded p-2">
                    <span className="text-sm text-gray-600">{test.name}</span>
                    <Badge 
                      variant="secondary"
                      className={testProgress[test.id] === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}
                    >
                      {testProgress[test.id] || 'Not Started'}
                    </Badge>
                  </div>
                ))}
              </div>
              {completedTests > 0 && (
                <div className="mt-4">
                  <Button 
                    onClick={() => setLocation('/results')}
                    variant="outline"
                    className="w-full"
                  >
                    View Results ({completedTests}/{tests.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
