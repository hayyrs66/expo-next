'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@shadcn/ui/button';
import { Input } from '@shadcn/ui/input';
import { Label } from '@shadcn/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@shadcn/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@shadcn/ui/alert';
import Loader from "@components/Loader/Loader";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!email || !password) {
        console.log('Faltan datos: email o contraseña');
        setError('Por favor, completa todos los campos.');
        setLoading(false);
        return;
      }

      console.log('Datos enviados al servidor:', { username: email, password });

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await response.json();

      console.log('Respuesta del servidor:', data);

      if (!response.ok) {
        console.error('Error al iniciar sesión:', data.error);
        setError(data.error || 'Error al iniciar sesión.');
        setLoading(false);
        return;
      }

      console.log('Inicio de sesión exitoso. Redirigiendo a /dashboard...');
      router.push('/dashboard');
    } catch (err) {
      console.error('Error de red en el cliente:', err);
      setError('Algo salió mal. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Loader global superpuesto */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Loader />
        </div>
      )}
      
      <Card className="w-[500px] h-[400px] py-2 flex flex-col justify-center items-start max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Iniciar Sesión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 w-full">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Usuario</Label>
            <Input
              id="email"
              type="email"
              placeholder="Ingresa tu usuario"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogin} disabled={loading} className="w-full">
            Iniciar Sesión
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
