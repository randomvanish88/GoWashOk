import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MessageCircle, X, Send, Sparkles, HelpCircle, Car, Coffee, ShieldCheck, Info } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const KNOWLEDGE_BASE = [
  {
    keywords: ['venta', 'cobrar', 'registrar', 'lavadero'],
    response: "Para registrar una venta: 1. Ve a la pestaña 'Punto de Venta'. 2. Busca el vehículo o ingresa los datos. 3. Haz clic en el botón 'Cobrar' dentro de la tarjeta del vehículo en 'Vehículos en lavadero'."
  },
  {
    keywords: ['empleado', 'consumo', 'liquida', 'cuenta'],
    response: "Para el consumo de empleados: Ve a la pestaña 'Consumo Empleados'. Selecciona el nombre del empleado a la izquierda, añade los productos del bar y haz clic en 'Liquidar Cuenta Final'."
  },
  {
    keywords: ['gasto', 'egreso', 'dinero', 'pagar'],
    response: "Para registrar un gasto: Entra en la pestaña 'Gastos'. Completa la categoría, monto y descripción, luego pulsa 'Registrar Gasto'. Recuerda que para borrar gastos necesitas ser Admin."
  },
  {
    keywords: ['anular', 'borrar', 'eliminar', 'venta'],
    response: "Para anular una venta: En el registro diario (abajo en el POS), busca la venta y dale a 'Eliminar'. El sistema te pedirá un motivo obligatorio para el registro de auditoría."
  },
  {
    keywords: ['admin', 'clave', 'contraseña', 'configuracion'],
    response: "Las funciones de Admin se activan desde la pestaña 'Config'. Allí puedes ingresar tu clave para habilitar el Log de Auditoría y la eliminación de registros críticos."
  },
  {
    keywords: ['prueba', 'google', 'sheets', 'sincronizar'],
    response: "El Modo Prueba se activa en 'Config'. Permite enviar los datos a una hoja secundaria para no afectar tus registros reales mientras testeas el programa."
  },
  {
    keywords: ['soporte', 'ayuda', 'tecnico', 'problema', 'fallo', 'error'],
    response: "Si tienes un problema técnico o necesitas una función nueva, contacta a Soporte: \n📧 Email: Randomvanish88@gmail.com\n📱 Instagram: @gowashpilar\nDesarrollador: Agustin Gauna."
  }
];

export function VirtualAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy tu asistente de GoWash. ¿En qué puedo ayudarte hoy?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Buscar respuesta
    setTimeout(() => {
      const lowerInput = input.toLowerCase();
      const match = KNOWLEDGE_BASE.find(k => 
        k.keywords.some(kw => lowerInput.includes(kw))
      );

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: match 
          ? match.response 
          : "Lo siento, no entiendo esa consulta específica. Prueba preguntando sobre 'ventas', 'gastos', 'empleados' o 'anulaciones'.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 600);
  };

  const handleQuickAction = (text: string) => {
    setInput(text);
    // Un pequeño delay para que se vea natural
    setTimeout(() => {
      const btn = document.getElementById('btn-send-ai');
      btn?.click();
    }, 100);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
      {/* Ventana de Chat */}
      {isOpen && (
        <Card className="w-[350px] md:w-[400px] h-[500px] shadow-2xl border-white/20 bg-slate-900/95 backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
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
                  En línea ahora
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Cuerpo de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias Rápidas */}
          <div className="p-2 bg-slate-800/50 border-t border-slate-700">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 px-2 flex items-center gap-1">
              <Info className="w-3 h-3" /> Sugerencias
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Registrar Venta', icon: <Car className="w-3 h-3" /> },
                { label: 'Consumo Empleados', icon: <Coffee className="w-3 h-3" /> },
                { label: 'Soporte Técnico', icon: <Sparkles className="w-3 h-3" /> },
                { label: 'Acceso Admin', icon: <ShieldCheck className="w-3 h-3" /> }
              ].map(action => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.label)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-700/50 hover:bg-blue-600/30 border border-slate-600 rounded-full text-[10px] font-medium text-slate-300 transition-colors"
                >
                  {action.icon} {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 bg-slate-900 border-t border-slate-700 flex gap-2">
            <Input 
              placeholder="Escribe tu duda..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="bg-slate-800 border-slate-700 text-white text-xs h-10"
            />
            <Button 
              id="btn-send-ai"
              size="icon" 
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700 h-10 w-10 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Botón Lanzador Divertido */}
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
            {/* Animación de Burbujas/Brillos */}
            <Sparkles className="absolute -top-4 -right-2 w-6 h-6 text-yellow-300 animate-pulse" />
            <Sparkles className="absolute top-2 -left-4 w-4 h-4 text-blue-200 animate-bounce" style={{ animationDelay: '0.5s' }} />
            
            <Car className="w-10 h-10 text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.5)] group-hover:translate-x-1 transition-transform" />
            
            <span className="text-[7px] font-black text-white/90 uppercase tracking-tight mt-1">Agus-Asist.</span>
          </div>
        )}
        
        {/* Efecto de luz pasando por el botón */}
        {!isOpen && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />
        )}
      </Button>
    </div>
  );
}
