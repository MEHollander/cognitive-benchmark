import { useParams, useLocation } from "wouter";
import { useEffect, useState } from "react";
import FlankerTask from "@/components/tests/flanker-task";
import ReactionTimeTask from "@/components/tests/reaction-time-task";
import TrailMakingTask from "@/components/tests/trail-making-task";
import CorsiMemoryTask from "@/components/tests/corsi-memory-task";
import GoNoGoTask from "@/components/tests/go-nogo-task";
import { ParticipantInfo } from "@shared/schema";
import { loadTestData, saveTestData } from "@/lib/test-data";

export default function TestInterface() {
  const { testType } = useParams<{ testType: string }>();
  const [, setLocation] = useLocation();
  const [participantInfo, setParticipantInfo] = useState<ParticipantInfo>({});

  useEffect(() => {
    // Load participant info from localStorage
    const stored = localStorage.getItem('participantInfo');
    if (stored) {
      setParticipantInfo(JSON.parse(stored));
    }
  }, []);

  const handleTestComplete = (testResults: any) => {
    // Save test results
    saveTestData(testType!, testResults, participantInfo);
    
    // Navigate back to home
    setLocation('/');
  };

  const handleExit = () => {
    setLocation('/');
  };

  if (!testType) return null;

  const TestComponent = {
    'flanker': FlankerTask,
    'reaction': ReactionTimeTask,
    'trails': TrailMakingTask,
    'corsi': CorsiMemoryTask,
    'gonogo': GoNoGoTask,
  }[testType];

  if (!TestComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Not Found</h1>
          <button 
            onClick={handleExit}
            className="bg-primary text-white px-4 py-2 rounded-md"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TestComponent 
        onComplete={handleTestComplete}
        onExit={handleExit}
        participantInfo={participantInfo}
      />
    </div>
  );
}
