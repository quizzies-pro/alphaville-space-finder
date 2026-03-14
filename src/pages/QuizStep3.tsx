import { useNavigate } from "react-router-dom";
import { useQuiz } from "@/components/quiz/QuizContext";
import { Step, StepLabel, QuizButton, RadioCards, QuizLayout } from "@/components/quiz/QuizComponents";

const QuizStep3 = () => {
  const navigate = useNavigate();
  const { data, update } = useQuiz();

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
            setTimeout(() => navigate("/etapa-4"), 400);
          }}
        />
      </Step>
    </QuizLayout>
  );
};

export default QuizStep3;
