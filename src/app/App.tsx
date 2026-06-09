import { useState, useEffect } from 'react';
import { PriceList } from './components/PriceList';
import { PriceForm } from './components/PriceForm';
import { SizeEditor } from './components/SizeEditor';
import { BrandEditor } from './components/BrandEditor';
import { POS } from './components/POS';
import { Gastos } from './components/Gastos';
import { Login } from './components/Login';
import { Card } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import { LogOut, User, Sparkles, Award, Users, Coffee, MapPin, Instagram, Settings, Upload } from 'lucide-react';
import { LicenseLock } from './components/LicenseLock';
import { googleSheetsSync } from './lib/googleSheetsSync';
import { GoogleSheetsSettings } from './components/GoogleSheetsSettings';
import { MigrarDatos } from './components/MigrarDatos';
import { UserPermissionsPanel } from './components/UserPermissionsPanel';
import { VirtualAssistant } from './components/VirtualAssistant';
import { restoreFromBackupIfNeeded, startAutoBackup } from './lib/dataBackup';
import { Toaster } from 'sonner';
import { MobileApp } from '../pwa/MobileApp';
import { sincronizarDesdeGoogleSheets, obtenerVehiculos } from '../services/vehiculosSync';
const logoImage = "./logo.png";

export interface Price {
  id: string;
  brand: string;
  model: string;
  year?: string;
  size: string;
  service: string;
  price: number;
  imageUrl?: string;
}

const DEFAULT_SIZES = ['Pequeño', 'Mediano', 'Grande', 'SUV', 'Camioneta', 'Van'];
const DEFAULT_BRANDS = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Mazda', 'Volkswagen', 'Hyundai', 'Kia', 'BMW', 'Mercedes-Benz', 'Audi'];

