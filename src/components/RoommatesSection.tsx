"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Users, Check, X } from "lucide-react";
import Card from "./Card";
import EmptyState from "./EmptyState";
import ConfirmDialog from "./ConfirmDialog";
import { Roommate } from "@/types";

interface RoommatesSectionProps {
  roommates: Roommate[];
  onAdd: (name: string) => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export default function RoommatesSection({
  roommates,
  onAdd,
  onEdit,
  onDelete,
}: RoommatesSectionProps) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setError("Please enter a name");
      return;
    }
    if (
      roommates.some((r) => r.name.toLowerCase() === trimmed.toLowerCase())
    ) {
      setError("This name already exists");
      return;
    }
    onAdd(trimmed);
    setNewName("");
    setError("");
  };

  const startEdit = (r: Roommate) => {
    setEditingId(r.id);
    setEditValue(r.name);
  };

  const saveEdit = () => {
    const trimmed = editValue.trim();
    if (!trimmed || !editingId) {
      setEditingId(null);
      return;
    }
    onEdit(editingId, trimmed);
    setEditingId(null);
    setEditValue("");
  };

  const roommateToDelete = roommates.find((r) => r.id === deleteId);

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Users size={18} className="text-primary-600" />
          Roommates
        </h2>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          {roommates.length}
        </span>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Enter roommate name"
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-slate-400"
        />
        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

      {roommates.length === 0 ? (
        <EmptyState
          icon={<Users size={24} />}
          title="No roommates yet"
          description="Add roommates to start splitting expenses equally."
        />
      ) : (
        <ul className="space-y-2">
          {roommates.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100"
            >
              {editingId === r.id ? (
                <>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                    autoFocus
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={saveEdit}
                    className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                    aria-label="Save"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                    aria-label="Cancel"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold shrink-0">
                      {r.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-700 truncate">
                      {r.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(r)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                      aria-label="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteId(r.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Remove Roommate"
        message={`Are you sure you want to remove "${roommateToDelete?.name}"? Their related expenses will keep this name as the payer reference but balances will recalculate.`}
        confirmLabel="Remove"
        onConfirm={() => {
          if (deleteId) onDelete(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </Card>
  );
}
