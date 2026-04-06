import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Plus, Trash2, Zap } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

export interface LiveTemplate {
  id: string;
  abbreviation: string;
  name: string;
  description: string;
  body: string;
  builtin?: boolean;
}

const BUILTIN_TEMPLATES: LiveTemplate[] = [
  {
    id: "sfc",
    abbreviation: "sfc",
    name: "React Functional Component",
    description: "Scaffold a React functional component",
    body: `import React from 'react';\n\ninterface $\{ComponentName\}Props {\n  // props\n}\n\nexport const $\{ComponentName\}: React.FC<$\{ComponentName\}Props> = () => {\n  return (\n    <div>\n      $CURSOR$\n    </div>\n  );\n};`,
    builtin: true,
  },
  {
    id: "usestate",
    abbreviation: "usestate",
    name: "useState Hook",
    description: "Add a useState hook",
    body: "const [$CURSOR$, set${State}] = useState(${initialValue});",
    builtin: true,
  },
  {
    id: "useeffect",
    abbreviation: "useeffect",
    name: "useEffect Hook",
    description: "Add a useEffect with cleanup",
    body: "useEffect(() => {\n  $CURSOR$\n  return () => {\n    // cleanup\n  };\n}, []);",
    builtin: true,
  },
  {
    id: "mofunc",
    abbreviation: "mofunc",
    name: "Motoko Function",
    description: "Scaffold a Motoko public function",
    body: "public func $CURSOR$(param : Text) : async Text {\n  // implementation\n  return param;\n};",
    builtin: true,
  },
  {
    id: "tryfetch",
    abbreviation: "tryfetch",
    name: "Async Fetch with Try/Catch",
    description: "Async fetch pattern with error handling",
    body: `const fetchData = async () => {\n  try {\n    const response = await fetch($CURSOR$);\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Fetch error:', error);\n    throw error;\n  }\n};`,
    builtin: true,
  },
];

const STORAGE_KEY = "codeveda_live_templates";

function loadCustomTemplates(): LiveTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

