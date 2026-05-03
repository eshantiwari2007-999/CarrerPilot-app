import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, Sparkles, Loader2, RotateCcw, CheckCircle, MessageSquare, Star } from "lucide-react";
import { PageLayout } from "./PageLayout";
import { chatService } from "../../services/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { AIResponseRenderer } from "../components/AIResponseRenderer";

const QUESTION_BANK = [
  { category: "Behavioral", q: "Tell me about a time you handled a conflict with a teammate." },
  { category: "Behavioral", q: "Describe a situation where you failed and what you learned." },
  { category: "Situational", q: "How would you handle competing deadlines with limited resources?" },
  { category: "Situational", q: "What would you do if a senior colleague gave you incorrect feedback?" },
  { category: "Technical", q: "Walk me through how you'd design a URL shortener." },
  { category: "HR", q: "Where do you see yourself in 5 years?" },
  { category: "HR", q: "Why do you want to leave your current company?" },
  { category: "HR", q: "What is your biggest weakness?" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Behavioral: "from-blue-500 to-cyan-500",
  Situational: "from-purple-500 to-pink-500",
  Technical: "from-orange-500 to-red-500",
  HR: "from-green-500 to-teal-500",
};

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round((score / 10) * 100);
  const color =
    score >= 8 ? "from-green-400 to-emerald-500" :
    score >= 6 ? "from-yellow-400 to-orange-400" :
    "from-red-400 to-pink-500";

  return (
    <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">Performance Score</span>
        <div className="flex items-center gap-1.5">
          <span className={`text-2xl font-extrabold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
            {score}
          </span>
          <span className="text-gray-400 text-sm font-medium">/ 10</span>
        </div>
      </div>
      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
      <div className="flex justify-between mt-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${i < Math.round(score / 2) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    </div>
  );
}

function extractScore(feedback: string): number | null {
  // Match patterns like: "7/10", "Score: 7", "7 out of 10", "Overall Score**: 7"
  const patterns = [
    /(?:score|scored?)[:\s*]*(\d+)\s*(?:\/\s*10|out of 10)?/i,
    /(\d+)\s*\/\s*10/,
    /(\d+)\s+out\s+of\s+10/i,
    /\*\*(\d+)\*\*\s*\/\s*10/,
    /\*\*(\d+)\/10\*\*/,
  ];
  for (const p of patterns) {
    const m = feedback.match(p);
    if (m) {
      const v = parseInt(m[1]);
      if (v >= 0 && v <= 10) return v;
    }
  }
  return null;
}

export function InterviewPage() {
  const { isAuthenticated } = useAuth();
  const [selectedQ, setSelectedQ] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [customQ, setCustomQ] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Behavioral", "Situational", "Technical", "HR"];
  const filtered = activeCategory === "All" ? QUESTION_BANK : QUESTION_BANK.filter(q => q.category === activeCategory);

  const score = feedback ? extractScore(feedback) : null;

  const handleGetFeedback = async () => {
    const question = customQ.trim() || selectedQ;
    if (!question) { toast.error("Please select or type a question first."); return; }
    if (!answer.trim()) { toast.error("Please write your answer before getting feedback."); return; }
    if (!isAuthenticated) { toast.error("Please log in to get AI feedback."); return; }

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await chatService.getInterviewFeedback({ question, answer, role: role || undefined });
      setFeedback(res.data.response || "");
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Failed to get feedback. Please try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnswer("");
    setFeedback(null);
    setCustomQ("");
  };

  return (
    <PageLayout
      title="Interview Prep"
      subtitle="Practice with real questions and get instant AI feedback on your answers"
      icon={<Mic className="w-8 h-8" />}
      iconGradient="from-orange-500 to-red-500"
    >
      <div className="grid grid-cols-12 gap-6">
        {/* Question bank */}
        <div className="col-span-5">
          <div className="page-card bg-white p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-500" /> Question Bank
              </h2>
            </div>

            {/* Category filter */}
            <div className="flex gap-2 flex-wrap mb-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    activeCategory === cat
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {filtered.map((item, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedQ(item.q); setFeedback(null); setAnswer(""); }}
                  className={`w-full text-left p-4 rounded-xl border text-sm transition-all hover:-translate-y-0.5 ${
                    selectedQ === item.q
                      ? "border-orange-400 bg-orange-50 shadow-sm"
                      : "border-gray-100 bg-gray-50 hover:border-orange-200 hover:bg-orange-50/50 hover:shadow-sm"
                  }`}
                >
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r ${CATEGORY_COLORS[item.category]} mb-1`}>
                    {item.category}
                  </span>
                  <div className="text-gray-700 leading-snug">{item.q}</div>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Or type your own question</label>
              <textarea
                value={customQ}
                onChange={e => { setCustomQ(e.target.value); setSelectedQ(null); }}
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all text-sm resize-none"
                placeholder="e.g. How do you prioritize tasks under pressure?"
              />
            </div>

            <div className="mt-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role being interviewed for</label>
              <input
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 text-sm"
                placeholder="e.g. Software Engineer, Product Manager"
              />
            </div>
          </div>
        </div>

        {/* Answer + feedback */}
        <div className="col-span-7 flex flex-col gap-4">
          {/* Selected question display */}
          {(selectedQ || customQ) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-100"
            >
              <div className="text-xs font-semibold text-orange-500 mb-1 uppercase tracking-wide">Current Question</div>
              <div className="text-gray-800 font-medium">{customQ || selectedQ}</div>
            </motion.div>
          )}

          {/* Answer box */}
          <div className="page-card bg-white p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Your Answer</h2>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              rows={6}
              className="w-full p-5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all text-sm resize-none leading-relaxed"
              placeholder="Write your answer here using the STAR method (Situation, Task, Action, Result)..."
            />
            <div className="flex gap-4 mt-5">
              <button
                onClick={handleGetFeedback}
                disabled={isLoading}
                className="page-btn-primary flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow-md"
              >
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating...</> : <><Sparkles className="w-4 h-4" /> Get AI Feedback</>}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>

          {/* Feedback output */}
          <AnimatePresence>
            {(feedback || isLoading) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="page-card bg-white p-6 flex-1"
              >
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" /> AI Feedback
                </h2>
                {isLoading ? (
                  <div className="flex items-center gap-3 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
                    <span className="text-sm">Peter is reviewing your answer...</span>
                  </div>
                ) : (
                  <>
                    {score !== null && <ScoreBar score={score} />}
                    <div className="overflow-y-auto" style={{ maxHeight: 360 }}>
                      <AIResponseRenderer text={feedback!} />
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageLayout>
  );
}
