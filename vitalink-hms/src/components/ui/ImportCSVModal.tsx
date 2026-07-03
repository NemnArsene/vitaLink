import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { ImportExportService } from "@/services";

interface ImportResult {
  imported: number;
  errors: { row: number; message: string }[];
  totalRows: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ImportCSVModal({ open, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith(".csv")) setFile(f);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await ImportExportService.importPatients(file);
      setResult(res);
      if (res.imported > 0) onSuccess?.();
    } catch (err: any) {
      setResult({
        imported: 0,
        errors: [{ row: -1, message: err?.response?.data?.message || err.message || "Erreur lors de l'import" }],
        totalRows: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold">Import CSV — Patients</h2>
          <button onClick={onClose} className="btn btn-ghost h-8 w-8 p-0"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          {!result ? (
            <>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${dragOver ? "border-[var(--primary)] bg-[var(--primary-50)]" : "border-[var(--border)]"}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="mx-auto h-8 w-8 mb-2" style={{ color: "var(--text-subtle)" }} />
                <div className="text-sm font-medium">Déposer un fichier CSV ici</div>
                <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>ou cliquer pour parcourir</div>
                <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
              </div>

              {file && (
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--surface-2)]">
                  <FileText className="h-5 w-5 shrink-0" style={{ color: "var(--primary)" }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{file.name}</div>
                    <div className="text-[10px]" style={{ color: "var(--text-muted)" } }>{(file.size / 1024).toFixed(1)} Ko</div>
                  </div>
                  <button onClick={() => setFile(null)} className="btn btn-ghost h-7 w-7 p-0"><X className="h-3.5 w-3.5" /></button>
                </div>
              )}

              <div className="text-xs px-3 py-2 rounded-lg bg-[var(--surface-2)]" style={{ color: "var(--text-muted)" }}>
                <div className="font-medium mb-1">Colonnes acceptées :</div>
                <code className="text-[10px]">firstName, lastName, medicalRecordNumber, dateOfBirth, gender, phone, email, street, city, allergies, insuranceCardNumber, insuranceProvider, status...</code>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={onClose} className="btn btn-ghost text-xs h-9">Annuler</button>
                <button onClick={handleImport} disabled={!file || loading} className="btn btn-primary text-xs h-9">
                  {loading ? "Import en cours..." : "Importer"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center py-4">
                {result.imported > 0 ? (
                  <CheckCircle2 className="mx-auto h-10 w-10 text-green-500 mb-2" />
                ) : (
                  <AlertCircle className="mx-auto h-10 w-10 text-amber-500 mb-2" />
                )}
                <div className="text-sm font-semibold">{result.imported} / {result.totalRows} patients importés</div>
              </div>

              {result.errors.length > 0 && (
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {result.errors.map((e, i) => (
                    <div key={i} className="text-xs px-3 py-1.5 rounded bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300">
                      {e.row > 0 ? `Ligne ${e.row} : ` : ""}{e.message}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button onClick={() => { setResult(null); setFile(null); }} className="btn btn-ghost text-xs h-9">Nouvel import</button>
                <button onClick={onClose} className="btn btn-primary text-xs h-9 ml-2">Terminé</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
