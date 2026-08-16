'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Package,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { ProductStatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { useTranslation } from '@/lib/i18n';
import { cn, debounce, formatMoney, getErrorMessage } from '@/lib/utils';
import type { Category, Product } from '@/types';

export default function ProductsPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [menuFor, setMenuFor] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [list, cats] = await Promise.all([
        api.listProducts({
          search: search || undefined,
          category_id: categoryId ? parseInt(categoryId) : undefined,
          status: status || undefined,
          page,
          page_size: 12,
        }),
        api.listCategories(),
      ]);
      setProducts(list.items);
      setTotal(list.total);
      setCategories(cats);
    } catch (err) {
      error(t.common_error, getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = debounce(() => {
    setPage(1);
    load();
  }, 400);

  useEffect(() => {
    debouncedSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryId, status, page]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleStatus = async (p: Product) => {
    try {
      const updated = await api.setProductStatus(p.id, p.status === 'active' ? 'inactive' : 'active');
      setProducts((ps) => ps.map((x) => (x.id === updated.id ? updated : x)));
      success(updated.status === 'active' ? t.products_activate : t.products_deactivate);
    } catch (err) {
      error(t.common_error, getErrorMessage(err));
    }
  };

  const duplicate = async (p: Product) => {
    try {
      await api.duplicateProduct(p.id);
      success(t.products_duplicate);
      load();
    } catch (err) {
      error(t.common_error, getErrorMessage(err));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteProduct(deleteTarget.id);
      success(t.products_delete);
      setDeleteTarget(null);
      load();
    } catch (err) {
      error(t.common_error, getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.products_title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} {t.products_title.toLowerCase()} {t.common_of} {t.dashboard_total_products.toLowerCase()}
          </p>
        </div>
        <Link href="/dashboard/products/new">
          <Button variant="gold">
            <Plus className="w-4 h-4" /> {t.products_add}
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[220px] max-w-sm">
          <Input
            placeholder={t.products_search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-36"
          options={[
            { value: '', label: t.products_all },
            { value: 'active', label: t.products_active },
            { value: 'inactive', label: t.products_inactive },
          ]}
        />
        <Select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-44"
          options={[
            { value: '', label: t.products_all },
            ...categories.map((c) => ({ value: c.id.toString(), label: c.name })),
          ]}
        />
      </div>

      {!loading && products.length === 0 ? (
        <EmptyState
          icon={<Package className="w-6 h-6" />}
          title={t.products_empty_title}
          description={t.products_empty_desc}
          actionLabel={t.products_add}
          actionHref="/dashboard/products/new"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className={cn(
                'card-surface overflow-hidden group',
                p.status === 'inactive' && 'opacity-60'
              )}
            >
              <div className="relative aspect-[4/3] bg-muted/40">
                {p.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                    <Package className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <ProductStatusBadge status={p.status} />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.category?.name || t.products_category} · {p.stock} {t.dashboard_total_products.toLowerCase()}
                    </p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setMenuFor(menuFor === p.id ? null : p.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
                      aria-label="Product actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {menuFor === p.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuFor(null)} />
                        <div className="absolute right-0 z-20 mt-1 w-40 rounded-xl bg-popover border border-border shadow-soft p-1 animate-scale-in">
                          <Link
                            href={`/dashboard/products/${p.id}/edit`}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted"
                          >
                            <Pencil className="w-3.5 h-3.5" /> {t.products_edit}
                          </Link>
                          <button
                            onClick={() => {
                              setMenuFor(null);
                              toggleStatus(p);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm hover:bg-muted text-left"
                          >
                            {p.status === 'active' ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                            {p.status === 'active' ? t.products_deactivate : t.products_activate}
                          </button>
                          <button
                            onClick={() => {
                              setMenuFor(null);
                              duplicate(p);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm hover:bg-muted text-left"
                          >
                            <Copy className="w-3.5 h-3.5" /> {t.products_duplicate}
                          </button>
                          <button
                            onClick={() => {
                              setMenuFor(null);
                              setDeleteTarget(p);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 text-left"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> {t.products_delete}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-lg font-bold">
                    {formatMoney(p.discount_price ?? p.price)}
                  </span>
                  {p.discount_price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatMoney(p.price)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {total > 12 && (
        <Pagination page={page} total={total} pageSize={12} onPageChange={setPage} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={t.products_delete}
        description={t.products_empty_desc}
        confirmLabel={t.common_delete}
        destructive
        loading={deleting}
      />
    </div>
  );
}
