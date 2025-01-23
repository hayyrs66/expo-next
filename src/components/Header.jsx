'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function AppHeader({ user }) {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
        router.push('/');
    };

    return (
        <header className="flex justify-between items-center px-6 py-6 shadow-md">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <div className="flex items-center">
                <span className="mr-4">Hola, {user.username}</span>
                <button onClick={handleLogout} className="flex items-center text-red-500">
                    <LogOut className="mr-1" />
                    Cerrar Sesión
                </button>
            </div>
        </header>
    );
}
