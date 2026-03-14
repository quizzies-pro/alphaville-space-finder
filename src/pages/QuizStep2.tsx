import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "@/components/quiz/QuizContext";
import { Step, StepLabel, RadioCards, QuizLayout } from "@/components/quiz/QuizComponents";
import { trackQuizStep, trackPageView } from "@/lib/meta-tracking";

const QuizStep2 = () => {
  const navigate = useNavigate();
  const { data, update } = useQuiz();

  useEffect(() => {
    trackPageView();
  }, []);

  return (
    <QuizLayout step={2}>
      <Step key="s2">
        <StepLabel>Etapa 2</StepLabel>
        <h2 className="text-2xl md:text-3xl font-light mb-10" style={{ fontFamily: "'Playfair Display', serif" }}>
          Como você se posiciona nessa <em className="italic">decisão de locação</em>?
        </h2>
        <RadioCards
          options={[
            "Sou proprietário / sócio da empresa",
            "Sou diretor ou gestor responsável pela decisão",
            "Faço parte da equipe administrativa",
            "Sou corretor ou intermediador",
            "Estou apenas pesquisando opções",
          ]}
          value={data.company_profile}
          onChange={(v) => {
            update("company_profile", v);
            trackQuizStep(2, "Perfil Empresa", v, {
              email: data.lead_email,
              phone: data.lead_whatsapp,
              firstName: data.lead_name.split(" ")[0],
            });
            setTimeout(() => navigate("/etapa-3"), 400);
          }}
        />
      </Step>
    </QuizLayout>
  );
};

export default QuizStep2;
