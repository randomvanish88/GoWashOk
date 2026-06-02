import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  User,
  Edit2,
  Trash2,
  Save,
  X,
  Shield,
  Eye,
  EyeOff,
  Key,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

// ─── Tipos ─────────────────────────────────────────────────────────────────────
export interface UserPermissions {
  // Acceso a secciones
  accesoPOS: boolean;
  accesoGastos: boolean;
  accesoListaPrecios: boolean;
  accesoEditarPrecios: boolean;
  accesoTamanios: boolean;
  accesoMarcas: boolean;
  accesoConfig: boolean;
  // Poderes en POS
  puedeEditarVentas: boolean;
  puedeEliminarVentas: boolean;
  puedeVerCierreCaja: boolean;
  puedeVerAuditoria: boolean;
  puedeAplicarDescuentos: boolean;
  puedeVerRegistro: boolean;
  // Poderes en Gastos
  puedeEditarGastos: boolean;
  puedeEliminarGastos: boolean;
}

export interface AppUser {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'supervisor' | 'empleado' | 'custom';
  displayName: string;
  active: boolean;
  permissions: UserPermissions;
  createdAt: string;
}

// ─── Permisos predeterminados por rol ──────────────────────────────────────────
const PERMISOS_ADMIN: UserPermissions = {
  accesoPOS: true,
  accesoGastos: true,
  accesoListaPrecios: true,
  accesoEditarPrecios: true,
  accesoTamanios: true,
  accesoMarcas: true,
  accesoConfig: true,
  puedeEditarVentas: true,
  puedeEliminarVentas: true,
  puedeVerCierreCaja: true,
  puedeVerAuditoria: true,
  puedeAplicarDescuentos: true,
  puedeVerRegistro: true,
  puedeEditarGastos: true,
  puedeEliminarGastos: true,
};

const PERMISOS_SUPERVISOR: UserPermissions = {
  accesoPOS: true,
  accesoGastos: true,
  accesoListaPrecios: false,
  accesoEditarPrecios: false,
  accesoTamanios: false,
  accesoMarcas: false,
  accesoConfig: false,
  puedeEditarVentas: true,
  puedeEliminarVentas: false,
  puedeVerCierreCaja: true,
  puedeVerAuditoria: false,
  puedeAplicarDescuentos: true,
  puedeVerRegistro: true,
  puedeEditarGastos: true,
  puedeEliminarGastos: false,
};

const PERMISOS_EMPLEADO: UserPermissions = {
  accesoPOS: true,
  accesoGastos: true,
  accesoListaPrecios: false,
  accesoEditarPrecios: false,
  accesoTamanios: false,
  accesoMarcas: false,
  accesoConfig: false,
  puedeEditarVentas: false,
  puedeEliminarVentas: false,
  puedeVerCierreCaja: false,
  puedeVerAuditoria: false,
  puedeAplicarDescuentos: false,
  puedeVerRegistro: true,
  puedeEditarGastos: false,
  puedeEliminarGastos: false,
};

// ─── Usuarios por defecto del sistema ──────────────────────────────────────────
const USUARIOS_DEFAULT: AppUser[] = [
  {
    id: 'admin',
    username: 'admin',
    password: 'tomadmin',
    role: 'admin',
    displayName: 'Administrador',
    active: true,
    permissions: PERMISOS_ADMIN,
    createdAt: '2024-01-01',
  },
  {
    id: 'supervisor',
    username: 'supervisor',
    password: 'admin1',
    role: 'supervisor',
    displayName: 'Supervisor',
    active: true,
    permissions: PERMISOS_SUPERVISOR,
    createdAt: '2024-01-01',
  },
  {
    id: 'empleado',
    username: 'empleado',
    password: 'admin2',
    role: 'empleado',
    displayName: 'Empleado',
    active: true,
    permissions: PERMISOS_EMPLEADO,
    createdAt: '2024-01-01',
  },
];

export const LS_KEY_USERS = 'gowash-users';

export function loadUsers(): AppUser[] {
  try {
    const saved = localStorage.getItem(LS_KEY_USERS);
    if (saved) return JSON.parse(saved);
  } catch {}
  return USUARIOS_DEFAULT;
}

export function saveUsers(users: AppUser[]) {
  localStorage.setItem(LS_KEY_USERS, JSON.stringify(users));
}

