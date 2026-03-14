import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "@/components/quiz/QuizContext";
import { Step, StepLabel, RadioCards, QuizLayout } from "@/components/quiz/QuizComponents";
import { trackQuizStep, trackPageView } from "@/lib/meta-tracking";

const QuizStep3 = () => {
  const navigate = useNavigate();
  const { data, update } = useQuiz();

  useEffect(() => {
    trackPageView();
  }, []);

  return (
    <QuizLayout step={3}>
      <Step key="s3">
        <StepLabel>Etapa 3</StepLabel>
        <h2 className="text-2xl md:text-3xl font-light mb-10" style={{ fontFamily: "'Playfair Display', serif" }}>
          Em que <em className="italic">momento</em> sua empresa está em relação a um <em className="italic">novo espaço comercial</em>?
        </h2>
        <RadioCards
          options={[
            "Preciso mudar de espaço com urgência",
            "Quero fechar algo nos próximos 30 dias",
            "Estou avaliando opções para os próximos meses",
            "Estou apenas pesquisando o mercado",
          ]}
          value={data.relocation_moment}
          onChange={(v) => {
            update("relocation_moment", v);
            trackQuizStep(3, "Momento Relocação", v, {
              email: data.lead_email,
              phone: data.lead_whatsapp,
              firstName: data.lead_name.split(" ")[0],
            });
            setTimeout(() => navigate("/etapa-4"), 400);
          }}
        />
      </Step>
    </QuizLayout>
  );
};

export default QuizStep3;
