import { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';

interface EditableNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  allowDecimals?: boolean;
}

/** Permite seleccionar y reemplazar el número completo (no edición dígito a dígito forzada). */
export function EditableNumberInput({
  value,
  onChange,
  className,
  placeholder,
  allowDecimals = false,
}: EditableNumberInputProps) {
  const [text, setText] = useState('');
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) {
      setText(value === 0 ? '' : String(value));
    }
  }, [value]);

  const parseValue = (raw: string) => {
    const normalized = raw.trim().replace(',', '.');
    if (!normalized) return 0;
    const parsed = allowDecimals ? parseFloat(normalized) : parseInt(normalized, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return (
    <Input
      type="text"
      inputMode={allowDecimals ? 'decimal' : 'numeric'}
      className={className}
      placeholder={placeholder}
      value={text}
      onFocus={() => {
        focused.current = true;
        setText(value === 0 ? '' : String(value));
      }}
      onChange={(e) => {
        const raw = e.target.value;
        const filtered = allowDecimals ? raw.replace(/[^\d.,]/g, '') : raw.replace(/\D/g, '');
        setText(filtered);
      }}
      onBlur={() => {
        focused.current = false;
        const parsed = parseValue(text);
        onChange(parsed);
        setText(parsed === 0 ? '' : String(parsed));
      }}
    />
  );
}
