import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Activity, Sparkles, LogIn, KeyRound } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useAuthStore } from "../store";
import { motion, AnimatePresence } from "framer-motion";

const IMS_USERS = [
  { email: "directeur@ims.com", label: "Directeur", role: "DIRECTEUR", color: "from-violet-500 to-indigo-600", shadow: "shadow-indigo-500/30" },
  { email: "liquidateur@ims.com", label: "Liquidateur", role: "LIQUIDATEUR", color: "from-blue-400 to-cyan-500", shadow: "shadow-cyan-500/30" },
  { email: "analyste@ims.com", label: "Analyste", role: "ANALYSTE", color: "from-fuchsia-500 to-pink-600", shadow: "shadow-fuchsia-500/30" },
  { email: "manager@ims.com", label: "Manager", role: "MANAGER", color: "from-amber-500 to-orange-600", shadow: "shadow-orange-500/30" },
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
  const loginWithCredentials = useAuthStore((s) => s.loginWithCredentials);

  const handleLogin = async () => {
    const user = IMS_USERS[selected];
    setLoading(true);
    setError("");
    try {
      await loginWithCredentials(user.email, PASSWORDS[user.email]);
      nav("/");
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Échec de connexion (Serveur injoignable)");
    } finally {
      setLoading(false);
    }
  };

  const currentProfile = IMS_USERS[selected];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Panneau gauche : Brand (Glassmorphism) */}
      <div className="hidden lg:flex lg:w-5/12 relative items-center justify-center overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full blur-[100px] bg-violet-600/20" 
          />
          <motion.div 
            animate={{ rotate: -360, scale: [1, 1.2, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full blur-[120px] bg-blue-600/20" 
          />
        </div>

        <div className="relative z-10 w-full max-w-lg p-12 text-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-12">
              <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl">
                <ShieldCheck className="h-7 w-7 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                  MediSure IMS
                </h1>
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-400 font-semibold mt-1">
                  Assurance Santé Connectée
                </p>
              </div>
            </div>

            <h2 className="text-4xl font-bold leading-[1.15] mb-6">
              La confiance,<br/>numérisée.
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed mb-12 font-light">
              Gérez les polices, les sinistres et les remboursements en temps réel. Connecté directement au réseau hospitalier national.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Activity, title: "Remboursements", desc: "Traitement automatisé" },
                { icon: ShieldCheck, title: "Garanties", desc: "Vérification en temps réel" },
                { icon: Sparkles, title: "Intelligence", desc: "Analyse de sinistralité" },
                { icon: KeyRound, title: "Sécurité", desc: "API Gateway sécurisée" },
              ].map((f, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  key={i} 
                  className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 hover:bg-white/10 transition-colors"
                >
                  <f.icon className="h-5 w-5 mb-3 text-indigo-400" />
                  <div className="text-sm font-semibold text-white mb-1">{f.title}</div>
                  <div className="text-xs text-slate-400">{f.desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Panneau droit : Login */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div className="font-bold text-lg text-slate-900 dark:text-white">MediSure</div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-xl"
        >
          <div className="text-center mb-10 mt-12 lg:mt-0">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
              Portail d'Assurance 🛡️
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Authentification au système central de gestion.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 text-sm flex items-start gap-3 shadow-sm"
              >
                <div className="mt-0.5"><ShieldCheck className="h-4 w-4" /></div>
                <div className="flex-1 font-medium">{error}</div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {IMS_USERS.map((p, idx) => {
              const isSelected = selected === idx;
              return (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={p.email}
                  onClick={() => setSelected(idx)}
                  className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                    isSelected
                      ? "border-indigo-500 bg-white dark:bg-slate-900 shadow-md ring-4 ring-indigo-500/10"
                      : "border-transparent bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-800"
                  }`}
                >
                  {isSelected && (
                    <motion.div layoutId="active-profile-ims" className="absolute inset-0 bg-indigo-50/50 dark:bg-indigo-500/5 pointer-events-none" />
                  )}
                  
                  <div className="relative z-10 flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-bold text-base shrink-0 shadow-lg ${p.shadow}`}>
                      {p.label.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold truncate transition-colors ${isSelected ? "text-indigo-700 dark:text-indigo-400" : "text-slate-900 dark:text-white"}`}>
                        {p.label}
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5 truncate">{p.email}</div>
                    </div>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-sm shrink-0">
                        <LogIn className="h-3 w-3 ml-0.5" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">Autorisation pour</div>
                <div className="text-lg text-indigo-600 dark:text-indigo-400 font-semibold">{currentProfile.label}</div>
              </div>
              <div className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                {currentProfile.role}
              </div>
            </div>
            
            <Button 
              onClick={handleLogin} 
              disabled={loading} 
              className="w-full h-14 text-base font-bold rounded-xl shadow-lg shadow-indigo-500/25 bg-indigo-600 hover:bg-indigo-700 text-white transition-all relative overflow-hidden group" 
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Activity className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <>Démarrer la session <LogIn className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </span>
            </Button>
          </div>

          <div className="mt-8 text-center text-xs font-medium text-slate-400">
            Protégé par <span className="text-indigo-600 dark:text-indigo-400">VitaLink Identity Gateway</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
