import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import KanbanBoard from "@/components/admin/KanbanBoard";

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

type ViewMode = "list" | "kanban";

const Admin = () => {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("role", "admin")
          .single();
        if (roles) {
          setAuthed(true);
          await loadLeads();
        }
      }
      setChecking(false);
    };
    check();
  }, []);

  const loadLeads = async () => {
    setLeadsLoading(true);
    const { data, error } = await supabase
      .from("quiz_leads")
      .select("*")
      .order("submitted_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar leads");
    } else {
      setLeads(data || []);
    }
    setLeadsLoading(false);
  };

  const handleDeleteLead = async (leadId: string) => {
    const prev = leads;
    setLeads(leads.filter((l) => l.id !== leadId));
    const { error } = await supabase.from("quiz_leads").delete().eq("id", leadId);
    if (error) {
      setLeads(prev);
      toast.error("Erro ao excluir lead");
    } else {
      toast.success("Lead excluído");
    }
  };

  const handleStageChange = async (leadId: string, newStage: string) => {
    const prev = leads;
    setLeads(leads.map((l) => l.id === leadId ? { ...l, stage: newStage } : l));
    const { error } = await supabase.from("quiz_leads").update({ stage: newStage }).eq("id", leadId);
    if (error) {
      setLeads(prev);
      toast.error("Erro ao atualizar status");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("role", "admin")
        .single();

      if (roleError || !roles) {
        await supabase.auth.signOut();
        toast.error("Acesso negado.");
        return;
      }

      setAuthed(true);
      await loadLeads();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthed(false);
    setLeads([]);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Verificando...</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-light mb-8 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Admin
          </h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-xs tracking-[0.2em] uppercase text-muted-foreground block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent border-b border-border text-foreground text-base py-3 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="text-xs tracking-[0.2em] uppercase text-muted-foreground block mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent border-b border-border text-foreground text-base py-3 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-primary text-primary-foreground px-8 py-4 text-xs tracking-[0.2em] uppercase font-medium hover:bg-transparent hover:text-primary border border-primary transition-all duration-300 disabled:opacity-50"
            >
              {loginLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto px-10 py-12 max-w-full">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-2xl font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
            Leads recebidos
          </h1>
          <div className="flex items-center gap-4">
            {/* View toggle */}
            <div className="flex border border-border rounded overflow-hidden">
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase transition-colors ${
                  viewMode === "kanban" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase transition-colors ${
                  viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Lista
              </button>
            </div>
            <span className="text-xs text-muted-foreground tracking-[0.15em] uppercase">
              {leads.length} lead{leads.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              Sair
            </button>
          </div>
        </div>

        {leadsLoading ? (
          <p className="text-muted-foreground text-sm">Carregando...</p>
        ) : leads.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum lead cadastrado ainda.</p>
        ) : viewMode === "kanban" ? (
          <KanbanBoard leads={leads} onLeadsChange={setLeads} onDeleteLead={handleDeleteLead} />
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="text-sm w-full">
                <thead>
                  <tr className="border-b border-border bg-card">
                    <th className="text-left px-8 py-4 text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium whitespace-nowrap">Nome</th>
                    <th className="text-left px-8 py-4 text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium whitespace-nowrap">Email</th>
                    <th className="text-left px-8 py-4 text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium whitespace-nowrap">WhatsApp</th>
                    <th className="text-left px-8 py-4 text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium whitespace-nowrap">Status</th>
                    <th className="text-left px-8 py-4 text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium whitespace-nowrap">Data</th>
                    <th className="text-left px-8 py-4 text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium whitespace-nowrap">Contato</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-card/50 transition-colors cursor-pointer" onClick={() => setSelectedLead(lead)}>
                      <td className="px-8 py-5 font-medium whitespace-nowrap">{lead.lead_name}</td>
                      <td className="px-8 py-5 text-muted-foreground whitespace-nowrap">{lead.lead_email}</td>
                      <td className="px-8 py-5 text-muted-foreground whitespace-nowrap">{lead.lead_whatsapp}</td>
                      
                      <td className="px-8 py-5" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.stage}
                          onChange={(e) => handleStageChange(lead.id, e.target.value)}
                          className="bg-transparent border border-border rounded px-3 py-1.5 text-[10px] tracking-[0.12em] uppercase text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer appearance-none pr-6"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 8px center",
                          }}
                        >
                          {STAGES.map((stage) => (
                            <option key={stage.id} value={stage.id} className="bg-card text-foreground">
                              {stage.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-8 py-5 text-muted-foreground text-xs whitespace-nowrap">
                        {new Date(lead.submitted_at).toLocaleDateString("pt-BR", {
                          day: "2-digit", month: "2-digit", year: "2-digit",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="px-8 py-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                          <a
                            href={`https://wa.me/55${lead.lead_whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors p-1.5 rounded hover:bg-primary/10"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          </a>
                          <DeleteButton onDelete={() => handleDeleteLead(lead.id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lead Detail Popup for list view */}
        {viewMode === "list" && selectedLead && (
          <div className="fixed inset-0 z-[80] bg-background/80 backdrop-blur-sm" onClick={() => setSelectedLead(null)}>
            <div className="fixed inset-0 z-[90] flex items-center justify-center p-6 pointer-events-none">
              <div className="bg-card border border-border rounded-xl w-full max-w-md pointer-events-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <div>
                    <h3 className="text-base font-medium">{selectedLead.lead_name}</h3>
                    <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                      {STAGES.find((s) => s.id === selectedLead.stage)?.label}
                    </span>
                  </div>
                  <button onClick={() => setSelectedLead(null)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <DetailRow label="Email" value={selectedLead.lead_email} />
                  <DetailRow label="WhatsApp" value={selectedLead.lead_whatsapp} />
                  <DetailRow label="Perfil" value={selectedLead.company_profile || "—"} />
                  <DetailRow label="Momento" value={selectedLead.relocation_moment || "—"} />
                  <DetailRow label="Investimento" value={selectedLead.investment_match || "—"} />
                  {selectedLead.custom_message && <DetailRow label="Mensagem" value={selectedLead.custom_message} />}
                  <DetailRow label="Data" value={new Date(selectedLead.submitted_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })} />
                </div>
                <div className="p-5 border-t border-border">
                  <a
                    href={`https://wa.me/55${selectedLead.lead_whatsapp.replace(/\D/g, "")}`}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  const [confirm, setConfirm] = useState(false);
  return confirm ? (
    <button
      onClick={(e) => { e.stopPropagation(); onDelete(); }}
      className="text-destructive hover:text-destructive/80 transition-colors p-1.5 rounded hover:bg-destructive/10"
      title="Confirmar exclusão"
    >
      <Trash2 size={16} strokeWidth={2.5} />
    </button>
  ) : (
    <button
      onClick={(e) => { e.stopPropagation(); setConfirm(true); }}
      className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded hover:bg-destructive/10"
      title="Excluir"
    >
      <Trash2 size={16} />
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

export default Admin;
