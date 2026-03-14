import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FormData {
  lead_name: string;
  lead_email: string;
  lead_whatsapp: string;
  company_profile: string;
  relocation_moment: string;
  investment_match: string;
  custom_message: string;
}

const initialData: FormData = {
  lead_name: "",
  lead_email: "",
  lead_whatsapp: "",
  company_profile: "",
  relocation_moment: "",
  investment_match: "",
  custom_message: "",
};

const TOTAL_STEPS = 5;

const slideVariants = {
  enter: { opacity: 0, y: 40 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -40 },
};

const Index = () => {
  const [step, setStep] = useState(0); // 0=landing, 1-5=steps, 6=result
  const [data, setData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = useCallback((field: keyof FormData, value: string) => {
    setData((d) => ({ ...d, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }, []);

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!data.lead_name.trim()) e.lead_name = "Nome obrigatório";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.lead_email.trim()))
      e.lead_email = "Email inválido";
    if (!/^\d{10,11}$/.test(data.lead_whatsapp.replace(/\D/g, "")))
      e.lead_whatsapp = "WhatsApp inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !data.company_profile) return;
    if (step === 4 && !data.relocation_moment) return;
    if (step === 5) {
      if (!data.investment_match) return;
      // Save to localStorage
      const submission = { ...data, submitted_at: new Date().toISOString() };
      const existing = JSON.parse(localStorage.getItem("quiz_leads") || "[]");
      existing.push(submission);
      localStorage.setItem("quiz_leads", JSON.stringify(existing));
    }
    setStep((s) => s + 1);
  };

  const progressWidth = step >= 1 && step <= 5 ? (step / TOTAL_STEPS) * 100 : 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Progress bar */}
      {step >= 1 && step <= 5 && (
        <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-secondary">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progressWidth}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      )}

      {/* Step indicator */}
      {step >= 1 && step <= 5 && (
        <div className="fixed top-4 right-6 z-50">
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
            {step} / {TOTAL_STEPS}
          </span>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[640px]">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <Step key="landing">
                <div className="text-center">
                  {/* Top badge */}
                  <div className="inline-flex items-center gap-2 border border-border rounded-full px-5 py-2 mb-10">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                      Oportunidade exclusiva · Alphaville, SP
                    </span>
                  </div>

                  {/* Main title */}
                  <h1 className="text-3xl md:text-5xl leading-tight mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Sua empresa já está<br />
                    <em className="italic">maior do que o espaço</em><br />
                    onde ela opera?
                  </h1>

                  {/* Subtitle */}
                  <p className="text-muted-foreground text-sm md:text-base mb-12 max-w-xl mx-auto leading-relaxed">
                    Um andar comercial completo em Alphaville está disponível para locação.<br />
                    Responda 3 perguntas rápidas e descubra se o perfil da sua empresa está alinhado com este imóvel.
                  </p>

                  {/* Stat cards */}
                  <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                      { big: "Andar", sub: "COMPLETO\nCORPORATIVO" },
                      { big: "Alphaville", sub: "SÃO PAULO" },
                      { big: "3 min", sub: "PARA SUA\nAVALIAÇÃO" },
                    ].map((card) => (
                      <div key={card.big} className="border border-border bg-card rounded-lg py-5 px-3 flex flex-col items-center justify-center min-h-[100px]">
                        <p className="text-xl md:text-2xl font-medium mb-1">{card.big}</p>
                        <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground whitespace-pre-line leading-snug">
                          {card.sub}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {["Locação corporativa", "Acesso imediato", "Planta livre"].map((t) => (
                      <span key={t} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Info box */}
                  <div className="border border-border rounded-xl p-6 mb-10 text-left">
                    <div className="flex items-start gap-3">
                      <span className="text-muted-foreground mt-0.5">◆</span>
                      <div>
                        <p className="text-sm font-medium mb-2">Por que essa avaliação existe?</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Este imóvel é voltado a empresas com real intenção de expansão. A avaliação garante
                          que você receba apenas informações relevantes ao seu momento — sem perda de
                          tempo para nenhuma das partes.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <QuizButton onClick={next}>Fazer avaliação rápida</QuizButton>

                  {/* Footer text */}
                  <p className="text-xs text-muted-foreground mt-6">
                    Leva menos de 3 minutos · Sem compromisso
                  </p>

                  {/* Down arrow */}
                  <div className="mt-6 flex justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground animate-bounce">
                      <path d="M12 5v14M19 12l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </Step>
            )}

            {step === 1 && (
              <Step key="s1">
                <StepLabel>Etapa 1</StepLabel>
                <h2 className="text-2xl md:text-3xl font-light mb-10">
                  Para liberar os detalhes completos do imóvel, informe seus dados:
                </h2>
                <div className="space-y-8">
                  <QuizInput label="Nome" value={data.lead_name} onChange={(v) => update("lead_name", v)} error={errors.lead_name} />
                  <QuizInput label="Email" type="email" value={data.lead_email} onChange={(v) => update("lead_email", v)} error={errors.lead_email} />
                  <QuizInput label="WhatsApp" type="tel" value={data.lead_whatsapp} onChange={(v) => update("lead_whatsapp", v)} error={errors.lead_whatsapp} />
                </div>
                <div className="mt-12">
                  <QuizButton onClick={() => { if (validateStep2()) setStep(2); }}>
                    Continuar
                  </QuizButton>
                </div>
              </Step>
            )}

            {step === 2 && (
              <Step key="s2">
                <StepLabel>Etapa 2</StepLabel>
                <h2 className="text-2xl md:text-3xl font-light mb-10">
                  Qual melhor descreve sua empresa hoje?
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
                  onChange={(v) => update("company_profile", v)}
                />
                <div className="mt-12">
                  <QuizButton onClick={() => data.company_profile && setStep(3)}>
                    Continuar
                  </QuizButton>
                </div>
              </Step>
            )}

            {step === 3 && (
              <Step key="s3">
                <StepLabel>Etapa 3</StepLabel>
                <h2 className="text-2xl md:text-3xl font-light mb-10">
                  Em que momento sua empresa está em relação a um novo espaço comercial?
                </h2>
                <RadioCards
                  options={[
                    "Preciso mudar de espaço com urgência",
                    "Quero fechar algo nos próximos 30 dias",
                    "Estou avaliando opções para os próximos meses",
                    "Estou apenas pesquisando o mercado",
                  ]}
                  value={data.relocation_moment}
                  onChange={(v) => update("relocation_moment", v)}
                />
                <div className="mt-12">
                  <QuizButton onClick={() => data.relocation_moment && setStep(4)}>
                    Continuar
                  </QuizButton>
                </div>
              </Step>
            )}

            {step === 4 && (
              <Step key="s4">
                <StepLabel>Etapa 4</StepLabel>
                <h2 className="text-xl md:text-2xl font-light mb-4">
                  Considerando que o valor do aluguel deste andar comercial é de aproximadamente
                </h2>
                <p className="text-3xl md:text-4xl font-light mb-6 text-primary">
                  R$30.000<span className="text-lg text-muted-foreground">/mês</span>
                </p>
                <p className="text-muted-foreground mb-10 text-sm">
                  (sem condomínio e IPTU) — esse investimento faz sentido para o momento da sua empresa hoje?
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
                  <QuizButton onClick={next}>Enviar avaliação</QuizButton>
                </div>
              </Step>
            )}

            {step === 5 && (
              <Step key="result">
                <div className="text-center">
                  <div className="w-12 h-12 border border-primary rounded-full flex items-center justify-center mx-auto mb-8">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-light mb-6">
                    Seu perfil é compatível com este imóvel
                  </h2>
                  <p className="text-muted-foreground mb-10 max-w-md mx-auto text-sm leading-relaxed">
                    Pelas suas respostas, existe uma boa aderência entre o perfil da sua empresa e este andar comercial em Alphaville.
                  </p>
                  <div className="text-left max-w-sm mx-auto mb-12">
                    <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
                      Nossa equipe pode compartilhar
                    </p>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-3">
                        <span className="text-primary mt-0.5">•</span>
                        Detalhes completos do imóvel
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary mt-0.5">•</span>
                        Condições da locação
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary mt-0.5">•</span>
                        Disponibilidade para visita
                      </li>
                    </ul>
                  </div>
                  <QuizButton onClick={() => window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(`Olá, completei a avaliação do andar comercial em Alphaville. Meu nome é ${data.lead_name}.`)}`, "_blank")}>
                    Quero receber as informações
                  </QuizButton>
                </div>
              </Step>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components ---

function Step({ children, ...props }: { children: React.ReactNode } & Record<string, unknown>) {
  return (
    <motion.div
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function StepLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-8">
      {children}
    </p>
  );
}

function QuizButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-primary text-primary-foreground px-8 py-4 text-xs tracking-[0.2em] uppercase font-medium hover:bg-transparent hover:text-primary border border-primary transition-all duration-300"
    >
      {children}
    </button>
  );
}

function QuizInput({
  label,
  value,
  onChange,
  type = "text",
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="text-xs tracking-[0.2em] uppercase text-muted-foreground block mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-b border-border text-foreground text-base py-3 focus:outline-none focus:border-primary transition-colors"
      />
      {error && <p className="text-destructive text-xs mt-2">{error}</p>}
    </div>
  );
}

function RadioCards({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`w-full text-left px-5 py-4 border text-sm transition-all duration-200 ${
            value === opt
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-transparent text-foreground border-border hover:border-muted-foreground"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default Index;
