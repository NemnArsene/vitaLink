import { useState } from "react";
import { Plus, Printer, FileText, Pill, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/Stat";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate } from "@/lib/format";
import { usePermission } from "@/hooks/usePermission";
import { toast } from "sonner";

type Medicament = { medicament: string; dosage: string; frequence: string; duree: string };
type Prescription = { id: string; patientName: string; doctorName: string; diagnosis: string; prescriptionDate: string; isValid: boolean; medicaments: Medicament[] };

const MOCK_PRESCRIPTIONS: Prescription[] = [
  { id: "rx-1", patientName: "Mariama Cissé", doctorName: "Dr. Mamadou Sow", diagnosis: "Infection respiratoire", prescriptionDate: new Date().toISOString(), isValid: true, medicaments: [{ medicament: "Amoxicilline 500mg", dosage: "1 comprimé", frequence: "3x/jour", duree: "7 jours" }] },
  { id: "rx-2", patientName: "Ousmane Diallo", doctorName: "Dr. Awa Mbaye", diagnosis: "Hypertension artérielle", prescriptionDate: new Date(Date.now() - 86400000).toISOString(), isValid: true, medicaments: [{ medicament: "Amlodipine 5mg", dosage: "1 comprimé", frequence: "1x/jour", duree: "30 jours" }] },
  { id: "rx-3", patientName: "Fatou Ndiaye", doctorName: "Dr. Mamadou Sow", diagnosis: "Diabète type 2", prescriptionDate: new Date(Date.now() - 2 * 86400000).toISOString(), isValid: true, medicaments: [{ medicament: "Metformine 850mg", dosage: "1 comprimé", frequence: "2x/jour", duree: "90 jours" }] },
];

function generatePrescriptionHTML(p: Prescription): string {
  const meds = p.medicaments.map(m =>
    `<tr><td style="padding:6px 12px">${m.medicament}</td><td style="padding:6px 12px">${m.dosage}</td><td style="padding:6px 12px">${m.frequence}</td><td style="padding:6px 12px">${m.duree}</td></tr>`
  ).join("");
  return `
    <html><head><meta charset="utf-8"><title>Ordonnance ${p.id}</title>
    <style>body{font-family:Arial,sans-serif;font-size:13px;padding:40px;color:#222;max-width:700px;margin:auto}
    h1{font-size:20px;margin-bottom:0;text-align:center}h2{font-size:13px;color:#666;text-align:center;margin-bottom:32px}
    .header{border-bottom:2px solid #222;padding-bottom:12px;margin-bottom:24px;text-align:center}
    table{width:100%;border-collapse:collapse}th{border-bottom:1px solid #333;padding:8px 12px;text-align:left}
    td{border-bottom:1px solid #ddd;padding:8px 12px}
    .footer{margin-top:48px;padding-top:16px;border-top:1px solid #ddd;font-size:11px;color:#999}
    .signature{margin-top:32px}.sig-line{width:240px;border-top:1px solid #333;margin-top:48px;padding-top:6px;font-size:11px;color:#666}
    </style></head><body>
    <div class="header"><h1>Hôpital Général de Dakar</h1><h2>Ordonnance médicale · Exeat cum medications</h2></div>
    <p><strong>Patient:</strong> ${p.patientName}</p>
    <p><strong>Médecin:</strong> ${p.doctorName}</p>
    <p><strong>Diagnostic:</strong> ${p.diagnosis}</p>
    <p><strong>Date:</strong> ${formatDate(p.prescriptionDate)}</p>
    <table><thead><tr><th>Médicament</th><th>Dosage</th><th>Fréquence</th><th>Durée</th></tr></thead><tbody>${meds}</tbody></table>
    <div class="signature"><div class="sig-line">Signature du médecin et cachet</div></div>
    <div class="footer">Document généré par VitaLink · Hôpital Général de Dakar</div>
    </body></html>`;
}

function printPrescription(p: Prescription) {
  const html = generatePrescriptionHTML(p);
  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); win.print(); }
  toast.success("Ordonnance imprimée");
}

