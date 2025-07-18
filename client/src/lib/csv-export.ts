import { TestSessionData } from "@shared/schema";
import { apiRequest } from "./queryClient";

export async function exportToCSV(sessionData: TestSessionData) {
  try {
    const response = await apiRequest('POST', '/api/export-csv', {
      sessionData,
      trialData: sessionData.trialData,
    });
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cognitive_test_data.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Failed to export CSV:', error);
    throw error;
  }
}

export async function exportSummary(sessionData: TestSessionData) {
  try {
    const response = await apiRequest('POST', '/api/export-summary', {
      sessionData,
    });
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cognitive_test_summary.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Failed to export summary:', error);
    throw error;
  }
}
