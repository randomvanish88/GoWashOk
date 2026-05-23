import { useState, useEffect } from 'react';
import { Price } from '../App';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Pencil, Trash2, Search, Car, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';
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

interface PriceListProps {
  prices: Price[];
  onEdit?: (price: Price) => void;
  onDelete?: (id: string) => void;
  onMove?: (id: string, direction: 'up' | 'down') => void;
}

// Función para obtener color según el tamaño
const getSizeColor = (size: string) => {
  const colors: Record<string, string> = {
    'Pequeño': 'bg-green-100 text-green-700 border-green-300',
    'Mediano': 'bg-blue-100 text-blue-700 border-blue-300',
    'Grande': 'bg-orange-100 text-orange-700 border-orange-300',
    'SUV': 'bg-purple-100 text-purple-700 border-purple-300',
    'Camioneta': 'bg-red-100 text-red-700 border-red-300',
    'Van': 'bg-pink-100 text-pink-700 border-pink-300',
  };
  return colors[size] || 'bg-gray-100 text-gray-700 border-gray-300';
};

export function PriceList({ prices, onEdit, onDelete, onMove }: PriceListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSize, setFilterSize] = useState<string>('all');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [vehiclesToday, setVehiclesToday] = useState(0);

  useEffect(() => {
    const savedVentas = localStorage.getItem('gowash-ventas');
    if (savedVentas) {
      const ventas = JSON.parse(savedVentas);
      const today = new Date().toISOString().split('T')[0];
      const todayVentas = ventas.filter((v: any) => v.fecha === today && v.lavado > 0);
      setVehiclesToday(todayVentas.length);
    }
  }, []);

  // Obtener marcas y tamaños únicos
  const uniqueBrands = Array.from(new Set(prices.map(p => p.brand))).sort();
  const uniqueSizes = Array.from(new Set(prices.map(p => p.size))).sort();

  // Filtrar precios
  const filteredPrices = prices.filter(price => {
    const matchesSearch = 
      price.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.size.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSize = filterSize === 'all' || price.size === filterSize;
    const matchesBrand = filterBrand === 'all' || price.brand === filterBrand;

    return matchesSearch && matchesSize && matchesBrand;
  });

  return (
    <div className="space-y-2">
      <div className="flex flex-col md:flex-row gap-2">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-purple-400 w-3 h-3" />
          <Input
            type="text"
            placeholder="Buscar por marca, servicio o tamaño..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 border-purple-200 focus:border-purple-400 h-7 text-xs"
          />
        </div>

        {/* Filtro por Marca */}
        <Select value={filterBrand} onValueChange={setFilterBrand}>
          <SelectTrigger className="w-full md:w-40 border-blue-200 focus:border-blue-400 h-7 text-xs">
            <SelectValue placeholder="Filtrar por marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">Todas las marcas</SelectItem>
            {uniqueBrands.filter(b => b && b.trim() !== '').map(brand => (
              <SelectItem key={brand} value={brand} className="text-xs">{brand}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro por Tamaño */}
        <Select value={filterSize} onValueChange={setFilterSize}>
          <SelectTrigger className="w-full md:w-40 border-pink-200 focus:border-pink-400 h-7 text-xs">
            <SelectValue placeholder="Filtrar por tamaño" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">Todos los tamaños</SelectItem>
            {uniqueSizes.filter(s => s && s.trim() !== '').map(size => (
              <SelectItem key={size} value={size} className="text-xs">{size}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabla de precios */}
      <div className="rounded border border-purple-200 overflow-hidden shadow-sm">
        <Table className="text-xs">
          <TableHeader className="bg-gradient-to-r from-blue-500 to-purple-500">
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="text-white w-8 py-1.5 px-2 h-8">Ord.</TableHead>
              <TableHead className="text-white w-10 py-1.5 px-2 h-8">Ref</TableHead>
              <TableHead className="text-white py-1.5 px-2 h-8">Marca</TableHead>
              <TableHead className="text-white py-1.5 px-2 h-8">Modelo</TableHead>
              <TableHead className="text-white py-1.5 px-2 h-8">Tamaño</TableHead>
              <TableHead className="text-white py-1.5 px-2 h-8">Servicio</TableHead>
              <TableHead className="text-right text-white py-1.5 px-2 h-8">Precio</TableHead>
              <TableHead className="text-right text-white py-1.5 px-2 h-8">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-4">
                  No se encontraron precios
                </TableCell>
              </TableRow>
            ) : (
              filteredPrices.map((price, index) => (
                <TableRow 
                  key={price.id}
                  className={index % 2 === 0 ? 'bg-purple-50/30' : 'bg-white'}
                >
                  <TableCell className="py-1 px-2">
                    <div className="flex flex-col items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!onMove || index === 0 && searchTerm === '' && filterSize === 'all' && filterBrand === 'all'}
                        onClick={() => onMove && onMove(price.id, 'up')}
                        className="h-4 w-4 p-0 hover:bg-blue-100"
                        title="Subir"
                      >
                        <ArrowUp className="w-2 h-2" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!onMove || index === filteredPrices.length - 1 && searchTerm === '' && filterSize === 'all' && filterBrand === 'all'}
                        onClick={() => onMove && onMove(price.id, 'down')}
                        className="h-4 w-4 p-0 hover:bg-blue-100"
                        title="Bajar"
                      >
                        <ArrowDown className="w-2 h-2" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="py-1 px-2">
                    {price.imageUrl ? (
                      <div className="relative group w-fit cursor-zoom-in">
                        <img 
                          src={price.imageUrl} 
                          alt={price.brand} 
                          className="w-7 h-7 object-cover rounded border border-gray-200" 
                        />
                        {/* Previsualización grande al pasar el cursor */}
                        <div className="absolute left-10 top-0 z-[100] hidden group-hover:block animate-in fade-in zoom-in duration-200 origin-left">
                          <div className="p-1 bg-white rounded-lg shadow-xl border border-gray-200">
                            <img 
                              src={price.imageUrl} 
                              alt="Previsualización" 
                              className="w-48 h-auto min-h-[150px] max-h-60 object-contain rounded" 
                            />
                            <div className="p-1 text-[10px] font-bold text-gray-500 bg-gray-50 rounded-b border-t text-center">
                              Vista Previa: {price.brand} {price.model}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-7 h-7 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        <Car className="w-4 h-4" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-1 px-2 font-bold text-slate-800">
                    {price.brand}
                  </TableCell>
                  <TableCell className="py-1 px-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-indigo-700">
                        {price.model}
                      </span>
                      {price.year && (
                        <span className="text-[10px] text-gray-400 font-bold italic">
                          {price.year}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-1 px-2">
                    <Badge className={`${getSizeColor(price.size)} text-[11px] px-1.5 py-0`}>
                      {price.size}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1 px-2 text-gray-700 font-medium">{price.service}</TableCell>
                  <TableCell className="py-1 px-2 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <DollarSign className="w-3 h-3 text-green-600" />
                      <span className="font-bold text-green-700 text-sm">{price.price.toFixed(2)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-1 px-2 text-right">
                    <div className="flex justify-end gap-1">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(price)}
                          className="hover:bg-blue-100 hover:text-blue-700 h-6 w-6 p-0"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      )}
                      {onDelete && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="hover:bg-red-100 hover:text-red-700 h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará permanentemente el precio de{' '}
                                <strong>{price.service}</strong> para{' '}
                                <strong>{price.brand} ({price.size})</strong>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(price.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>


    </div>
  );
}