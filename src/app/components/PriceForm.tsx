import { useEffect, useState } from 'react';
import { Price } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, Save, X, Car, Ruler, Sparkles, DollarSign, Image as ImageIcon, FolderOpen } from 'lucide-react';

declare global {
  interface Window {
    electronAPI: {
      getMachineId: () => Promise<string>;
      validateLicense: (key: string) => Promise<boolean>;
      selectImage: () => Promise<string | null>;
    };
  }
}

interface PriceFormProps {
  onSubmit: (price: Omit<Price, 'id'> | Price) => void;
  onCancel?: () => void;
  editingPrice?: Price | null;
  sizes: string[];
  brands: string[];
}

const SERVICES = [
  'Lavado Básico',
  'Lavado Premium',
  'Lavado Completo',
  'Lavado + Aspirado',
  'Lavado + Encerado',
  'Lavado Premium + Encerado',
  'Detallado Interior',
  'Detallado Exterior',
  'Detallado Completo',
  'Pulido',
  'Limpieza de Motor'
];

export function PriceForm({ onSubmit, onCancel, editingPrice, sizes, brands }: PriceFormProps) {
  const [brand, setBrand] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [size, setSize] = useState('');
  const [service, setService] = useState('');
  const [customService, setCustomService] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (editingPrice) {
      setBrand(editingPrice.brand);
      setCustomBrand('');
      setModel(editingPrice.model);
      setYear(editingPrice.year || '');
      setSize(editingPrice.size);
      setService(editingPrice.service);
      setCustomService('');
      setPrice(editingPrice.price.toString());
      setImageUrl(editingPrice.imageUrl || '');
    } else {
      resetForm();
    }
  }, [editingPrice, brands]);

  const resetForm = () => {
    setBrand('');
    setCustomBrand('');
    setModel('');
    setYear('');
    setSize('');
    setService('');
    setCustomService('');
    setPrice('');
    setImageUrl('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 200; // Resize width to 200px to avoid large base64 strings
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setImageUrl(dataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectLocalImage = async () => {
    if (window.electronAPI?.selectImage) {
      const path = await window.electronAPI.selectImage();
      if (path) {
        setImageUrl(path);
      }
    } else {
      alert('Esta función solo está disponible en la versión de escritorio.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!brand || !model) {
      alert("Por favor completa al menos la Marca y el Modelo del vehículo.");
      return;
    }

    const priceData = {
      brand: brand,
      model,
      year: year || undefined,
      size: size || 'No especificado',
      service: service || 'Sin especificar',
      price: price ? parseFloat(price) : 0,
      imageUrl: imageUrl || undefined,
    };

    if (editingPrice) {
      onSubmit({ ...priceData, id: editingPrice.id });
    } else {
      onSubmit(priceData);
      resetForm();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-3 mb-2">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {editingPrice ? 'Editar Precio' : 'Agregar Nuevo Precio'}
        </h2>
        <p className="text-gray-600">
          Complete los datos del servicio y su precio correspondiente
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Marca */}
        <div className="space-y-2 bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
          <Label htmlFor="brand" className="flex items-center gap-2 text-blue-700">
            <Car className="w-4 h-4" />
            Marca del Vehículo
          </Label>
          <Input
            id="brand"
            list="brand-options"
            placeholder="Ej: Toyota, Ford, Honda..."
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
            className="bg-white border-blue-300"
          />
          <datalist id="brand-options">
            {brands.map(b => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </div>
        
        {/* Modelo */}
        <div className="space-y-4 bg-indigo-50 p-4 rounded-lg border-2 border-indigo-200">
          <div className="space-y-2">
            <Label htmlFor="model" className="flex items-center gap-2 text-indigo-700">
              <Car className="w-4 h-4" />
              Modelo del Vehículo
            </Label>
            <Input
              id="model"
              placeholder="Ej: Hilux, Civic, Focus..."
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
              className="bg-white border-indigo-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year" className="flex items-center gap-2 text-indigo-700 font-medium">
              Año (Opcional)
            </Label>
            <Input
              id="year"
              placeholder="Ej: 2020, 2024..."
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-white border-indigo-300"
            />
          </div>
        </div>

        {/* Tamaño */}
        <div className="space-y-2 bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
          <Label htmlFor="size" className="flex items-center gap-2 text-purple-700">
            <Ruler className="w-4 h-4" />
            Tamaño del Vehículo (Opcional)
          </Label>
          <Input
            id="size"
            list="size-options"
            placeholder="Ej: Pequeño, Mediano, SUV..."
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="bg-white border-purple-300"
          />
          <datalist id="size-options">
            {sizes.map(s => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        {/* Servicio */}
        <div className="space-y-2 bg-pink-50 p-4 rounded-lg border-2 border-pink-200">
          <Label htmlFor="service" className="flex items-center gap-2 text-pink-700">
            <Sparkles className="w-4 h-4" />
            Tipo de Servicio (Opcional)
          </Label>
          <Input
            id="service"
            list="service-options"
            placeholder="Ej: Lavado Básico, Detallado..."
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="bg-white border-pink-300"
          />
          <datalist id="service-options">
            {SERVICES.map(s => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        {/* Precio */}
        <div className="space-y-2 bg-green-50 p-4 rounded-lg border-2 border-green-200">
          <Label htmlFor="price" className="flex items-center gap-2 text-green-700">
            <DollarSign className="w-4 h-4" />
            Precio ($) (Opcional)
          </Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="bg-white border-green-300"
          />
        </div>

        {/* Imagen de Referencia */}
        <div className="space-y-2 bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
          <Label htmlFor="imageUpload" className="flex items-center gap-2 text-orange-700">
            <ImageIcon className="w-4 h-4" />
            Imagen de Referencia
          </Label>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="bg-white border-orange-300 file:bg-orange-100 file:text-orange-700 file:border-0 file:rounded file:px-2 file:py-1 hover:file:bg-orange-200"
              />
              {imageUrl && (
                <img src={imageUrl} alt="Preview" className="w-12 h-12 object-cover rounded-md shadow-sm border border-orange-300" />
              )}
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-orange-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-orange-50 px-2 text-orange-500 font-bold">O</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              onClick={handleSelectLocalImage}
              className="w-full bg-white border-orange-300 text-orange-700 hover:bg-orange-100 border-2"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Seleccionar Carpeta/Imagen de la PC
            </Button>
            <p className="text-[10px] text-orange-600 font-medium italic">
              * Ideal para usar imágenes ya guardadas en tus carpetas locales.
            </p>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 justify-end pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="border-2">
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        )}
        <Button 
          type="submit"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
        >
          {editingPrice ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Actualizar Precio
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Precio
            </>
          )}
        </Button>
      </div>
    </form>
  );
}