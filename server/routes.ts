import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // CSV export endpoint
  app.post("/api/export-csv", async (req, res) => {
    try {
      const { sessionData, trialData } = req.body;
      
      // Generate CSV headers
      const headers = [
        "participant_id",
        "age", 
        "gender",
        "test_type",
        "trial_number",
        "stimulus",
        "response",
        "reaction_time",
        "accuracy",
        "timestamp"
      ];

      // Generate CSV rows
      let csvContent = headers.join(",") + "\n";
      
      trialData.forEach((trial: any) => {
        const row = [
          sessionData.participantInfo.participantId || "",
          sessionData.participantInfo.age || "",
          sessionData.participantInfo.gender || "",
          trial.testType,
          trial.trialNumber,
          trial.stimulus || "",
          trial.response || "",
          trial.reactionTime || "",
          trial.accuracy,
          trial.timestamp
        ];
        csvContent += row.join(",") + "\n";
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="cognitive_test_data.csv"');
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate CSV" });
    }
  });

  // Summary report endpoint
  app.post("/api/export-summary", async (req, res) => {
    try {
      const { sessionData } = req.body;
      
      let summary = "Cognitive Testing Platform - Summary Report\n";
      summary += "=====================================\n\n";
      
      if (sessionData.participantInfo.participantId) {
        summary += `Participant ID: ${sessionData.participantInfo.participantId}\n`;
      }
      if (sessionData.participantInfo.age) {
        summary += `Age: ${sessionData.participantInfo.age}\n`;
      }
      if (sessionData.participantInfo.gender) {
        summary += `Gender: ${sessionData.participantInfo.gender}\n`;
      }
      
      summary += "\nTest Results:\n";
      summary += "-------------\n";
      
      Object.entries(sessionData.tests).forEach(([testType, result]: [string, any]) => {
        if (result.completed) {
          summary += `\n${testType.toUpperCase()}:\n`;
          summary += `  Mean RT: ${result.meanRT}ms\n`;
          summary += `  Accuracy: ${result.accuracy}%\n`;
          summary += `  Errors: ${result.errors}/${result.totalTrials}\n`;
        }
      });

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="cognitive_test_summary.txt"');
      res.send(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate summary" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
