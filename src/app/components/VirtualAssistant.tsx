import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { MessageCircle, X, Sparkles, Car, Coffee, ShieldCheck, Info, DollarSign, Download } from 'lucide-react';

const QUICK_ACTIONS = [
  { label: 'Registrar Venta', icon: <Car className="w-3 h-3" />, action: 'venta' },
  { label: 'Consumo Empleados', icon: <Coffee className="w-3 h-3" />, action: 'consumo' },
  { label: 'Apertura y Cierre de Caja', icon: <DollarSign className="w-3 h-3" />, action: 'caja' },
  { label: 'Actualizaciones', icon: <Download className="w-3 h-3" />, action: 'updates' },
  { label: 'Soporte Técnico', icon: <Sparkles className="w-3 h-3" />, action: 'soporte' },
  { label: 'Acceso Admin', icon: <ShieldCheck className="w-3 h-3" />, action: 'admin' }
];

const VERSION_CHANGES = {
  '0.0.6': [
    '✅ Mejorada visibilidad del header de cierre de caja',
    '✅ Reorganización de datos de venta (Hora entrada, Hora salida, Patente)',
    '✅ Solución del scroll automático al editar',
    '✅ Reorganización de controles de precio y stock',
    '✅ Reducción de tamaño de botones de agregar'
  ],
  '0.0.5': [
    '✅ Implementación de inicio y cierre de caja',
    '✅ Cálculo correcto de total esperado',
    '✅ Arqueo de billetes mejorado'
  ]
};

export function VirtualAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleActionClick = (action: string) => {
    setSelectedAction(action);
  };

  const getActionContent = () => {
    switch(selectedAction) {
      case 'venta':
        return {
          title: 'Registrar Venta',
          content: 'Para registrar una venta:\n1. Ve a la pestaña "Punto de Venta"\n2. Busca el vehículo o ingresa los datos\n3. Haz clic en el botón "Cobrar" dentro de la tarjeta del vehículo'
        };
      case 'consumo':
        return {
          title: 'Consumo Empleados',
          content: 'Para el consumo de empleados:\n1. Ve a la pestaña "Consumo Empleados"\n2. Selecciona el nombre del empleado a la izquierda\n3. Añade los productos del bar\n4. Haz clic en "Liquidar Cuenta Final"'
        };
      case 'caja':
        return {
          title: 'Apertura y Cierre de Caja',
          content: 'Para gestionar la caja:\n1. Apertura: Ve a "Cierre de Caja" y selecciona la pestaña "Inicio de Caja"\n2. Ingresa el monto inicial en efectivo\n3. Cierre: Completa el arqueo de billetes y haz clic en "Cerrar caja y enviar a la nube"'
        };
      case 'updates':
        return {
          title: 'Actualizaciones',
          content: `Versión Actual: 0.0.6\n\n${VERSION_CHANGES['0.0.6'].join('\n')}\n\nVersiones Anteriores:\n${VERSION_CHANGES['0.0.5'].join('\n')}`
        };
      case 'soporte':
        return {
          title: 'Soporte Técnico',
          content: 'Si tienes un problema técnico o necesitas una función nueva:\n📧 Email: Randomvanish88@gmail.com\n📱 Instagram: @gowashpilar\nDesarrollador: Agustin Gauna'
        };
      case 'admin':
        return {
          title: 'Acceso Admin',
          content: 'Las funciones de Admin se activan desde la pestaña "Config".\nAllí puedes ingresar tu clave para habilitar:\n• Log de Auditoría\n• Eliminación de registros críticos\n• Modo Prueba'
        };
      default:
        return {
          title: 'Accesos Directos',
          content: 'Selecciona una opción para obtener más información'
        };
    }
  };

  const content = getActionContent();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
      {/* Ventana de Accesos Directos */}
      {isOpen && (
        <Card className="w-[350px] md:w-[400px] shadow-2xl border-white/20 bg-slate-900/95 backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Agus-Asist.</h3>
                <p className="text-[10px] text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  Accesos Directos
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setIsOpen(false); setSelectedAction(null); }} className="text-white hover:bg-white/10">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedAction ? (
              <div className="space-y-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedAction(null)}
                  className="text-blue-400 hover:text-blue-300 mb-2"
                >
                  ← Volver
                </Button>
                <div>
                  <h4 className="font-bold text-white text-sm mb-3">{content.title}</h4>
                  <p className="text-slate-300 text-xs whitespace-pre-line leading-relaxed">{content.content}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Accesos Directos
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_ACTIONS.map(action => (
                    <button
                      key={action.label}
                      onClick={() => handleActionClick(action.action)}
                      className="flex flex-col items-center gap-2 p-3 bg-slate-800/50 hover:bg-blue-600/30 border border-slate-600 rounded-lg text-[10px] font-medium text-slate-300 transition-colors hover:text-white"
                    >
                      {action.icon}
                      <span className="text-center">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Botón Lanzador */}
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-20 h-20 rounded-full shadow-[0_10px_40px_rgba(59,130,246,0.4)] transition-all duration-500 flex items-center justify-center border-4 border-white/20 group relative overflow-hidden ${
          isOpen 
            ? 'bg-slate-800 rotate-90' 
            : 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 hover:scale-110 active:scale-95'
        }`}
      >
        {isOpen ? (
          <X className="w-10 h-10 text-white" />
        ) : (
          <div className="relative flex flex-col items-center">
            <Sparkles className="absolute -top-4 -right-2 w-6 h-6 text-yellow-300 animate-pulse" />
            <Sparkles className="absolute top-2 -left-4 w-4 h-4 text-blue-200 animate-bounce" style={{ animationDelay: '0.5s' }} />
            
            <Car className="w-10 h-10 text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.5)] group-hover:translate-x-1 transition-transform" />
            
            <span className="text-[7px] font-black text-white/90 uppercase tracking-tight mt-1">Agus-Asist.</span>
          </div>
        )}
        
        {!isOpen && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />
        )}
      </Button>
    </div>
  );
}
