import { useState } from "react";
import { motion } from "motion/react";
import { TrendingUp, Sparkles, Loader2, ChevronRight, Target, Lightbulb } from "lucide-react";
import { PageLayout } from "./PageLayout";
import { chatService } from "../../services/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { AIResponseRenderer } from "../components/AIResponseRenderer";
import { SkeletonText, ThinkingLabel } from "../components/SkeletonLoader";

const CAREER_PATHS = [
  { title: "Software Engineering", icon: "💻", desc: "Backend, Frontend, Full-Stack, DevOps", color: "from-blue-500 to-cyan-500" },
  { title: "Data & AI", icon: "🤖", desc: "Data Science, ML Engineer, AI Research", color: "from-purple-500 to-pink-500" },
  { title: "Product Management", icon: "🎯", desc: "Product, Growth, Strategy, Operations", color: "from-orange-500 to-yellow-500" },
  { title: "Design & UX", icon: "🎨", desc: "UI/UX, Graphic Design, Brand Design", color: "from-green-500 to-teal-500" },
  { title: "Marketing & Sales", icon: "📈", desc: "Digital Marketing, Growth Hacking, Sales", color: "from-red-500 to-pink-500" },
  { title: "Finance & Consulting", icon: "💼", desc: "Investment Banking, Consulting, FinTech", color: "from-indigo-500 to-purple-500" },
];

export function CareerPage() {
  const { isAuthenticated } = useAuth();
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetSuggestions = async () => {
    if (!currentRole || !skills) {
      toast.error("Please fill in your current role and skills.");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Please log in to get career suggestions.");
      return;
    }

    setIsLoading(true);
    setSuggestions(null);

    try {
      const res = await chatService.getCareerSuggestions({ current_role: currentRole, target_role: targetRole, skills, experience });
      setSuggestions(res.data.response || "");
    } catch (error) {
      toast.error("Failed to get suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all text-sm text-gray-800 placeholder-gray-400";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <PageLayout
      title="Career Suggestions"
      subtitle="Discover personalized career paths tailored to your skills and goals"
      icon={<TrendingUp className="w-8 h-8" />}
      iconGradient="from-purple-500 to-pink-500"
    >
      {/* Career Path Explorer */}
      <div className="mb-6">
        <h2 className="text-base font-bold text-gray-700 mb-3">Explore Career Paths</h2>
        <div className="grid grid-cols-3 gap-3">
          {CAREER_PATHS.map((path, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setTargetRole(path.title)}
              className={`page-card text-left p-4 rounded-2xl bg-white border-2 transition-all shadow-sm ${
                targetRole === path.title ? "border-purple-400 bg-purple-50/50" : "border-gray-100"
              }`}
            >
              <div className="text-2xl mb-2">{path.icon}</div>
              <div className="font-semibold text-gray-800 text-sm">{path.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{path.desc}</div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Form */}
        <div className="col-span-5">
          <div className="page-card bg-white p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" /> Your Profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Current Role / Background *</label>
                <input value={currentRole} onChange={e => setCurrentRole(e.target.value)} className={inputClass} placeholder="e.g. Computer Science student, Junior Developer" />
              </div>
              <div>
                <label className={labelClass}>Target / Dream Role</label>
                <input value={targetRole} onChange={e => setTargetRole(e.target.value)} className={inputClass} placeholder="e.g. Product Manager at a startup" />
              </div>
              <div>
                <label className={labelClass}>Current Skills *</label>
                <textarea
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  rows={3}
                  className={inputClass + " resize-none"}
                  placeholder="e.g. Python, SQL, Excel, Communication, Leadership..."
                />
              </div>
              <div>
                <label className={labelClass}>Years of Experience</label>
                <input value={experience} onChange={e => setExperience(e.target.value)} className={inputClass} placeholder="e.g. 2 years, Fresh Graduate, 5+ years" />
              </div>
              <button
                onClick={handleGetSuggestions}
                disabled={isLoading}
                className="page-btn-primary w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> <ThinkingLabel steps={["Reading profile…", "Matching paths…", "Calculating fit…", "Writing advice…", "Done!…"]} /></>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Get AI Suggestions</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="col-span-7">
          <div className="page-card bg-white p-6 min-h-[440px] flex flex-col">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" /> AI Career Insights
            </h2>

            {!suggestions && !isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                  <TrendingUp className="w-10 h-10 text-purple-200" />
                </div>
                <div>
                  <p className="font-medium text-gray-500 mb-1">Your personalized roadmap</p>
                  <p className="text-sm">Fill in your profile and get AI-powered career advice</p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
                  {["Career paths matched to your skills", "90-day action plan", "Salary expectations", "Top companies to target"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-gray-500 bg-purple-50 rounded-xl px-3 py-2">
                      <ChevronRight className="w-4 h-4 text-purple-400 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex-1 flex flex-col justify-center p-4">
                <SkeletonText lines={7} />
              </div>
            )}

            {suggestions && (
              <div className="flex-1 overflow-y-auto" style={{ maxHeight: 420 }}>
                <AIResponseRenderer text={suggestions} />
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