// ─── Sub-componente: Toggle de permiso ─────────────────────────────────────────
function PermToggle({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange(!value)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all duration-200 w-full text-left
        ${value
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : 'bg-red-500/10 border-red-500/20 text-red-400'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.01] cursor-pointer'}
      `}
    >
      {value ? (
        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
      ) : (
        <XCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-400" />
      )}
      <span className="truncate">{label}</span>
    </button>
  );
}

// ─── Colores por rol ───────────────────────────────────────────────────────────
const ROLE_COLORS = {
  admin: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-300', badge: 'bg-purple-500/20 text-purple-200', dot: 'bg-purple-400' },
  supervisor: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-300', badge: 'bg-blue-500/20 text-blue-200', dot: 'bg-blue-400' },
  empleado: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-300', badge: 'bg-emerald-500/20 text-emerald-200', dot: 'bg-emerald-400' },
  custom: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300', badge: 'bg-amber-500/20 text-amber-200', dot: 'bg-amber-400' },
};

const ROLE_LABELS = { admin: 'Admin', supervisor: 'Supervisor', empleado: 'Empleado', custom: 'Personalizado' };

// ─── Grupos de permisos para la UI ────────────────────────────────────────────
const PERM_GROUPS = [
  {
    title: 'Acceso a Secciones',
    icon: <Eye className="w-4 h-4" />,
    perms: [
      { key: 'accesoPOS', label: 'Punto de Venta' },
      { key: 'accesoGastos', label: 'Gastos' },
      { key: 'accesoListaPrecios', label: 'Lista de Precios' },
      { key: 'accesoEditarPrecios', label: 'Editar Precios' },
      { key: 'accesoTamanios', label: 'Tamaños' },
      { key: 'accesoMarcas', label: 'Marcas' },
      { key: 'accesoConfig', label: 'Configuración' },
    ],
  },
  {
    title: 'Poderes en POS',
    icon: <Shield className="w-4 h-4" />,
    perms: [
      { key: 'puedeEditarVentas', label: 'Editar Ventas' },
      { key: 'puedeEliminarVentas', label: 'Eliminar Ventas' },
      { key: 'puedeVerCierreCaja', label: 'Ver Cierre de Caja' },
      { key: 'puedeVerAuditoria', label: 'Ver Auditoría' },
      { key: 'puedeAplicarDescuentos', label: 'Aplicar Descuentos' },
      { key: 'puedeVerRegistro', label: 'Ver Registro de Ventas' },
    ],
  },
  {
    title: 'Poderes en Gastos',
    icon: <UserCheck className="w-4 h-4" />,
    perms: [
      { key: 'puedeEditarGastos', label: 'Editar Gastos' },
      { key: 'puedeEliminarGastos', label: 'Eliminar Gastos' },
    ],
  },
];

// ─── Componente Principal ──────────────────────────────────────────────────────
export function UserPermissionsPanel() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Formulario de nuevo usuario
  const [newUser, setNewUser] = useState<Partial<AppUser>>({
    username: '',
    password: '',
    displayName: '',
    role: 'empleado',
    active: true,
    permissions: { ...PERMISOS_EMPLEADO },
  });

  useEffect(() => {
    setUsers(loadUsers());
  }, []);

  const persistUsers = (updated: AppUser[]) => {
    setUsers(updated);
    saveUsers(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRolePreset = (role: AppUser['role'], target: 'editing' | 'new') => {
    const presets = { admin: PERMISOS_ADMIN, supervisor: PERMISOS_SUPERVISOR, empleado: PERMISOS_EMPLEADO, custom: PERMISOS_EMPLEADO };
    const perms = { ...presets[role] };
    if (target === 'editing' && editing) {
      setEditing({ ...editing, role, permissions: perms });
    } else {
      setNewUser({ ...newUser, role, permissions: perms });
    }
  };

  const handlePermChange = (key: keyof UserPermissions, val: boolean, target: 'editing' | 'new') => {
    if (target === 'editing' && editing) {
      const newPerms = { ...editing.permissions, [key]: val };
      const isCustom = JSON.stringify(newPerms) !== JSON.stringify(PERMISOS_ADMIN)
        && JSON.stringify(newPerms) !== JSON.stringify(PERMISOS_SUPERVISOR)
        && JSON.stringify(newPerms) !== JSON.stringify(PERMISOS_EMPLEADO);
      setEditing({ ...editing, permissions: newPerms, role: isCustom ? 'custom' : editing.role });
    } else {
      const prev = newUser.permissions || { ...PERMISOS_EMPLEADO };
      setNewUser({ ...newUser, permissions: { ...prev, [key]: val } });
    }
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    if (!editing.username.trim()) return;
    const updated = users.map(u => u.id === editing.id ? editing : u);
    persistUsers(updated);
    setEditing(null);
  };

  const handleCreateUser = () => {
    if (!newUser.username?.trim() || !newUser.password?.trim()) return;
    const created: AppUser = {
      id: Date.now().toString(),
      username: newUser.username!.trim().toLowerCase(),
      password: newUser.password!,
      displayName: newUser.displayName?.trim() || newUser.username!.trim(),
      role: newUser.role as AppUser['role'] || 'empleado',
      active: true,
      permissions: newUser.permissions || { ...PERMISOS_EMPLEADO },
      createdAt: new Date().toISOString().slice(0, 10),
    };
    persistUsers([...users, created]);
    setCreating(false);
    setNewUser({ username: '', password: '', displayName: '', role: 'empleado', active: true, permissions: { ...PERMISOS_EMPLEADO } });
  };

  const handleDelete = (id: string) => {
    if (id === 'admin') return; // protegido
    persistUsers(users.filter(u => u.id !== id));
    setConfirmDelete(null);
  };

  const handleToggleActive = (id: string) => {
    if (id === 'admin') return;
    persistUsers(users.map(u => u.id === id ? { ...u, active: !u.active } : u));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <Users className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">Gestión de Usuarios</h2>
            <p className="text-xs text-slate-500">Administrá usuarios, roles y permisos del sistema</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5" /> Guardado
            </span>
          )}
          {!creating && !editing && (
            <Button
              onClick={() => setCreating(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold px-4 h-9 rounded-xl shadow-lg shadow-blue-500/10 transition-all hover:scale-105 active:scale-95"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          )}
        </div>
      </div>

      {/* ─── Formulario de Creación ─── */}
      {creating && (
        <div className="rounded-2xl border border-blue-500/20 bg-slate-800/60 backdrop-blur-md p-5 space-y-4 shadow-[0_0_40px_rgba(59,130,246,0.08)]">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-400" /> Crear Nuevo Usuario
            </h3>
            <button onClick={() => setCreating(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Usuario</Label>
              <Input
                value={newUser.username || ''}
                onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                placeholder="ej: maria_lopez"
                className="bg-slate-700/50 border-slate-600/50 text-white text-sm h-9 focus:border-blue-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Nombre Visible</Label>
              <Input
                value={newUser.displayName || ''}
                onChange={e => setNewUser({ ...newUser, displayName: e.target.value })}
                placeholder="ej: María López"
                className="bg-slate-700/50 border-slate-600/50 text-white text-sm h-9 focus:border-blue-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Contraseña</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newUser.password || ''}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Contraseña segura"
                  className="bg-slate-700/50 border-slate-600/50 text-white text-sm h-9 pr-9 focus:border-blue-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Preset de rol */}
          <div className="space-y-2">
            <Label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Rol / Plantilla de Permisos</Label>
            <div className="flex flex-wrap gap-2">
              {(['supervisor', 'empleado', 'custom'] as const).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRolePreset(role, 'new')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    newUser.role === role
                      ? `${ROLE_COLORS[role].bg} ${ROLE_COLORS[role].border} ${ROLE_COLORS[role].text}`
                      : 'bg-slate-700/40 border-slate-600/40 text-slate-400 hover:border-slate-500/60'
                  }`}
                >
                  {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          </div>

          {/* Permisos para nuevo usuario */}
          <div className="space-y-3">
            {PERM_GROUPS.map(group => (
              <div key={group.title}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  {group.icon} {group.title}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
                  {group.perms.map(p => (
                    <PermToggle
                      key={p.key}
                      label={p.label}
                      value={(newUser.permissions as any)?.[p.key] ?? false}
                      onChange={v => handlePermChange(p.key as keyof UserPermissions, v, 'new')}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-700/50">
            <Button
              variant="ghost"
              onClick={() => setCreating(false)}
              className="text-slate-400 hover:text-slate-200 text-xs h-9"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={!newUser.username?.trim() || !newUser.password?.trim()}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold h-9 px-5 rounded-xl disabled:opacity-40"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" /> Crear Usuario
            </Button>
          </div>
        </div>
      )}

      {/* ─── Lista de Usuarios ─── */}
      <div className="space-y-3">
        {users.map(u => {
          const colors = ROLE_COLORS[u.role] || ROLE_COLORS.custom;
          const isEditingThis = editing?.id === u.id;

          return (
            <div
              key={u.id}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isEditingThis
                  ? 'border-blue-500/40 bg-slate-800/70 shadow-[0_0_40px_rgba(59,130,246,0.12)]'
                  : u.active
                  ? `border-slate-700/50 bg-slate-800/40 hover:border-slate-600/60`
                  : 'border-slate-700/30 bg-slate-900/20 opacity-60'
              }`}
            >
              {/* Cabecera de usuario */}
              <div className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${colors.bg} ${colors.border}`}>
                    {u.role === 'admin' ? (
                      <Shield className={`w-4 h-4 ${colors.text}`} />
                    ) : (
                      <User className={`w-4 h-4 ${colors.text}`} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{u.displayName}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${colors.badge}`}>
                        {ROLE_LABELS[u.role]}
                      </span>
                      {!u.active && (
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500 font-mono">@{u.username}</span>
                      <span className="text-[10px] text-slate-600">•</span>
                      <span className="text-[10px] text-slate-600 flex items-center gap-1">
                        <Key className="w-2.5 h-2.5" /> {'•'.repeat(Math.min(u.password.length, 8))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1.5">
                  {!isEditingThis && (
                    <>
                      {u.id !== 'admin' && (
                        <button
                          onClick={() => handleToggleActive(u.id)}
                          title={u.active ? 'Desactivar usuario' : 'Activar usuario'}
                          className={`p-2 rounded-xl border transition-all hover:scale-105 ${
                            u.active
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-slate-700/30 border-slate-600/30 text-slate-500 hover:bg-slate-700/60'
                          }`}
                        >
                          {u.active ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      <button
                        onClick={() => { setEditing(u); setCreating(false); }}
                        className="p-2 rounded-xl border bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all hover:scale-105"
                        title="Editar usuario"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {u.id !== 'admin' && (
                        confirmDelete === u.id ? (
                          <div className="flex items-center gap-1 bg-red-950/60 border border-red-500/30 rounded-xl px-2.5 py-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-[11px] text-red-300 font-semibold">¿Eliminar?</span>
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="ml-1 text-[11px] text-red-400 hover:text-red-200 font-black"
                            >Sí</button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-[11px] text-slate-400 hover:text-slate-200 font-bold ml-1"
                            >No</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(u.id)}
                            className="p-2 rounded-xl border bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all hover:scale-105"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Panel de Edición */}
              {isEditingThis && editing && (
                <div className="border-t border-slate-700/50 px-5 py-4 space-y-4 bg-slate-800/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Nombre Visible</Label>
                      <Input
                        value={editing.displayName}
                        onChange={e => setEditing({ ...editing, displayName: e.target.value })}
                        className="bg-slate-700/50 border-slate-600/50 text-white text-sm h-9 focus:border-blue-500/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Usuario (Login)</Label>
                      <Input
                        value={editing.username}
                        onChange={e => setEditing({ ...editing, username: e.target.value })}
                        disabled={editing.id === 'admin'}
                        className="bg-slate-700/50 border-slate-600/50 text-white text-sm h-9 focus:border-blue-500/50 disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        <Key className="w-3 h-3 inline mr-1" /> Nueva Contraseña
                      </Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={editing.password}
                          onChange={e => setEditing({ ...editing, password: e.target.value })}
                          className="bg-slate-700/50 border-slate-600/50 text-white text-sm h-9 pr-9 focus:border-blue-500/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Preset de rol */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Rol / Plantilla</Label>
                    <div className="flex flex-wrap gap-2">
                      {(['admin', 'supervisor', 'empleado', 'custom'] as const).map(role => (
                        <button
                          key={role}
                          type="button"
                          disabled={role === 'admin' && editing.id !== 'admin'}
                          onClick={() => handleRolePreset(role, 'editing')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                            editing.role === role
                              ? `${ROLE_COLORS[role].bg} ${ROLE_COLORS[role].border} ${ROLE_COLORS[role].text}`
                              : 'bg-slate-700/40 border-slate-600/40 text-slate-400 hover:border-slate-500/60'
                          }`}
                        >
                          {ROLE_LABELS[role]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Permisos editables */}
                  <div className="space-y-3">
                    {PERM_GROUPS.map(group => (
                      <div key={group.title}>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          {group.icon} {group.title}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
                          {group.perms.map(p => (
                            <PermToggle
                              key={p.key}
                              label={p.label}
                              value={(editing.permissions as any)[p.key] ?? false}
                              onChange={v => handlePermChange(p.key as keyof UserPermissions, v, 'editing')}
                              disabled={editing.role === 'admin'}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {editing.role === 'admin' && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-purple-500/5 border border-purple-500/20">
                      <Shield className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <p className="text-xs text-purple-300">El usuario Admin tiene todos los permisos y no se pueden restringir.</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-700/50">
                    <Button
                      variant="ghost"
                      onClick={() => setEditing(null)}
                      className="text-slate-400 hover:text-slate-200 text-xs h-9"
                    >
                      <X className="w-3.5 h-3.5 mr-1" /> Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveEdit}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold h-9 px-5 rounded-xl"
                    >
                      <Save className="w-3.5 h-3.5 mr-1.5" /> Guardar Cambios
                    </Button>
                  </div>
                </div>
              )}

              {/* Resumen de permisos en modo collapsed */}
              {!isEditingThis && (
                <div className="px-5 pb-3 flex flex-wrap gap-1.5">
                  {PERM_GROUPS.flatMap(g => g.perms).map(p => {
                    const val = (u.permissions as any)[p.key];
                    return val ? (
                      <span key={p.key} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {p.label}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

