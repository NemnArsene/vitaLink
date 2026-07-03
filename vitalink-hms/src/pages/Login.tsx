import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShieldCheck, Activity, ChevronRight, Sparkles, LogIn, KeyRound } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { isStandaloneMode } from "@/services/http";

const ROLE_PROFILES = [
  { email: "admin@hgd.cm", name: "Aïssatou Diallo", title: "Administration", service: "Direction", color: "from-violet-500 to-indigo-600", shadow: "shadow-indigo-500/30" },
  { email: "reception@hgd.cm", name: "Moussa Diop", title: "Accueil", service: "Accueil", color: "from-blue-400 to-cyan-500", shadow: "shadow-cyan-500/30" },
  { email: "triage@hgd.cm", name: "Aminata Gueye", title: "Infirmière Triage", service: "Urgences", color: "from-red-400 to-orange-500", shadow: "shadow-orange-500/30" },
  { email: "medecin@hgd.cm", name: "Dr. Mamadou Sow", title: "Médecin", service: "Cardiologie", color: "from-emerald-500 to-teal-600", shadow: "shadow-teal-500/30" },
  { email: "laboratoire@hgd.cm", name: "Ibrahima Ndiaye", title: "Laborantin", service: "Laboratoire", color: "from-yellow-500 to-amber-600", shadow: "shadow-amber-500/30" },
  { email: "caissier@hgd.cm", name: "Khady Fall", title: "Caissier", service: "Caisse", color: "from-green-500 to-emerald-600", shadow: "shadow-emerald-500/30" },
  { email: "infirmier@hgd.cm", name: "Fatou Ndiaye", title: "Infirmier", service: "Pédiatrie", color: "from-sky-500 to-blue-600", shadow: "shadow-blue-500/30" },
  { email: "facturation@hgd.cm", name: "Ousmane Ba", title: "Facturation", service: "Facturation", color: "from-amber-500 to-orange-600", shadow: "shadow-orange-500/30" },
  { email: "admin@cliniquesante.cm", name: "Clinique Indé.", title: "Admin", service: "Indépendant", color: "from-slate-600 to-slate-800", shadow: "shadow-slate-500/30" }
];

const PASSWORDS: Record<string, string> = {
  "admin@hgd.cm": "password",
  "reception@hgd.cm": "password",
  "triage@hgd.cm": "password",
  "medecin@hgd.cm": "password",
  "laboratoire@hgd.cm": "password",
  "caissier@hgd.cm": "password",
  "infirmier@hgd.cm": "password",
  "facturation@hgd.cm": "password",
  "direction@hgd.cm": "password",
  "admin@cliniquesante.cm": "password",
};

