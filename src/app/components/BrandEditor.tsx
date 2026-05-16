import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Plus, Pencil, Trash2, Save, X, Car } from 'lucide-react';
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

interface BrandEditorProps {
  brands: string[];
  onAddBrand: (brand: string) => void;
  onEditBrand: (oldBrand: string, newBrand: string) => void;
  onDeleteBrand: (brand: string) => void;
}

const getBrandColor = (index: number) => {
  const colors = [
    'bg-blue-100 text-blue-700 border-blue-300',
    'bg-purple-100 text-purple-700 border-purple-300',
    'bg-pink-100 text-pink-700 border-pink-300',
    'bg-orange-100 text-orange-700 border-orange-300',
    'bg-teal-100 text-teal-700 border-teal-300',
    'bg-rose-100 text-rose-700 border-rose-300',
    'bg-cyan-100 text-cyan-700 border-cyan-300',
    'bg-violet-100 text-violet-700 border-violet-300',
  ];
  return colors[index % colors.length];
};

export function BrandEditor({ brands, onAddBrand, onEditBrand, onDeleteBrand }: BrandEditorProps) {
  const [newBrand, setNewBrand] = useState('');
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBrand.trim() && !brands.includes(newBrand.trim())) {
      onAddBrand(newBrand.trim());
      setNewBrand('');
    }
  };

  const handleStartEdit = (brand: string) => {
    setEditingBrand(brand);
    setEditValue(brand);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && editValue !== editingBrand) {
      onEditBrand(editingBrand!, editValue.trim());
    }
    setEditingBrand(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingBrand(null);
    setEditValue('');
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-center space-y-1 mb-2">
        <div className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full p-1.5 mb-1">
          <Car className="w-4 h-4" />
        </div>
        <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent leading-none uppercase tracking-tight">
          Editor de Marcas
        </h2>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider">
          Gestiona las marcas disponibles
        </p>
      </div>

      {/* Formulario para agregar nueva marca */}
      <Card className="p-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
        <form onSubmit={handleAddBrand} className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="newBrand" className="sr-only">Nueva marca</Label>
            <Input
              id="newBrand"
              type="text"
              placeholder="Ej: Tesla, Subaru, Jeep..."
              value={newBrand}
              onChange={(e) => setNewBrand(e.target.value)}
              className="bg-white border-blue-300 h-7 text-xs px-2"
            />
          </div>
          <Button 
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white h-7 text-xs px-3"
          >
            <Plus className="w-3 h-3 mr-1" />
            Agregar
          </Button>
        </form>
      </Card>

      {/* Lista de marcas */}
      <div className="space-y-2">
        <h3 className="font-bold text-[10px] text-gray-500 uppercase tracking-wider">Marcas Disponibles ({brands.length})</h3>
        {brands.length === 0 ? (
          <Card className="p-4 text-center text-xs text-gray-500">
            No hay marcas configuradas. Agrega la primera arriba.
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {brands.map((brand, index) => (
              <Card
                key={brand}
                className="p-1.5 flex items-center justify-between hover:shadow-sm transition-shadow border border-blue-100"
              >
                {editingBrand === brand ? (
                  // Modo edición
                  <div className="flex items-center gap-1 flex-1">
                    <Input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 h-6 text-[10px] px-1"
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
                      <Car className="w-3 h-3 text-blue-500 shrink-0" />
                      <Badge className={`${getBrandColor(index)} text-[9px] px-1.5 py-0 truncate max-w-[80px]`}>
                        {brand}
                      </Badge>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(brand)}
                        className="hover:bg-blue-100 hover:text-blue-700 h-5 w-5 p-0"
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
                            <AlertDialogTitle>¿Eliminar marca?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará la marca <strong>{brand}</strong>.
                              Los precios existentes con esta marca no se verán afectados,
                              pero ya no podrás seleccionar esta marca para nuevos precios.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteBrand(brand)}
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
      <Card className="p-2.5 bg-cyan-50 border-cyan-200">
        <div className="flex gap-2 items-center">
          <div className="text-cyan-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1 text-[10px] text-cyan-800 leading-tight">
            <strong>Consejo:</strong> Agrega las marcas más comunes para agilizar.
          </div>
        </div>
      </Card>
    </div>
  );
}
