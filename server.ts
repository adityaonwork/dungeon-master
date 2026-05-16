import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // AI Endpoint: Generate the "Royal Standard" (Wealthy Person's default report)
  app.post("/api/dungeon/royal-standard", async (req, res) => {
    try {
      const { category } = req.body; 
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `You are the ultimate Zero-to-Hero Summer Challenge AI Mentor. 
        Your goal is to transform a BTech 2nd year student into a DSA & AI/ML powerhouse in 75 days.
        Generate a set of 3-5 high-impact quest objectives for a ${category} (e.g., Morning Arc, Library Mode, Fitness Mission) based on a high-performer's routine.
        Format as JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                task: { type: Type.STRING },
                difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard", "Epic"] },
                reward: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["task", "difficulty", "reward", "description"]
            }
          }
        }
      });
      res.json(JSON.parse(response.text || "[]"));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/dungeon/compare", async (req, res) => {
    try {
      const { userTasks, standardTasks, profile } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are the Shadow Monarch Quest Master and AI Mentor for a 75-Day Zero-to-Hero Challenge.
        User Profile: ${JSON.stringify(profile)}
        User Completed Quests: ${JSON.stringify(userTasks)} 
        Mentor's Expected High-Performance Standard: ${JSON.stringify(standardTasks)}.
        
        Evaluated the user's discipline, grit, and progress toward becoming advanced in DSA and AI/ML.
        Award XP (max 50) and Gold (max 500) based on effort. 
        Provide a verdict that is motivating yet firm—like a leveling system.
        Return JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              xpAwarded: { type: Type.NUMBER },
              goldAwarded: { type: Type.NUMBER },
              verdict: { type: Type.STRING },
              rank: { type: Type.STRING, enum: ["S", "A", "B", "C", "D", "F"] }
            },
            required: ["xpAwarded", "goldAwarded", "verdict", "rank"]
          }
        }
      });
      res.json(JSON.parse(response.text || "{}"));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dungeon running on http://localhost:${PORT}`);
  });
}

startServer();

