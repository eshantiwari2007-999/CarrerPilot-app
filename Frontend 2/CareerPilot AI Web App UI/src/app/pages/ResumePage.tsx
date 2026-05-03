import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Sparkles, Loader2, Download, Copy, User, Briefcase, Code, CheckCircle } from "lucide-react";
import { PageLayout } from "./PageLayout";
import { chatService } from "../../services/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { AIResponseRenderer } from "../components/AIResponseRenderer";
import { SkeletonResume, ThinkingLabel } from "../components/SkeletonLoader";

export function ResumePage() {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    name: "",
    role: "",
    skills: "",
    experience: "",
    education: "",
    summary: "",
  });
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerate = async () => {
    if (!form.name || !form.role || !form.skills) {
      toast.error("Please fill in Name, Target Role, and Skills at minimum.");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Please log in to generate a resume.");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const res = await chatService.generateResume(form);
      setResult(res.data.response || "Resume generated successfully!");
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Failed to generate resume. Please try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Resume copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) { toast.error("Could not open print window. Please allow popups."); return; }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${form.name || "Resume"} - Resume</title>
          <style>
            body { font-family: 'Arial', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 40px; color: #111; line-height: 1.6; font-size: 13px; }
            h1 { font-size: 22px; font-weight: bold; border-bottom: 2px solid #3b82f6; padding-bottom: 6px; margin-bottom: 4px; }
            h2 { font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.08em; color: #3b82f6; margin-top: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 2px; }
            ul { padding-left: 18px; }
            li { margin-bottom: 3px; }
            strong { font-weight: 600; }
            @media print { body { margin: 20px; padding: 0 20px; } }
          </style>
        </head>
        <body>
          <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 13px;">${result.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
          <script>window.onload = function() { window.print(); }<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const inputClass =
    "w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all text-sm text-gray-800 placeholder-gray-400";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <PageLayout
      title="Resume Generator"
      subtitle="Create a professional, ATS-optimized resume with AI assistance"
      icon={<FileText className="w-8 h-8" />}
      iconGradient="from-blue-500 to-cyan-500"
    >
      <div className="grid grid-cols-12 gap-6">
        {/* Form */}
        <div className="col-span-5">
          <div className="page-card bg-white p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" /> Your Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="e.g. Rahul Sharma" />
              </div>
              <div>
                <label className={labelClass}>Target Role *</label>
                <input name="role" value={form.role} onChange={handleChange} className={inputClass} placeholder="e.g. Software Engineer, Product Manager" />
              </div>
              <div>
                <label className={labelClass}>Skills *</label>
                <input name="skills" value={form.skills} onChange={handleChange} className={inputClass} placeholder="e.g. Python, React, SQL, Leadership" />
              </div>
              <div>
                <label className={labelClass}>Work Experience</label>
                <textarea
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass + " resize-none"}
                  placeholder="e.g. 2 years at TCS as frontend developer, built 3 products..."
                />
              </div>
              <div>
                <label className={labelClass}>Education</label>
                <input name="education" value={form.education} onChange={handleChange} className={inputClass} placeholder="e.g. B.Tech CSE, KIIT University, 2024" />
              </div>
              <div>
                <label className={labelClass}>Professional Summary (optional)</label>
                <textarea
                  name="summary"
                  value={form.summary}
                  onChange={handleChange}
                  rows={2}
                  className={inputClass + " resize-none"}
                  placeholder="Leave blank to let AI write it for you..."
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="page-btn-primary w-full py-3 mt-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> <ThinkingLabel steps={["Analyzing details…", "Writing summary…", "Adding skills…", "Polishing format…", "Finalizing…"]} /></>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate Resume</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="col-span-7">
          <div className="page-card bg-white p-6 min-h-[540px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-500" /> AI-Generated Resume
              </h2>
              {result && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm hover:shadow-md transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                </div>
              )}
            </div>

            {!result && !isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-blue-200" />
                </div>
                <div>
                  <p className="font-medium text-gray-500 mb-1">Your resume will appear here</p>
                  <p className="text-sm">Fill in your details and click Generate Resume</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-4 max-w-sm">
                  {["ATS Optimized", "Action Verbs", "Quantified Achievements", "Professional Format"].map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium border border-blue-100">
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex-1 bg-gray-50 rounded-2xl p-5 overflow-y-auto">
                <SkeletonResume />
              </div>
            )}

            {result && (
              <AnimatePresence>
                <div className="flex-1 bg-gray-50 rounded-2xl p-5 overflow-y-auto" style={{ maxHeight: 460 }}>
                  <AIResponseRenderer text={result} />
                </div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 grid grid-cols-3 gap-6">
        {[
          { icon: <Code className="w-5 h-5 text-blue-500" />, title: "Use Keywords", desc: "Include terms from the job description to pass ATS filters" },
          { icon: <Briefcase className="w-5 h-5 text-purple-500" />, title: "Quantify Results", desc: "Use numbers — 'Increased revenue by 30%' beats 'Improved revenue'" },
          { icon: <Sparkles className="w-5 h-5 text-cyan-500" />, title: "Tailor Each Time", desc: "Customize your resume for each application for best results" },
        ].map((tip, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="page-card bg-white p-6 flex gap-4 items-start"
          >
            <div className="mt-1 shrink-0">{tip.icon}</div>
            <div>
              <div className="font-semibold text-gray-800 text-sm mb-0.5">{tip.title}</div>
              <div className="text-xs text-gray-500">{tip.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </PageLayout>
  );
}
