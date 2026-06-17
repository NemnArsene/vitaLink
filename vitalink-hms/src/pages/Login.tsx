import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShieldCheck, Activity, ChevronRight, Sparkles } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import type { Role } from "@/types";

const ROLE_PROFILES: Array<{ role: Role; name: string; title: string; service: string; description: string; color: string }> = [
  { role: "ROLE_ADMIN_HOSPITAL", name: "Aïssatou Diallo", title: "Administration", service: "Administration", description: "Accès complet, gestion des utilisateurs, paramètres.", color: "from-violet-500 to-indigo-600" },
  { role: "ROLE_DOCTOR", name: "Dr. Mamadou Sow", title: "Médecin", service: "Cardiologie", description: "Consultations, dossier patient, prescriptions.", color: "from-emerald-500 to-teal-600" },
  { role: "ROLE_NURSE", name: "Fatou Ndiaye", title: "Infirmier(ère)", service: "Pédiatrie", description: "Suivi des patients et des soins.", color: "from-sky-500 to-blue-600" },
  { role: "ROLE_BILLING", name: "Ousmane Ba", title: "Facturation", service: "Facturation", description: "Factures, remboursements et suivi assurance.", color: "from-amber-500 to-orange-600" },
  { role: "ROLE_DIRECTOR", name: "Cheikh Fall", title: "Direction", service: "Direction", description: "Vue stratégique et rapports exécutifs.", color: "from-rose-500 to-pink-600" },
];

export default function Login() {
  const login = useAuthStore(s => s.login);
  const nav = useNavigate();
  const [selected, setSelected] = useState(0);

  const handleLogin = (profile: typeof ROLE_PROFILES[number]) => {
    login({
      id: profile.role.toLowerCase(),
      firstName: profile.name.split(" ").slice(0, -1).join(" "),
      lastName: profile.name.split(" ").slice(-1)[0],
      email: `${profile.title.toLowerCase().replace(/\s/g, ".")}@hcd.sn`,
      role: profile.role,
      service: profile.service,
    });
    nav("/");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden" style={{ background: "linear-gradient(135deg, #042f2e 0%, #0f766e 50%, #6366f1 100%)" }}>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 h-72 w-72 rounded-full blur-3xl bg-emerald-400" />
          <div className="absolute bottom-20 right-20 h-72 w-72 rounded-full blur-3xl bg-indigo-400" />
        </div>
        <div className="relative z-10 max-w-md text-white p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">MediCore HMS</div>
              <div className="text-xs uppercase tracking-widest opacity-70">Plateforme Hospitalière Africaine</div>
            </div>
          </div>
          <h1 className="text-3xl font-bold leading-tight mb-3">
            Le système nerveux digital de votre hôpital.
          </h1>
          <p className="text-white/80 leading-relaxed mb-8">
            Gérez patients, consultations, facturation et remboursements en parfaite connexion avec votre écosystème d'assurance via notre API Gateway sécurisée.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Activity, label: "Temps réel" },
              { icon: ShieldCheck, label: "Sécurisé" },
              { icon: Sparkles, label: "Intelligent" },
            ].map((f, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
                <f.icon className="h-4 w-4 mb-1.5 opacity-80" />
                <div className="text-xs font-medium">{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #0d9488 0%, #6366f1 100%)" }}>
              <Heart className="h-5 w-5" />
            </div>
            <div className="text-lg font-bold">MediCore HMS</div>
          </div>

          <h2 className="text-2xl font-bold mb-1">Bienvenue 👋</h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Sélectionnez un profil pour explorer la démo. Chaque rôle expose des permissions distinctes (RBAC).
          </p>

          <div className="space-y-2">
            {ROLE_PROFILES.map((p, idx) => (
              <button
                key={p.role}
                onClick={() => setSelected(idx)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                  selected === idx
                    ? "border-[var(--primary)] bg-[var(--primary-50)]"
                    : "border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
                }`}
              >
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {p.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{p.name}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{p.title} · {p.service}</div>
                </div>
                <ChevronRight className={`h-4 w-4 transition ${selected === idx ? "text-[var(--primary)] translate-x-0.5" : "opacity-30"}`} />
              </button>
            ))}
          </div>

          <Button onClick={() => handleLogin(ROLE_PROFILES[selected])} className="w-full mt-5" size="lg">
            Accéder à la plateforme
          </Button>

          <p className="text-xs text-center mt-6" style={{ color: "var(--text-muted)" }}>
            🔒 Démo avec données mockées · Aucune information réelle transmise
          </p>
        </div>
      </div>
    </div>
  );
}