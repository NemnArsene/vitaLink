import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Pill, AlertTriangle, Package, DollarSign, Plus, Minus } from "lucide-react";
import { PharmacyService } from "@/services";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { usePermission } from "@/hooks/usePermission";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";
import type { PharmacyItem } from "@/types";

function StockBadge({ item }: { item: PharmacyItem }) {
  const ratio = item.stock / item.minStock;
  if (ratio <= 0.5) return <Badge variant="danger" dot>{item.stock}</Badge>;
  if (ratio <= 1) return <Badge variant="warning" dot>{item.stock}</Badge>;
  return <Badge variant="success" dot>{item.stock}</Badge>;
}

export default function Pharmacie() {
  const qc = useQueryClient();
  const { can } = usePermission();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockModal, setStockModal] = useState<{ item: PharmacyItem; type: "in" | "out" } | null>(null);
  const [stockQty, setStockQty] = useState(0);

  const { data: items = [] } = useQuery({ queryKey: ["pharmacy"], queryFn: PharmacyService.list });

  const updateStockMut = useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) => PharmacyService.updateStock(id, stock),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pharmacy"] });
      setStockModal(null);
      toast.success("Stock mis à jour");
    },
  });

  const filtered = useMemo(() => {
    let result = items;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.code.toLowerCase().includes(q) ||
        i.supplier.toLowerCase().includes(q)
      );
    }
    if (categoryFilter) result = result.filter(i => i.category === categoryFilter);
    return result;
  }, [items, search, categoryFilter]);

  const categories = useMemo(() => [...new Set(items.map(i => i.category))], [items]);
  const lowStock = useMemo(() => items.filter(i => i.stock <= i.minStock), [items]);
  const totalValue = useMemo(() => items.reduce((s, i) => s + i.stock * i.unitPrice, 0), [items]);

  return (
    <div className="space-y-6">
      <PageHeader title="Pharmacie" description="Gestion des stocks et dispensation de médicaments" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-teal-50 dark:bg-teal-950 flex items-center justify-center">
                <Pill className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{items.length}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Médicaments</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-950 flex items-center justify-center">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{items.reduce((s, i) => s + i.stock, 0)}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Unités en stock</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-950 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{lowStock.length}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Stock bas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Valeur du stock</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
                <Input
                  placeholder="Rechercher un médicament..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-44">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
              >
                <option value="">Toutes catégories</option>
                {categories.map(c => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable
        data={filtered}
        rowKey={(i: PharmacyItem) => i.id}
        columns={[
          { key: "code", label: "Code", render: (i: PharmacyItem) => <span className="font-mono text-xs">{i.code}</span> },
          {
            key: "name", label: "Médicament", sortable: true,
            render: (i: PharmacyItem) => (
              <div>
                <div className="font-semibold text-sm">{i.name}</div>
                <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{i.dosage} — {i.form}</div>
              </div>
            ),
          },
          { key: "category", label: "Catégorie", render: (i: PharmacyItem) => <Badge variant="neutral">{i.category.replace(/_/g, " ")}</Badge> },
          {
            key: "stock", label: "Stock", sortable: true,
            render: (i: PharmacyItem) => <StockBadge item={i} />,
          },
          { key: "minStock", label: "Seuil mini", render: (i: PharmacyItem) => <span className="text-xs">{i.minStock}</span> },
          { key: "unitPrice", label: "Prix unit.", render: (i: PharmacyItem) => <span className="font-semibold text-sm">{formatCurrency(i.unitPrice)}</span> },
          {
            key: "expiryDate", label: "Expire le", sortable: true,
            render: (i: PharmacyItem) => {
              const exp = new Date(i.expiryDate);
              const soon = exp.getTime() - Date.now() < 90 * 86400000;
              return <Badge variant={soon ? "warning" : "neutral"}>{exp.toLocaleDateString("fr-FR")}</Badge>;
            },
          },
          { key: "supplier", label: "Fournisseur", render: (i: PharmacyItem) => <span className="text-xs">{i.supplier}</span> },
          {
            key: "actions", label: "",
            render: (i: PharmacyItem) => (
              <div className="flex gap-1">
                {can("pharmacy.write") && (
                  <>
                    <button
                      onClick={() => { setStockModal({ item: i, type: "in" }); setStockQty(0); }}
                      className="p-1.5 rounded-md hover:bg-green-50 text-green-600"
                      title="Entrée de stock"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { setStockModal({ item: i, type: "out" }); setStockQty(0); }}
                      className="p-1.5 rounded-md hover:bg-red-50 text-red-600"
                      title="Sortie de stock"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={!!stockModal}
        onClose={() => setStockModal(null)}
        title={stockModal?.type === "in" ? "Entrée de stock" : "Sortie de stock"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setStockModal(null)}>Annuler</Button>
            <Button
              onClick={() => {
                if (!stockModal) return;
                const newStock = stockModal.type === "in"
                  ? stockModal.item.stock + stockQty
                  : stockModal.item.stock - stockQty;
                if (newStock < 0) { toast.error("Stock insuffisant"); return; }
                updateStockMut.mutate({ id: stockModal.item.id, stock: newStock });
              }}
              loading={updateStockMut.isPending}
              variant={stockModal?.type === "in" ? "primary" : "danger"}
            >
              Valider
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="text-sm">
            <strong>{stockModal?.item.name}</strong> — {stockModal?.item.dosage}
            <br />
            Stock actuel : <strong>{stockModal?.item.stock}</strong>
          </div>
          <div>
            <label className="text-sm font-medium">Quantité</label>
            <Input
              type="number"
              min={1}
              value={stockQty || ""}
              onChange={e => setStockQty(Math.max(0, parseInt(e.target.value) || 0))}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
