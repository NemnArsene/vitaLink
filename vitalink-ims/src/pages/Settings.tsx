import { useState } from "react";
import { Settings as SettingsIcon, Save, Bell, Shield, Clock, Sliders, Check } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Tabs } from "../components/ui/Tabs";
import { Alert } from "../components/ui/States";
import { useSettingsStore, useAuthStore } from "../store";

export function Settings() {
  const user = useAuthStore((state) => state.currentUser);
  const { settings, updateSettings } = useSettingsStore();
  const [tab, setTab] = useState("general");
  const [local, setLocal] = useState(settings);
  const [saved, setSaved] = useState(false);

  const isDirector = user?.role === "ROLE_DIRECTOR" || user?.role === "ROLE_SUPER_ADMIN";

  const save = () => {
    updateSettings(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paramètres"
        description="Configuration système, sécurité et seuils automatiques"
        icon={<SettingsIcon className="h-5 w-5" />}
        actions={<Button icon={<Save className="h-4 w-4" />} onClick={save}>Enregistrer</Button>}
      />

      {saved && <Alert variant="success" title="Paramètres enregistrés">Vos modifications ont été prises en compte avec succès.</Alert>}

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "general", label: "Général", icon: <Sliders className="h-4 w-4" /> },
          { id: "sla", label: "Délais & SLA", icon: <Clock className="h-4 w-4" /> },
          { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
          { id: "security", label: "Sécurité", icon: <Shield className="h-4 w-4" /> },
        ]}
      />

      {tab === "general" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Paramètres généraux</CardTitle>
              <CardDescription>Configuration de base du système</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Délai de remboursement (jours)"
                type="number"
                value={local.reimbursementDelayDays}
                onChange={(e) => setLocal({ ...local, reimbursementDelayDays: Number(e.target.value) })}
                hint="Délai contractuel pour le traitement d'une demande"
              />
              <Input
                label="Seuil d'approbation automatique (€)"
                type="number"
                value={local.autoApprovalThreshold}
                onChange={(e) => setLocal({ ...local, autoApprovalThreshold: Number(e.target.value) })}
                hint="Montant en dessous duquel l'approbation est automatique"
              />
              <Input
                label="Co-paiement par défaut (%)"
                type="number"
                value={local.copayDefault}
                onChange={(e) => setLocal({ ...local, copayDefault: Number(e.target.value) })}
              />
              <Select
                label="Devise"
                options={[
                  { value: "EUR", label: "Euro (€)" },
                  { value: "USD", label: "Dollar ($)" },
                  { value: "GBP", label: "Livre (£)" },
                ]}
              />
            </div>

            {isDirector && (
              <div className="mt-6 border-t pt-6">
                <h4 className="mb-3 text-sm font-semibold text-brand-600">Configuration des seuils (Direction)</h4>
                <div className="space-y-2">
                  <Threshold label="Approbation automatique sous le seuil défini" enabled />
                  <Threshold label="Demandes &gt; 5000€ : double validation requise" enabled />
                  <Threshold label="Plus de 3 litiges par assuré : alerte au superviseur" enabled />
                  <Threshold label="Hôpitaux avec délai &gt; 10j : revue trimestrielle" enabled />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "sla" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Délais & SLA</CardTitle>
              <CardDescription>Délais contractuels et seuils d'escalade</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="SLA demandes urgentes (heures)"
                type="number"
                value={local.slaUrgentHours}
                onChange={(e) => setLocal({ ...local, slaUrgentHours: Number(e.target.value) })}
              />
              <Input
                label="SLA demandes normales (heures)"
                type="number"
                value={local.slaNormalHours}
                onChange={(e) => setLocal({ ...local, slaNormalHours: Number(e.target.value) })}
              />
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
              <h4 className="text-sm font-semibold">Règles d'escalade</h4>
              <div className="mt-3 space-y-2">
                <Threshold label="Niveau 1 : Notification automatique au gestionnaire" enabled />
                <Threshold label="Niveau 2 : Alerte superviseur après 50% du SLA" enabled />
                <Threshold label="Niveau 3 : Escalade directeur après dépassement" enabled />
                <Threshold label="Niveau 4 : Notification email au RSSI si dépassement critique" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "notifications" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Préférences de notifications</CardTitle>
              <CardDescription>Choisissez vos canaux de communication</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <ToggleCard label="Email" description="Notifications par email" enabled={local.notifications.email} onChange={(v) => setLocal({ ...local, notifications: { ...local.notifications, email: v } })} />
              <ToggleCard label="SMS" description="SMS pour alertes critiques" enabled={local.notifications.sms} onChange={(v) => setLocal({ ...local, notifications: { ...local.notifications, sms: v } })} />
              <ToggleCard label="Push" description="Notifications navigateur" enabled={local.notifications.push} onChange={(v) => setLocal({ ...local, notifications: { ...local.notifications, push: v } })} />
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "security" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Sécurité</CardTitle>
              <CardDescription>Politique de sécurité et accès</CardDescription>
            </div>
            <Badge variant="success" dot>Sécurisé</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Timeout de session (minutes)"
                type="number"
                value={local.security.sessionTimeout}
                onChange={(e) => setLocal({ ...local, security: { ...local.security, sessionTimeout: Number(e.target.value) } })}
              />
              <Input
                label="Rotation mot de passe (jours)"
                type="number"
                value={local.security.passwordRotationDays}
                onChange={(e) => setLocal({ ...local, security: { ...local.security, passwordRotationDays: Number(e.target.value) } })}
              />
            </div>
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Authentification multi-facteurs (MFA)</p>
                  <p className="text-xs text-slate-500">Obligatoire pour tous les utilisateurs</p>
                </div>
                <Toggle enabled={local.security.mfaRequired} onChange={(v) => setLocal({ ...local, security: { ...local.security, mfaRequired: v } })} />
              </div>
            </div>
            <Alert variant="info" title="Journalisation active">
              Toutes les actions sont enregistrées dans le journal d'audit avec horodatage.
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Threshold({ label, enabled = false }: { label: string; enabled?: boolean }) {
  const [on, setOn] = useState(enabled);
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <span className="text-sm">{label}</span>
      <Toggle enabled={on} onChange={setOn} />
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700"}`}
      role="switch"
      aria-checked={enabled}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

function ToggleCard({ label, description, enabled, onChange }: { label: string; description: string; enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className={`rounded-xl border p-4 transition-all ${enabled ? "border-brand-200 bg-brand-50/50" : "border-slate-200 bg-white"} dark:border-slate-800 dark:bg-slate-900`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <Toggle enabled={enabled} onChange={onChange} />
      </div>
      {enabled && (
        <Badge variant="success" size="sm" className="mt-2">
          <Check className="h-3 w-3" /> Activé
        </Badge>
      )}
    </div>
  );
}