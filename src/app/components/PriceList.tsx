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
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar por marca, servicio o tamaño..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-purple-200 focus:border-purple-400"
          />
        </div>

        {/* Filtro por Marca */}
        <Select value={filterBrand} onValueChange={setFilterBrand}>
          <SelectTrigger className="w-full md:w-48 border-blue-200 focus:border-blue-400">
            <SelectValue placeholder="Filtrar por marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las marcas</SelectItem>
            {uniqueBrands.map(brand => (
              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro por Tamaño */}
        <Select value={filterSize} onValueChange={setFilterSize}>
          <SelectTrigger className="w-full md:w-48 border-pink-200 focus:border-pink-400">
            <SelectValue placeholder="Filtrar por tamaño" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tamaños</SelectItem>
            {uniqueSizes.map(size => (
              <SelectItem key={size} value={size}>{size}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabla de precios */}
      <div className="rounded-lg border border-purple-200 overflow-hidden shadow-md">
        <Table>
          <TableHeader className="bg-gradient-to-r from-blue-500 to-purple-500">
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="text-white w-16">Orden</TableHead>
              <TableHead className="text-white w-16">Ref</TableHead>
              <TableHead className="text-white">Marca</TableHead>
              <TableHead className="text-white">Modelo</TableHead>
              <TableHead className="text-white">Tamaño</TableHead>
              <TableHead className="text-white">Servicio</TableHead>
              <TableHead className="text-right text-white">Precio</TableHead>
              <TableHead className="text-right text-white">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                  No se encontraron precios
                </TableCell>
              </TableRow>
            ) : (
              filteredPrices.map((price, index) => (
                <TableRow 
                  key={price.id}
                  className={index % 2 === 0 ? 'bg-purple-50/30' : 'bg-white'}
                >
                  <TableCell>
                    <div className="flex flex-col items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!onMove || index === 0 && searchTerm === '' && filterSize === 'all' && filterBrand === 'all'}
                        onClick={() => onMove && onMove(price.id, 'up')}
                        className="h-6 w-6 p-0 hover:bg-blue-100"
                        title="Subir"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!onMove || index === filteredPrices.length - 1 && searchTerm === '' && filterSize === 'all' && filterBrand === 'all'}
                        onClick={() => onMove && onMove(price.id, 'down')}
                        className="h-6 w-6 p-0 hover:bg-blue-100"
                        title="Bajar"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {price.imageUrl ? (
                      <div className="relative group w-fit cursor-zoom-in">
                        <img 
                          src={price.imageUrl} 
                          alt={price.brand} 
                          className="w-10 h-10 object-cover rounded shadow-sm border border-gray-200 transition-transform hover:scale-110" 
                        />
                        {/* Previsualización grande al pasar el cursor */}
                        <div className="absolute left-14 top-0 z-[100] hidden group-hover:block animate-in fade-in zoom-in duration-200 origin-left">
                          <div className="p-1 bg-white rounded-xl shadow-2xl border border-gray-200">
                            <img 
                              src={price.imageUrl} 
                              alt="Previsualización" 
                              className="w-64 h-auto min-h-[200px] max-h-80 object-contain rounded-lg" 
                            />
                            <div className="p-2 text-xs font-bold text-gray-500 bg-gray-50 rounded-b-lg border-t text-center">
                              Vista Previa: {price.brand} {price.model}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        <Car className="w-5 h-5" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {price.brand}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="bg-white text-indigo-700 border-indigo-200 w-fit">
                        {price.model}
                      </Badge>
                      {price.year && (
                        <span className="text-[10px] text-gray-400 font-bold ml-1 italic">
                          Año: {price.year}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSizeColor(price.size)}>
                      {price.size}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-700">{price.service}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-700">{price.price.toFixed(2)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(price)}
                          className="hover:bg-blue-100 hover:text-blue-700"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="hover:bg-red-100 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vehículos Lavados Hoy */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg p-6 shadow-lg flex flex-col justify-center items-center relative overflow-hidden">
          <Car className="absolute w-24 h-24 text-white opacity-20 -right-4 -bottom-4" />
          <div className="text-lg font-medium opacity-90 z-10">Vehículos Ingresados Hoy</div>
          <div className="text-5xl font-extrabold z-10 mt-2">
            {vehiclesToday}
          </div>
        </div>

        {/* Imagen 3D Animada/Premium */}
        <div className="rounded-lg shadow-lg overflow-hidden h-32 md:h-40 relative group bg-black">
          <img 
            src="./car_wash_3d.png" 
            alt="GoWash 3D Render" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4 pointer-events-none">
             <span className="text-white font-bold text-lg drop-shadow-md tracking-wide">Servicio Premium</span>
          </div>
        </div>
      </div>
    </div>
  );
}