export default function Ordonnances() {
  const { can } = usePermission();
  const [prescriptions, setPrescriptions] = useState(MOCK_PRESCRIPTIONS);
  const [open, setOpen] = useState(false);
  const [viewRx, setViewRx] = useState<Prescription | null>(null);

  const addPrescription = (p: Prescription) => {
    setPrescriptions([p, ...prescriptions]);
    setOpen(false);
    printPrescription(p);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ordonnances"
        description="Prescriptions médicales · Génération et impression"
        actions={can("consultation.write") && <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nouvelle ordonnance</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Ordonnances actives" value={prescriptions.filter(r => r.isValid).length} icon={<FileText className="h-5 w-5" />} color="primary" />
        <StatCard label="Prescriptions" value={prescriptions.reduce((s, r) => s + r.medicaments.length, 0)} icon={<Pill className="h-5 w-5" />} color="info" />
        <StatCard label="À renouveler" value={prescriptions.filter(r => !r.isValid).length || "2"} icon={<Clock className="h-5 w-5" />} color="warning" />
      </div>

      <DataTable
        data={prescriptions}
        searchable
        searchPlaceholder="Rechercher patient, médicament..."
        rowKey={(r) => r.id}
        onRowClick={(r) => setViewRx(r)}
        columns={[
          { key: "patient", label: "Patient", render: (r: Prescription) => (
            <div className="flex items-center gap-2">
              <Avatar name={r.patientName} size="sm" />
              <span className="font-medium">{r.patientName}</span>
            </div>
          )},
          { key: "doctorName", label: "Médecin" },
          { key: "diagnosis", label: "Diagnostic" },
          { key: "medicaments", label: "Médicaments", render: (r: Prescription) => (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{r.medicaments.map(m => m.medicament).join(", ")}</span>
          )},
          { key: "prescriptionDate", label: "Date", render: (r: Prescription) => <span className="text-xs">{formatDate(r.prescriptionDate)}</span> },
          { key: "isValid", label: "Statut", render: (r: Prescription) => r.isValid ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Inactive</Badge> },
        ]}
      />

      {viewRx && (
        <Modal open={!!viewRx} onClose={() => setViewRx(null)} title="Détail ordonnance" size="lg"
          footer={<><Button variant="ghost" onClick={() => setViewRx(null)}>Fermer</Button><Button onClick={() => printPrescription(viewRx)}><Printer className="h-4 w-4" /> Imprimer</Button></>}>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-[var(--border)] p-6 rounded-xl" style={{ minHeight: 400 }}>
              <div className="text-center border-b border-[var(--border)] pb-4 mb-4">
                <h2 className="text-lg font-bold">Hôpital Général de Dakar</h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Exeat cum medications / Sortie avec médicaments</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div><span style={{ color: "var(--text-muted)" }}>Patient:</span> <span className="font-semibold">{viewRx.patientName}</span></div>
                <div><span style={{ color: "var(--text-muted)" }}>Médecin:</span> <span className="font-semibold">{viewRx.doctorName}</span></div>
                <div><span style={{ color: "var(--text-muted)" }}>Diagnostic:</span> <span>{viewRx.diagnosis}</span></div>
                <div><span style={{ color: "var(--text-muted)" }}>Date:</span> <span>{formatDate(viewRx.prescriptionDate)}</span></div>
              </div>
              <table className="w-full text-sm border-t border-[var(--border)]">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="py-2 text-left">Médicament</th>
                    <th className="py-2 text-left">Dosage</th>
                    <th className="py-2 text-left">Fréquence</th>
                    <th className="py-2 text-left">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  {viewRx.medicaments.map((m, i) => (
                    <tr key={i} className="border-b border-[var(--border)]">
                      <td className="py-2 font-medium">{m.medicament}</td>
                      <td className="py-2">{m.dosage}</td>
                      <td className="py-2">{m.frequence}</td>
                      <td className="py-2">{m.duree}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-6 pt-4 border-t border-[var(--border)] text-xs" style={{ color: "var(--text-muted)" }}>
                <p>Signature du médecin: _________________________</p>
                <p className="mt-1">Cachet de l'établissement</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <NewPrescriptionModal open={open} onClose={() => setOpen(false)} onCreated={addPrescription} />
    </div>
  );
}

function NewPrescriptionModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (p: Prescription) => void }) {
  const [patientName, setPatientName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [meds, setMeds] = useState<Medicament[]>([]);
  const [medForm, setMedForm] = useState<Medicament>({ medicament: "", dosage: "", frequence: "", duree: "" });
  const [instructions, setInstructions] = useState("");

  const addMed = () => {
    if (!medForm.medicament.trim()) { toast.error("Nom du médicament requis"); return; }
    setMeds([...meds, medForm]);
    setMedForm({ medicament: "", dosage: "", frequence: "", duree: "" });
  };

  const submit = () => {
    if (!patientName.trim() || !diagnosis.trim()) { toast.error("Patient et diagnostic requis"); return; }
    if (meds.length === 0) { toast.error("Ajoutez au moins un médicament"); return; }
    onCreated({
      id: `rx-${Date.now()}`,
      patientName: patientName.trim(),
      doctorName: "Dr. Utilisateur",
      diagnosis: diagnosis.trim(),
      prescriptionDate: new Date().toISOString(),
      isValid: true,
      medicaments: meds,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle ordonnance" size="lg"
      footer={<><Button variant="ghost" onClick={onClose}>Annuler</Button><Button onClick={submit}><Printer className="h-4 w-4" /> Créer et imprimer</Button></>}>
      <div className="space-y-3">
        <div><Label required>Patient</Label><Input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Rechercher un patient..." /></div>
        <div><Label required>Diagnostic</Label><Input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} /></div>
        <div className="rounded-lg border border-[var(--border)] p-4">
          <h4 className="text-sm font-semibold mb-3">Médicaments</h4>
          {meds.length > 0 && (
            <div className="mb-3 space-y-1">
              {meds.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-xs bg-[var(--surface-2)] p-2 rounded">
                  <span className="font-medium flex-1">{m.medicament}</span>
                  <span>{m.dosage}</span>
                  <span>{m.frequence}</span>
                  <span>{m.duree}</span>
                  <button onClick={() => setMeds(meds.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 ml-1">&times;</button>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-4 gap-2 mb-2">
            <Input value={medForm.medicament} onChange={e => setMedForm({ ...medForm, medicament: e.target.value })} placeholder="Médicament" />
            <Input value={medForm.dosage} onChange={e => setMedForm({ ...medForm, dosage: e.target.value })} placeholder="Dosage" />
            <Input value={medForm.frequence} onChange={e => setMedForm({ ...medForm, frequence: e.target.value })} placeholder="Fréquence" />
            <Input value={medForm.duree} onChange={e => setMedForm({ ...medForm, duree: e.target.value })} placeholder="Durée" />
          </div>
          <Button variant="outline" size="sm" onClick={addMed}><Plus className="h-3 w-3" /> Ajouter un médicament</Button>
        </div>
        <div><Label>Instructions</Label><Textarea value={instructions} onChange={e => setInstructions(e.target.value)} /></div>
      </div>
    </Modal>
  );
}
