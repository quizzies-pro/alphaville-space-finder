import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "@/components/quiz/QuizContext";
import { Step, StepLabel, QuizButton, QuizInput, QuizLayout } from "@/components/quiz/QuizComponents";
import { trackLead, trackPageView } from "@/lib/meta-tracking";

const QuizStep1 = () => {
  const navigate = useNavigate();
  const { data, errors, update, validateContacts } = useQuiz();

  useEffect(() => {
    trackPageView();
    trackLead();
  }, []);

  const handleContinue = () => {
    if (validateContacts()) {
      // Track with user data after validation
      trackLead({
        email: data.lead_email,
        phone: data.lead_whatsapp,
        firstName: data.lead_name.split(" ")[0],
        lastName: data.lead_name.split(" ").slice(1).join(" ") || undefined,
      });
      navigate("/etapa-2");
    }
  };

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
        <div className="mt-10 pt-6 border-t border-muted/30 w-full">
          <p className="text-[10px] md:text-xs text-muted-foreground leading-[1.8] tracking-wide">
            Ao clicar em "Continuar", você concorda com o uso dos seus dados pessoais para fins de contato comercial, conforme a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). Seus dados não serão compartilhados com terceiros.
          </p>
        </div>
        <div className="mt-8">
          <QuizButton onClick={handleContinue}>
            Continuar
          </QuizButton>
        </div>
      </Step>
    </QuizLayout>
  );
};

export default QuizStep1;