// ─── Panel de Configuración con sub-solapas ────────────────────────────────────
function ConfigPanel() {
  const [activeConfigTab, setActiveConfigTab] = useState<'sheets' | 'users' | 'migrate'>('sheets');

  return (
    <div className="space-y-4">
      {/* Sub-tabs de Configuración */}
      <div className="flex gap-2 p-1 bg-slate-800/60 rounded-2xl border border-slate-700/50 backdrop-blur-md w-fit flex-wrap">
        <button
          onClick={() => setActiveConfigTab('sheets')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
            activeConfigTab === 'sheets'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Google Sheets
        </button>
        <button
          onClick={() => setActiveConfigTab('migrate')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
            activeConfigTab === 'migrate'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Migrar Datos
        </button>
        <button
          onClick={() => setActiveConfigTab('users')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
            activeConfigTab === 'users'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Gestión de Usuarios
        </button>
      </div>

      {/* Contenido de la sub-solapa activa */}
      <div className="transition-all duration-300">
        {activeConfigTab === 'sheets' && (
          <GoogleSheetsSettings />
        )}
        {activeConfigTab === 'migrate' && (
          <MigrarDatos />
        )}
        {activeConfigTab === 'users' && (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-md p-6">
            <UserPermissionsPanel />
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [prices, setPrices] = useState<Price[]>([]);
  const [editingPrice, setEditingPrice] = useState<Price | null>(null);
  const [sizes, setSizes] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const isAdmin = user === 'admin';
  const [activeTab, setActiveTab] = useState('pos'); // Default to POS for workers
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLicensed, setIsLicensed] = useState(false);

  // Cargar datos desde localStorage
  useEffect(() => {
    const initializeApp = async () => {
      // Primero intentar restaurar desde backup si localStorage está vacío
      const restored = await restoreFromBackupIfNeeded();
      if (restored) {
        console.log('[GoWash] Datos restaurados desde backup. Recargando...');
        window.location.reload();
        return;
      }

      // Iniciar auto-backup periódico
      startAutoBackup();

      const savedLicense = localStorage.getItem('gowash-license-active');
      if (savedLicense === 'true') {
        setIsLicensed(true);
      }
      // La licencia solo aplica en Electron. En navegador (web/PWA) siempre está activa.
      if (typeof window !== 'undefined' && !window.electronAPI) {
        setIsLicensed(true);
      }
      const savedAuth = localStorage.getItem('gowash-auth');
      if (savedAuth) {
        const authData = JSON.parse(savedAuth);
        setIsAuthenticated(true);
        setUser(authData.username);
      }
      const savedPrices = localStorage.getItem('carwash-prices');
      const savedSizes = localStorage.getItem('carwash-sizes');
      const savedBrands = localStorage.getItem('carwash-brands');

      // Intentar sincronizar vehículos PRIMERO
      console.log('[GoWash] 🔄 Iniciando sincronización de vehículos...');
      try {
        const vehiculosSincronizados = await sincronizarDesdeGoogleSheets();
        console.log('[GoWash] 📊 Vehículos obtenidos:', vehiculosSincronizados.length);
        
        if (vehiculosSincronizados && vehiculosSincronizados.length > 0) {
          console.log(`[GoWash] ✅ Cargados ${vehiculosSincronizados.length} vehículos`);
          console.log('[GoWash] 📸 Primeros 3 con imágenes:');
          vehiculosSincronizados.slice(0, 3).forEach(v => {
            console.log(`  - ${v.brand} ${v.model}: ${v.imageUrl || 'SIN IMAGEN'}`);
          });
          setPrices(vehiculosSincronizados);
          localStorage.setItem('carwash-prices', JSON.stringify(vehiculosSincronizados));
        } else if (savedPrices) {
          console.log('[GoWash] ⚠️  Sin vehículos nuevos, usando cache');
          setPrices(JSON.parse(savedPrices));
        } else {
          throw new Error('No hay vehículos ni cache');
        }
      } catch (error) {
        console.error('[GoWash] ❌ Error en sincronización:', error);
        console.log('[GoWash] ℹ️  Usando cache de precios...');
        if (savedPrices) {
          setPrices(JSON.parse(savedPrices));
        } else {
          // Datos de ejemplo iniciales como último recurso
          const defaultPrices: Price[] = [
            { id: '1', brand: 'Toyota', model: '-', size: 'Pequeño', service: 'Lavado Básico', price: 15 },
            { id: '2', brand: 'Toyota', model: '-', size: 'Mediano', service: 'Lavado Básico', price: 20 },
            { id: '3', brand: 'Toyota', model: '-', size: 'Grande', service: 'Lavado Básico', price: 25 },
            { id: '4', brand: 'Honda', model: '-', size: 'Pequeño', service: 'Lavado Premium', price: 25 },
            { id: '5', brand: 'Ford', model: '-', size: 'SUV', service: 'Lavado Premium + Encerado', price: 50 },
          ];
          setPrices(defaultPrices);
          localStorage.setItem('carwash-prices', JSON.stringify(defaultPrices));
        }
      }

      if (savedSizes) {
        setSizes(JSON.parse(savedSizes));
      } else {
        setSizes(DEFAULT_SIZES);
        localStorage.setItem('carwash-sizes', JSON.stringify(DEFAULT_SIZES));
      }

      if (savedBrands) {
        setBrands(JSON.parse(savedBrands));
      } else {
        setBrands(DEFAULT_BRANDS);
        localStorage.setItem('carwash-brands', JSON.stringify(DEFAULT_BRANDS));
      }

      // Inicializar Google Sheets
      googleSheetsSync.init();
    };

    initializeApp();

    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail);
      }
    };
    window.addEventListener('navegar-a', handleNavigate);

    return () => {
      window.removeEventListener('navegar-a', handleNavigate);
    };
  }, []);

  // Guardar en localStorage cuando cambian los datos
  useEffect(() => {
    if (prices.length > 0) {
      localStorage.setItem('carwash-prices', JSON.stringify(prices));
    }
  }, [prices]);

  useEffect(() => {
    if (sizes.length > 0) {
      localStorage.setItem('carwash-sizes', JSON.stringify(sizes));
    }
  }, [sizes]);

  useEffect(() => {
    if (brands.length > 0) {
      localStorage.setItem('carwash-brands', JSON.stringify(brands));
    }
  }, [brands]);

  const handleAddPrice = (price: Omit<Price, 'id'>) => {
    const newPrice: Price = {
      ...price,
      id: Date.now().toString(),
    };
    setPrices([...prices, newPrice]);

    // Sincronizar con Google Sheets
    const isElectron = typeof window !== 'undefined' && (window as any).electronAPI?.googleSheets;
    if (isElectron) {
      const SPREADSHEET_ID = '1V6EmrQQIExA3UtAUeJsdAZESa1S5WiGQRAOsfHsQ6E8';
      (window as any).electronAPI.googleSheets.init(SPREADSHEET_ID).then(() => {
        return (window as any).electronAPI.googleSheets.addRow('PWA_Vehiculos', {
          Marca: newPrice.brand,
          Modelo: newPrice.model,
          'Tamaño': newPrice.size,
          Precio: newPrice.price,
          URL_Imagen: newPrice.imageUrl || '',
        });
      }).then(() => {
        console.log('[App] ✅ Vehículo nuevo sincronizado con Sheets (Electron)');
      }).catch((err: any) => {
        console.error('[App] Error sincronizando nuevo vehículo (Electron):', err);
      });
    } else {
      // Web: llamar a /api/pos-sync con action: 'upsert'
      fetch('/api/pos-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheet: 'PWA_Vehiculos',
          action: 'upsert',
          data: {
            brand: newPrice.brand,
            model: newPrice.model,
            size: newPrice.size,
            price: newPrice.price,
            imageUrl: newPrice.imageUrl || ''
          }
        })
      }).then(res => {
        if (res.ok) console.log('[App] ✅ Vehículo nuevo sincronizado con Sheets (Web)');
      }).catch(err => {
        console.error('[App] Error sincronizando nuevo vehículo (Web):', err);
      });
    }
  };

  const handleUpdatePrice = (updatedPrice: Price) => {
    setPrices(prices.map(p => p.id === updatedPrice.id ? updatedPrice : p));
    setEditingPrice(null);

    // Sincronizar actualización con Google Sheets
    const isElectron = typeof window !== 'undefined' && (window as any).electronAPI?.googleSheets;
    if (isElectron) {
      const SPREADSHEET_ID = '1V6EmrQQIExA3UtAUeJsdAZESa1S5WiGQRAOsfHsQ6E8';
      (window as any).electronAPI.googleSheets.init(SPREADSHEET_ID).then(() => {
        return (window as any).electronAPI.googleSheets.updateRow(
          'PWA_Vehiculos', 'Marca', updatedPrice.brand,
          {
            Marca: updatedPrice.brand,
            Modelo: updatedPrice.model,
            'Tamaño': updatedPrice.size,
            Precio: updatedPrice.price,
            URL_Imagen: updatedPrice.imageUrl || '',
          }
        );
      }).then(() => {
        console.log('[App] ✅ Vehículo actualizado en Sheets (Electron)');
      }).catch((err: any) => {
        console.error('[App] Error actualizando vehículo en Sheets (Electron):', err);
      });
    } else {
      // Web: llamar a /api/pos-sync con action: 'upsert'
      fetch('/api/pos-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheet: 'PWA_Vehiculos',
          action: 'upsert',
          data: {
            brand: updatedPrice.brand,
            model: updatedPrice.model,
            size: updatedPrice.size,
            price: updatedPrice.price,
            imageUrl: updatedPrice.imageUrl || ''
          }
        })
      }).then(res => {
        if (res.ok) console.log('[App] ✅ Vehículo actualizado en Sheets (Web)');
      }).catch(err => {
        console.error('[App] Error actualizando vehículo en Sheets (Web):', err);
      });
    }
  };

  const handleDeletePrice = (id: string) => {
    const priceToDelete = prices.find(p => p.id === id);
    setPrices(prices.filter(p => p.id !== id));

    if (priceToDelete) {
      const isElectron = typeof window !== 'undefined' && (window as any).electronAPI?.googleSheets;
      if (isElectron) {
        const SPREADSHEET_ID = '1V6EmrQQIExA3UtAUeJsdAZESa1S5WiGQRAOsfHsQ6E8';
        (window as any).electronAPI.googleSheets.init(SPREADSHEET_ID).then(() => {
          return (window as any).electronAPI.googleSheets.deleteRow(
            'PWA_Vehiculos', 'Marca', priceToDelete.brand, { model: priceToDelete.model }
          );
        }).then(() => {
          console.log('[App] ✅ Vehículo eliminado de Sheets (Electron)');
        }).catch((err: any) => {
          console.error('[App] Error eliminando vehículo de Sheets (Electron):', err);
        });
      } else {
        // Web: llamar a /api/pos-sync con action: 'delete'
        fetch('/api/pos-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sheet: 'PWA_Vehiculos',
            action: 'delete',
            data: {
              brand: priceToDelete.brand,
              model: priceToDelete.model
            }
          })
        }).then(res => {
          if (res.ok) console.log('[App] ✅ Vehículo eliminado de Sheets (Web)');
        }).catch(err => {
          console.error('[App] Error eliminando vehículo de Sheets (Web):', err);
        });
      }
    }
  };

  const handleMovePrice = (id: string, direction: 'up' | 'down') => {
    const index = prices.findIndex(p => p.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= prices.length) return;

    const newPrices = [...prices];
    [newPrices[index], newPrices[newIndex]] = [newPrices[newIndex], newPrices[index]];
    setPrices(newPrices);
  };

  const handleEditPrice = (price: Price) => {
    setEditingPrice(price);
    setActiveTab('add');
  };

  const handleCancelEdit = () => {
    setEditingPrice(null);
  };

  // Handlers para tamaños
  const handleAddSize = (size: string) => {
    setSizes([...sizes, size]);
  };

  const handleEditSize = (oldSize: string, newSize: string) => {
    setSizes(sizes.map(s => s === oldSize ? newSize : s));
  };

  const handleDeleteSize = (size: string) => {
    setSizes(sizes.filter(s => s !== size));
  };

  // Handlers para marcas
  const handleAddBrand = (brand: string) => {
    setBrands([...brands, brand]);
  };

  const handleEditBrand = (oldBrand: string, newBrand: string) => {
    setBrands(brands.map(b => b === oldBrand ? newBrand : b));
  };

  const handleDeleteBrand = (brand: string) => {
    setBrands(brands.filter(b => b !== brand));
  };

  const handleLogin = (username: string) => {
    setIsAuthenticated(true);
    setUser(username);
    localStorage.setItem('gowash-auth', JSON.stringify({ username, timestamp: Date.now() }));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('gowash-auth');
  };

  const onLoginSuccess = (username: string) => {
    handleLogin(username);
    setShowLoginModal(false);
  };

  // Si no está autenticado, simplemente mostramos la app con restricciones
  // Eliminamos el bloqueo total anterior
  const handleOpenLogin = () => setShowLoginModal(true);

  const [isMobile, setIsMobile] = useState(() => {
    // Detectar móvil en el render inicial para evitar flash de la app de escritorio
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      // Detecta móvil si el ancho es menor a 768px
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return (
      <MobileApp 
        user={user} 
        onLogout={handleLogout} 
        onLogin={handleLogin} 
      />
    );
  }

  if (!isLicensed) {
    return <LicenseLock onActivated={() => setIsLicensed(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 p-4 md:p-8 selection:bg-cyan-500/30 relative overflow-x-hidden">
      {/* Decorative Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 px-4 md:px-6">
        {/* Header Compacto y Profesional con contraste mejorado */}
        <header className="mb-4 relative bg-slate-800/50 backdrop-blur-2xl rounded-2xl py-2 px-6 border border-white/10 border-t-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Decorative Gradient Line */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 group cursor-default transition-transform duration-500 hover:scale-105">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full blur opacity-20 group-hover:opacity-60 transition duration-1000"></div>
                <img 
                  src={logoImage} 
                  alt="GoWash Logo"
                  className="relative h-10 w-auto object-contain transition-transform duration-500 group-hover:rotate-12"
                />
              </div>
              <div className="flex flex-col -space-y-1">
                <h1 className="text-xl md:text-2xl font-black tracking-tighter bg-gradient-to-b from-white via-white to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  GOWASH
                </h1>
                <span className="text-[7px] font-black text-blue-500 uppercase tracking-[0.3em] pl-0.5">
                  Lavadero Artesanal
                </span>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-2">
              <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
              <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/5 border border-blue-500/10 rounded-full text-[9px] font-bold text-blue-400/80 uppercase tracking-widest">
                <Sparkles className="w-2.5 h-2.5" /> Lavado Artesanal
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/5 border border-purple-500/10 rounded-full text-[9px] font-bold text-purple-400/80 uppercase tracking-widest">
                <Award className="w-2.5 h-2.5" /> Premium
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/5 border border-amber-500/10 rounded-full text-[9px] font-bold text-amber-400/80 uppercase tracking-widest">
                <Coffee className="w-2.5 h-2.5" /> Bar
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/5 border border-emerald-500/10 rounded-full text-[9px] font-bold text-emerald-400/80 uppercase tracking-widest">
                <Users className="w-2.5 h-2.5" /> Cosmética/Accesorios
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                  isAdmin
                    ? 'bg-purple-500/10 border-purple-500/20'
                    : user === 'supervisor'
                    ? 'bg-blue-500/10 border-blue-500/20'
                    : 'bg-emerald-500/10 border-emerald-500/20'
                }`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    isAdmin ? 'bg-purple-400' : user === 'supervisor' ? 'bg-blue-400' : 'bg-emerald-400'
                  }`} />
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">{user}</span>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
                    isAdmin
                      ? 'bg-purple-500/20 text-purple-300'
                      : user === 'supervisor'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {isAdmin ? 'Admin' : user === 'supervisor' ? 'Supervisor' : 'Empleado'}
                  </span>
                </div>
                <Button 
                  onClick={handleLogout} 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-400 hover:text-red-400 hover:bg-red-400/5 h-8 px-3 text-[10px] font-bold uppercase tracking-wider transition-colors"
                >
                  <LogOut className="w-3 h-3 mr-2" />
                  Salir
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleOpenLogin} 
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-6 h-9 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-500/10 transition-all hover:shadow-blue-500/20 active:scale-95"
              >
                Iniciar Sesión
              </Button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full max-w-5xl mx-auto ${isAdmin ? 'grid-cols-3 md:grid-cols-7' : 'grid-cols-3 md:grid-cols-3'} bg-white shadow-lg`}>
            <TabsTrigger value="pos">Punto de Venta</TabsTrigger>
            <TabsTrigger value="gastos">Gastos</TabsTrigger>
            {isAdmin && <TabsTrigger value="list">Lista de Precios</TabsTrigger>}
            {isAdmin && <TabsTrigger value="add">Editar Precios</TabsTrigger>}
            {isAdmin && <TabsTrigger value="sizes">Tamaños</TabsTrigger>}
            {isAdmin && <TabsTrigger value="brands">Marcas</TabsTrigger>}
            
            {isAdmin && (
              <TabsTrigger value="settings" title="Configuración de Google Sheets" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>Config</span>
              </TabsTrigger>
            )}
          </TabsList>

          {isAdmin && (
            <>
              <TabsContent value="list">
                <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <PriceList
                    prices={prices}
                    onEdit={handleEditPrice}
                    onDelete={handleDeletePrice}
                    onMove={handleMovePrice}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="add">
                <Card className="p-6 max-w-2xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <PriceForm
                    onSubmit={editingPrice ? handleUpdatePrice : handleAddPrice}
                    onCancel={editingPrice ? handleCancelEdit : undefined}
                    editingPrice={editingPrice}
                    sizes={sizes}
                    brands={brands}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="sizes">
                <Card className="p-6 max-w-4xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <SizeEditor
                    sizes={sizes}
                    onAddSize={handleAddSize}
                    onEditSize={handleEditSize}
                    onDeleteSize={handleDeleteSize}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="brands">
                <Card className="p-6 max-w-5xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <BrandEditor
                    brands={brands}
                    onAddBrand={handleAddBrand}
                    onEditBrand={handleEditBrand}
                    onDeleteBrand={handleDeleteBrand}
                  />
                </Card>
              </TabsContent>
            </>
          )}

          <TabsContent value="pos">
            <POS prices={prices} isAdmin={isAdmin} onNavigateToPrices={() => setActiveTab('add')} />
          </TabsContent>

          <TabsContent value="gastos">
            <Gastos isAdmin={isAdmin} />
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="settings">
              <ConfigPanel />
            </TabsContent>
          )}
        </Tabs>

        {/* Sección de Contacto y Redes */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center border-t border-white/5 pt-16">
          {/* Ubicación */}
          <a 
            href="https://maps.app.goo.gl/546T1kAsif8sdcBWA" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center md:items-start gap-4 group cursor-pointer"
          >
            <div className="flex items-center gap-6">
              <div className="p-5 bg-blue-500/10 rounded-2xl border border-blue-400/20 group-hover:bg-blue-500/20 transition-all duration-500 shadow-[0_0_30px_rgba(59,130,246,0.1)] group-hover:scale-110">
                <MapPin className="w-10 h-10 text-blue-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-black text-xl tracking-tight">Nuestra Ubicación</h4>
                <p className="text-slate-400 text-sm font-medium"> Ingeniero Madero (Ruta 26)y Panamericana, Del Viso - Pilar </p>
                <p className="text-blue-400/60 text-[10px] font-bold uppercase tracking-widest hover:text-blue-400 transition-colors">Ver en Google Maps</p>
              </div>
            </div>
          </a>

          {/* Redes Sociales */}
          <a 
            href="https://www.instagram.com/gowashpilar?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center md:items-end gap-4 group cursor-pointer"
          >
            <div className="flex items-center gap-6">
              <div className="text-right hidden md:block space-y-1">
                <h4 className="text-white font-black text-xl tracking-tight">Seguinos</h4>
                <p className="text-slate-400 text-sm font-medium">@gowashpilar</p>
                <p className="text-pink-400/60 text-[10px] font-bold uppercase tracking-widest group-hover:text-pink-400 transition-colors">Ver Instagram</p>
              </div>
              <div className="p-5 bg-gradient-to-tr from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-2xl border border-purple-400/20 group-hover:from-purple-500/20 group-hover:via-pink-500/20 group-hover:to-orange-500/20 transition-all duration-500 shadow-[0_0_30px_rgba(168,85,247,0.1)] group-hover:scale-110">
                <Instagram className="w-10 h-10 text-pink-400" />
              </div>
              <div className="md:hidden space-y-1 text-center">
                <h4 className="text-white font-black text-xl tracking-tight">Seguinos</h4>
                <p className="text-slate-400 text-sm font-medium">@gowashpilar</p>
              </div>
            </div>
          </a>
        </div>

        {/* Footer */}
        <footer className="mt-20 py-10 border-t border-white/10 flex items-center justify-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-yellow-400/20 blur-lg rounded-full group-hover:bg-yellow-400/40 transition-colors"></div>
            <img 
              src="./copyright.png" 
              alt="Copyright Seal" 
              className="w-10 h-10 relative z-10 mix-blend-screen brightness-125 contrast-125" 
            />
          </div>
          <p className="text-slate-400 text-xs md:text-sm font-medium tracking-widest uppercase">
            copyright 2026 <span className="text-blue-400 font-bold">&lt;Gauna Agustin-Developer- Randomvanish88@gmail.com &gt;</span>
          </p>
        </footer>

        {/* Login Modal */}
        <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
          <DialogContent className="sm:max-w-md bg-transparent border-0 p-0 overflow-hidden">
            <Login onLogin={onLoginSuccess} />
          </DialogContent>
        </Dialog>
        {/* Asistente Virtual */}
        <VirtualAssistant />
        {/* Notificaciones Fluídas */}
        <Toaster position="top-right" richColors closeButton />
      </div>
    </div>
  );
}

export default App;