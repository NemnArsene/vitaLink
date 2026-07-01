import { useState } from "react";
import { Thermometer, Plus, Pill, Bed, Activity, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/Stat";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { formatDateTime } from "@/lib/format";
import { toast } from "sonner";

type Soin = { date: string; soin: string; par: string; type: "soin" | "produit" | "constante" };
type Patient = { id: string; patientName: string; room: string; service: string; admissionDate: string; diagnostic: string; statut: string; doctor: string; soins: Soin[] };

const MOCK_PATIENTS: Patient[] = [
  { id: "hosp-1", patientName: "Amadou Diallo", room: "201A", service: "Cardiologie", admissionDate: new Date(Date.now() - 3 * 86400000).toISOString(), diagnostic: "Infarctus du myocarde", statut: "hospitalise", doctor: "Dr. Mamadou Sow", soins: [{ date: new Date(Date.now() - 60 * 60000).toISOString(), soin: "Prise constantes", par: "Fatou Ndiaye", type: "constante" }] },
  { id: "hosp-2", patientName: "Mariama Cissé", room: "105B", service: "Pédiatrie", admissionDate: new Date(Date.now() - 1 * 86400000).toISOString(), diagnostic: "Pneumonie aiguë", statut: "hospitalise", doctor: "Dr. Awa Mbaye", soins: [] },
  { id: "hosp-3", patientName: "Ousmane Diallo", room: "302", service: "Urgences", admissionDate: new Date(Date.now() - 0.5 * 86400000).toISOString(), diagnostic: "Crise d'asthme", statut: "hospitalise", doctor: "Dr. Mamadou Sow", soins: [] },
];

export default function Nursing() {
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [soinModal, setSoinModal] = useState(false);
  const [produitModal, setProduitModal] = useState(false);
  const [constantesModal, setConstantesModal] = useState(false);
  const [vitals, setVitals] = useState({ tension: "", temperature: "", pulsations: "", saturation: "", observations: "" });
  const [soinType, setSoinType] = useState("Prise de constantes");
  const [soinNotes, setSoinNotes] = useState("");
  const [produit, setProduit] = useState({ name: "", quantity: 0, unitPrice: 0 });

  const addSoin = () => {
    if (!selected) return;
    setPatients(patients.map(p => p.id === selected.id ? { ...p, soins: [...p.soins, { date: new Date().toISOString(), soin: soinType, par: "Infirmier(ère)", type: "soin" as const }] } : p));
    setSoinModal(false);
    setSoinType("Prise de constantes");
    setSoinNotes("");
    toast.success("Soin enregistré");
  };

  const addProduit = () => {
    if (!produit.name.trim() || produit.quantity <= 0) { toast.error("Nom et quantité requis"); return; }
    if (!selected) return;
    const total = produit.quantity * produit.unitPrice;
    setPatients(patients.map(p => p.id === selected.id ? { ...p, soins: [...p.soins, { date: new Date().toISOString(), soin: `Produit: ${produit.name} x${produit.quantity} = ${total.toLocaleString()} FCFA`, par: "Infirmier(ère)", type: "produit" as const }] } : p));
    setProduitModal(false);
    setProduit({ name: "", quantity: 0, unitPrice: 0 });
    toast.success(`Produit ajouté: ${produit.name} x${produit.quantity}`);
  };

  const saveConstantes = () => {
    if (!vitals.tension || !vitals.temperature) { toast.error("Tension et température requises"); return; }
    if (!selected) return;
    setPatients(patients.map(p => p.id === selected.id ? { ...p, soins: [...p.soins, { date: new Date().toISOString(), soin: `Constantes: TA=${vitals.tension}, T°=${vitals.temperature}°C, Pouls=${vitals.pulsations}/min, SpO2=${vitals.saturation}%`, par: "Infirmier(ère)", type: "constante" as const }] } : p));
    setConstantesModal(false);
    setVitals({ tension: "", temperature: "", pulsations: "", saturation: "", observations: "" });
    toast.success("Constantes enregistrées");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Soins infirmiers" description="Suivi des patients hospitalisés et administration des soins" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Patients hospitalisés" value={patients.length} icon={<Bed className="h-5 w-5" />} color="primary" />
        <StatCard label="Soins aujourd'hui" value={patients.reduce((s, p) => s + p.soins.length, 0)} icon={<Activity className="h-5 w-5" />} color="info" />
        <StatCard label="Constantes à prendre" value={patients.length} icon={<Thermometer className="h-5 w-5" />} color="warning" />
        <StatCard label="Médicaments à administrer" value="12" icon={<Pill className="h-5 w-5" />} color="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {patients.map(p => (
          <Card key={p.id} className="card-hover cursor-pointer" onClick={() => setSelected(p)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={p.patientName} />
                  <div>
                    <CardTitle className="text-base">{p.patientName}</CardTitle>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Chambre {p.room} · {p.service}</p>
                  </div>
                </div>
                <Badge variant="success" dot>Hospitalisé</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>Diagnostic:</span>
                  <span className="font-medium">{p.diagnostic}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>Médecin traitant:</span>
                  <span>{p.doctor}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>Admis le:</span>
                  <span>{formatDateTime(p.admissionDate)}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={(e) => { e.stopPropagation(); setSelected(p); setSoinModal(true); }}><Plus className="h-3 w-3" /> Soin</Button>
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelected(p); setProduitModal(true); }}><Pill className="h-3 w-3" /> Produit</Button>
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelected(p); setConstantesModal(true); setVitals({ tension: "", temperature: "", pulsations: "", saturation: "", observations: "" }); }}><ClipboardList className="h-3 w-3" /> Constantes</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle>Historique des soins - {selected.patientName}</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-2 px-3">Date</th>
                  <th className="text-left py-2 px-3">Soin</th>
                  <th className="text-left py-2 px-3">Par</th>
                </tr>
              </thead>
              <tbody>
                {selected.soins.map((s, i) => (
                  <tr key={i} className="border-b border-[var(--border)]">
                    <td className="py-2 px-3 text-xs">{formatDateTime(s.date)}</td>
                    <td className="py-2 px-3">{s.soin}</td>
                    <td className="py-2 px-3">{s.par}</td>
                  </tr>
                ))}
                {selected.soins.length === 0 && (
                  <tr><td colSpan={3} className="py-4 text-center text-xs" style={{ color: "var(--text-muted)" }}>Aucun soin enregistré</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Modal open={soinModal} onClose={() => setSoinModal(false)} title="Enregistrer un soin"
        footer={<><Button variant="ghost" onClick={() => setSoinModal(false)}>Annuler</Button><Button onClick={addSoin}>Enregistrer</Button></>}>
        <div className="space-y-3">
          <div><Label required>Type de soin</Label>
            <Select value={soinType} onChange={e => setSoinType(e.target.value)}>
              <option>Prise de constantes</option><option>Pansement</option><option>Perfusion</option>
              <option>Injection</option><option>Prélèvement sanguin</option><option>Sondage</option>
            </Select>
          </div>
          <div><Label>Notes</Label><Textarea value={soinNotes} onChange={e => setSoinNotes(e.target.value)} placeholder="Observations..." /></div>
        </div>
        {selected && selected.soins.filter(s => s.type === "soin").length > 0 && (
          <div className="mt-4 border-t border-[var(--border)] pt-3">
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Soins précédents</p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {[...selected.soins].filter(s => s.type === "soin").reverse().map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded" style={{ background: "var(--card-alt)" }}>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{s.soin}</span>
                    <span className="ml-2" style={{ color: "var(--text-muted)" }}>{s.par}</span>
                  </div>
                  <span className="ml-2 shrink-0" style={{ color: "var(--text-muted)" }}>{formatDateTime(s.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={produitModal} onClose={() => setProduitModal(false)} title="Produit utilisé"
        footer={<><Button variant="ghost" onClick={() => setProduitModal(false)}>Annuler</Button><Button onClick={addProduit}>Ajouter</Button></>}>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label required>Produit</Label><Input value={produit.name} onChange={e => setProduit({ ...produit, name: e.target.value })} placeholder="Nom du produit..." /></div>
          <div><Label required>Quantité</Label><Input type="number" value={produit.quantity || ""} onChange={e => setProduit({ ...produit, quantity: parseInt(e.target.value) || 0 })} /></div>
          <div><Label required>Prix unitaire (FCFA)</Label><Input type="number" value={produit.unitPrice || ""} onChange={e => setProduit({ ...produit, unitPrice: parseInt(e.target.value) || 0 })} /></div>
        </div>
        {selected && selected.soins.filter(s => s.type === "produit").length > 0 && (
          <div className="mt-4 border-t border-[var(--border)] pt-3">
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Produits ajoutés</p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {[...selected.soins].filter(s => s.type === "produit").reverse().map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded" style={{ background: "var(--card-alt)" }}>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{s.soin}</span>
                    <span className="ml-2" style={{ color: "var(--text-muted)" }}>{s.par}</span>
                  </div>
                  <span className="ml-2 shrink-0" style={{ color: "var(--text-muted)" }}>{formatDateTime(s.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={constantesModal} onClose={() => setConstantesModal(false)} title="Prise de constantes"
        footer={<><Button variant="ghost" onClick={() => setConstantesModal(false)}>Annuler</Button><Button onClick={saveConstantes}>Enregistrer</Button></>}>
        <div className="grid grid-cols-2 gap-3">
          <div><Label required>Tension artérielle</Label><Input value={vitals.tension} onChange={e => setVitals({ ...vitals, tension: e.target.value })} placeholder="ex: 120/80" /></div>
          <div><Label required>Température (°C)</Label><Input type="number" step="0.1" value={vitals.temperature} onChange={e => setVitals({ ...vitals, temperature: e.target.value })} placeholder="37.0" /></div>
          <div><Label>Pulsations (/min)</Label><Input type="number" value={vitals.pulsations} onChange={e => setVitals({ ...vitals, pulsations: e.target.value })} placeholder="72" /></div>
          <div><Label>Saturation SpO2 (%)</Label><Input type="number" value={vitals.saturation} onChange={e => setVitals({ ...vitals, saturation: e.target.value })} placeholder="98" /></div>
          <div className="col-span-2"><Label>Observations</Label><Textarea value={vitals.observations} onChange={e => setVitals({ ...vitals, observations: e.target.value })} placeholder="Notes complémentaires..." /></div>
        </div>
        {selected && selected.soins.filter(s => s.type === "constante").length > 0 && (
          <div className="mt-4 border-t border-[var(--border)] pt-3">
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Constantes précédentes</p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {[...selected.soins].filter(s => s.type === "constante").reverse().map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded" style={{ background: "var(--card-alt)" }}>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{s.soin}</span>
                    <span className="ml-2" style={{ color: "var(--text-muted)" }}>{s.par}</span>
                  </div>
                  <span className="ml-2 shrink-0" style={{ color: "var(--text-muted)" }}>{formatDateTime(s.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
