/**
 * ProfileModal — Lets users set their "memory context" that Peter AI
 * will silently use in every conversation. Saved to localStorage.
 */
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { User, Briefcase, GraduationCap, Target, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";

export interface UserProfile {
  displayName: string;
  currentRole: string;
  targetRole: string;
  skills: string;
  experience: string;
  education: string;
}

const STORAGE_KEY = "careerpilot_profile";
const EMPTY: UserProfile = {
  displayName: "",
  currentRole: "",
  targetRole: "",
  skills: "",
  experience: "",
  education: "",
};

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

interface ProfileModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileModal({ isOpen, onOpenChange }: ProfileModalProps) {
  const [form, setForm] = useState<UserProfile>(EMPTY);

  useEffect(() => {
    if (isOpen) setForm(loadProfile());
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    toast.success("Profile saved! Peter will use this context in every chat.");
    onOpenChange(false);
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all text-sm text-gray-800 placeholder-gray-400";
  const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg border-0"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2)",
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Your Profile Memory
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm">
            Peter AI will silently use this in every conversation to give you personalized advice.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Display Name */}
          <div>
            <label className={labelClass}>
              <User className="w-3 h-3 inline mr-1" />
              Preferred Name
            </label>
            <input
              value={form.displayName}
              onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
              className={inputClass}
              placeholder="e.g. Rahul"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Current Role */}
            <div>
              <label className={labelClass}>
                <Briefcase className="w-3 h-3 inline mr-1" />
                Current Role
              </label>
              <input
                value={form.currentRole}
                onChange={(e) => setForm((p) => ({ ...p, currentRole: e.target.value }))}
                className={inputClass}
                placeholder="e.g. CS Student"
              />
            </div>

            {/* Target Role */}
            <div>
              <label className={labelClass}>
                <Target className="w-3 h-3 inline mr-1" />
                Target Role
              </label>
              <input
                value={form.targetRole}
                onChange={(e) => setForm((p) => ({ ...p, targetRole: e.target.value }))}
                className={inputClass}
                placeholder="e.g. SDE at Google"
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className={labelClass}>Key Skills</label>
            <input
              value={form.skills}
              onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))}
              className={inputClass}
              placeholder="e.g. Python, React, SQL, Leadership"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Experience */}
            <div>
              <label className={labelClass}>Experience</label>
              <input
                value={form.experience}
                onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))}
                className={inputClass}
                placeholder="e.g. 2 years / Fresher"
              />
            </div>

            {/* Education */}
            <div>
              <label className={labelClass}>
                <GraduationCap className="w-3 h-3 inline mr-1" />
                Education
              </label>
              <input
                value={form.education}
                onChange={(e) => setForm((p) => ({ ...p, education: e.target.value }))}
                className={inputClass}
                placeholder="e.g. B.Tech CSE, KIIT"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all mt-2"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
