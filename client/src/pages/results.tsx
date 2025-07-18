import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Brain, Download, FileText, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadTestData, getAllTestData } from "@/lib/test-data";
import { exportToCSV, exportSummary } from "@/lib/csv-export";
import { TestSessionData, TestResult } from "@shared/schema";

export default function Results() {
  const [sessionData, setSessionData] = useState<TestSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = getAllTestData();
    setSessionData(data);
    setIsLoading(false);
  }, []);

  const handleExportCSV = async () => {
    if (!sessionData) return;
    try {
      await exportToCSV(sessionData);
    } catch (error) {
      console.error('Failed to export CSV:', error);
    }
  };

  const handleExportSummary = async () => {
    if (!sessionData) return;
    try {
      await exportSummary(sessionData);
    } catch (error) {
      console.error('Failed to export summary:', error);
    }
  };

  const completedTests = sessionData ? 
    Object.values(sessionData.tests).filter(test => test.completed) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading results...</div>
      </div>
    );
  }

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
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Tests
              </Link>
              <Link href="/results" className="text-primary font-medium border-b-2 border-primary pb-1">
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Results</h2>
          <p className="text-gray-600">Comprehensive analysis of your cognitive assessment performance.</p>
        </div>

        {completedTests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Available</h3>
                <p className="text-gray-600 mb-4">Complete some cognitive tests to view your results here.</p>
                <Link href="/">
                  <Button>Take Tests</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Results Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {completedTests.map((result) => (
                <Card key={result.testType}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{getTestDisplayName(result.testType)}</CardTitle>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Mean RT:</span>
                        <span className="text-sm font-medium">{result.meanRT} ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Accuracy:</span>
                        <span className="text-sm font-medium">{result.accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Errors:</span>
                        <span className="text-sm font-medium">{result.errors}/{result.totalTrials}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Export Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Data Export</CardTitle>
                  <div className="space-x-3">
                    <Button onClick={handleExportCSV} className="bg-primary hover:bg-blue-700">
                      <Download className="w-4 h-4 mr-2" />
                      Download CSV
                    </Button>
                    <Button onClick={handleExportSummary} variant="secondary">
                      <FileText className="w-4 h-4 mr-2" />
                      Summary Report
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">CSV Data Includes:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Participant information and session metadata</li>
                    <li>• Trial-by-trial data for each test (stimulus, response, reaction time, accuracy)</li>
                    <li>• Calculated metrics and performance indicators</li>
                    <li>• Timestamps and testing environment information</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

function getTestDisplayName(testType: string): string {
  const names: Record<string, string> = {
    'flanker': 'Flanker Task',
    'reaction': 'Reaction Time',
    'trails': 'Trail Making',
    'corsi': 'Corsi Memory',
    'gonogo': 'Go No-Go'
  };
  return names[testType] || testType;
}
