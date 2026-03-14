import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("quiz_leads")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (error) {
        toast.error("Erro ao carregar leads");
        console.error(error);
      } else {
        setLeads(data || []);
      }
      setLoading(false);
    };

    checkAuthAndLoad();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1
            className="text-2xl font-light"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Leads recebidos
          </h1>
          <div className="flex items-center gap-4">
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

        {leads.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum lead cadastrado ainda.</p>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-card">
                    <th className="text-left px-4 py-3 text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium">
                      Nome
                    </th>
                    <th className="text-left px-4 py-3 text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium">
                      WhatsApp
                    </th>
                    <th className="text-left px-4 py-3 text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium">
                      Perfil
                    </th>
                    <th className="text-left px-4 py-3 text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium">
                      Momento
                    </th>
                    <th className="text-left px-4 py-3 text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium">
                      Investimento
                    </th>
                    <th className="text-left px-4 py-3 text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-card/50 transition-colors">
                      <td className="px-4 py-3">{lead.lead_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{lead.lead_email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{lead.lead_whatsapp}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{lead.company_profile || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{lead.relocation_moment || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{lead.investment_match || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {new Date(lead.submitted_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
