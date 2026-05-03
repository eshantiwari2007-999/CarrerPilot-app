import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

interface PageLayoutProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  iconGradient: string;
  children: ReactNode;
}

export function PageLayout({ title, subtitle, icon, iconGradient, children }: PageLayoutProps) {
  const navigate = useNavigate();

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
        .page-btn-primary {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .page-btn-primary:hover {
          transform: scale(1.04);
          box-shadow: 0 0 24px rgba(99,102,241,0.4);
        }
        .page-card {
          transition: box-shadow 0.2s ease, transform 0.2s ease;
          box-shadow: 0 8px 30px rgba(0,0,0,0.05);
          border-radius: 16px;
        }
        .page-card:hover {
          box-shadow: 0 12px 40px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 pt-8 pb-16 lg:px-8">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => { 
            sessionStorage.setItem("skipIntro", "true");
            window.scrollTo(0, 0); 
            navigate("/"); 
          }}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </motion.button>

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center gap-5 mb-10"
        >
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${iconGradient} flex items-center justify-center text-white shadow-lg`}
          >
            {icon}
          </div>
          <div>
            <h1
              className="text-4xl md:text-5xl font-bold leading-tight"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {title}
            </h1>
            <p className="text-gray-500 mt-1">{subtitle}</p>
          </div>
        </motion.div>

        {/* Page content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
