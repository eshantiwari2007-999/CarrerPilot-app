import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Send, TrendingUp,
  UserCircle, History, LogOut, Loader2, FileText,
  Mic, Map, RotateCcw, Settings
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { AuthModals } from "./AuthModals";
import { HistorySidebar } from "./HistorySidebar";
import { ProfileModal, loadProfile } from "./ProfileModal";
import { chatService } from "../../services/api";
import { toast } from "sonner";
import { AIResponseRenderer } from "./AIResponseRenderer";
import { TypewriterText } from "./TypewriterText";

interface Message {
  type: "ai" | "user";
  text: string;
  timestamp: Date;
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex justify-start"
    >
      <div className="px-4 py-3 rounded-2xl bg-gray-100 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-gray-400 block"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MainProduct() {
  const [message, setMessage] = useState("");
  const { user, isAuthenticated, logout } = useAuth();
  const chatSectionRef = useRef<HTMLDivElement>(null);
  const featuresSectionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      type: "ai",
      text: "Hi! I'm Peter, your AI career companion. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);  // true while typewriter runs
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  useEffect(() => {
    // Only auto-scroll if there are actual conversation messages or if AI is generating.
    // This prevents the page from auto-scrolling down to chat on initial load!
    if (messages.length > 1 || isGenerating || isStreaming) {
      scrollToBottom();
    }
  }, [messages, isGenerating, isStreaming]);

  const handleStartWithPeter = () => {
    chatSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => inputRef.current?.focus(), 600);
  };

  const handleViewFeatures = () => {
    featuresSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isGenerating) return;

    if (!isAuthenticated) {
      setAuthTab("login");
      setIsAuthModalOpen(true);
      return;
    }

    const userText = message.trim();
    setMessage("");
    setMessages((prev) => [...prev, { type: "user", text: userText, timestamp: new Date() }]);
    setIsGenerating(true);

