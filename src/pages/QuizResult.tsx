import { useQuiz } from "@/components/quiz/QuizContext";
import { Step, QuizButton, QuizLayout } from "@/components/quiz/QuizComponents";

const QuizResult = () => {
  const { data } = useQuiz();

  return (
    <QuizLayout>
      <Step key="result">
        <div className="text-center">
          <div className="w-12 h-12 border border-primary rounded-full flex items-center justify-center mx-auto mb-8">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-light mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
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
            Agendar uma visita ao local
          </QuizButton>
        </div>
      </Step>
    </QuizLayout>
  );
};

export default QuizResult;
