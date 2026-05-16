import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Plus, Pencil, Trash2, Save, X, Ruler } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { Card } from './ui/card';

interface SizeEditorProps {
  sizes: string[];
  onAddSize: (size: string) => void;
  onEditSize: (oldSize: string, newSize: string) => void;
  onDeleteSize: (size: string) => void;
}

const getSizeColor = (size: string, index: number) => {
  const colors = [
    'bg-green-100 text-green-700 border-green-300',
    'bg-blue-100 text-blue-700 border-blue-300',
    'bg-orange-100 text-orange-700 border-orange-300',
    'bg-purple-100 text-purple-700 border-purple-300',
    'bg-red-100 text-red-700 border-red-300',
    'bg-pink-100 text-pink-700 border-pink-300',
    'bg-cyan-100 text-cyan-700 border-cyan-300',
    'bg-indigo-100 text-indigo-700 border-indigo-300',
  ];
  return colors[index % colors.length];
};

export function SizeEditor({ sizes, onAddSize, onEditSize, onDeleteSize }: SizeEditorProps) {
  const [newSize, setNewSize] = useState('');
  const [editingSize, setEditingSize] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAddSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSize.trim() && !sizes.includes(newSize.trim())) {
      onAddSize(newSize.trim());
      setNewSize('');
    }
  };

  const handleStartEdit = (size: string) => {
    setEditingSize(size);
    setEditValue(size);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && editValue !== editingSize) {
      onEditSize(editingSize!, editValue.trim());
    }
    setEditingSize(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingSize(null);
    setEditValue('');
  };

  return (
    <div className="space-y-3 w-full">
      {/* Header */}
      <div className="text-center space-y-1 mb-2">
        <div className="inline-block bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full p-1.5 mb-1">
          <Ruler className="w-4 h-4" />
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-none uppercase tracking-tight">
          Editor de Tamaños
        </h2>
        <p className="text-xs text-gray-500 uppercase tracking-wider">
          Gestiona los tamaños de vehículos
        </p>
      </div>

      {/* Formulario para agregar nuevo tamaño */}
      <Card className="p-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
        <form onSubmit={handleAddSize} className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="newSize" className="sr-only">Nuevo tamaño</Label>
            <Input
              id="newSize"
              type="text"
              placeholder="Ej: XL, Compacto, Deportivo..."
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              className="bg-white border-indigo-300 h-7 text-xs px-2"
            />
          </div>
          <Button 
            type="submit"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-7 text-xs px-3"
          >
            <Plus className="w-3 h-3 mr-1" />
            Agregar
          </Button>
        </form>
      </Card>

      {/* Lista de tamaños */}
      <div className="space-y-2">
        <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wider">Tamaños Disponibles ({sizes.length})</h3>
        {sizes.length === 0 ? (
          <Card className="p-4 text-center text-xs text-gray-500">
            No hay tamaños configurados. Agrega el primero arriba.
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 w-full">
            {sizes.map((size, index) => (
              <Card
                key={size}
                className="p-1.5 flex items-center justify-between hover:shadow-sm transition-shadow border border-indigo-100"
              >
                {editingSize === size ? (
                  // Modo edición
                  <div className="flex items-center gap-1 flex-1">
                    <Input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 h-7 text-xs px-1"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      className="bg-green-600 hover:bg-green-700 text-white h-6 w-6 p-0"
                    >
                      <Save className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  // Modo vista
                  <>
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <Ruler className="w-3 h-3 text-indigo-500 shrink-0" />
                      <Badge className={`${getSizeColor(size, index)} text-xs px-2 py-0.5 truncate max-w-[90px]`}>
                        {size}
                      </Badge>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(size)}
                        className="hover:bg-indigo-100 hover:text-indigo-700 h-5 w-5 p-0"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="hover:bg-red-100 hover:text-red-700 h-5 w-5 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar tamaño?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará el tamaño <strong>{size}</strong>.
                              Los precios existentes con este tamaño no se verán afectados,
                              pero ya no podrás seleccionar este tamaño para nuevos precios.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteSize(size)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Información útil */}
      <Card className="p-2.5 bg-blue-50 border-blue-200">
        <div className="flex gap-2 items-center">
          <div className="text-blue-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1 text-[10px] text-blue-800 leading-tight">
            <strong>Consejo:</strong> Usa tamaños para organizar los precios (Ej: "Pequeño", "SUV").
          </div>
        </div>
      </Card>
    </div>
  );
}
