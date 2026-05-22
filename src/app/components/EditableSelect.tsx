import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface EditableSelectProps {
  /** List of options as strings */
  options: string[];
  /** Currently selected value */
  value: string;
  /** Called when selection changes */
  onValueChange: (val: string) => void;
  /** Placeholder for the select */
  placeholder?: string;
  /** Callback to add a new option */
  onAdd: (newOption: string) => void;
  /** Callback to edit an existing option */
  onEdit: (oldOption: string, newOption: string) => void;
  /** Callback to delete an option */
  onDelete: (option: string) => void;
  /** UI flags */
  allowAdd?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
}

export const EditableSelect: React.FC<EditableSelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder = 'Seleccionar',
  onAdd,
  onEdit,
  onDelete,
  allowAdd = true,
  allowEdit = true,
  allowDelete = true,
}) => {
  const [editing, setEditing] = useState<string | null>(null);
  const [temp, setTemp] = useState('');
  const [newOption, setNewOption] = useState('');

  const startEdit = (opt: string) => {
    if (!allowEdit) return;
    setEditing(opt);
    setTemp(opt);
  };

  const applyEdit = () => {
    if (!temp.trim()) {
      toast.warning('Valor no válido');
      return;
    }
    if (editing !== null) {
      onEdit(editing, temp.trim());
      setEditing(null);
      setTemp('');
    }
  };

  const handleAdd = () => {
    if (!newOption.trim()) {
      toast.warning('Valor no válido');
      return;
    }
    onAdd(newOption.trim());
    setNewOption('');
  };

  return (
    <div className="flex flex-col space-y-2">
      <select
        value={value}
        onChange={e => onValueChange(e.target.value)}
        className="bg-white border rounded h-8 text-xs p-1"
      >
        <option disabled value="">
          {placeholder}
        </option>
        {options.map(opt => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {allowEdit && editing !== null && (
        <div className="flex gap-2 items-center">
          <Input
            value={temp}
            onChange={e => setTemp(e.target.value)}
            className="h-8 text-xs"
          />
          <Button size="sm" onClick={applyEdit}>
            ✓
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
            ✕
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <div
            key={opt}
            className="flex items-center gap-1 bg-gray-100 rounded px-2 py-0.5"
          >
            <span className="text-sm">{opt}</span>
            {allowEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => startEdit(opt)}
                className="h-6 w-6 p-0"
              >
                <Pencil className="w-3 h-3" />
              </Button>
            )}
            {allowDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(opt)}
                className="h-6 w-6 p-0 text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {allowAdd && (
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Nuevo"
            value={newOption}
            onChange={e => setNewOption(e.target.value)}
            className="h-8 text-xs"
          />
          <Button size="sm" onClick={handleAdd}>
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
};
