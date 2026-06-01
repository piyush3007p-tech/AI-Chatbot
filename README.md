# AI Chat Assistant

A high-performance, responsive, and visually stunning AI Chat interface modeled after premium modern design systems. This application features a robust full-stack architecture with an Express-based server proxy that coordinates with the Google GenAI SDK (`@google/genai`) to provide persistent context and rich features.

---

## ✨ Key Features

1. **Persistent History Sidebar**
   - Save chat histories in local workspace storage.
   - Switch active conversation contexts instantly.
   - Live rename or delete chats directly within the navigation rail.

2. **Multimodal Attachments Handler**
   - True Drag & Drop trigger detection or manual picker click workflows.
   - Upload images (`PNG`, `WEBP`, `JPEG`) or paste source code/text configurations with responsive thumbnail previews.
   - Converts files to base64 inline structures automatically for unified Gemini inputs.

3. **Advanced Model & Environment Configuration**
   - Toggle specific Google Gemini model targets (such as `gemini-3.5-flash`).
   - Define custom system prompts (system instruction boundaries) dynamically.
   - Control model creativity parameters via custom Temperature sliders.
   - Enable or disable **Google Search Grounding** to fetch current real-world internet search content in real time with beautiful clickable web source attribution chips.

4. **Premium Markdown Renderer**
   - Interactive syntax-highlighted code containers.
   - Floating one-click copy helper actions to simplify copying code blocks.
   - Supports bolding, lists, code markers, headers, and paragraph formats.

5. **Simulated Voice Transcription**
   - Generates preset tech prompts mimicking active voice transcription with interactive loading states, rendering audio feedback instantly.

---

## 🚀 Getting Started

### Prerequisites

Identify your configuration environment. Locate your Google Gemini API Key and make sure it has been set inside your workspace variables:

- **Local Development**: Create a `.env` file in the root directory (based on `.env.example`) and append your key:
  ```env
  GEMINI_API_KEY="AIzaSyYourActualKeyHere..."
  ```
- **Google AI Studio Workspace**: Define `GEMINI_API_KEY` inside the **Secrets Panel** on the left. The compiler integrates this directly at runtime!

### Installation & Run

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Run Dev Environment**:

   ```bash
   npm run dev
   ```

   This spins up the custom Express server with integrated Vite HMR on host http://localhost:3000.

3. **Production Compiler**:

   ```bash
   npm run build
   ```

   This compiles client assets inside `dist/` and bundles server TypeScript routing safely via esbuild into `dist/server.cjs`.

4. **Production Run**:
   ```bash
   npm start
   ```

---

## 🛠️ Folder Hierarchy

```
├── /assets/               # Ambient icons and static metadata configurations
├── /src/
│   ├── /components/       # Isolated custom modules (e.g. Markdown text blocks)
│   ├── App.tsx            # Full core React layout and reactive controls
│   ├── index.css          # Tailwind CSS layer definitions and custom scrollbars
│   ├── main.tsx           # Entry React pipeline configuration
│   └── types.ts           # Shared TypeScript models and session schemas
├── server.ts              # Express.js back-end proxy with lazy Gemini clients
├── .env.example           # Secure configuration instructions template
├── package.json           # Dependencies and build system instructions
├── tsconfig.json          # TypeScript boundaries configuration
└── vite.config.ts         # Vite compiler pipeline hooks
```

---

## 🔒 Security & Privacy

- **Server-Side API Handlers**: Keeps all sensitive Gemini API keys hidden from the browser console, executing request proxies securely on the container.
- **Payload Strict Controls**: Built-in 20MB file upload safeguards and image sanitizers protecting server nodes against erratic inputs.
