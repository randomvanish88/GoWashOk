import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { loadUsers } from './UserPermissionsPanel';

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = loadUsers();
    const match = users.find(
      u => u.username === username.trim().toLowerCase() && u.password === password && u.active
    );
    if (match) {
      onLogin(match.username);
    } else {
      // Verificar si el usuario existe pero está inactivo
      const exists = users.find(u => u.username === username.trim().toLowerCase());
      if (exists && !exists.active) {
        setError('Tu usuario está desactivado. Contactá al administrador.');
      } else {
        setError('Credenciales incorrectas. Verificá tu usuario y contraseña.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform -rotate-6">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">GoWash</CardTitle>
          <CardDescription className="text-gray-500">
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-gray-200 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gray-200 focus:ring-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-500 font-medium animate-bounce">
                {error}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
            >
              Iniciar Sesión
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
