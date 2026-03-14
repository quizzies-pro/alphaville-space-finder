import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QuizProvider } from "@/components/quiz/QuizContext";
import QuizLanding from "./pages/QuizLanding.tsx";
import QuizStep1 from "./pages/QuizStep1.tsx";
import QuizStep2 from "./pages/QuizStep2.tsx";
import QuizStep3 from "./pages/QuizStep3.tsx";
import QuizStep4 from "./pages/QuizStep4.tsx";
import QuizResult from "./pages/QuizResult.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <QuizProvider>
          <Routes>
            <Route path="/" element={<QuizLanding />} />
            <Route path="/etapa-1" element={<QuizStep1 />} />
            <Route path="/etapa-2" element={<QuizStep2 />} />
            <Route path="/etapa-3" element={<QuizStep3 />} />
            <Route path="/etapa-4" element={<QuizStep4 />} />
            <Route path="/resultado" element={<QuizResult />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </QuizProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
