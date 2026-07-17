'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Save,
} from 'lucide-react';
import { useMenus, useSaveMenu, useDeleteMenu, useReorderMenu, useCategories } from '@/hooks/queries';
import { AdminModal } from '@/components/admin/AdminModal';
import { cn } from '@/lib/utils';
import { MenuNode } from '@/components/storefront/MegaMenu';

export default function AdminMenusPage() {
  const { data, refetch, isLoading } = useMenus();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MenuNode | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);

  const tree: MenuNode[] = (data ?? []) as MenuNode[];

  const openCreate = (parentId: string | null = null) => {
    setEditing(null);
    setDefaultParentId(parentId);
    setOpen(true);
  };
  const openEdit = (node: MenuNode) => {
    setEditing(node);
    setDefaultParentId(node.parentId ?? null);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="luxury-card p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl mb-1">Mega Menu Builder</h2>
          <p className="text-sm text-charcoal-300">
            Drag rows to reorder. Drag a row onto another to nest it under that parent.
            Inactive items are hidden from the storefront.
          </p>
        </div>
        <button onClick={() => openCreate(null)} className="btn-primary self-start">
          <Plus size={14} /> New Top-Level Item
        </button>
      </div>

      <div className="luxury-card p-4">
        {isLoading ? (
          <p className="text-sm text-charcoal-300 py-8 text-center">Loading menu…</p>
        ) : tree.length === 0 ? (
          <p className="text-sm text-charcoal-300 py-8 text-center">
            No menu items yet. Create your first one above.
          </p>
        ) : (
          <MenuEditor tree={tree} onEdit={openEdit} onCreateChild={(pid) => openCreate(pid)} />
        )}
      </div>

      <AdminModal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit menu item' : 'New menu item'}
        size="lg"
      >
        <MenuForm
          initial={editing}
          defaultParentId={defaultParentId}
          existing={tree}
          onClose={() => {
            setOpen(false);
            refetch();
          }}
        />
      </AdminModal>
    </div>
  );
}

