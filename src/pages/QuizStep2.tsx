import { useNavigate } from "react-router-dom";
import { useQuiz } from "@/components/quiz/QuizContext";
import { Step, StepLabel, QuizButton, RadioCards, QuizLayout } from "@/components/quiz/QuizComponents";

const QuizStep2 = () => {
  const navigate = useNavigate();
  const { data, update } = useQuiz();

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
            setTimeout(() => navigate("/etapa-3"), 400);
          }}
        />
      </Step>
    </QuizLayout>
  );
};

export default QuizStep2;
