'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Label } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage, slugify } from '@/lib/utils';
import type { Category, Product, ProductPayload, VariantGroupIn } from '@/types';

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  onDone?: () => void;
}

export function ProductForm({ product, categories, onDone }: ProductFormProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const isEdit = !!product;

  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [discountPrice, setDiscountPrice] = useState(product?.discount_price?.toString() || '');
  const [stock, setStock] = useState(product?.stock?.toString() || '0');
  const [categoryId, setCategoryId] = useState(product?.category_id?.toString() || '');
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [featured, setFeatured] = useState(product?.is_featured || false);
  const [active, setActive] = useState(product ? product.status === 'active' : true);
  const [groups, setGroups] = useState<VariantGroupIn[]>(
    product?.variant_groups?.map((g) => ({
      name: g.name,
      options: g.options.map((o) => ({
        value: o.value,
        additional_price: o.additional_price,
        stock: o.stock,
      })),
    })) || []
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ProductPayload = {
      name,
      description: description || null,
      price: parseFloat(price) || 0,
      discount_price: discountPrice ? parseFloat(discountPrice) : null,
      stock: parseInt(stock) || 0,
      category_id: categoryId ? parseInt(categoryId) : null,
      images,
      is_featured: featured,
      status: active ? 'active' : 'inactive',
      variant_groups: groups.filter((g) => g.name.trim()),
    };

    if (!payload.name.trim()) {
      error('Product name is required');
      return;
    }
    if (payload.price <= 0) {
      error('Price must be greater than zero');
      return;
    }

    setSaving(true);
    try {
      if (isEdit && product) {
        await api.updateProduct(product.id, payload);
        success('Product updated', `${payload.name} was saved successfully.`);
      } else {
        await api.createProduct(payload);
        success('Product created', `${payload.name} is now live in your store.`);
      }
      onDone ? onDone() : router.push('/dashboard/products');
    } catch (err) {
      error('Failed to save product', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const updateGroup = (idx: number, field: keyof VariantGroupIn, value: unknown) => {
    setGroups((gs) => gs.map((g, i) => (i === idx ? { ...g, [field]: value } : g)));
  };

  const updateOption = (gIdx: number, oIdx: number, field: string, value: unknown) => {
    setGroups((gs) =>
      gs.map((g, i) =>
        i === gIdx
          ? {
              ...g,
              options: g.options.map((o, j) =>
                j === oIdx ? { ...o, [field]: value } : o
              ),
            }
          : g
      )
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-surface p-6 space-y-4">
            <h3 className="font-semibold">Basic info</h3>
            <Input
              label="Product name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Silk Touch Serum"
            />
            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product…"
              rows={4}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price *"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="29.00"
              />
              <Input
                label="Discount price"
                type="number"
                step="0.01"
                min="0"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="24.00"
                helperText="Optional — must be lower than price"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
              />
              <div>
                <Label>Category</Label>
                <Select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  options={[
                    { value: '', label: 'No category' },
                    ...categories.map((c) => ({ value: c.id.toString(), label: c.name })),
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="card-surface p-6">
            <h3 className="font-semibold mb-4">Images</h3>
            <ImageUpload images={images} onChange={setImages} max={6} />
          </div>

          <div className="card-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Variants</h3>
                <p className="text-sm text-muted-foreground">
                  Sizes, colors, scents… Optional but powerful.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setGroups((g) => [...g, { name: '', options: [{ value: '', additional_price: 0, stock: null }] }])}
              >
                <Plus className="w-4 h-4" /> Add group
              </Button>
            </div>

            {groups.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-xl">
                No variants. Add size or color options to let customers customize their order.
              </p>
            ) : (
              <div className="space-y-4">
                {groups.map((group, gIdx) => (
                  <div key={gIdx} className="border border-border rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Input
                        value={group.name}
                        onChange={(e) => updateGroup(gIdx, 'name', e.target.value)}
                        placeholder="Group name, e.g. Size"
                        className="max-w-[220px]"
                      />
                      <button
                        type="button"
                        onClick={() => setGroups((g) => g.filter((_, i) => i !== gIdx))}
                        className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                        aria-label="Remove group"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {group.options.map((option, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <Input
                            value={option.value}
                            onChange={(e) => updateOption(gIdx, oIdx, 'value', e.target.value)}
                            placeholder="Option, e.g. M"
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            step="0.01"
                            value={option.additional_price || ''}
                            onChange={(e) => updateOption(gIdx, oIdx, 'additional_price', parseFloat(e.target.value) || 0)}
                            placeholder="+price"
                            className="w-24"
                          />
                          <Input
                            type="number"
                            value={option.stock ?? ''}
                            onChange={(e) => updateOption(gIdx, oIdx, 'stock', e.target.value === '' ? null : parseInt(e.target.value))}
                            placeholder="stock"
                            className="w-20"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setGroups((g) =>
                                g.map((grp, i) =>
                                  i === gIdx
                                    ? { ...grp, options: grp.options.filter((_, j) => j !== oIdx) }
                                    : grp
                                )
                              )
                            }
                            className="p-2 rounded-lg text-muted-foreground hover:text-red-400"
                            aria-label="Remove option"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setGroups((g) =>
                            g.map((grp, i) =>
                              i === gIdx
                                ? { ...grp, options: [...grp.options, { value: '', additional_price: 0, stock: null }] }
                                : grp
                            )
                          )
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add option
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-surface p-6 space-y-5">
            <h3 className="font-semibold">Visibility</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Visible in your store</p>
              </div>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Featured</p>
                <p className="text-xs text-muted-foreground">Showcase this product</p>
              </div>
              <Switch checked={featured} onCheckedChange={setFeatured} />
            </div>
            {name && (
              <div className="px-3 py-2.5 rounded-xl bg-muted/50 text-xs text-muted-foreground">
                Store link:{' '}
                <span className="text-foreground font-medium">
                  /store/&#123;slug&#125;/products/{slugify(name) || '…'}
                </span>
              </div>
            )}
          </div>

          <Button type="submit" variant="gold" size="lg" className="w-full" isLoading={saving}>
            {isEdit ? 'Save changes' : 'Create product'}
          </Button>
        </div>
      </div>
    </form>
  );
}
