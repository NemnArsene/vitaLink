import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Phone, Mail, MapPin, AlertTriangle, FileText, Heart, Calendar, Plus, Shield, User as UserIcon } from "lucide-react";
import { PatientsAPI, MedicalRecordsAPI, ConsultationsAPI, InvoicesAPI } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { calcAge, formatDate, formatCurrency } from "@/lib/format";
import { PageSpinner } from "@/components/ui/Feedback";
import { toast } from "sonner";
import { useState } from "react";
import type { Allergy, MedicalCondition } from "@/types";

export default function PatientDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [allergyOpen, setAllergyOpen] = useState(false);
  const [condOpen, setCondOpen] = useState(false);

  const { data: patient, isLoading } = useQuery({ queryKey: ["patient", id], queryFn: () => PatientsAPI.get(id!), enabled: !!id });
  const { data: record } = useQuery({ queryKey: ["record", id], queryFn: () => MedicalRecordsAPI.getByPatient(id!), enabled: !!id });
  const { data: consultations = [] } = useQuery({ queryKey: ["consultations"], queryFn: ConsultationsAPI.list });
  const { data: invoices = [] } = useQuery({ queryKey: ["invoices"], queryFn: InvoicesAPI.list });

  const addAllergyMut = useMutation({
    mutationFn: (a: any) => MedicalRecordsAPI.addAllergy(id!, a),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["record", id] }); setAllergyOpen(false); toast.success("Allergie ajoutée"); },
  });
  const addCondMut = useMutation({
    mutationFn: (c: any) => MedicalRecordsAPI.addCondition(id!, c),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["record", id] }); setCondOpen(false); toast.success("Antécédent ajouté"); },
  });

  if (isLoading || !patient) return <PageSpinner />;

  const myConsultations = Array.isArray(consultations) ? consultations.filter(c => c.patientId === id).slice(0, 5) : [];
  const myInvoices = Array.isArray(invoices) ? invoices.filter(i => i.patientId === id).slice(0, 5) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => nav(-1)}><ArrowLeft className="h-4 w-4" /> Retour</Button>
        <Link to={`/consultations?patient=${id}`}>
          <Button variant="outline"><Calendar className="h-4 w-4" /> Nouvelle consultation</Button>
        </Link>
      </div>

      {/* Profile card */}
      <Card className="overflow-hidden">
        <div className="h-28" style={{ background: "linear-gradient(135deg, #0d9488 0%, #6366f1 100%)" }} />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div className="flex items-end gap-4">
              <Avatar name={`${patient.firstName} ${patient.lastName}`} size="lg" className="ring-4 ring-[var(--surface)] !h-24 !w-24 !text-2xl" />
              <div className="pb-1">
                <h1 className="text-2xl font-bold">{patient.firstName} {patient.lastName}</h1>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {patient.fileNumber} · {patient.gender === "M" ? "Homme" : "Femme"} · {calcAge(patient.birthDate)} ans · {patient.bloodGroup}
                </p>
              </div>
            </div>
            <StatusBadge status={patient.status} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <InfoRow icon={<Phone className="h-4 w-4" />} label="Téléphone" value={patient.phone} />
            <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={patient.email} />
            <InfoRow icon={<MapPin className="h-4 w-4" />} label="Adresse" value={`${patient.address}, ${patient.city}`} />
            <InfoRow icon={<UserIcon className="h-4 w-4" />} label="Date de naissance" value={formatDate(patient.birthDate)} />
            <InfoRow icon={<Heart className="h-4 w-4" />} label="Contact d'urgence" value={`${patient.emergencyContact} — ${patient.emergencyPhone}`} />
            {patient.insuranceCompany && (
              <div className="rounded-lg bg-[var(--info-50)] p-3 mt-3">
                <div className="flex items-center gap-2 mb-1.5" style={{ color: "var(--info)" }}>
                  <Shield className="h-4 w-4" />
                  <span className="text-xs font-semibold">Couverture assurance</span>
                </div>
                <div className="text-sm font-semibold">{patient.insuranceCompany}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>N° {patient.insuranceNumber}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medical record */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Dossier médical</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Allergies */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Allergies
                </h4>
                <Button size="sm" variant="ghost" onClick={() => setAllergyOpen(true)}><Plus className="h-3.5 w-3.5" /> Ajouter</Button>
              </div>
              <div className="space-y-2">
                {(!record?.allergies || record.allergies.length === 0) ? (
                  <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>Aucune allergie connue</p>
                ) : record.allergies.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border)]">
                    <div>
                      <div className="text-sm font-semibold">{a.substance}</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{a.reaction}</div>
                    </div>
                    <Badge variant={a.severity === "SEVERE" ? "danger" : a.severity === "MODERATE" ? "warning" : "info"}>{a.severity}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Conditions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-sky-500" /> Antécédents médicaux
                </h4>
                <Button size="sm" variant="ghost" onClick={() => setCondOpen(true)}><Plus className="h-3.5 w-3.5" /> Ajouter</Button>
              </div>
              <div className="space-y-2">
                {(!record?.conditions || record.conditions.length === 0) ? (
                  <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>Aucun antécédent déclaré</p>
                ) : record.conditions.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border)]">
                    <div>
                      <div className="text-sm font-semibold">{c.name}</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{c.notes}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(c.diagnosedAt)}</span>
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consultations & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Consultations récentes</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {myConsultations.length === 0 && <p className="text-xs italic py-4 text-center" style={{ color: "var(--text-muted)" }}>Aucune consultation</p>}
            {myConsultations.map(c => (
              <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[var(--surface-2)]">
                <div>
                  <div className="text-sm font-semibold">{c.reason}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{c.doctorName} · {formatDate(c.scheduledAt)}</div>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Factures</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {myInvoices.length === 0 && <p className="text-xs italic py-4 text-center" style={{ color: "var(--text-muted)" }}>Aucune facture</p>}
            {myInvoices.map(i => (
              <div key={i.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[var(--surface-2)]">
                <div>
                  <div className="text-sm font-semibold font-mono">{i.number}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(i.issuedAt)} · Total {formatCurrency(i.total)}</div>
                </div>
                <StatusBadge status={i.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <AddAllergyModal open={allergyOpen} onClose={() => setAllergyOpen(false)} onSubmit={(a) => addAllergyMut.mutate(a)} loading={addAllergyMut.isPending} />
      <AddConditionModal open={condOpen} onClose={() => setCondOpen(false)} onSubmit={(c) => addCondMut.mutate(c)} loading={addCondMut.isPending} />
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-[var(--surface-2)] flex items-center justify-center shrink-0" style={{ color: "var(--text-muted)" }}>
        {icon}
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>{label}</div>
        <div className="text-sm">{value || "—"}</div>
      </div>
    </div>
  );
}

function AddAllergyModal({ open, onClose, onSubmit, loading }: { open: boolean; onClose: () => void; onSubmit: (a: any) => void; loading?: boolean }) {
  const [a, setA] = useState({ substance: "", reaction: "", severity: "MILD" as Allergy["severity"], notedAt: new Date().toISOString() });
  return (
    <Modal open={open} onClose={onClose} title="Ajouter une allergie" size="md"
      footer={<><Button variant="ghost" onClick={onClose}>Annuler</Button><Button onClick={() => onSubmit(a)} loading={loading}>Ajouter</Button></>}>
      <div className="space-y-3">
        <div><Label required>Substance</Label><Input value={a.substance} onChange={e => setA({ ...a, substance: e.target.value })} /></div>
        <div><Label>Sévérité</Label><Select value={a.severity} onChange={e => setA({ ...a, severity: e.target.value as any })}><option value="MILD">Légère</option><option value="MODERATE">Modérée</option><option value="SEVERE">Sévère</option></Select></div>
        <div><Label>Réaction</Label><Textarea value={a.reaction} onChange={e => setA({ ...a, reaction: e.target.value })} /></div>
      </div>
    </Modal>
  );
}

function AddConditionModal({ open, onClose, onSubmit, loading }: { open: boolean; onClose: () => void; onSubmit: (c: any) => void; loading?: boolean }) {
  const [c, setC] = useState({ name: "", status: "ACTIVE" as MedicalCondition["status"], diagnosedAt: new Date().toISOString(), notes: "" });
  return (
    <Modal open={open} onClose={onClose} title="Ajouter un antécédent" size="md"
      footer={<><Button variant="ghost" onClick={onClose}>Annuler</Button><Button onClick={() => onSubmit(c)} loading={loading}>Ajouter</Button></>}>
      <div className="space-y-3">
        <div><Label required>Pathologie</Label><Input value={c.name} onChange={e => setC({ ...c, name: e.target.value })} /></div>
        <div><Label>Statut</Label><Select value={c.status} onChange={e => setC({ ...c, status: e.target.value as any })}><option value="ACTIVE">Actif</option><option value="CHRONIC">Chronique</option><option value="RESOLVED">Résolu</option></Select></div>
        <div><Label>Notes</Label><Textarea value={c.notes} onChange={e => setC({ ...c, notes: e.target.value })} /></div>
      </div>
    </Modal>
  );
}