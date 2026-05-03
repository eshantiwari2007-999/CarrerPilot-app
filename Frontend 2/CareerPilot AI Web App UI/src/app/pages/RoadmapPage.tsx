import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Map, Sparkles, Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { PageLayout } from "./PageLayout";
import { chatService } from "../../services/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { AIResponseRenderer } from "../components/AIResponseRenderer";
import { SkeletonRoadmap, ThinkingLabel } from "../components/SkeletonLoader";

const QUICK_GOALS = [
  { label: "Frontend Developer", icon: "🖥️", value: "Become a professional frontend developer with React" },
  { label: "Data Scientist", icon: "📊", value: "Become a data scientist with Python and machine learning skills" },
  { label: "Product Manager", icon: "🎯", value: "Transition into a product manager role at a tech company" },
  { label: "Backend Engineer", icon: "⚙️", value: "Become a backend engineer with Node.js and cloud skills" },
  { label: "DevOps Engineer", icon: "🚀", value: "Become a DevOps engineer with cloud and CI/CD expertise" },
  { label: "UX Designer", icon: "🎨", value: "Become a UX/UI designer with Figma and user research skills" },
];

const TIMEFRAMES = ["1 month", "3 months", "6 months", "1 year", "2 years"];
const LEVELS = ["Complete Beginner", "Beginner", "Intermediate", "Advanced"];

export function RoadmapPage() {
  const { isAuthenticated } = useAuth();
  const [goal, setGoal] = useState("");
  const [timeframe, setTimeframe] = useState("6 months");
  const [level, setLevel] = useState("Beginner");
  const [roadmap, setRoadmap] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!goal.trim()) { toast.error("Please enter your learning goal."); return; }
    if (!isAuthenticated) { toast.error("Please log in to generate a roadmap."); return; }

    setIsLoading(true);
    setRoadmap(null);
    setError(null);

    try {
      const res = await chatService.generateRoadmap({ goal: goal.trim(), timeframe, level });
      setRoadmap(res.data.response || "");
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to generate roadmap. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    handleGenerate();
  };

  return (
    <PageLayout
      title="Skill Roadmap"
      subtitle="Your personalized, AI-generated step-by-step plan to reach your career goals"
      icon={<Map className="w-8 h-8" />}
      iconGradient="from-green-500 to-emerald-500"
    >
      {/* Quick Goal Picker */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Quick Start — Pick a Goal</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {QUICK_GOALS.map((g) => (
            <motion.button
              key={g.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setGoal(g.value)}
              className={`text-center p-3 rounded-2xl border-2 transition-all text-sm bg-white ${
                goal === g.value
                  ? "border-green-400 bg-green-50/60 shadow-sm"
                  : "border-gray-100 hover:border-green-200 hover:bg-green-50/30"
              }`}
            >
              <div className="text-2xl mb-1">{g.icon}</div>
              <div className="font-semibold text-gray-700 text-xs leading-tight">{g.label}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Builder Form */}
      <div className="page-card bg-white p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-green-500" /> Build Your Roadmap
        </h2>

        <div className="space-y-5">
          {/* Goal */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Your Goal *</label>
            <textarea
              value={goal}
              onChange={e => setGoal(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all text-sm resize-none"
              placeholder="e.g. Become an ML Engineer, Learn web development, Switch to product management..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Timeframe */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Timeframe</label>
              <div className="flex flex-wrap gap-2">
                {TIMEFRAMES.map(t => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      timeframe === t
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-green-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Level</label>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map(l => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      level === l
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary badge */}
          {goal && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-green-50 rounded-xl px-4 py-2.5 border border-green-100">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              <span>Generating a <strong>{level}</strong> roadmap to <em>"{goal.slice(0, 60)}{goal.length > 60 ? '...' : ''}"</em> in <strong>{timeframe}</strong></span>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isLoading || !goal.trim()}
            className="page-btn-primary py-3 px-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-60 shadow-md w-full justify-center"
          >
            {isLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> <ThinkingLabel steps={["Mapping your goal…", "Structuring phases…", "Adding resources…", "Building timeline…", "Wrapping up…"]} /></>
              : <><Sparkles className="w-4 h-4" /> Generate My Roadmap</>}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="page-card bg-white p-6"
        >
          <SkeletonRoadmap />
        </motion.div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-card bg-red-50 p-6 border border-red-100 flex items-start gap-4"
        >
          <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-700 mb-1">Could not generate roadmap</p>
            <p className="text-sm text-red-500">{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-100 text-red-600 text-sm font-semibold hover:bg-red-200 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </motion.div>
      )}

      {/* Roadmap Output */}
      <AnimatePresence>
        {roadmap && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="page-card bg-white p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-500" /> Your Personalized Roadmap
              </h2>
              <div className="flex gap-2 text-xs">
                <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full font-semibold">{level}</span>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold">{timeframe}</span>
              </div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 600 }}>
              <AIResponseRenderer text={roadmap} />
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">AI-generated plan based on your profile · Refine it by adjusting the fields above</p>
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-green-600 hover:border-green-300 transition-all"
              >
                <RefreshCw className="w-3 h-3" /> Regenerate
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
