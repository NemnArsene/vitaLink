import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Activity, Sparkles, LogIn } from "lucide-react";
import { Button } from "../components/ui/Button";
import { AuthAPI } from "../api/http-client";

const IMS_USERS = [
  { email: "directeur@ims.com", label: "Directeur", role: "DIRECTEUR", color: "from-violet-500 to-indigo-600" },
  { email: "liquidateur@ims.com", label: "Liquidateur", role: "LIQUIDATEUR", color: "from-blue-400 to-cyan-500" },
  { email: "analyste@ims.com", label: "Analyste", role: "ANALYSTE", color: "from-emerald-500 to-teal-600" },
  { email: "manager@ims.com", label: "Manager", role: "MANAGER", color: "from-amber-500 to-orange-600" },
];

const PASSWORDS: Record<string, string> = {
  "directeur@ims.com": "Directeur@123",
  "liquidateur@ims.com": "Liquidateur@123",
  "analyste@ims.com": "Analyste@123",
  "manager@ims.com": "Manager@123",
};

export default function Login() {
  const nav = useNavigate();
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const user = IMS_USERS[selected];
    setLoading(true);
    setError("");
    try {
      const result = await AuthAPI.login(user.email, PASSWORDS[user.email]);
      localStorage.setItem(
        "medisure-auth",
        JSON.stringify({
          state: {
            currentUser: {
              id: result.user.id,
              email: result.user.email,
              fullName: `${result.user.prenom} ${result.user.nom}`,
              role: `ROLE_${result.user.role}`,
              department: user.label,
              active: true,
              lastLogin: new Date().toISOString(),
              permissions: ["*"],
              createdAt: "2023-01-15T08:00:00Z",
            },
            isAuthenticated: true,
            token: result.accessToken,
          },
        }),
      );
      nav("/");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Échec de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div
        className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #6366f1 100%)" }}
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 h-72 w-72 rounded-full blur-3xl bg-indigo-400" />
          <div className="absolute bottom-20 right-20 h-72 w-72 rounded-full blur-3xl bg-violet-400" />
        </div>
        <div className="relative z-10 max-w-md text-white p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">MediSure IMS</div>
              <div className="text-xs uppercase tracking-widest opacity-70">Plateforme d'Assurance Africaine</div>
            </div>
          </div>
          <h1 className="text-3xl font-bold leading-tight mb-3">La confiance, numérisée.</h1>
          <p className="text-white/80 leading-relaxed mb-8">
            Gérez polices, sinistres et remboursements en temps réel, connecté à votre réseau hospitalier via notre Gateway sécurisée.
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

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #3730a3 0%, #6366f1 100%)" }}>
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-lg font-bold">MediSure IMS</div>
          </div>

          <h2 className="text-2xl font-bold mb-1">Bienvenue 👋</h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Sélectionnez un utilisateur IMS pour vous connecter.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <div className="space-y-2">
            {IMS_USERS.map((p, idx) => (
              <button
                key={p.email}
                onClick={() => setSelected(idx)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                  selected === idx
                    ? "border-[var(--primary)] bg-[var(--primary-50)]"
                    : "border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
                }`}
              >
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {p.label.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{p.label}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{p.email}</div>
                </div>
                <LogIn className={`h-4 w-4 transition ${selected === idx ? "text-[var(--primary)]" : "opacity-30"}`} />
              </button>
            ))}
          </div>

          <Button onClick={handleLogin} disabled={loading} className="w-full mt-5" size="lg">
            {loading ? "Connexion..." : "Accéder à la plateforme"}
          </Button>

          <p className="text-xs text-center mt-6" style={{ color: "var(--text-muted)" }}>
            🔒 Connexion sécurisée via API Gateway
          </p>
        </div>
      </div>
    </div>
  );
}
