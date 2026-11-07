import { ChevronDown, ChevronRight, File, Folder, FolderOpen } from "lucide-react";
import { useState } from "react";
import { trees, type TreeNode } from "./folderTree.data";

function Row({
  node,
  depth,
  path,
  open,
  toggle,
  selected,
  select,
}: {
  node: TreeNode;
  depth: number;
  path: string;
  open: Set<string>;
  toggle: (p: string) => void;
  selected: string;
  select: (p: string, n: TreeNode) => void;
}) {
  const hasKids = !!node.children?.length;
  const isOpen = open.has(path);
  const isSel = selected === path;
  const Icon = hasKids ? (isOpen ? FolderOpen : Folder) : node.dir ? Folder : File;

  return (
    <li className="mt-0" role="none">
      <div
        role="treeitem"
        aria-level={depth + 1}
        aria-expanded={hasKids ? isOpen : undefined}
        aria-selected={isSel}
        style={{ paddingLeft: 8 + depth * 18 }}
        className={[
          "flex items-center gap-1.5 rounded-xs py-1 pr-2",
          isSel ? "bg-sel-bg text-sel" : "text-ink hover:bg-field",
        ].join(" ")}
      >
        {hasKids ? (
          <button
            type="button"
            onClick={() => toggle(path)}
            aria-label={isOpen ? `ยุบ ${node.name}` : `ขยาย ${node.name}`}
            className="flex size-5 items-center justify-center rounded-xs text-ink2 hover:text-ink"
          >
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="size-5" aria-hidden />
        )}
        <button
          type="button"
          onClick={() => {
            select(path, node);
            if (hasKids && !isOpen) toggle(path);
          }}
          className="flex min-w-0 flex-1 items-center gap-2 text-left font-mono text-code"
        >
          <Icon size={15} className={node.dir ? "text-haze" : "text-dim"} aria-hidden />
          <span className="truncate">{node.name}</span>
        </button>
      </div>
      {hasKids && isOpen && (
        <ul role="group" className="m-0 list-none p-0">
          {node.children!.map((c) => (
            <Row
              key={c.name}
              node={c}
              depth={depth + 1}
              path={`${path}/${c.name}`}
              open={open}
              toggle={toggle}
              selected={selected}
              select={select}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/** Expandable folder map. Click a name to read what lives there and how it is named. */
export function FolderTree() {
  const [treeId, setTreeId] = useState(trees[0]!.id);
  const tree = trees.find((t) => t.id === treeId) ?? trees[0]!;
  const [open, setOpen] = useState<Set<string>>(new Set([trees[0]!.root.name]));
  const [selected, setSelected] = useState(trees[0]!.root.name);
  const [node, setNode] = useState<TreeNode>(trees[0]!.root);

  const pick = (id: string) => {
    const t = trees.find((x) => x.id === id)!;
    setTreeId(id);
    setOpen(new Set([t.root.name]));
    setSelected(t.root.name);
    setNode(t.root);
  };

  const toggle = (p: string) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(p)) n.delete(p);
      else n.add(p);
      return n;
    });

  return (
    <div data-wide className="flex flex-col gap-4">
      <div role="radiogroup" aria-label="เลือกแผนที่" className="flex flex-wrap gap-2">
        {trees.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={t.id === treeId}
            onClick={() => pick(t.id)}
            className={["btn btn--sm", t.id === treeId ? "btn--primary" : "btn--outlined"].join(" ")}
          >
            {t.title}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ul
          role="tree"
          aria-label={`โครงสร้าง ${tree.title}`}
          className="m-0 max-h-[28rem] list-none overflow-auto rounded-md border border-edge bg-card p-2"
        >
          <Row
            node={tree.root}
            depth={0}
            path={tree.root.name}
            open={open}
            toggle={toggle}
            selected={selected}
            select={(p, n) => {
              setSelected(p);
              setNode(n);
            }}
          />
        </ul>

        <div className="card card--flat" aria-live="polite">
          <p className="card-meta">{node.dir ? "โฟลเดอร์" : "ไฟล์"}</p>
          <p className="card-title font-mono">{node.name}</p>
          <p className="text-body text-ink">{node.note}</p>
          {node.rule && (
            <div className="alert alert--brand mt-4">
              <div>
                <p className="alert-title">กติกา</p>
                <p className="alert-body">{node.rule}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