export default function Login() {
  const loginWithCredentials = useAuthStore(s => s.loginWithCredentials);
  const nav = useNavigate();
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isManual, setIsManual] = useState(false);
  const [manualEmail, setManualEmail] = useState("");
  const [manualPassword, setManualPassword] = useState("");

  const doLogin = async (email: string, pass: string) => {
    setLoading(true);
    setError("");
    try {
      await loginWithCredentials(email, pass);
      nav("/");
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Échec de connexion (Serveur injoignable ou Accès refusé)");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileLogin = () => {
    const profile = ROLE_PROFILES[selected];
    doLogin(profile.email, PASSWORDS[profile.email]);
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail || !manualPassword) return setError("Veuillez remplir tous les champs");
    doLogin(manualEmail, manualPassword);
  };

  const currentProfile = ROLE_PROFILES[selected];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Panneau gauche : Brand (Glassmorphism + Abstract Shapes) */}
      <div className="hidden lg:flex lg:w-5/12 relative items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full blur-[100px] bg-emerald-500/20" 
          />
          <motion.div 
            animate={{ rotate: -360, scale: [1, 1.2, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full blur-[120px] bg-indigo-600/20" 
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
                <Heart className="h-7 w-7 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                  MediCore HMS
                </h1>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-400 font-semibold mt-1">
                  Système Hospitalier Intégré
                </p>
              </div>
            </div>

            <h2 className="text-4xl font-bold leading-[1.15] mb-6">
              Le cœur battant<br/>de votre hôpital.
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed mb-12 font-light">
              Gérez les parcours patients, les consultations et la facturation avec une fluidité absolue. { !isStandaloneMode ? "Connecté en temps réel à l'écosystème d'assurance." : "Mode Standalone activé." }
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Activity, title: "Temps réel", desc: "Données synchronisées" },
                { icon: ShieldCheck, title: "Sécurité", desc: "Chiffrement bout-en-bout" },
                { icon: Sparkles, title: "Intuitif", desc: "Interface repensée" },
                { icon: KeyRound, title: "RBAC", desc: "Contrôle d'accès strict" },
              ].map((f, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  key={i} 
                  className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 hover:bg-white/10 transition-colors"
                >
                  <f.icon className="h-5 w-5 mb-3 text-emerald-400" />
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
          <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <div className="font-bold text-lg text-slate-900 dark:text-white">MediCore</div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-xl"
        >
          <div className="text-center mb-10 mt-12 lg:mt-0">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
              Bon retour parmi nous 👋
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Sélectionnez votre profil pour accéder à votre espace de travail.
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

          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {isManual ? "Connexion manuelle" : "Profils de démonstration"}
            </h3>
            <button 
              onClick={() => setIsManual(!isManual)}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              {isManual ? "Utiliser un profil" : "Saisie manuelle"}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {isManual ? (
              <motion.form
                key="manual"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleManualLogin}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none mb-8"
              >
                <div className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="email">Adresse e-mail</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="nom@hopital.cm" 
                      value={manualEmail} 
                      onChange={(e) => setManualEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={manualPassword} 
                      onChange={(e) => setManualPassword(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-14 text-base font-bold rounded-xl shadow-lg shadow-emerald-500/25 bg-emerald-600 hover:bg-emerald-700 text-white transition-all relative overflow-hidden group" 
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <Activity className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      <>Se connecter <LogIn className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </span>
                </Button>
              </motion.form>
            ) : (
              <motion.div 
                key="profiles"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 max-h-[45vh] overflow-y-auto pr-2 scrollbar-thin">
                  {ROLE_PROFILES.map((p, idx) => {
                    const isSelected = selected === idx;
                    return (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        key={p.email}
                        onClick={() => setSelected(idx)}
                        className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                          isSelected
                            ? "border-emerald-500 bg-white dark:bg-slate-900 shadow-md ring-4 ring-emerald-500/10"
                            : "border-transparent bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-800"
                        }`}
                      >
                        {isSelected && (
                          <motion.div layoutId="active-profile" className="absolute inset-0 bg-emerald-50/50 dark:bg-emerald-500/5 pointer-events-none" />
                        )}
                        
                        <div className="relative z-10 flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-bold text-base shrink-0 shadow-lg ${p.shadow}`}>
                            {p.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-bold truncate transition-colors ${isSelected ? "text-emerald-700 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                              {p.name}
                            </div>
                            <div className="text-xs text-slate-500 font-medium mt-0.5 truncate">{p.title}</div>
                          </div>
                          {isSelected && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm shrink-0">
                              <ChevronRight className="h-3 w-3" />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">Se connecter en tant que</div>
                      <div className="text-lg text-emerald-600 dark:text-emerald-400 font-semibold">{currentProfile.name}</div>
                    </div>
                    <div className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                      {currentProfile.service}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleProfileLogin} 
                    disabled={loading} 
                    className="w-full h-14 text-base font-bold rounded-xl shadow-lg shadow-emerald-500/25 bg-emerald-600 hover:bg-emerald-700 text-white transition-all relative overflow-hidden group" 
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                          <Activity className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        <>Accéder au système <LogIn className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </span>
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 text-center text-xs font-medium text-slate-400">
            Sécurisé par <span className="text-emerald-600 dark:text-emerald-400">VitaLink Identity</span>
            <div className="mt-1 opacity-60">
              {isStandaloneMode ? "Mode autonome (Core API)" : "Mode connecté (Gateway API)"}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}