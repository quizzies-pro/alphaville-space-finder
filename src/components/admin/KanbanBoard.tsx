import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Lead {
  id: string;
  lead_name: string;
  lead_email: string;
  lead_whatsapp: string;
  company_profile: string | null;
  relocation_moment: string | null;
  investment_match: string | null;
  custom_message: string | null;
  submitted_at: string;
  stage: string;
}

const STAGES = [
  { id: "lead_capturado", label: "Lead Capturado" },
  { id: "qualificacao", label: "Qualificação" },
  { id: "primeiro_contato", label: "Primeiro Contato" },
  { id: "visita_agendada", label: "Visita Agendada" },
  { id: "proposta_enviada", label: "Proposta Enviada" },
  { id: "negociacao", label: "Negociação" },
  { id: "contratacao_fechada", label: "Contratação Fechada" },
  { id: "descartado", label: "Descartado" },
];

interface KanbanBoardProps {
  leads: Lead[];
  onLeadsChange: (leads: Lead[]) => void;
  onDeleteLead: (leadId: string) => void;
}

const KanbanBoard = ({ leads, onLeadsChange, onDeleteLead }: KanbanBoardProps) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const moveToStage = useCallback(
    async (leadId: string, newStage: string) => {
      const lead = leads.find((l) => l.id === leadId);
      if (!lead || lead.stage === newStage) return;

      // Optimistic update
      const updated = leads.map((l) =>
        l.id === leadId ? { ...l, stage: newStage } : l
      );
      onLeadsChange(updated);

      const { error } = await supabase
        .from("quiz_leads")
        .update({ stage: newStage })
        .eq("id", leadId);

      if (error) {
        // Revert
        onLeadsChange(leads);
        toast.error("Erro ao mover lead");
      }
    },
    [leads, onLeadsChange]
  );

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggingId(leadId);
    e.dataTransfer.setData("text/plain", leadId);
    e.dataTransfer.effectAllowed = "move";
    // Make drag image semi-transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggingId(null);
    setOverStage(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverStage(stageId);
  };

  const handleDragLeave = () => {
    setOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain");
    setDraggingId(null);
    setOverStage(null);
    moveToStage(leadId, stageId);
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-6 pr-6" style={{ minHeight: "calc(100vh - 140px)" }}>
      {STAGES.map((stage) => {
        const stageLeads = leads.filter((l) => l.stage === stage.id);
        const isDescartado = stage.id === "descartado";
        const isFechada = stage.id === "contratacao_fechada";
        const isOver = overStage === stage.id;

        return (
          <div
            key={stage.id}
            className="flex-shrink-0 w-[260px] flex flex-col"
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            {/* Column header */}
            <div className={`flex items-center gap-2 mb-3 px-2 ${isDescartado ? "opacity-60" : ""}`}>
              <span
                className={`w-2 h-2 rounded-full ${
                  isFechada ? "bg-green-500" : isDescartado ? "bg-red-500" : "bg-primary"
                }`}
              />
              <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">
                {stage.label}
              </span>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {stageLeads.length}
              </span>
            </div>

            {/* Column body */}
            <div
              className={`flex-1 rounded-lg border p-2 space-y-2 min-h-[100px] transition-all duration-200 ${
                isOver && draggingId
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border/50 bg-card/30"
              }`}
            >
              <AnimatePresence mode="popLayout">
                {stageLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    isDragging={draggingId === lead.id}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onMoveToStage={moveToStage}
                    onDelete={onDeleteLead}
                    onClick={() => setSelectedLead(lead)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      })}

      {/* Lead Detail Popup */}
      <AnimatePresence>
        {selectedLead && (
          <LeadDetailPopup
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
            onMoveToStage={(stage) => {
              moveToStage(selectedLead.id, stage);
              setSelectedLead({ ...selectedLead, stage });
            }}
            onDelete={() => {
              onDeleteLead(selectedLead.id);
              setSelectedLead(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

function LeadCard({
  lead,
  isDragging,
  onDragStart,
  onDragEnd,
  onMoveToStage,
  onClick,
}: {
  lead: Lead;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onMoveToStage: (id: string, stage: string) => void;
  onClick: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      draggable
      onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, lead.id)}
      onDragEnd={(e) => onDragEnd(e as unknown as React.DragEvent)}
      onClick={onClick}
      className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-primary/40 transition-colors relative group"
    >
      <p className="text-sm font-medium mb-1 truncate">{lead.lead_name}</p>
      <p className="text-xs text-muted-foreground truncate">{lead.lead_email}</p>
      <p className="text-xs text-muted-foreground mb-2">{lead.lead_whatsapp}</p>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {new Date(lead.submitted_at).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          })}
        </span>

        <div className="flex items-center gap-1">
          <a
            href={`https://wa.me/55${lead.lead_whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors p-1"
            onClick={(e) => e.stopPropagation()}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 opacity-0 group-hover:opacity-100"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>
      </div>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-lg py-1 shadow-lg min-w-[180px]">
            <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground px-3 py-1.5">
              Mover para
            </p>
            {STAGES.filter((s) => s.id !== lead.stage).map((stage) => (
              <button
                key={stage.id}
                onClick={() => {
                  onMoveToStage(lead.id, stage.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors"
              >
                {stage.label}
              </button>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}

function LeadDetailPopup({
  lead,
  onClose,
  onMoveToStage,
}: {
  lead: Lead;
  onClose: () => void;
  onMoveToStage: (stage: string) => void;
}) {
  const currentStage = STAGES.find((s) => s.id === lead.stage);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed inset-0 z-[90] flex items-center justify-center p-6 pointer-events-none"
      >
        <div className="bg-card border border-border rounded-xl w-full max-w-md pointer-events-auto shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h3 className="text-base font-medium">{lead.lead_name}</h3>
              <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                {currentStage?.label}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            <InfoRow label="Email" value={lead.lead_email} />
            <InfoRow label="WhatsApp" value={lead.lead_whatsapp} />
            <InfoRow label="Perfil" value={lead.company_profile || "—"} />
            <InfoRow label="Momento" value={lead.relocation_moment || "—"} />
            <InfoRow label="Investimento" value={lead.investment_match || "—"} />
            {lead.custom_message && (
              <InfoRow label="Mensagem" value={lead.custom_message} />
            )}
            <InfoRow
              label="Data"
              value={new Date(lead.submitted_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          </div>

          {/* Move to stage */}
          <div className="px-5 pb-3">
            <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-2">
              Mover para
            </p>
            <div className="flex flex-wrap gap-1.5">
              {STAGES.filter((s) => s.id !== lead.stage).map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => onMoveToStage(stage.id)}
                  className="text-[10px] tracking-[0.1em] uppercase px-2.5 py-1.5 border border-border rounded hover:bg-accent hover:border-muted-foreground transition-colors"
                >
                  {stage.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-border">
            <a
              href={`https://wa.me/55${lead.lead_whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-xs tracking-[0.15em] uppercase font-medium hover:bg-transparent hover:text-primary border border-primary transition-all duration-300"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chamar no WhatsApp
            </a>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-0.5">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

export default KanbanBoard;
