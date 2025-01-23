// app/dashboard/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppSidebar from '@components/Sidebar';
import AppHeader from '@components/Header';
import MainContent from '@components/MainContent';
import DashboardContent from '@components/DashboardContent';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/checkauth', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.push('/');
        }
      } catch (err) {
        console.error(err);
        router.push('/');
      }
    }

    fetchUser();
  }, [router]);

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <AppHeader user={user} />
        <MainContent>
          {/* Aquí irá el contenido específico del dashboard */}
          <DashboardContent />
        </MainContent>
      </div>
    </div>
  );
}
