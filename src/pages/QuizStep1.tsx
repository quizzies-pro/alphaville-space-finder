import { useNavigate } from "react-router-dom";
import { useQuiz } from "@/components/quiz/QuizContext";
import { Step, StepLabel, QuizButton, QuizInput, QuizLayout } from "@/components/quiz/QuizComponents";

const QuizStep1 = () => {
  const navigate = useNavigate();
  const { data, errors, update, validateContacts } = useQuiz();

  return (
    <QuizLayout step={1}>
      <Step key="s1">
        <StepLabel>Etapa 1</StepLabel>
        <h2 className="text-2xl md:text-3xl font-light mb-10" style={{ fontFamily: "'Playfair Display', serif" }}>
          Preencha abaixo para receber as <em className="italic">condições completas</em> de locação.
        </h2>
        <div className="space-y-8">
          <QuizInput label="Nome" value={data.lead_name} onChange={(v) => update("lead_name", v)} error={errors.lead_name} />
          <QuizInput label="Email" type="email" value={data.lead_email} onChange={(v) => update("lead_email", v)} error={errors.lead_email} />
          <QuizInput label="WhatsApp" type="tel" value={data.lead_whatsapp} onChange={(v) => update("lead_whatsapp", v)} error={errors.lead_whatsapp} />
        </div>
        <div className="mt-12">
          <QuizButton onClick={() => { if (validateContacts()) navigate("/etapa-2"); }}>
            Continuar
          </QuizButton>
        </div>
      </Step>
    </QuizLayout>
  );
};

export default QuizStep1;
