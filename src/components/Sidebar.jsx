// components/Sidebar.jsx
'use client';

import { Sidebar, SidebarMenuItem } from "./ui/sidebar";
import Link from 'next/link';

import { SidebarProvider } from "./ui/sidebar";

export default function AppSidebar() {
  return (
    <SidebarProvider>
      <Sidebar className="w-64 h-screen bg-gray-800 text-white">
        <div className="p-4 text-2xl font-bold">Call Center</div>
        <SidebarMenuItem as={Link} href="/dashboard">
          Dashboard
        </SidebarMenuItem>
        <SidebarMenuItem as={Link} href="/add-call">
          Agregar Llamada
        </SidebarMenuItem>
        <SidebarMenuItem as={Link} href="/reports">
          Reportes
        </SidebarMenuItem>
        {/* Agrega más items según sea necesario */}
      </Sidebar>
    </SidebarProvider>
  );
}
