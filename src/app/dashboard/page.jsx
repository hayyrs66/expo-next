'use client'

import { useToast } from "@/hooks/use-toast"
import { utils, writeFile } from "xlsx"
import { Input } from '@shadcn/ui/input'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@components/ui/button'
import { Spotlight } from '@components/ui/Spotlight'
import Loader from "@components/Loader/Loader"
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from '@shadcn/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import DatePicker from '@/components/DatePicker'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [today, setToday] = useState('')
  const [reason, setReason] = useState('expo')
  const [totalCalls, setTotalCalls] = useState(0)
  const [selectedDate, setSelectedDate] = useState('')
  const [callsByDate, setCallsByDate] = useState(0)
  const [totalOperatorCalls, setTotalOperatorCalls] = useState(0)
  const [totalOperatorCallsByDate, setTotalOperatorCallsByDate] = useState(0)
  const [loadingTotalCalls, setLoadingTotalCalls] = useState(false)
  const [errorTotalCalls, setErrorTotalCalls] = useState(null)
  const [loadingDateCalls, setLoadingDateCalls] = useState(false)
  const [errorDateCalls, setErrorDateCalls] = useState(null)
  const [loadingTotalOperatorCallsByDate, setLoadingTotalOperatorCallsByDate] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [exporting, setExporting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()


  const getGuatemalaDate = () => {
    return new Date().toLocaleDateString('en-CA', {
      timeZone: 'America/Guatemala'
    });
  };


  const handleExport = async () => {
    try {
      setExporting(true);
      const url = selectedDate 
        ? `/api/exportcalls?date=${selectedDate}` 
        : `/api/exportcalls`;
        
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al obtener datos');
  
      const data = await response.json();
      if (!data || data.length === 0) {
        alert(selectedDate 
          ? 'No se encontraron registros para la fecha seleccionada.' 
          : 'No se encontraron registros.');
        return;
      }
  
      const ws = utils.json_to_sheet(data);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Llamadas");
  
      const timestamp = new Date().toISOString().slice(0, 10);
      const baseName = selectedDate 
        ? `llamadas_${selectedDate}_${timestamp}` 
        : `llamadas_${timestamp}`;
  
      writeFile(wb, `${baseName}.xlsx`);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al exportar: ' + error.message);
    } finally {
      setExporting(false);
    }
  };
  
  

  useEffect(() => {
    const date = new Date();
    const guatemalaDateFormatted = date.toLocaleDateString('es-GT', {
      timeZone: 'America/Guatemala',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    setToday(guatemalaDateFormatted);

    const fetchUser = async () => {
      try {
        const res = await fetch('/api/checkauth', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else {
          router.push('/')
        }
      } catch (err) {
        console.error(err)
        router.push('/')
      }
    }

    fetchUser()
  }, [router])

  const fetchCallCount = async (params) => {
    try {
      const res = await fetch(`/api/calls?${params.toString()}`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      return data.totalCalls || 0
    } catch (error) {
      console.error('Error fetching call count:', error)
      return 0
    }
  }

  const fetchCounts = async () => {
    if (!user) return;

    try {
      // Total de llamadas de hoy para el usuario
      const todayParams = new URLSearchParams({
        userId: user.id,
        date: new Date().toLocaleDateString('en-CA')
      });
      setTotalCalls(await fetchCallCount(todayParams));

      // Llamadas personales por fecha
      if (selectedDate) {
        const dateParams = new URLSearchParams({
          userId: user.id,
          date: selectedDate
        });
        setCallsByDate(await fetchCallCount(dateParams));
      }

      // Total histórico global
      const globalParams = new URLSearchParams({ global: 'true' });
      setTotalOperatorCalls(await fetchCallCount(globalParams));

      // Total global por fecha
      if (selectedDate) {
        const operatorDateParams = new URLSearchParams({
          global: 'true',
          date: selectedDate
        });
        setTotalOperatorCallsByDate(await fetchCallCount(operatorDateParams));
      }
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  };


  useEffect(() => {
    fetchCounts();
  }, [user, selectedDate]);

  const handleAddCall = async () => {
    if (!reason) {
      alert('Por favor, selecciona una razón para la llamada.');
      return;
    }

    if (!/^\d{8}$/.test(phoneNumber)) {
      alert('El número debe contener exactamente 8 dígitos');
      return;
    }

    try {
      const res = await fetch('/api/addcall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          date: getGuatemalaDate(),
          reason,
          number: `+502${phoneNumber}`
        }),
      });

      if (res.ok) {
        toast({ description: "La llamada fue agregada." });
        setPhoneNumber('');

        const today = getGuatemalaDate();
        const todayParams = new URLSearchParams({
          userId: user.id,
          date: today
        });
        setTotalCalls(await fetchCallCount(todayParams));

        const globalParams = new URLSearchParams({ global: 'true' });
        setTotalOperatorCalls(await fetchCallCount(globalParams));

        if (selectedDate === today) {
          const dateParams = new URLSearchParams({
            userId: user.id,
            date: today
          });
          setCallsByDate(await fetchCallCount(dateParams));

          const operatorDateParams = new URLSearchParams({
            global: 'true',
            date: today
          });
          setTotalOperatorCallsByDate(await fetchCallCount(operatorDateParams));
        }
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error al agregar la llamada:', error);
      alert('Hubo un error al agregar la llamada.');
    }
  };


  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', { method: 'POST' })
      if (res.ok) router.push('/')
      else alert(`Error: ${(await res.json()).error}`)
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      alert('Hubo un error al cerrar sesión.')
    }
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    )
  }

  return (
    <section className="px-12 py-6 z-10">
      <Spotlight className="-top-40 left-0" fill="#40E0D0" />

      <header className="flex justify-between items-center gap-2 mb-8 w-full">
        <Select onValueChange={setReason}>
          <SelectTrigger className="w-[180px]">
            <div className="w-6 h-6 bg-gradient-to-r from-neutral-800 to-neutral-500 rounded-full" />
            <SelectValue placeholder={user.username} />
          </SelectTrigger>
          <SelectContent>
            <button onClick={handleLogout} className='px-2 py-1 text-red-500 text-sm'>
              Cerrar Sesión
            </button>
          </SelectContent>
        </Select>
        <div className="py-1 px-4 font-medium rounded-sm bg-neutral-900">
          <span className="text-sm font-medium">{today}</span>
        </div>
      </header>

      <div className="w-full flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <DatePicker onChange={(date) => {
            if (date) {
              setSelectedDate(date)
            }
          }} />
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exportando...' : 'Exportar'}
          </Button>
        </div>
      </div>

      <div className="w-full gap-4 grid grid-cols-3">
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="mb-1">Registrar</CardTitle>
            <CardDescription>Agrega un registro de llamada</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Razón de llamada" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Razones</SelectLabel>
                  <SelectItem value="expo">Expo Landivar</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Input
              placeholder="12345678"
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 8)
                setPhoneNumber(value)
              }}
            />
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={handleAddCall} className="w-full">
              Agregar
            </Button>
          </CardFooter>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="mb-1">Llamadas de hoy</CardTitle>
            <CardDescription>
              {`Total de llamadas realizadas hoy por ${user?.username}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="font-bold text-4xl">{totalCalls}</span>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="mb-1">Llamadas personales</CardTitle>
            <CardDescription>
              {selectedDate
                ? `Total de llamadas realizadas el ${selectedDate.split('-').reverse().join('/')} por ${user?.username}`
                : 'Seleccione una fecha para ver el histórico'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingDateCalls ? (
              <span className="font-medium">Cargando...</span>
            ) : errorDateCalls ? (
              <span className="text-red-500">{errorDateCalls}</span>
            ) : (
              <span className="text-4xl font-bold">
                {callsByDate || "--"}
              </span>
            )}
          </CardContent>
        </Card>
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="mb-1">Llamadas generales</CardTitle>
            <CardDescription>
              {selectedDate
                ? `Total de llamadas de todos los operadores el ${selectedDate.split('-').reverse().join('/')}`
                : 'Seleccione una fecha para ver el histórico'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTotalOperatorCallsByDate ? (
              <span className="font-medium">Cargando...</span>
            ) : (
              <span className="text-4xl font-bold">
                {selectedDate ? (totalOperatorCallsByDate > 0 ? totalOperatorCallsByDate : "--") : '--'}
              </span>
            )}
          </CardContent>
        </Card>
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="mb-1">Histórico completo</CardTitle>
            <CardDescription>Total de llamadas registradas por todos los operadores</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTotalCalls ? (
              <span className="font-medium">Cargando...</span>
            ) : (
              <span className="text-4xl font-bold">{totalOperatorCalls}</span>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}