function saveCustomTemplates(templates: LiveTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function getAllTemplates(): LiveTemplate[] {
  return [...BUILTIN_TEMPLATES, ...loadCustomTemplates()];
}

export function expandTemplate(abbreviation: string): string | null {
  const all = getAllTemplates();
  const tmpl = all.find((t) => t.abbreviation === abbreviation);
  return tmpl ? tmpl.body : null;
}

interface LiveTemplatesManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveTemplatesManager: React.FC<LiveTemplatesManagerProps> = ({
  isOpen,
  onClose,
}) => {
  const [customTemplates, setCustomTemplates] =
    useState<LiveTemplate[]>(loadCustomTemplates);
  const [editingTemplate, setEditingTemplate] = useState<LiveTemplate | null>(
    null,
  );
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    saveCustomTemplates(customTemplates);
  }, [customTemplates]);

  const allTemplates = [...BUILTIN_TEMPLATES, ...customTemplates];

  const handleSave = (tmpl: LiveTemplate) => {
    if (isNew) {
      setCustomTemplates((prev) => [...prev, { ...tmpl, builtin: false }]);
    } else {
      setCustomTemplates((prev) =>
        prev.map((t) => (t.id === tmpl.id ? tmpl : t)),
      );
    }
    setEditingTemplate(null);
    setIsNew(false);
  };

  const handleDelete = (id: string) => {
    setCustomTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-2xl"
        style={{
          background: "var(--bg-sidebar)",
          border: "1px solid var(--border)",
          maxHeight: "80vh",
        }}
        data-ocid="livetemplates.dialog"
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Zap size={16} style={{ color: "var(--accent)" }} />
            <DialogTitle style={{ color: "var(--text-primary)" }}>
              Live Templates
            </DialogTitle>
          </div>
        </DialogHeader>

        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Type an abbreviation in the editor and press{" "}
          <kbd
            className="px-1 py-0.5 rounded text-[10px]"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
            }}
          >
            Tab
          </kbd>{" "}
          to expand the template.
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {allTemplates.length} templates
          </span>
          <Button
            size="sm"
            className="h-7 text-xs gap-1"
            style={{ background: "var(--accent)", color: "#fff" }}
            onClick={() => {
              setEditingTemplate({
                id: `tmpl_${Date.now()}`,
                abbreviation: "",
                name: "",
                description: "",
                body: "$CURSOR$",
              });
              setIsNew(true);
            }}
            data-ocid="livetemplates.primary_button"
          >
            <Plus size={11} /> New Template
          </Button>
        </div>

        <ScrollArea className="h-64">
          <div className="space-y-1">
            {allTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors"
                style={{ background: "var(--bg-input)" }}
              >
                <code
                  className="text-xs px-1.5 py-0.5 rounded font-mono flex-shrink-0"
                  style={{
                    background: "var(--accent)22",
                    color: "var(--accent)",
                    border: "1px solid var(--accent)33",
                  }}
                >
                  {tmpl.abbreviation}
                </code>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-medium truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {tmpl.name}
                  </p>
                  <p
                    className="text-[10px] truncate"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {tmpl.description}
                  </p>
                </div>
                {tmpl.builtin ? (
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1 py-0 flex-shrink-0"
                    style={{
                      color: "var(--text-muted)",
                      borderColor: "var(--border)",
                    }}
                  >
                    built-in
                  </Badge>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        setEditingTemplate({ ...tmpl });
                        setIsNew(false);
                      }}
                      data-ocid="livetemplates.edit_button"
                    >
                      <Edit2 size={10} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => handleDelete(tmpl.id)}
                      data-ocid="livetemplates.delete_button"
                    >
                      <Trash2 size={10} style={{ color: "var(--error)" }} />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {editingTemplate && (
          <TemplateEditForm
            template={editingTemplate}
            onSave={handleSave}
            onCancel={() => {
              setEditingTemplate(null);
              setIsNew(false);
            }}
          />
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={onClose}
          data-ocid="livetemplates.close_button"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

function TemplateEditForm({
  template,
  onSave,
  onCancel,
}: {
  template: LiveTemplate;
  onSave: (t: LiveTemplate) => void;
  onCancel: () => void;
}) {
  const [abbr, setAbbr] = useState(template.abbreviation);
  const [name, setName] = useState(template.name);
  const [desc, _setDesc] = useState(template.description);
  const [body, setBody] = useState(template.body);

  return (
    <div
      className="rounded-md p-3 space-y-2 border border-[var(--border)]"
      style={{ background: "var(--bg-panel)" }}
    >
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            Abbreviation
          </Label>
          <Input
            value={abbr}
            onChange={(e) => setAbbr(e.target.value)}
            placeholder="usestate"
            className="mt-1 text-xs h-7 font-mono"
            style={{
              background: "var(--bg-input)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
            data-ocid="livetemplates.input"
          />
        </div>
        <div>
          <Label className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            Name
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="useState Hook"
            className="mt-1 text-xs h-7"
            style={{
              background: "var(--bg-input)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
            data-ocid="livetemplates.input"
          />
        </div>
      </div>
      <div>
        <Label className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          Template Body (use $CURSOR$ for cursor position)
        </Label>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-1 text-xs font-mono resize-none"
          style={{
            background: "var(--bg-input)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            minHeight: 80,
          }}
          data-ocid="livetemplates.textarea"
        />
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1 h-7 text-xs"
          style={{ background: "var(--accent)", color: "#fff" }}
          onClick={() =>
            onSave({
              ...template,
              abbreviation: abbr,
              name,
              description: desc,
              body,
            })
          }
          disabled={!abbr.trim() || !name.trim() || !body.trim()}
          data-ocid="livetemplates.save_button"
        >
          Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-7 text-xs"
          onClick={onCancel}
          data-ocid="livetemplates.cancel_button"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
