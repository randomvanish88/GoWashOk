import { useEffect, useState } from 'react';
import { Price } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, Save, X, Car, Ruler, Sparkles, DollarSign, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// IDs de carpetas de Drive por categoría de precio
const DRIVE_FOLDERS: Record<string, string> = {
  '25000': '1pMZDV3fMRP0GlUF1w4jNyaBXx5i-Bcn2', // $25000 3Y5 PUERTAS (subcarpeta real)
  '28000': '1ttmtRwdVNasvNB7II_4q-4UspNlmjEnk', // $28.000 5 PUERTAS (usar carpeta raíz por ahora)
  '30000': '1ttmtRwdVNasvNB7II_4q-4UspNlmjEnk', // $30.000 SUV CHI Y MED
  '35000': '1ttmtRwdVNasvNB7II_4q-4UspNlmjEnk', // $35.000 SUV GRANDES
  '40000': '1ttmtRwdVNasvNB7II_4q-4UspNlmjEnk', // $40.000 CAMIONETAS
  'default': '1ttmtRwdVNasvNB7II_4q-4UspNlmjEnk', // carpeta raíz vehiculos lavadero
};

declare global {
  interface Window {
    electronAPI: {
      getMachineId: () => Promise<string>;
      validateLicense: (key: string) => Promise<boolean>;
      selectImage: () => Promise<string | null>;
      uploadImageToDrive: (filePath: string, fileName: string, folderId: string) => Promise<{ success: boolean; fileId?: string; imageUrl?: string; error?: string }>;
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
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // En web: usar base64 como fallback (sin Drive)
    if (typeof window === 'undefined' || !(window as any).electronAPI?.uploadImageToDrive) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          setImageUrl(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
      return;
    }
    
    // En Electron: usar la ruta del archivo real provista por el input file
    setUploadingImage(true);
    toast.info('Subiendo imagen a Google Drive...');
    
    try {
      const realPath = (file as any).path;
      if (!realPath) {
        toast.error("No se pudo obtener la ruta de la imagen.");
        setUploadingImage(false);
        return;
      }
      const fileName = file.name || 'vehiculo.jpg';
      
      // Determinar carpeta de Drive según el precio
      const priceNum = price ? Math.round(parseFloat(price) / 1000) * 1000 : 0;
      const folderKey = Object.keys(DRIVE_FOLDERS).find(k => k === priceNum.toString()) || 'default';
      const folderId = DRIVE_FOLDERS[folderKey];

      const result = await (window as any).electronAPI.uploadImageToDrive(realPath, fileName, folderId);
      
      if (result.success && result.imageUrl) {
        setImageUrl(result.imageUrl);
        toast.success('Imagen subida a Google Drive correctamente');
      } else {
        toast.error('Error subiendo imagen: ' + (result.error || 'desconocido'));
      }
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSelectLocalImage = async () => {
    if (!(window as any).electronAPI?.uploadImageToDrive) {
      toast.error('Esta función requiere la versión desktop.');
      return;
    }

    setUploadingImage(true);
    toast.info('Seleccioná la imagen a subir...');

    try {
      const filePath = await (window as any).electronAPI.selectImage();
      if (!filePath) { setUploadingImage(false); return; }

      const realPath = filePath.replace('app-image://', '');
      const fileName = realPath.split('/').pop() || 'vehiculo.jpg';
      
      toast.info('Subiendo a Google Drive...');

      const priceNum = price ? Math.round(parseFloat(price) / 1000) * 1000 : 0;
      const folderKey = Object.keys(DRIVE_FOLDERS).find(k => k === priceNum.toString()) || 'default';
      const folderId = DRIVE_FOLDERS[folderKey];

      const result = await (window as any).electronAPI.uploadImageToDrive(realPath, fileName, folderId);

      if (result.success && result.imageUrl) {
        setImageUrl(result.imageUrl);
        toast.success('✅ Imagen subida a Google Drive. Disponible en web y desktop.');
      } else {
        toast.error('Error: ' + (result.error || 'desconocido'));
      }
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    // Guardar localmente y gatillar submit
    if (editingPrice) {
      onSubmit({ ...priceData, id: editingPrice.id });
    } else {
      onSubmit(priceData);
    }

    if (!editingPrice) resetForm();
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
        <div className="space-y-3 bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
          <Label className="flex items-center gap-2 text-orange-700 font-bold">
            <ImageIcon className="w-4 h-4" />
            Imagen del Vehículo
          </Label>
          <div className="flex flex-col gap-3">
            
            {/* Preview */}
            {imageUrl && (
              <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-orange-200">
                <img src={imageUrl} alt="Preview" className="w-16 h-16 object-cover rounded-md shadow-sm border border-orange-300" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs font-bold text-green-700">✅ Imagen cargada</span>
                  <span className="text-[9px] text-gray-500 truncate" title={imageUrl}>
                    {imageUrl.startsWith('https://lh3') ? 'Guardada en Google Drive' : 
                     imageUrl.startsWith('data:image') ? 'Vista previa local (Base64)' : 'Enlace directo'}
                  </span>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setImageUrl('')} className="ml-auto text-red-500 hover:bg-red-50">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Opción A: Archivo desde la PC */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">Opción A: Cargar archivo desde la PC</span>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploadingImage}
                  className="bg-white border-orange-300 text-xs h-9 cursor-pointer flex-1 file:bg-orange-50 file:text-orange-700 file:border-0 file:rounded-md file:text-[10px] file:font-black file:uppercase file:px-2 file:h-full file:mr-2 file:cursor-pointer"
                />
                
                {typeof window !== 'undefined' && (window as any).electronAPI?.uploadImageToDrive && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSelectLocalImage}
                    disabled={uploadingImage}
                    className="bg-white border-orange-400 text-orange-700 hover:bg-orange-100 border-2 font-black text-[10px] h-9 px-3"
                  >
                    📁 Examinar PC
                  </Button>
                )}
              </div>
            </div>

            {/* Opción B: Enlace directo */}
            <div className="space-y-1 pt-1 border-t border-orange-200/50">
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">Opción B: Pegar enlace de imagen directamente</span>
              <Input
                type="text"
                placeholder="Pegá la URL de la imagen aquí (ej. de Sheets o Drive)"
                value={imageUrl.startsWith('data:image') ? '' : imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="bg-white border-orange-300 text-xs h-9"
              />
            </div>
            
            <p className="text-[9px] text-orange-600 font-medium italic leading-tight">
              En la versión de escritorio, las imágenes de la PC se suben automáticamente a Google Drive.
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