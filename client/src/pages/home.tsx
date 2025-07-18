import { useState } from "react";
import { Link } from "wouter";
import { Brain, BarChart3, HelpCircle } from "lucide-react";
import DemographicForm from "@/components/demographic-form";
import TestSelection from "@/components/test-selection";
import { ParticipantInfo } from "@shared/schema";

export default function Home() {
  const [participantInfo, setParticipantInfo] = useState<ParticipantInfo>({});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Brain className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Cognitive Testing Platform</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-primary font-medium border-b-2 border-primary pb-1">
                Tests
              </Link>
              <Link href="/results" className="text-gray-500 hover:text-gray-700">
                Results
              </Link>
              <a href="#help" className="text-gray-500 hover:text-gray-700">
                Help
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DemographicForm 
          participantInfo={participantInfo}
          onUpdate={setParticipantInfo}
        />
        
        <TestSelection participantInfo={participantInfo} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>Cognitive Testing Platform - Research and Educational Use</p>
            <p className="mt-2">Ensure proper informed consent and ethical approval for research use.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