    try {
      const profile = loadProfile();
      const userContext = {
        name: profile.displayName || user?.first_name || user?.username || "User",
        currentRole: profile.currentRole || "",
        targetRole: profile.targetRole || "",
        skills: profile.skills || "",
        experience: profile.experience || "",
        education: profile.education || "",
      };

      // Start the API call
      const apiCall = chatService.generate(userText, userContext);
      
      // Simulate human typing delay (min 800ms)
      const delay = new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));
      
      const [res] = await Promise.all([apiCall, delay]);
      
      const responseText = res.data.response || res.data.ai_response?.improved_summary || "I'm here to help with your career!";
      setIsStreaming(true);
      setMessages((prev) => [...prev, { type: "ai", text: responseText, timestamp: new Date() }]);
    } catch (error: any) {
      const msg = error?.response?.data?.error || "AI is temporarily unavailable. Please try again.";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const INITIAL_MESSAGE: Message = {
    type: "ai",
    text: "Hi! I'm Peter, your AI career companion. How can I help you today?",
    timestamp: new Date(),
  };

  const handleNewChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setIsStreaming(false);
    setMessage("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const openAuth = (tab: "login" | "signup") => {
    setAuthTab(tab);
    setIsAuthModalOpen(true);
  };

  const navigate = useNavigate();

  const features = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Resume Generator",
      description: "AI-powered resume creation tailored to your industry and role",
      gradient: "from-blue-500 to-cyan-500",
      action: () => navigate("/resume"),
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Career Suggestions",
      description: "Personalized career paths based on your skills and goals",
      gradient: "from-purple-500 to-pink-500",
      action: () => navigate("/career"),
    },
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Interview Prep",
      description: "Practice with AI-generated questions and get instant feedback",
      gradient: "from-orange-500 to-red-500",
      action: () => navigate("/interview"),
    },
    {
      icon: <Map className="w-8 h-8" />,
      title: "Skill Roadmap",
      description: "Structured learning paths to reach your career objectives",
      gradient: "from-green-500 to-emerald-500",
      action: () => navigate("/roadmap"),
    },
  ];

  return (
    <div
      className="w-full min-h-screen"
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #fce7f3 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 12s ease infinite",
      }}
    >
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .btn-primary {
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }
        .btn-primary:hover {
          transform: scale(1.05);
          box-shadow: 0 0 24px rgba(99, 102, 241, 0.45);
        }
        .btn-secondary {
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
        }
        .btn-secondary:hover {
          transform: scale(1.03);
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.05);
        }
        .feature-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          box-shadow: 0 8px 30px rgba(0,0,0,0.05);
          border-radius: 16px;
          cursor: pointer;
        }
        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
        }
        .chat-message-ai {
          background: #f3f4f6;
          color: #1f2937;
          border-radius: 4px 18px 18px 18px;
        }
        .chat-message-user {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border-radius: 18px 18px 4px 18px;
        }
        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-track { background: transparent; }
        .messages-area::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }
        .glass-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          background: rgba(255,255,255,0.75);
          border-bottom: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 20px rgba(0,0,0,0.04);
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 pt-8 pb-12 lg:px-8">

      {/* ── Sticky Glass Nav ──────────────────────────────────────── */}
      <nav className="glass-nav -mx-6 lg:-mx-8 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-extrabold tracking-tight">CP</span>
            </div>
            <span
              className="text-lg font-extrabold bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
            >
              CareerPilot
            </span>
          </div>

          {/* Nav Items */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors rounded-xl hover:bg-blue-50"
              >
                <History className="w-4 h-4" />
                <span className="font-medium">History</span>
              </button>
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-purple-600 transition-colors rounded-xl hover:bg-purple-50"
                title="Edit your profile memory"
              >
                <Settings className="w-4 h-4" />
                <span className="font-medium">Profile</span>
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-100">
                <UserCircle className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-700 text-sm">{user?.username}</span>
              </div>
              <button
                onClick={() => { logout(); toast.success("Logged out successfully."); }}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => openAuth("login")}
                className="px-4 py-2 text-sm text-gray-600 font-medium hover:text-blue-600 transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => openAuth("signup")}
                className="btn-primary px-4 py-2 text-sm bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800"
              >
                Sign up free
              </button>
            </div>
          )}
        </div>
      </nav>

        {/* ── Hero + Chat ──────────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-8 mb-24">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-7 flex flex-col justify-center"
          >
            <div className="mb-6">
              <div className="text-xs tracking-[0.2em] text-gray-500 mb-4 font-semibold">AI CAREER COMPANION</div>
              <h1
                className="text-6xl lg:text-7xl font-bold mb-2 leading-tight"
                style={{
                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 4px 12px rgba(59, 130, 246, 0.3))",
                }}
              >
                CareerPilot
              </h1>
            </div>

            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your AI Career<br />Companion
            </h2>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
              Navigate your career journey with AI-powered guidance, personalized advice, and expert insights.
            </p>

            <div className="flex gap-4 mb-8">
              <button
                onClick={handleStartWithPeter}
                className="btn-primary px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg font-semibold"
              >
                Start with Peter
              </button>
              <button
                onClick={handleViewFeatures}
                className="btn-secondary px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold"
              >
                View Features
              </button>
            </div>

            <div className="flex gap-6 text-sm text-gray-600">
              {["50K+ Users", "98% Interview Rate", "4.9/5 Rating"].map((stat) => (
                <div key={stat} className="flex items-center gap-2">
                  <span className="text-green-500 font-bold text-lg">✓</span>
                  <span>{stat}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Chat */}
          <motion.div
            ref={chatSectionRef}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-5"
          >
            <div
              className="bg-white rounded-2xl p-6 flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.05)]"
              style={{
                height: 540,
              }}
            >
              {/* Chat Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xl shadow-md">
                    🤖
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Peter AI</div>
                  <div className="text-xs text-green-600 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                    Online · Career Expert
                  </div>
                </div>
                {/* New Chat button */}
                {messages.length > 1 && (
                  <button
                    onClick={handleNewChat}
                    title="Start new chat"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-300 rounded-xl transition-all hover:bg-blue-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> New Chat
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="messages-area flex-1 overflow-y-auto py-4 space-y-3 pr-1">
                <AnimatePresence initial={false}>
                  {messages.map((msg, idx) => {
                    const isLastAI = msg.type === "ai" && idx === messages.length - 1 && idx > 0;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`flex flex-col ${msg.type === "user" ? "items-end" : "items-start"} gap-1`}
                      >
                        <div
                          className={`max-w-[82%] px-4 py-3 text-sm leading-relaxed ${
                            msg.type === "user" ? "chat-message-user" : "chat-message-ai"
                          }`}
                          style={{ wordBreak: "break-word" }}
                        >
                          {msg.type === "ai" ? (
                            isLastAI && isStreaming ? (
                              <TypewriterText
                                text={msg.text}
                                speed={10}
                                onDone={() => {
                                  setIsStreaming(false);
                                  scrollToBottom();
                                }}
                              />
                            ) : (
                              <AIResponseRenderer text={msg.text} animate={false} />
                            )
                          ) : (
                            <span style={{ whiteSpace: "pre-wrap" }}>{msg.text}</span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 px-1">
                          {formatTime(msg.timestamp)}
                        </span>
                      </motion.div>
                    );
                  })}
                  {isGenerating && <TypingIndicator key="typing" />}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="pt-3 border-t border-gray-100">
                {/* Quick Prompt Pills — show when chat is empty (only welcome msg) */}
                {messages.length === 1 && isAuthenticated && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {[
                      "Help me with my resume",
                      "Behavioral interview tips",
                      "What skills should I learn?",
                      "Suggest my next career step",
                    ].map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => { setMessage(prompt); inputRef.current?.focus(); }}
                        className="px-3 py-1.5 text-xs font-medium rounded-full border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
                {!isAuthenticated && (
                  <p className="text-xs text-center text-gray-400 mb-2">
                    <button
                      onClick={() => openAuth("login")}
                      className="text-blue-500 hover:underline font-medium"
                    >
                      Log in
                    </button>{" "}
                    or{" "}
                    <button
                      onClick={() => openAuth("signup")}
                      className="text-blue-500 hover:underline font-medium"
                    >
                      sign up
                    </button>{" "}
                    to chat with Peter
                  </p>
                )}
                <form 
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      isAuthenticated
                        ? "Ask Peter anything about your career…"
                        : "Log in to chat with Peter…"
                    }
                    disabled={!isAuthenticated || isGenerating}
                    className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-sm disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={isGenerating || !message.trim() || !isAuthenticated}
                    className="btn-primary px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                    title="Send message"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Features ─────────────────────────────────────────────── */}
        <motion.div
          ref={featuresSectionRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-900 mb-3">Powerful Features</h3>
            <p className="text-lg text-gray-600">Everything you need to accelerate your career</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pb-16">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className="feature-card bg-white p-6"
                onClick={feature.action}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && feature.action()}
              >
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-4`}
                  style={{ boxShadow: "0 8px 16px rgba(0,0,0,0.15)" }}
                >
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-[10px] font-extrabold">CP</span>
                </div>
                <span className="font-extrabold text-gray-900">CareerPilot</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your AI-powered career companion. From resumes to roadmaps — we’ve got you covered.
              </p>
            </div>
            {/* Product */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Product</h5>
              <ul className="space-y-2 text-sm text-gray-500">
                {["Resume Generator", "Career Suggestions", "Interview Prep", "Skill Roadmap"].map((f) => (
                  <li key={f} className="hover:text-blue-600 cursor-pointer transition-colors">{f}</li>
                ))}
              </ul>
            </div>
            {/* Legal */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Company</h5>
              <ul className="space-y-2 text-sm text-gray-500">
                {["About", "Privacy Policy", "Terms of Service", "Contact Us"].map((l) => (
                  <li key={l} className="hover:text-blue-600 cursor-pointer transition-colors">{l}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <span>© {new Date().getFullYear()} CareerPilot. All rights reserved.</span>
            <span className="flex items-center gap-1">
              Built with ❤️ and AI · Powered by Google Gemini
            </span>
          </div>
        </div>
      </footer>

      <AuthModals
        isOpen={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        defaultTab={authTab}
      />
      <HistorySidebar
        isOpen={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        onSelectPrompt={(prompt) => {
          setMessage(prompt);
          setIsHistoryOpen(false);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
      />
      <ProfileModal
        isOpen={isProfileOpen}
        onOpenChange={setIsProfileOpen}
      />
    </div>
  );
}
