import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Step, QuizButton, QuizLayout } from "@/components/quiz/QuizComponents";
import { PropertyCarousel } from "@/components/quiz/PropertyCarousel";
import { initPixel } from "@/lib/meta-tracking";

const QuizLanding = () => {
  const navigate = useNavigate();

  useEffect(() => {
    initPixel();
  }, []);

  return (
    <QuizLayout>
      <Step key="landing">
        <div className="text-center">
          {/* Top badge */}
          <div className="inline-flex items-center gap-2 border border-border rounded-full px-4 py-1.5 mb-8 md:mb-10">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary" />
            <span className="text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.25em] uppercase text-muted-foreground">
              Oportunidade exclusiva · Alphaville, SP
            </span>
          </div>

          {/* Main title */}
          <h1 className="text-3xl md:text-6xl leading-snug md:leading-tight mb-6 md:mb-8 px-2 md:px-0" style={{ fontFamily: "'Playfair Display', serif" }}>
            Sua empresa já está<br />
            <em className="italic">maior do que o espaço</em><br />
            onde ela opera?
          </h1>

          {/* Subtitle */}
          <p className="text-muted-foreground text-sm md:text-lg mb-8 md:mb-12 max-w-xl mx-auto leading-relaxed px-4 md:px-0">
            Um andar comercial completo em Alphaville está disponível para locação.
            {" "}Responda 3 perguntas rápidas e descubra se o perfil da sua empresa está alinhado com este imóvel.
          </p>

          {/* Carrossel de fotos */}
          <PropertyCarousel />

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6 md:mb-8">
            {[
              { big: "Andar", sub: "COMPLETO\nCORPORATIVO" },
              { big: "Alphaville", sub: "SÃO PAULO" },
              { big: "3 min", sub: "PARA SUA\nAVALIAÇÃO" },
            ].map((card) => (
              <div key={card.big} className="border border-border bg-card rounded-lg py-4 md:py-5 px-2 md:px-3 flex flex-col items-center justify-center min-h-[80px] md:min-h-[100px]">
                <p className="text-base md:text-2xl font-medium mb-1">{card.big}</p>
                <p className="text-[8px] md:text-[10px] tracking-[0.1em] md:tracking-[0.15em] uppercase text-muted-foreground whitespace-pre-line leading-snug">
                  {card.sub}
                </p>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-10">
            {["Locação corporativa", "Acesso imediato", "Planta livre"].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-[10px] md:text-xs text-muted-foreground">
                <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-muted-foreground" />
                {t}
              </span>
            ))}
          </div>

          {/* Info box */}
          <div className="border border-border rounded-xl p-4 md:p-6 mb-8 md:mb-10 text-left">
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
          <QuizButton onClick={() => navigate("/etapa-1")}>Fazer avaliação rápida</QuizButton>

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
    </QuizLayout>
  );
};

export default QuizLanding;
