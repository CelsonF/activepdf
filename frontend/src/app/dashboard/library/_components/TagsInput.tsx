"use client";
import { useState } from "react";
import { Plus, Tag, X } from "@phosphor-icons/react";

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagsInput({ tags, onChange }: TagsInputProps) {
  const [tagInput, setTagInput] = useState("");

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setTagInput("");
  }

  return (
    <div>
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
        Tags
      </label>
      <div className="flex gap-1.5 flex-wrap mb-2">
        {tags.map((t) => (
          <span
            key={t}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold"
          >
            <Tag size={10} /> {t}
            <button onClick={() => onChange(tags.filter((x) => x !== t))} className="ml-0.5 hover:text-violet-900">
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="grammar, B1, vocabulary…"
          className="ui-input flex-1"
        />
        <button
          onClick={addTag}
          disabled={!tagInput.trim()}
          className="ui-btn ui-btn-secondary ui-btn-sm"
        >
          <Plus size={13} weight="bold" />
        </button>
      </div>
    </div>
  );
}
