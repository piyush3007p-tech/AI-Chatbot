import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Helper to safely get the Gemini API client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY environment variable is not defined. Please configure it in the Secrets/Settings panel in the Google AI Studio UI."
    );
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit to allow users to upload images for multimodality
  app.use(express.json({ limit: "20mb" }));

  // Endpoint to check status and check if key is set
  app.get("/api/status", (req, res) => {
    const hasKey = !!process.env.GEMINI_API_KEY;
    res.json({
      status: "ok",
      hasApiKey: hasKey,
      appUrl: process.env.APP_URL || "http://localhost:3000",
    });
  });

  // Main proxy endpoint for Gemini AI chat interactions
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, model, systemPrompt, searchGrounding, temperature } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "messages array is required" });
      }

      // Initialize client lazily and securely
      let ai;
      try {
        ai = getGeminiClient();
      } catch (err: any) {
        console.error("Gemini init error:", err.message);
        return res.status(500).json({
          error: "Gemini API key is not configured.",
          details: err.message,
          needSetup: true
        });
      }

      const activeModel = model || "gemini-3.5-flash";

      // Translate client message schema to GenAI SDK contents structure:
      // contents: Array<{ role: 'user'|'model', parts: Array<{ text?: string, inlineData?: { mimeType: string, data: string } }> }>
      const queryContents = messages.map((m: any) => {
        const parts: any[] = [];
        
        // Add attachment as inlineData part if present
        if (m.attachment && m.attachment.base64) {
          parts.push({
            inlineData: {
              mimeType: m.attachment.type,
              data: m.attachment.base64,
            },
          });
        }

        // Add text part for the main message content
        parts.push({ text: m.content || "" });

        return {
          role: m.role === "user" ? "user" : "model",
          parts: parts,
        };
      });

      // Prepare configuration
      const config: any = {};
      
      if (systemPrompt && systemPrompt.trim()) {
        config.systemInstruction = systemPrompt;
      }

      if (typeof temperature === "number") {
        config.temperature = temperature;
      }

      if (searchGrounding) {
        config.tools = [{ googleSearch: {} }];
      }

      console.log(`Sending query to Gemini (${activeModel}). Search Grounding: ${!!searchGrounding}`);

      const response = await ai.models.generateContent({
        model: activeModel,
        contents: queryContents,
        config: config,
      });

      const responseText = response.text || "";

      // Extract search grounding metadata if available
      let groundingSources: Array<{ title: string; url: string }> = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks && Array.isArray(chunks)) {
        chunks.forEach((chunk: any) => {
          if (chunk.web && chunk.web.uri) {
            groundingSources.push({
              title: chunk.web.title || chunk.web.uri,
              url: chunk.web.uri,
            });
          }
        });
      }

      // Trim duplicates from grounding sources
      const uniqueSources = groundingSources.filter(
        (value, index, self) =>
          self.findIndex((t) => t.url === value.url) === index
      );

      return res.json({
        content: responseText,
        groundingSources: uniqueSources,
      });
    } catch (error: any) {
      console.error("Gemini API error during request:", error);
      return res.status(500).json({
        error: "Failed to generate content from Gemini AI.",
        details: error.message || error.toString(),
      });
    }
  });

  // Vite development middleware vs Static Production bundle delivery
  if (process.env.NODE_ENV !== "production") {
    console.log("Loading Vite Dev Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production static assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
