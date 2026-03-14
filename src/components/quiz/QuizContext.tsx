import { createContext, useContext, useState, useCallback } from "react";

export interface FormData {
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

interface QuizContextType {
  data: FormData;
  errors: Record<string, string>;
  update: (field: keyof FormData, value: string) => void;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  validateContacts: () => boolean;
}

const QuizContext = createContext<QuizContextType | null>(null);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = useCallback((field: keyof FormData, value: string) => {
    setData((d) => ({ ...d, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }, []);

  const validateContacts = () => {
    const e: Record<string, string> = {};
    if (!data.lead_name.trim()) e.lead_name = "Nome obrigatório";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.lead_email.trim()))
      e.lead_email = "Email inválido";
    if (!/^\d{10,11}$/.test(data.lead_whatsapp.replace(/\D/g, "")))
      e.lead_whatsapp = "WhatsApp inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <QuizContext.Provider value={{ data, errors, update, setErrors, validateContacts }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used within QuizProvider");
  return ctx;
}
