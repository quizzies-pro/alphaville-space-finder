import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuiz } from "@/components/quiz/QuizContext";
import { Step, StepLabel, QuizButton, RadioCards, QuizLayout } from "@/components/quiz/QuizComponents";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  trackPageView,
  trackQuizStep,
  trackCompleteRegistration,
  trackContact,
} from "@/lib/meta-tracking";

const WHATSAPP_LINK = "https://wa.me/5511969735649";

const QuizStep4 = () => {
  const { data, update } = useQuiz();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    trackPageView();
  }, []);

  const getUserData = () => ({
    email: data.lead_email,
    phone: data.lead_whatsapp,
    firstName: data.lead_name.split(" ")[0],
    lastName: data.lead_name.split(" ").slice(1).join(" ") || undefined,
  });

  const handleSubmit = async () => {
    if (!data.investment_match) return;
    setSubmitting(true);

    // Track step 4 answer
    trackQuizStep(4, "Investimento", data.investment_match, getUserData());

    try {
      const { error } = await supabase.from("quiz_leads").insert({
        lead_name: data.lead_name,
        lead_email: data.lead_email,
        lead_whatsapp: data.lead_whatsapp,
        company_profile: data.company_profile,
        relocation_moment: data.relocation_moment,
        investment_match: data.investment_match,
        custom_message: data.custom_message || null,
      });
      if (error) throw error;

      // Track CompleteRegistration
      trackCompleteRegistration(getUserData());

      // Track Contact (WhatsApp click)
      trackContact(getUserData());

      const msg = encodeURIComponent(
        `Olá, completei a avaliação do andar comercial em Alphaville. Meu nome é ${data.lead_name}.`
      );
      window.open(`${WHATSAPP_LINK}?text=${msg}`, "_blank");
    } catch {
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <QuizLayout step={4}>
      <Step key="s4">
        <StepLabel>Etapa 4</StepLabel>
        <h2 className="text-xl md:text-2xl font-light mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Considerando que o <em className="italic">valor do aluguel</em> deste andar comercial é de aproximadamente
        </h2>
        <p className="text-3xl md:text-4xl font-light mb-6 text-primary">
          R$30.000<span className="text-lg text-muted-foreground">/mês</span>
        </p>
        <p className="text-muted-foreground mb-10 text-sm">
          (sem condomínio e IPTU). Esse investimento faz sentido para o momento da sua empresa hoje?
        </p>
        <RadioCards
          options={[
            "Sim, faz sentido para nossa empresa neste momento",
            "Não, estou buscando algo com investimento menor",
            "Outro cenário",
          ]}
          value={data.investment_match}
          onChange={(v) => update("investment_match", v)}
        />
        {data.investment_match === "Outro cenário" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-6">
            <textarea
              className="w-full bg-transparent border-b border-border text-foreground text-sm py-3 focus:outline-none focus:border-primary resize-none"
              rows={3}
              placeholder="Escreva o que sua empresa tem procurado"
              value={data.custom_message}
              onChange={(e) => update("custom_message", e.target.value)}
            />
          </motion.div>
        )}

        <div className="mt-12">
          <QuizButton onClick={handleSubmit}>
            {submitting ? "Enviando..." : "Enviar avaliação"}
          </QuizButton>
        </div>
      </Step>
    </QuizLayout>
  );
};

export default QuizStep4;