function MenuEditor({
  tree,
  onEdit,
  onCreateChild,
}: {
  tree: MenuNode[];
  onEdit: (n: MenuNode) => void;
  onCreateChild: (parentId: string) => void;
}) {
  const reorder = useReorderMenu();
  const remove = useDeleteMenu();

  // Flatten existing tree into rows we render (root-level only for drag-reordering).
  const [rows, setRows] = useState<MenuNode[]>(tree);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [overAsChild, setOverAsChild] = useState(false);

  useEffect(() => {
    setRows(tree);
    if (Object.keys(expanded).length === 0) {
      const seed: Record<string, boolean> = {};
      for (const r of tree) seed[r.id] = true;
      setExpanded(seed);
    }
  }, [tree]);

  const persistOrder = (next: MenuNode[]) => {
    setRows(next);
    const payload = next.flatMap((row, idx) => [
      { id: row.id, parentId: null, sortOrder: idx },
      ...(row.children ?? []).map((child, j) => ({ id: child.id, parentId: row.id, sortOrder: j })),
    ]);
    reorder.mutate(payload);
  };

  const handleDragStart = (id: string) => setDragId(id);

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offset = e.clientY - rect.top;
    setOverId(id);
    setOverAsChild(offset > rect.height / 2);
  };

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setOverId(null);
      return;
    }
    const fromIdx = rows.findIndex((r) => r.id === dragId);
    const toIdx = rows.findIndex((r) => r.id === targetId);
    if (fromIdx === -1 || toIdx === -1) {
      setDragId(null);
      setOverId(null);
      return;
    }
    const next = [...rows];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setDragId(null);
    setOverId(null);
    persistOrder(next);
  };

  const moveRow = (id: string, dir: -1 | 1) => {
    const idx = rows.findIndex((r) => r.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[idx], next[target]] = [next[target], next[idx]];
    persistOrder(next);
  };

  return (
    <div>
      {rows.map((row) => (
        <div
          key={row.id}
          onDragOver={(e) => handleDragOver(e, row.id)}
          onDrop={() => handleDrop(row.id)}
          className={cn(
            'rounded-lg border transition-all',
            overId === row.id
              ? overAsChild
                ? 'border-champagne bg-champagne-50/50'
                : 'border-primary bg-primary-50/40'
              : 'border-charcoal-100',
            dragId === row.id ? 'opacity-50' : ''
          )}
        >
          <div className="flex items-center gap-2 py-2 px-2 group">
            <span
              draggable
              onDragStart={() => handleDragStart(row.id)}
              onDragEnd={() => {
                setDragId(null);
                setOverId(null);
              }}
              className="cursor-grab text-charcoal-300 hover:text-charcoal"
              aria-label="Drag handle"
            >
              <GripVertical size={14} />
            </span>

            {(row.children ?? []).length > 0 ? (
              <button onClick={() => setExpanded((s) => ({ ...s, [row.id]: !s[row.id] }))} className="p-0.5">
                {expanded[row.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <span className="w-3.5" />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{row.label}</span>
                {row.link && row.link !== '#' && (
                  <span className="text-[11px] text-charcoal-300 truncate max-w-[160px]">{row.link}</span>
                )}
                {row.categorySlug && (
                  <span className="text-[11px] text-champagne-600">→ {row.categorySlug}</span>
                )}
              </div>
            </div>

            <span
              className={cn(
                'text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full',
                row.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-charcoal-100 text-charcoal-300'
              )}
            >
              {row.isActive !== false ? 'Visible' : 'Hidden'}
            </span>

            <button
              onClick={() => moveRow(row.id, -1)}
              className="p-1 text-charcoal-300 hover:text-charcoal"
              title="Move up"
            >
              <ArrowUp size={12} />
            </button>
            <button
              onClick={() => moveRow(row.id, 1)}
              className="p-1 text-charcoal-300 hover:text-charcoal"
              title="Move down"
            >
              <ArrowDown size={12} />
            </button>
            <button
              onClick={() => onCreateChild(row.id)}
              className="p-1 text-charcoal-300 hover:text-primary"
              title="Add child"
            >
              <Plus size={12} />
            </button>
            <button onClick={() => onEdit(row)} className="p-1 text-charcoal-300 hover:text-primary" title="Edit">
              <Edit size={12} />
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete "${row.label}" and all its children?`)) remove.mutate(row.id);
              }}
              className="p-1 text-charcoal-300 hover:text-red-500"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>

          {expanded[row.id] && (row.children ?? []).length > 0 && (
            <div className="ml-10 mr-2 mb-2 border-l border-charcoal-100 pl-4 space-y-1">
              {(row.children ?? []).map((child) => (
                <div
                  key={child.id}
                  className="flex items-center gap-2 py-1.5 text-sm border-b border-charcoal-100/50"
                >
                  <span className="text-charcoal-300 text-xs">↳</span>
                  <span className="flex-1 truncate">{child.label}</span>
                  {child.link && child.link !== '#' && (
                    <span className="text-[11px] text-charcoal-300 truncate max-w-[140px]">{child.link}</span>
                  )}
                  {child.categorySlug && (
                    <span className="text-[11px] text-champagne-600">→ {child.categorySlug}</span>
                  )}
                  <span
                    className={cn(
                      'text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full',
                      child.isActive !== false
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-charcoal-100 text-charcoal-300'
                    )}
                  >
                    {child.isActive !== false ? (
                      <span className="inline-flex items-center gap-1">
                        <Eye size={10} /> On
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <EyeOff size={10} /> Off
                      </span>
                    )}
                  </span>
                  <button onClick={() => onEdit(child)} className="p-1 text-charcoal-300 hover:text-primary">
                    <Edit size={12} />
                  </button>
                  <DeleteInline item={child} onDelete={() => remove.mutate(child.id)} />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function DeleteInline({ item, onDelete }: { item: MenuNode; onDelete: () => void }) {
  return (
    <button
      onClick={() => {
        if (confirm(`Delete "${item.label}"?`)) onDelete();
      }}
      className="p-1 text-charcoal-300 hover:text-red-500"
      title="Delete"
    >
      <Trash2 size={12} />
    </button>
  );
}

function MenuForm({
  initial,
  defaultParentId,
  existing,
  onClose,
}: {
  initial: MenuNode | null;
  defaultParentId: string | null;
  existing: MenuNode[];
  onClose: () => void;
}) {
  const save = useSaveMenu();
  const { data: categoriesData } = useCategories();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const flatParents = useMemo(() => {
    const out: { id: string; label: string; depth: number }[] = [];
    const visit = (items: MenuNode[], depth: number) => {
      for (const i of items) {
        if (i.id !== initial?.id) out.push({ id: i.id, label: i.label, depth });
        if (i.children?.length) visit(i.children, depth + 1);
      }
    };
    visit(existing, 0);
    return out;
  }, [existing, initial?.id]);

  const nextSortOrder = useMemo(() => {
    if (initial?.id) return initial.sortOrder ?? 0;
    const siblings = existing.filter((m) => (m.parentId ?? null) === (defaultParentId ?? null));
    return siblings.length;
  }, [existing, defaultParentId, initial]);

  const [f, setF] = useState<any>(() => ({
    label: initial?.label ?? '',
    link: initial?.link ?? '',
    categorySlug: initial?.categorySlug ?? '',
    parentId: initial?.parentId ?? defaultParentId ?? null,
    sortOrder: initial?.sortOrder ?? nextSortOrder,
    isActive: initial?.isActive !== false,
  }));

  useEffect(() => {
    setF({
      label: initial?.label ?? '',
      link: initial?.link ?? '',
      categorySlug: initial?.categorySlug ?? '',
      parentId: initial?.parentId ?? defaultParentId ?? null,
      sortOrder: initial?.sortOrder ?? nextSortOrder,
      isActive: initial?.isActive !== false,
    });
    setSubmitError(null);
  }, [initial, defaultParentId, nextSortOrder]);

  const categoryOptions = useMemo(() => {
    const out: { id: string; label: string; slug: string }[] = [];
    const visit = (items: any[], depth: number) => {
      for (const c of items) {
        out.push({ id: c.id, label: `${'— '.repeat(depth)}${c.name}`, slug: c.slug });
        if (c.children?.length) visit(c.children, depth + 1);
      }
    };
    visit(categoriesData ?? [], 0);
    return out;
  }, [categoriesData]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const payload = {
      ...f,
      id: initial?.id,
      label: f.label.trim(),
      link: f.link?.trim() ? f.link.trim() : null,
      categorySlug: f.categorySlug?.trim() ? f.categorySlug.trim() : null,
      parentId: f.parentId || null,
      sortOrder: Number.isFinite(Number(f.sortOrder)) ? Number(f.sortOrder) : 0,
      isActive: !!f.isActive,
    };
    if (!payload.label) {
      setSubmitError('Label is required.');
      return;
    }
    save.mutate(payload, {
      onSuccess: () => onClose(),
      onError: (err: any) => {
        const msg =
          err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          'Failed to save menu item.';
        setSubmitError(msg);
      },
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">Label / Display Title</label>
          <input
            className="input"
            value={f.label}
            onChange={(e) => setF({ ...f, label: e.target.value })}
            placeholder="e.g. SAREES"
            required
          />
        </div>
        <div>
          <label className="label">Order</label>
          <input
            type="number"
            className="input"
            value={f.sortOrder}
            onChange={(e) => setF({ ...f, sortOrder: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="label">Parent Item</label>
        {initial?.parentId || defaultParentId ? (
          <div className="input flex items-center justify-between bg-ivory-50">
            <span className="text-sm">
              {(() => {
                const pid = initial?.parentId ?? defaultParentId;
                const parent = flatParents.find((p) => p.id === pid);
                if (!parent) return 'Nested item';
                return `${'— '.repeat(parent.depth)}${parent.label}`;
              })()}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-charcoal-300">Locked</span>
          </div>
        ) : initial ? (
          <select
            className="input"
            value={f.parentId ?? ''}
            onChange={(e) => setF({ ...f, parentId: e.target.value || null })}
          >
            <option value="">— Top-level (root) —</option>
            {flatParents.map((p) => (
              <option key={p.id} value={p.id}>
                {'— '.repeat(p.depth)}
                {p.label}
              </option>
            ))}
          </select>
        ) : (
          <div className="input flex items-center justify-between bg-ivory-50">
            <span className="text-sm">Top-level (root) — appears in the main nav</span>
            <span className="text-[10px] uppercase tracking-widest text-champagne-600">New root</span>
          </div>
        )}
        {!initial?.parentId && !defaultParentId && !initial && (
          <p className="text-[11px] text-charcoal-300 mt-1">
            To create a sub-item, click the + icon on the parent row in the list.
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">Destination (URL)</label>
          <input
            className="input"
            value={f.link ?? ''}
            onChange={(e) => setF({ ...f, link: e.target.value })}
            placeholder="/shop/sarees"
          />
        </div>
        <div>
          <label className="label">Or link to a category</label>
          <select
            className="input"
            value={f.categorySlug ?? ''}
            onChange={(e) => setF({ ...f, categorySlug: e.target.value || null })}
          >
            <option value="">— None —</option>
            {categoryOptions.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm pt-2">
        <input
          type="checkbox"
          checked={!!f.isActive}
          onChange={(e) => setF({ ...f, isActive: e.target.checked })}
        />
        Visible on storefront
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={save.isPending}>
          <Save size={14} /> {save.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>

      {submitError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
          {submitError}
        </p>
      )}
    </form>
  );
}
