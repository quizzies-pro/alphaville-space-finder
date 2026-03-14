import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuiz } from "@/components/quiz/QuizContext";
import { Step, StepLabel, QuizButton, QuizInput, RadioCards, QuizLayout } from "@/components/quiz/QuizComponents";

const QuizStep4 = () => {
  const navigate = useNavigate();
  const { data, update, validateContacts } = useQuiz();

  const handleSubmit = () => {
    if (!data.investment_match) return;
    if (!validateContacts()) return;
    // Save to localStorage
    const submission = { ...data, submitted_at: new Date().toISOString() };
    const existing = JSON.parse(localStorage.getItem("quiz_leads") || "[]");
    existing.push(submission);
    localStorage.setItem("quiz_leads", JSON.stringify(existing));
    navigate("/resultado");
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

        {/* Confirmação de dados */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6">
            Confirme seus dados
          </p>
          <div className="space-y-4">
            <QuizInput label="Nome" value={data.lead_name} onChange={(v) => update("lead_name", v)} />
            <QuizInput label="Email" type="email" value={data.lead_email} onChange={(v) => update("lead_email", v)} />
            <QuizInput label="WhatsApp" type="tel" value={data.lead_whatsapp} onChange={(v) => update("lead_whatsapp", v)} />
          </div>
        </div>

        <div className="mt-12">
          <QuizButton onClick={handleSubmit}>Enviar avaliação</QuizButton>
        </div>
      </Step>
    </QuizLayout>
  );
};

export default QuizStep4;
