import { motion } from "framer-motion";

const slideVariants = {
  enter: { opacity: 0, y: 40 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -40 },
};

export function Step({ children, ...props }: { children: React.ReactNode } & Record<string, unknown>) {
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

export function StepLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-8">
      {children}
    </p>
  );
}

export function QuizButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-primary text-primary-foreground px-8 py-4 text-xs tracking-[0.2em] uppercase font-medium hover:bg-transparent hover:text-primary border border-primary transition-all duration-300"
    >
      {children}
    </button>
  );
}

export function QuizInput({
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

export function RadioCards({
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

export function QuizLayout({ children, step, totalSteps = 5 }: { children: React.ReactNode; step?: number; totalSteps?: number }) {
  const progressWidth = step && step >= 1 && step <= totalSteps ? (step / totalSteps) * 100 : 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {step && step >= 1 && step <= totalSteps && (
        <>
          <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-secondary">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressWidth}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <div className="fixed top-4 right-6 z-50">
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
              {step} / {totalSteps}
            </span>
          </div>
        </>
      )}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[640px]">
          {children}
        </div>
      </div>
    </div>
  );
}
