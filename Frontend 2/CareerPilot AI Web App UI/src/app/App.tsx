import { Routes, Route } from "react-router";
import { AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { CinematicIntro } from "./components/CinematicIntro";
import { ScrollToTop } from "./components/ScrollToTop";
import { MainProduct } from "./components/MainProduct";
import { ResumePage } from "./pages/ResumePage";
import { CareerPage } from "./pages/CareerPage";
import { InterviewPage } from "./pages/InterviewPage";
import { RoadmapPage } from "./pages/RoadmapPage";

// Intro state managed by sessionStorage to handle "Back to Home" skips
type AppState = "intro" | "main";

function HomeFlow() {
  const [state, setState] = useState<AppState>(() => {
    return sessionStorage.getItem("skipIntro") === "true" ? "main" : "intro";
  });

  useEffect(() => {
    // Clear the flag on refresh so intro always plays on a fresh load
    const handleBeforeUnload = () => {
      sessionStorage.removeItem("skipIntro");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleIntroComplete = () => {
    // Always scroll to absolute top before revealing the homepage
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setState("main");
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {state === "intro" && (
          <CinematicIntro key="intro" onComplete={handleIntroComplete} />
        )}
        {state === "main" && <MainProduct key="main" />}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomeFlow />} />
      <Route path="/resume" element={<ResumePage />} />
      <Route path="/career" element={<CareerPage />} />
      <Route path="/interview" element={<InterviewPage />} />
      <Route path="/roadmap" element={<RoadmapPage />} />
      </Routes>
    </>
  );
}