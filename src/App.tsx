import React, { useState, useEffect, useRef } from "react";
import {
  Zap,
  PlusCircle,
  MessageSquare,
  Settings,
  HelpCircle,
  MoreVertical,
  LogOut,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Paperclip,
  Mic,
  Send,
  Trash2,
  Copy,
  Check,
  Globe,
  Plus,
  X,
  FileText,
  AlertTriangle,
  Flame,
  User,
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckSquare,
  Edit3,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MarkdownRenderer } from "./components/MarkdownRenderer";
import { ChatSession, Message, UserProfile, MessageAttachment } from "./types";

// Static mock avatar images hotlinked from user requested HTML
const BOT_AVATAR = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&h=80&q=80"; // Premium abstract sphere
const USER_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuDx7-m_L5E3mNcLyrDl5bksoukgA7az6lH-85ehgZJFf1KhF746_Jx0QUFXhFvN3LJej8lmFccnr393KjeMWTKW4o0JJibrPsDu3VDMV7U3LPwM2Wnptj1PHyJS3CNatHKLI1RNo8oI2sxXuQ_sl3b1wGh2Zhl4GJfPUW5JXrTOFXmQ-SwiO5TEWHJ2QFjQ92Rc3UEm4-0sNTKtTs9YsqWyis_9CyiHRBu-s4_cjziZql9x3gu-I7jXkLYGDaCeGmrRoTmdzMkG53yD";
const ALEX_JOHNSON_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuCiqOjuAELOVD6jqZpihQ3OWZEj8doYhcx8yfSnUFR0_lsB4TKJMN6NGnRUAG5W1dykuA8v-scsAVs1Fw9NLIlNGbialDjCs4VeynGzZQqIR42uw87tQ6-NUVq_UCD-kx4_rqaIZJtbxQGwwC-5FO9IhCqoN_p90HTFYNn7S-G_EbWEKuWqUhEPz_FbJi6UebzwxjXz91k5oM7tp6RKwT2U6Y7FrEgX_51z7-12EBd3oGGEiyEpeyX9Zqocy4ddBRFAyk40U-Z8Z9cx";

// Hardcoded initial data to look EXACTLY like the mock visual and be fully usable
const INITIAL_MODEL = "gemini-3.5-flash";
const DEFAULT_SYSTEM_PROMPT = "You are a professional, helpful software architect assistant who provides elegant, detailed, and optimized responses.";

export default function App() {
  // --- States ---
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [attachment, setAttachment] = useState<MessageAttachment | null>(null);
  
  // App Config & Settings
  const [selectedModel, setSelectedModel] = useState(INITIAL_MODEL);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [temperature, setTemperature] = useState(0.7);
  const [searchGrounding, setSearchGrounding] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Piyush",
    tier: "Pro Account",
    avatar: ALEX_JOHNSON_AVATAR,
  });

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Custom interactive animations and events
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" | "error" } | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceTimer, setVoiceTimer] = useState<number>(0);

  // Suggested chips
  const [suggestedChips, setSuggestedChips] = useState<string[]>([
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Load Data & Setup ---
  useEffect(() => {
    // Check key status on startup
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(data.hasApiKey);
      })
      .catch((err) => {
        console.error("Failed to check status:", err);
        setHasApiKey(false);
      });

    // Load Sessions from localStorage
    const saved = localStorage.getItem("ai_assistant_sessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          // Sync options from current active session if they exist
          setSelectedModel(parsed[0].model || INITIAL_MODEL);
          setSystemPrompt(parsed[0].systemPrompt || DEFAULT_SYSTEM_PROMPT);
          setSearchGrounding(!!parsed[0].searchGrounding);
          setTemperature(parsed[0].temperature ?? 0.7);
          return;
        }
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }

    // Default pre-populated sessions matching mock visual and onboarding
    const defaultSessions: ChatSession[] = [
      {
        id: "session_code_opt",
        name: "Code Optimization",
        messages: [
          {
            id: "msg_1",
            role: "model",
            content: "Hello! I'm your AI assistant. How can I help you optimize your project workflow today?",
            timestamp: "10:24 AM"
          },
          {
            id: "msg_2",
            role: "user",
            content: "Can you review this code snippet and suggest improvements for better performance and readability?",
            timestamp: "10:25 AM"
          },
          {
            id: "msg_3",
            role: "model",
            content: "Certainly! I've analyzed your logic. Using a hash map for lookups would significantly reduce complexity from O(n) to O(1).\n\n```javascript\nconst lookup = new Map(data.map(item => [item.id, item]));\nfunction findById(id) {\n  return lookup.get(id) || null;\n} \n```",
            timestamp: "10:26 AM"
          }
        ],
        createdAt: "2026-05-30T10:24:00Z",
        lastActive: "2026-05-30T10:26:00Z",
        model: "gemini-3.5-flash",
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
        searchGrounding: false,
        temperature: 0.7
      },
      {
        id: "session_res_sum",
        name: "Research Summary",
        messages: [
          {
            id: "msg_res_1",
            role: "model",
            content: "Greetings! I am ready to summarize any research papers, study materials, or reports you provide. You can write topics or paste content directly.",
            timestamp: "10:10 AM"
          },
          {
            id: "msg_res_2",
            role: "user",
            content: "Can you give me a summary of Quantum Computing principles?",
            timestamp: "10:12 AM"
          },
          {
            id: "msg_res_3",
            role: "model",
            content: "Quantum Computing is built on three core quantum-mechanical phenomena:\n\n1. **Superposition**: Unlike classical bits (0 or 1), quantum bits (qubits) can exist in a superposition of both states simultaneously.\n2. **Entanglement**: Qubits can be linked such that the state of one instantaneously influences the state of another, enabling exponential coordination.\n3. **Interference**: Interference is used to amplify constructive signals (correct paths) and cancel out destructive signals (incorrect calculations).\n\nThis permits resolving complex factoring and optimization tasks that are impossible for current classical architectures.",
            timestamp: "10:14 AM"
          }
        ],
        createdAt: "2026-05-30T10:10:00Z",
        lastActive: "2026-05-30T10:14:00Z",
        model: "gemini-3.5-flash",
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
        searchGrounding: false,
        temperature: 0.7
      },
      {
        id: "session_welcome",
        name: "Welcome Session",
        messages: [
          {
            id: "msg_welcome_1",
            role: "model",
            content: "Welcome to your high-performance **AI Chat Assistant**! ✨\n\nI am connected to Google's powerful **Gemini 3.5 Flash** model on the server to help you analyze code, write copy, summarize docs, and answer queries.\n\n### Key Features of This Assistant:\n- **Persistent Context**: Your chats are saved locally in your browser workspace.\n- **Search Grounding**: Toggle Google Search in Settings to fetch real-world data.\n- **Attachments**: Drag-and-drop or click to attach images to ask questions about them!\n- **Action Chips**: Click suggestion cards below responses to expand topics.\n\nTo get started, try asking me something in the field below!",
            timestamp: "09:00 AM"
          }
        ],
        createdAt: "2026-05-30T09:00:00Z",
        lastActive: "2026-05-30T09:00:00Z",
        model: "gemini-3.5-flash",
        systemPrompt: "You are a warm onboarding buddy.",
        searchGrounding: false,
        temperature: 0.7
      }
    ];

    setSessions(defaultSessions);
    setActiveSessionId("session_code_opt");
    localStorage.setItem("ai_assistant_sessions", JSON.stringify(defaultSessions));
  }, []);

  // Sync to localStorage whenever sessions change
  const saveSessions = (updated: ChatSession[]) => {
    setSessions(updated);
    localStorage.setItem("ai_assistant_sessions", JSON.stringify(updated));
  };

  // Scroll current chat to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSessionId, isSubmitting]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Sync state whenever active session switches
  useEffect(() => {
    if (activeSession) {
      setSelectedModel(activeSession.model || INITIAL_MODEL);
      setSystemPrompt(activeSession.systemPrompt || DEFAULT_SYSTEM_PROMPT);
      setSearchGrounding(!!activeSession.searchGrounding);
      setTemperature(activeSession.temperature ?? 0.7);
    }
  }, [activeSessionId]);

  // Helper to show a fast and responsive toast
  const showToast = (text: string, type: "success" | "info" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- Actions & Methods ---

  const handleNewChat = () => {
    const id = "session_" + Date.now();
    const newChat: ChatSession = {
      id,
      name: "New Chat",
      messages: [
        {
          id: "msg_init_" + id,
          role: "model",
          content: "Hello! I'm your AI assistant. How can I help you optimize your project workflow today?",
          timestamp: formatTime(new Date())
        }
      ],
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      model: selectedModel,
      systemPrompt: systemPrompt,
      searchGrounding: searchGrounding,
      temperature: temperature
    };

    const updated = [newChat, ...sessions];
    saveSessions(updated);
    setActiveSessionId(id);
    showToast("Created a new chat session.");
    scrollToBottom();
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = sessions.filter((s) => s.id !== id);
    if (filtered.length === 0) {
      showToast("Creating fresh session since you had none left.", "info");
      saveSessions([]);
      handleNewChat();
      return;
    }
    saveSessions(filtered);
    if (activeSessionId === id) {
      setActiveSessionId(filtered[0].id);
    }
    showToast("Chat deleted successfully.");
  };

  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setRenameValue(session.name);
  };

  const handleSaveRename = (id: string) => {
    if (!renameValue.trim()) return;
    const updated = sessions.map((s) => {
      if (s.id === id) {
        return { ...s, name: renameValue.trim() };
      }
      return s;
    });
    saveSessions(updated);
    setEditingSessionId(null);
    showToast("Chat renamed.");
  };

  // File Attachment reading
  const processAttachedFile = (file: File) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "text/plain", "text/javascript", "text/typescript", "application/json"];

    const isImage = file.type.startsWith("image/");
    const isText = file.type.startsWith("text/") || ["application/json", "text/javascript", "text/typescript"].includes(file.type);

    if (!isImage && !isText) {
      showToast("Only images or text documents/code files are supported", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("File is too large! Limit is 5MB.", "error");
      return;
    }

    const reader = new FileReader();
    if (isImage) {
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Strip data url metadata
        const base64 = result.split(",")[1];
        setAttachment({
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
          base64: base64
        });
        showToast(`Selected image "${file.name}"`);
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (e) => {
        const textContent = e.target?.result as string;
        // For text file, we append text file contents nicely or send base64
        const base64 = btoa(unescape(encodeURIComponent(textContent)));
        setAttachment({
          name: file.name,
          size: formatFileSize(file.size),
          type: "text/plain",
          base64: base64
        });
        showToast(`Attached code/text file "${file.name}"`);
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processAttachedFile(e.target.files[0]);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processAttachedFile(e.dataTransfer.files[0]);
    }
  };

  // simulated Voice recording
  const handleTriggerVoice = () => {
    if (isListeningVoice) {
      // Stop and insert preset voice prompt
      clearInterval(voiceTimerRef.current!);
      setIsListeningVoice(false);
      const voicePrompts = [
        "Explain the Big O notation of binary search",
        "Generate a simple clean responsive flexbox layout for cards",
        "Could you show me a Python version of the Map lookup algorithm?",
        "Compare React state management mechanisms: Context vs Redux vs local state",
        "Write a quick express route proxy function to fetch data from an API source"
      ];
      const randomPrompt = voicePrompts[Math.floor(Math.random() * voicePrompts.length)];
      setInputValue(randomPrompt);
      showToast("Voice transcribed successfully!", "success");
    } else {
      // Start recording timer
      setIsListeningVoice(true);
      setVoiceTimer(0);
      voiceTimerRef.current = setInterval(() => {
        setVoiceTimer((prev) => prev + 1);
      }, 1000);
    }
  };

  // cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    };
  }, []);

  // Share Application link
  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast("Application link copied to clipboard!");
    }).catch(() => {
      showToast("Failed to copy link", "error");
    });
  };

  // Send message to actual back-end Google Gemini proxies
  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || inputValue).trim();
    if (!promptToSend && !attachment) return;

    // Reset input fields immediately for immediate responsive visualization
    setInputValue("");
    const currentAttachment = attachment;
    setAttachment(null);

    const now = new Date();
    const userMessage: Message = {
      id: "user_msg_" + Date.now(),
      role: "user",
      content: promptToSend,
      timestamp: formatTime(now),
      attachment: currentAttachment || undefined
    };

    // Append user message immediately
    const updatedMessages = [...(activeSession?.messages || []), userMessage];
    const isFirstRealQueryInChat = activeSession.messages.length <= 1;
    let autoChatName = activeSession.name;
    
    if (isFirstRealQueryInChat && promptToSend) {
      // Set chat title automatically from the first real user query
      const words = promptToSend.split(" ");
      autoChatName = words.slice(0, 4).join(" ") + (words.length > 4 ? "..." : "");
    }

    const updatedSession: ChatSession = {
      ...activeSession,
      name: autoChatName,
      messages: updatedMessages,
      lastActive: now.toISOString(),
      model: selectedModel,
      systemPrompt: systemPrompt,
      searchGrounding: searchGrounding,
      temperature: temperature
    };

    const updatedSessionsList = sessions.map((s) => {
      return s.id === activeSession.id ? updatedSession : s;
    });
    saveSessions(updatedSessionsList);
    setIsSubmitting(true);

    // Create a pending element for bot response
    const botPendingId = "bot_pending_" + Date.now();
    const pendingBotMessage: Message = {
      id: botPendingId,
      role: "model",
      content: "",
      timestamp: formatTime(new Date()),
      isPending: true
    };

    const sessionWithPending = {
      ...updatedSession,
      messages: [...updatedMessages, pendingBotMessage]
    };

    setSessions(sessions.map((s) => {
      return s.id === activeSession.id ? sessionWithPending : s;
    }));

    try {
      console.log("Posting message payload to /api/chat Proxy endpoint...");
      // Make high-fidelity request to server proxy
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages, // Send full session messages context to Gemini!
          model: selectedModel,
          systemPrompt: systemPrompt,
          searchGrounding: searchGrounding,
          temperature: temperature
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || "Request failed");
      }

      // Successful response back! Remove pending message and replace with content
      const completedBotMessage: Message = {
        id: "msg_bot_" + Date.now(),
        role: "model",
        content: responseData.content,
        timestamp: formatTime(new Date()),
        groundingSources: responseData.groundingSources && responseData.groundingSources.length > 0 
          ? responseData.groundingSources 
          : undefined
      };

      const finalSession: ChatSession = {
        ...updatedSession,
        messages: [...updatedMessages, completedBotMessage]
      };

      saveSessions(sessions.map((s) => {
        return s.id === activeSession.id ? finalSession : s;
      }));

      // Dynamically tweak suggestion chips for rich interactions!
      if (promptToSend.toLowerCase().includes("code") || promptToSend.toLowerCase().includes("function")) {
        setSuggestedChips(["Identify performance bottlenecks", "Write TS Type safety checks", "Explain O(n) space complexity"]);
      } else {
        setSuggestedChips(["Summarize key lessons", "Suggest alternate tools", "Translate to other formats"]);
      }

    } catch (e: any) {
      console.error("Failed to fetch response: ", e);
      
      // Let's create a highly polite and beautiful mock answers fallback if they don't have the API key!
      // This matches the visual and lets the app be extremely playable in all environments!
      let fallbackText = "I encountered an issue connecting to Gemini AI.";
      if (e.message?.includes("key") || !hasApiKey) {
        fallbackText = `**Notice**: I am running in a visual demonstration mode because the Google Gemini API key is currently not configured in your settings. 
        
To activate real-time server responses:
1. Open the **Secrets / Settings** panel in the Google AI Studio UI.
2. Define a secret named \`GEMINI_API_KEY\` with a valid Gemini key.
3. Refresh this page to immediately activate!

In the meantime, let's pretend I answered your prompt! Here is a helpful tip related to your request:\n\n*Always ensure that algorithms are optimized by analyzing space/time constraints ($O(n)$ decreases exponentially when applying modern indexed Map/Set properties).*`;
      } else {
        fallbackText = `Error during generation: ${e.message || "Unknown error occurred"}. Please support re-trying.`;
      }

      const completedBotMessage: Message = {
        id: "msg_fallback_" + Date.now(),
        role: "model",
        content: fallbackText,
        timestamp: formatTime(new Date()),
      };

      const finalSession: ChatSession = {
        ...updatedSession,
        messages: [...updatedMessages, completedBotMessage]
      };

      saveSessions(sessions.map((s) => {
        return s.id === activeSession.id ? finalSession : s;
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger chips action
  const handleChipClick = (chipText: string) => {
    handleSendMessage(chipText);
  };

  // Save changes from settings modal
  const handleSaveSettings = () => {
    if (!activeSession) return;
    const updated = sessions.map((s) => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          model: selectedModel,
          systemPrompt: systemPrompt,
          searchGrounding: searchGrounding,
          temperature: temperature,
        };
      }
      return s;
    });
    saveSessions(updated);
    setShowSettings(false);
    showToast("Session specific configurations saved.");
  };

  const handleResetSettings = () => {
    setSelectedModel(INITIAL_MODEL);
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
    setTemperature(0.7);
    setSearchGrounding(false);
    showToast("Configurations re-initialized to defaults.");
  };

  // Utilities
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div 
      className="bento-layout font-sans text-slate-900 select-none relative overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* ===== Background Mesh Orbs ===== */}
      <div className="mesh-orb w-[500px] h-[500px] bg-indigo-300/40 top-[-100px] left-[-100px]" style={{ animationDelay: '0s' }} />
      <div className="mesh-orb w-[400px] h-[400px] bg-purple-300/30 bottom-[-80px] right-[-80px]" style={{ animationDelay: '-5s' }} />
      <div className="mesh-orb w-[300px] h-[300px] bg-sky-200/30 top-[40%] right-[20%]" style={{ animationDelay: '-10s' }} />
      <div className="mesh-orb w-[250px] h-[250px] bg-amber-200/20 bottom-[10%] left-[30%]" style={{ animationDelay: '-15s' }} />

      {/* ===== File Dragging Overlay ===== */}
      <AnimatePresence>
        {isDraggingFile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 drag-overlay flex flex-col items-center justify-center border-2 border-dashed border-indigo-400/50 m-3 rounded-3xl"
          >
            <div className="glass-strong p-8 rounded-2xl flex flex-col items-center max-w-sm text-center">
              <Paperclip className="w-16 h-16 text-indigo-500 animate-bounce mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Drop file here</h3>
              <p className="text-sm text-slate-500">
                Support images (PNG, JPG, WEBP) or text/doc files to prompt Gemini.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Toast Notification (Glass) ===== */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 glass-toast text-white rounded-2xl text-sm font-medium"
          >
            {toastMessage.type === "success" && <Sparkles className="w-4 h-4 text-emerald-400" />}
            {toastMessage.type === "info" && <ShieldAlert className="w-4 h-4 text-indigo-400" />}
            {toastMessage.type === "error" && <AlertTriangle className="w-4 h-4 text-rose-400" />}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================
           SIDEBAR — Glass Bento Panel
           ==================================================== */}
      <motion.aside 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bento-sidebar glass-strong h-full flex flex-col p-5 z-30 relative"
      >
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-5 px-1">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg animate-gradient"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7, #6366f1)' }}
          >
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight leading-none">AI Assistant</h1>
            <span className="text-[9px] font-bold text-indigo-400 tracking-[0.2em] uppercase">Workspace Gateway</span>
          </div>
        </div>

        {/* New Chat Button — Gradient glow */}
        <button 
          onClick={handleNewChat}
          className="btn-glass-primary flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-sm cursor-pointer mb-6 group"
        >
          <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          <span>New Chat</span>
        </button>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar -mx-1 px-1 space-y-5">
          
          <div>
            <div className="px-2 pb-2">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.15em] block">Recent Activity</span>
            </div>
            
            <div className="space-y-1">
              <AnimatePresence initial={false}>
                {sessions.map((session) => {
                  const isActive = session.id === activeSessionId;
                  const isEditing = editingSessionId === session.id;

                  return (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onClick={() => !isEditing && setActiveSessionId(session.id)}
                      className={`flex items-center justify-between group p-2.5 rounded-xl text-sm transition-all cursor-pointer border ${
                        isActive 
                          ? "sidebar-item-active text-indigo-700 font-semibold" 
                          : "border-transparent text-slate-600 hover:bg-white/40 hover:border-white/40 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-500' : 'opacity-60'}`} />
                        
                        {isEditing ? (
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={() => handleSaveRename(session.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename(session.id);
                              if (e.key === "Escape") setEditingSessionId(null);
                            }}
                            className="bg-white/70 px-2 py-1 rounded-lg text-xs text-slate-800 w-full outline-hidden border border-indigo-200 focus:ring-1 focus:ring-indigo-400 backdrop-blur-sm"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="truncate pr-1 text-xs font-medium">{session.name}</span>
                        )}
                      </div>

                      {/* Hover action buttons */}
                      {!isEditing && (
                        <div className="flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity gap-0.5">
                          <button
                            onClick={(e) => handleStartRename(session, e)}
                            className="p-1 hover:bg-white/60 rounded-lg hover:text-indigo-600 transition-colors cursor-pointer"
                            title="Rename"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            className="p-1 hover:bg-rose-100/60 rounded-lg hover:text-rose-500 transition-colors cursor-pointer"
                            title="Delete Chat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <div className="px-2 pb-2">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.15em] block">Support</span>
            </div>
            
            <div className="space-y-0.5">
              <button 
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2.5 w-full p-2.5 text-xs rounded-xl text-slate-600 hover:bg-white/40 hover:text-slate-900 transition-all text-left cursor-pointer border border-transparent hover:border-white/40 font-medium"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </button>
              
              <button 
                onClick={() => setShowHelp(true)}
                className="flex items-center gap-2.5 w-full p-2.5 text-xs rounded-xl text-slate-600 hover:bg-white/40 hover:text-slate-900 transition-all text-left cursor-pointer border border-transparent hover:border-white/40 font-medium"
              >
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <span>Help Guide</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer Profile — Glass card */}
        <div className="pt-4 border-t border-white/20 flex flex-col gap-2 relative mt-auto">
          
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-2.5 rounded-xl glass-subtle hover:bg-white/40 transition-all cursor-pointer group"
          >
            <img 
              alt="User profile" 
              className="w-10 h-10 rounded-full object-cover border-2 border-white/60 shrink-0 shadow-sm"
              src={userProfile.avatar}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-slate-800">{userProfile.name}</p>
              <p className="text-[10px] text-indigo-500 font-semibold tracking-wide">{userProfile.tier}</p>
            </div>
            <MoreVertical className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
          </div>

          {/* Profile Menu Popup — Glass */}
          <AnimatePresence>
            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowProfileMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-16 left-0 right-0 z-40 glass-menu p-3 rounded-2xl flex flex-col gap-1 text-sm font-medium"
                >
                  <p className="text-[9px] text-slate-400 font-extrabold px-2 uppercase tracking-[0.15em] py-1">Quick Actions</p>
                  <button 
                    onClick={() => {
                      const newNick = prompt("Enter a new username:", userProfile.name);
                      if (newNick) setUserProfile({ ...userProfile, name: newNick });
                      setShowProfileMenu(false);
                    }}
                    className="flex items-center gap-2 text-left p-2.5 hover:bg-white/50 rounded-xl text-xs transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Change Name</span>
                  </button>
                  <button 
                    onClick={() => {
                      if(activeSession) {
                        const newTitle = prompt("Enter a custom system instruction for Gemini:", systemPrompt);
                        if(newTitle !== null) {
                          setSystemPrompt(newTitle);
                          showToast("Gemini System instruction updated!");
                        }
                      }
                      setShowProfileMenu(false);
                    }}
                    className="flex items-center gap-2 text-left p-2.5 hover:bg-white/50 rounded-xl text-xs transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit Prompt</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <button 
            onClick={() => {
              if (confirm("Are you sure you want to log out and clear local memories?")) {
                localStorage.removeItem("ai_assistant_sessions");
                showToast("Cleared localized browser history.", "info");
                setTimeout(() => window.location.reload(), 1000);
              }
            }}
            className="flex items-center gap-2 w-full p-2.5 rounded-xl text-slate-500 hover:bg-rose-50/60 hover:text-rose-500 transition-colors text-xs font-semibold cursor-pointer border border-transparent hover:border-rose-200/40"
          >
            <LogOut className="w-4 h-4" />
            <span>Clear History</span>
          </button>

        </div>
      </motion.aside>

      {/* ====================================================
           MAIN CHAT CANVAS — Glass Bento Panel
           ==================================================== */}
      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="bento-main glass relative overflow-hidden h-full"
      >
        
        {/* API Key Missing Alert Bar */}
        {hasApiKey === false && (
          <div className="glass-subtle border-b border-amber-200/30 px-6 py-2.5 flex items-center justify-between text-xs text-amber-800 shrink-0 z-10">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Notice:</strong> No <code className="bg-amber-100/60 px-1 rounded text-[10px]">GEMINI_API_KEY</code> detected. Running in presentation mode.
              </span>
            </div>
            <button 
              onClick={() => showToast("Define GEMINI_API_KEY inside the Secrets tab in AI Studio configuration", "info")}
              className="px-3 py-1 bg-amber-500/80 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors text-[10px] backdrop-blur-sm"
            >
              How-To Setup
            </button>
          </div>
        )}

        {/* ===== Top Header Bar — Glass ===== */}
        <header className="glass-subtle border-b border-white/20 sticky top-0 z-20 flex justify-between items-center w-full px-6 h-16 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white status-online animate-pulse z-10" />
              <img 
                src={BOT_AVATAR}
                alt="Assistant State"
                className="w-9 h-9 rounded-xl object-cover border border-white/50 shadow-sm"
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-none">Chat Assistant</h2>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">
                {activeSession ? `${activeSession.model || "Gemini 3.5"}` : "Standby Session"}
              </span>
            </div>
          </div>

          {/* Header Bento Action Pills */}
          <div className="flex items-center gap-2">
            
            <button 
              onClick={() => setShowSettings(true)}
              className="glass-chip px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer max-md:hidden"
              title="Session properties"
            >
              <Globe className={`w-3.5 h-3.5 ${searchGrounding ? "text-indigo-500 animate-pulse" : "text-slate-400"}`} />
              <span>{searchGrounding ? "Search Active" : "Search Off"}</span>
            </button>

            <button 
              onClick={handleShare}
              className="glass-chip p-2.5 rounded-xl text-slate-500 cursor-pointer hover:text-indigo-500"
              title="Copy Share Link"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="glass-chip p-2.5 rounded-xl text-slate-500 cursor-pointer hover:text-indigo-500"
              title="Configure Model"
            >
              <Settings className="w-4 h-4" />
            </button>

          </div>
        </header>

        {/* ===== Chat Stream Section ===== */}
        <section 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto custom-scrollbar px-6 mx-auto w-full space-y-6 py-6"
        >
          {/* Day Divider — Glass pill */}
          <div className="flex justify-center my-6">
            <span className="glass-chip px-4 py-1.5 rounded-full text-[10px] font-bold text-indigo-600 uppercase tracking-[0.15em] leading-none">
              Today's Session
            </span>
          </div>

          {/* Conversation stream */}
          <div className="space-y-5">
            {activeSession?.messages.map((msg) => {
              const isUser = msg.role === "user";
              
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className={`flex items-start gap-3 group ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {/* Left Avatar for Model */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full glass flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                    </div>
                  )}

                  <div className={`max-w-[82%] ${isUser ? "flex flex-col items-end" : "flex flex-col items-start"}`}>
                    
                    {/* Message Card — Glass bubble */}
                    <div 
                      className={`p-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 ${
                        isUser 
                          ? "msg-user rounded-tr-sm" 
                          : "msg-bot text-slate-800 rounded-tl-sm"
                      }`}
                    >
                      {/* Attached attachment renderer */}
                      {msg.attachment && (
                        <div className={`mb-3 flex items-center gap-2 p-2.5 rounded-xl text-xs ${
                          isUser ? "bg-white/15 border border-white/20 text-white" : "glass-subtle text-slate-700"
                        }`}>
                          {msg.attachment.type.startsWith("image/") ? (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/20">
                              <img 
                                src={`data:${msg.attachment.type};base64,${msg.attachment.base64}`} 
                                alt="Attachment Thumbnail"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <FileText className="w-6 h-6 text-indigo-400 shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-bold truncate text-[11px]">{msg.attachment.name}</p>
                            <p className="text-[10px] opacity-70 font-semibold">{msg.attachment.size}</p>
                          </div>
                        </div>
                      )}

                      {/* Pending skeleton loader */}
                      {msg.isPending ? (
                        <div className="flex items-center gap-1.5 py-1.5">
                          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                        </div>
                      ) : (
                        <div className="prose text-sm font-medium leading-relaxed">
                          <MarkdownRenderer text={msg.content} />
                        </div>
                      )}

                      {/* Grounding sources */}
                      {msg.groundingSources && msg.groundingSources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-white/20 space-y-1.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Informed by web search:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.groundingSources.map((source, sIdx) => (
                              <a 
                                key={sIdx}
                                href={source.url}
                                target="_blank"
                                rel="noreferrer"
                                className="glass-chip inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] text-slate-600 hover:text-indigo-600"
                              >
                                <Globe className="w-3 h-3" />
                                <span className="max-w-[120px] truncate">{source.title}</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className={`flex items-center gap-2 mt-1.5 px-1 text-[11px] text-slate-400 font-semibold`}>
                      {!isUser && (
                        <>
                          <button 
                            onClick={() => showToast("Thank you for your feedback!")}
                            className="p-0.5 hover:text-indigo-500 transition-colors cursor-pointer"
                            title="Helpful response"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => showToast("Feedback logged. We'll adjust parameter defaults.", "info")}
                            className="p-0.5 hover:text-rose-500 transition-colors cursor-pointer"
                            title="Unhelpful response"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </>
                      )}
                      <span>{msg.timestamp}</span>
                    </div>

                  </div>

                  {/* Right Avatar for User */}
                  {isUser && (
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border-2 border-white/60 shadow-sm">
                      <img 
                        src={USER_AVATAR}
                        alt="Me"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Suggested Action Chips — Glass pills */}
          {activeSession?.messages && activeSession.messages.length > 0 && !isSubmitting && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 justify-center pt-4"
            >
              {suggestedChips.map((chip, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleChipClick(chip)}
                  className="glass-chip px-4 py-2 rounded-full text-xs font-semibold text-indigo-600 active:scale-95 cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </motion.div>
          )}

        </section>

        {/* ===== Input Dock — Glass ===== */}
        <footer className="p-5 pt-1 mx-auto w-full shrink-0 z-10">
          
          <div className="relative input-dock rounded-2xl p-3">
            
            {/* Active attachment preview */}
            {attachment && (
              <motion.div 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2.5 p-2.5 glass-subtle rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {attachment.type.startsWith("image/") ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/30">
                      <img 
                        src={`data:${attachment.type};base64,${attachment.base64}`} 
                        alt="Upload Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg glass flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-indigo-500" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate leading-tight">{attachment.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{attachment.size}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setAttachment(null)}
                  className="p-1.5 hover:bg-rose-100/50 text-slate-400 hover:text-rose-500 rounded-lg shrink-0 transition-colors cursor-pointer"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            <div className="flex items-end gap-1">
              
              {/* Paperclip button */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl hover:bg-white/50 text-slate-400 hover:text-indigo-500 transition-all shrink-0 cursor-pointer group"
                title="Attach photo/code file"
              >
                <Paperclip className="w-5 h-5 group-hover:rotate-45 transition-transform duration-200" />
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.txt,.js,.ts,.py,.html,.css,.json"
              />

              <textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="w-full bg-transparent border-0 focus:ring-0 focus:outline-hidden py-2 px-2 text-sm font-medium text-slate-800 placeholder-slate-400/80 resize-none max-h-36 custom-scrollbar"
                placeholder="Ask me anything..."
                rows={1}
                disabled={isSubmitting}
                style={{ height: "auto" }}
                ref={(el) => {
                  if (el) {
                    el.style.height = "auto";
                    el.style.height = el.scrollHeight + "px";
                  }
                }}
              />

              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                
                {/* Voice recorder */}
                <button 
                  onClick={handleTriggerVoice}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                    isListeningVoice 
                      ? "bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-200" 
                      : "hover:bg-white/50 text-slate-400 hover:text-indigo-500"
                  }`}
                  title={isListeningVoice ? "Click to finish voice" : "Simulate voice prompt"}
                >
                  <Mic className="w-5 h-5" />
                </button>

                <button 
                  onClick={() => handleSendMessage()}
                  disabled={isSubmitting || (!inputValue.trim() && !attachment)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    (inputValue.trim() || attachment) && !isSubmitting
                      ? "btn-glass-primary cursor-pointer active:scale-95"
                      : "bg-slate-100/50 text-slate-300 pointer-events-none"
                  }`}
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>

              </div>

            </div>

          </div>

          <p className="text-[10px] text-center text-slate-400/80 mt-2 font-medium">
            AI Assistant may provide inaccurate information. Double check responses.
          </p>
        </footer>

      </motion.main>

      {/* ===== Voice Recording Modal — Glass ===== */}
      <AnimatePresence>
        {isListeningVoice && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-modal p-8 rounded-3xl max-w-sm w-full text-center flex flex-col items-center"
            >
              <div className="relative mb-6">
                <span className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping h-16 w-16" />
                <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg relative animate-gradient"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7, #6366f1)' }}
                >
                  <Mic className="w-8 h-8 text-white animate-pulse" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Listening...</h3>
              <p className="text-xs text-slate-400 mb-4 font-mono">00:{voiceTimer.toString().padStart(2, "0")}</p>
              
              {/* Audio wave */}
              <div className="flex gap-1 h-8 items-center justify-center mb-6">
                {[1, 2, 3, 4, 3, 2, 1, 3, 4, 2, 4, 3, 1].map((val, idx) => (
                  <span 
                    key={idx}
                    className="w-1 rounded-full animate-bounce"
                    style={{ 
                      height: `${val * 20}%`,
                      animationDelay: `${idx * 0.1}s`,
                      animationDuration: '0.8s',
                      background: `linear-gradient(to top, #6366f1, #a855f7)`
                    }}
                  />
                ))}
              </div>

              <p className="text-xs text-slate-500 mb-6 font-medium">
                "Review my map lookup code for scalability"
              </p>

              <button 
                onClick={handleTriggerVoice}
                className="w-full py-3 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-colors active:scale-98 cursor-pointer shadow-lg shadow-rose-200"
              >
                Stop recording and transcribe
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== Settings Panel — Glass Slide-out ===== */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 z-40 bg-slate-900 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-[420px] max-w-full z-45 glass-modal shadow-2xl p-6 overflow-y-auto custom-scrollbar flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/20 mb-6">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-base font-bold text-slate-900">Workspace Configurations</h3>
                  </div>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="glass-chip p-1.5 px-3 text-xs font-semibold cursor-pointer text-slate-500 rounded-lg hover:text-slate-700"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-6">
                  
                  {/* Model section — Bento card */}
                  <div className="bento-info-card space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em] block">Model Target Selection</label>
                    <select 
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-hidden focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 font-medium"
                    >
                      <option value="gemini-3.5-flash">Gemini 3.5 Flash (Default: fast reasoning)</option>
                      <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Premium: coding & science reasoning)</option>
                    </select>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Pro models might require active paid billing flow authorization.
                    </span>
                  </div>

                  {/* System instruction — Bento card */}
                  <div className="bento-info-card space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em] block">System Instructions (Context)</label>
                    <textarea 
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      className="w-full bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl px-3 py-2.5 text-xs text-slate-700 font-medium h-24 outline-hidden focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300"
                      placeholder="e.g. You are a precise expert programmer who loves writing lightweight modular TypeScript code."
                    />
                    <span className="text-[10px] text-slate-400 block font-medium">
                      This shapes the voice, constraints, and professional style of Gemini.
                    </span>
                  </div>

                  {/* Temperature — Bento card */}
                  <div className="bento-info-card space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em]">
                      <span>Randomness (Temperature)</span>
                      <span className="text-indigo-500 font-mono font-bold text-xs">{temperature}</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                      <span>Precise Rules (0)</span>
                      <span>Creative Flow (2)</span>
                    </div>
                  </div>

                  {/* Search grounding — Bento card with toggle */}
                  <div className="bento-info-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className={`w-5 h-5 ${searchGrounding ? "text-indigo-500 animate-pulse" : "text-slate-400"}`} />
                        <div>
                          <p className="text-xs font-bold text-slate-800">Google Search Grounding</p>
                          <p className="text-[10px] text-slate-400 font-medium">Bridges internet metadata to answer queries</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSearchGrounding(!searchGrounding)}
                        className={`w-11 h-6 rounded-full transition-all shrink-0 cursor-pointer flex items-center px-0.5 ${
                          searchGrounding ? "toggle-track-on justify-end" : "toggle-track-off justify-start"
                        }`}
                      >
                        <span className="w-5 h-5 bg-white rounded-full shadow-md transition-all" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-6 border-t border-white/20 flex gap-3">
                <button 
                  onClick={handleResetSettings}
                  className="w-1/3 py-2.5 glass-chip font-bold text-xs rounded-xl cursor-pointer text-center text-slate-600 hover:text-slate-800"
                >
                  Reset Defaults
                </button>
                <button 
                  onClick={handleSaveSettings}
                  className="w-2/3 py-2.5 btn-glass-primary font-bold text-xs rounded-xl cursor-pointer text-center"
                >
                  Save and Apply Config
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== Help Panel — Glass Slide-out ===== */}
      <AnimatePresence>
        {showHelp && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelp(false)}
              className="fixed inset-0 z-40 bg-slate-900 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-[420px] max-w-full z-45 glass-modal shadow-2xl p-6 overflow-y-auto custom-scrollbar flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/20 mb-6">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-base font-bold text-slate-900">User Help Center</h3>
                  </div>
                  <button 
                    onClick={() => setShowHelp(false)}
                    className="glass-chip p-1.5 px-3 text-xs font-semibold cursor-pointer text-slate-500 rounded-lg hover:text-slate-700"
                  >
                    Close
                  </button>
                </div>

                {/* Help items as Bento cards */}
                <div className="space-y-4 text-slate-600 text-xs leading-relaxed font-medium">
                  
                  <div className="bento-info-card">
                    <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <span>Smart Multi-Modal Prompting</span>
                    </h4>
                    <p className="text-slate-500">
                      Attach images or text documents directly by dragging them onto the workspace or pressing the paperclip utility.
                    </p>
                    <ul className="list-disc pl-4 mt-2 space-y-1 glass-subtle p-2.5 rounded-xl font-mono text-[10px] text-slate-500">
                      <li>"Review this diagram for bugs"</li>
                      <li>"Refactor this attached JSON dataset to CSV"</li>
                      <li>"Generate clean responsive style rules based on this image"</li>
                    </ul>
                  </div>

                  <div className="bento-info-card">
                    <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
                        <Globe className="w-4 h-4 text-white" />
                      </div>
                      <span>Search Grounding</span>
                    </h4>
                    <p className="text-slate-500">
                      Bypass traditional training data cutoff by enabling <strong className="text-slate-700">Google Search Grounding</strong> in Settings. Gemini queries live web indexes with verified source links!
                    </p>
                  </div>

                  <div className="bento-info-card">
                    <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}>
                        <Mic className="w-4 h-4 text-white" />
                      </div>
                      <span>Voice Simulation</span>
                    </h4>
                    <p className="text-slate-500">
                      Press the microphone utility to open a recording simulation and inject transcription ideas automatically!
                    </p>
                  </div>

                  <div className="bento-info-card">
                    <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                        <Sliders className="w-4 h-4 text-white" />
                      </div>
                      <span>Custom System Contexts</span>
                    </h4>
                    <p className="text-slate-500">
                      Fine-tune instructions per session. Set the system prompt to shape the bot's voice and unlock specialized productivity.
                    </p>
                  </div>

                </div>
              </div>

              <div className="pt-6 border-t border-white/20">
                <button 
                  onClick={() => setShowHelp(false)}
                  className="w-full py-3 btn-glass-primary font-bold text-xs rounded-2xl cursor-pointer text-center"
                >
                  Got It, Let's Prompt!
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
