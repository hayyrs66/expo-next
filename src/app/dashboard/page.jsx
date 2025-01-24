'use client'

import { useToast } from "@/hooks/use-toast"
import { Toast, ToastAction } from "@components/ui/toast"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/button';
import { Spotlight } from '@components/ui/Spotlight';
import Loader from "@components/Loader/Loader"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@shadcn/ui/table";

import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from '@shadcn/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import DatePicker from '@/components/DatePicker';

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { title } from "process";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [today, setToday] = useState('');
  const [reason, setReason] = useState('expo');
  const [totalCalls, setTotalCalls] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [callsByDate, setCallsByDate] = useState(0);
  const [totalOperatorCalls, setTotalOperatorCalls] = useState(0);
  const [totalOperatorCallsByDate, setTotalOperatorCallsByDate] = useState(0); // Nuevo estado
  const [loadingTotalCalls, setLoadingTotalCalls] = useState(false);
  const [errorTotalCalls, setErrorTotalCalls] = useState(null);
  const [loadingDateCalls, setLoadingDateCalls] = useState(false);
  const [errorDateCalls, setErrorDateCalls] = useState(null);
  const [loadingTotalOperatorCallsByDate, setLoadingTotalOperatorCallsByDate] = useState(false); // Nuevo estado de carga
  const [errorTotalOperatorCallsByDate, setErrorTotalOperatorCallsByDate] = useState(null); // Nuevo estado de error
  const router = useRouter();
  const { toast } = useToast()


  const generatePDF = async () => {
    if (!selectedDate) {
      alert("Selecciona una fecha para exportar los datos.");
      return;
    }

    try {
      // Obtener el contenido del dashboard o sección a exportar
      const content = document.getElementById("pdf-content"); // Asegúrate de que esta ID esté configurada en el div deseado

      // Capturar el área seleccionada con html2canvas
      const canvas = await html2canvas(content, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      // Crear un PDF con jsPDF
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Guardar el archivo PDF
      pdf.save(`Reporte_${selectedDate}.pdf`);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Hubo un error al generar el PDF. Intenta de nuevo.");
    }
  };

  useEffect(() => {
    const fetchTodayDate = () => {
      const guatemalaDate = new Date().toLocaleDateString('es-GT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      setToday(guatemalaDate);
    };

    fetchTodayDate();

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

  useEffect(() => {
    if (user) {
      const fetchTotalCalls = async () => {
        try {
          const res = await fetch(`/api/calls?userId=${user.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (res.ok) {
            const data = await res.json();
            setTotalCalls(data.totalCalls);
          } else {
            const errorData = await res.json();
            console.error(`Error al obtener total de llamadas: ${errorData.error}`);
          }
        } catch (error) {
          console.error('Error al obtener total de llamadas:', error);
        }
      };

      fetchTotalCalls();
    }
  }, [user]);

  useEffect(() => {
    const fetchTotalOperatorCalls = async () => {
      setLoadingTotalCalls(true);
      setErrorTotalCalls(null);

      try {
        const res = await fetch('/api/totalcalls', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          setTotalOperatorCalls(data.totalCalls);
        } else {
          const errorData = await res.json();
          setErrorTotalCalls(errorData.error || 'Error al obtener las llamadas.');
        }
      } catch (error) {
        console.error('Error al obtener llamadas totales entre operadores:', error);
        setErrorTotalCalls('Error al obtener las llamadas.');
      } finally {
        setLoadingTotalCalls(false);
      }
    };

    fetchTotalOperatorCalls();
  }, []);

  // Nuevo useEffect para obtener las llamadas totales por fecha para todos los operadores
  useEffect(() => {
    const fetchTotalOperatorCallsByDate = async () => {
      if (!selectedDate) {
        setTotalOperatorCallsByDate(0);
        return;
      }

      setLoadingTotalOperatorCallsByDate(true);
      setErrorTotalOperatorCallsByDate(null);

      try {
        const res = await fetch(`/api/totalcallsbydate?date=${selectedDate}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          setTotalOperatorCallsByDate(data.totalCalls);
        } else {
          const errorData = await res.json();
          setErrorTotalOperatorCallsByDate(errorData.error || 'Error al obtener las llamadas.');
          setTotalOperatorCallsByDate(0);
        }
      } catch (error) {
        console.error('Error al obtener llamadas totales por fecha:', error);
        setErrorTotalOperatorCallsByDate('Error al obtener las llamadas.');
        setTotalOperatorCallsByDate(0);
      } finally {
        setLoadingTotalOperatorCallsByDate(false);
      }
    };

    fetchTotalOperatorCallsByDate();
  }, [selectedDate]);

  const fetchCallsByDate = async (date) => {
    if (!date) {
      setCallsByDate(0);
      return;
    }
    setLoadingDateCalls(true);
    setErrorDateCalls(null);

    try {
      const res = await fetch(`/api/datecalls?date=${date}&userId=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setCallsByDate(data.totalCalls);
      } else {
        const errorData = await res.json();
        setErrorDateCalls(errorData.error || 'Error al obtener las llamadas.');
        setCallsByDate(0);
      }
    } catch (error) {
      console.error('Error al obtener llamadas por fecha:', error);
      setErrorDateCalls('Error al obtener las llamadas.');
      setCallsByDate(0);
    } finally {
      setLoadingDateCalls(false);
    }
  };

  const handleAddCall = async () => {
    if (!reason) {
      alert('Por favor, selecciona una razón para la llamada.');
      return;
    }

    try {
      const res = await fetch('/api/addcall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          date: new Date().toISOString(),
          reason,
        }),
      });

      if (res.ok) {

        toast({
          description: "La llamada fue agregada.",
        })

        setTotalCalls(prev => prev + 1);
        if (selectedDate) {
          setCallsByDate(prev => prev + 1);
          setTotalOperatorCallsByDate(prev => prev + 1);
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
      const res = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        router.push('/');
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Hubo un error al cerrar sesión.');
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    )
  }

  return (
    <section className="px-12 py-6 z-10">
      <Spotlight
        className="-top-40 left-0"
        fill="#40E0D0"
      />
      <header className="flex justify-between outline-none items-center gap-2 mb-8 w-full">
        <Select onValueChange={(value) => {
          setReason(value);
        }}>
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
        <div className="py-1 px-4 font-medium w-fit rounded-sm bg-neutral-900 text-lg">
          <span className="text-sm font-medium">{today}</span>
        </div>
      </header>

      <div className="w-full flex justify-between items-center">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <DatePicker onChange={(date) => {
            if (date) {
              const formattedDate = date.toISOString().split('T')[0];
              setSelectedDate(formattedDate);
              fetchCallsByDate(formattedDate);
            }
          }} />
          <Button onClick={generatePDF}>Descargar</Button>
        </div>
      </div>

      <div className="w-full gap-4 grid grid-cols-3">
        <Card className="w-full mt-8">
          <CardHeader>
            <CardTitle className="mb-1">Registrar</CardTitle>
            <CardDescription>Agrega un registro de llamada</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              onValueChange={(value) => setReason(value)}
              value='expo'
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Razón de llamada" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Razones</SelectLabel>
                  <SelectItem value="expo">Expo Landivar</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </CardContent>
          <CardFooter className="flex items-center gap-2">
            <Button variant="outline" onClick={handleAddCall}>
              Agregar
            </Button>
          </CardFooter>
        </Card>


        <Card className="w-full mt-8">
          <CardHeader>
            <CardTitle className="mb-1">Llamadas</CardTitle>
            <CardDescription>Total de llamadas hoy</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="font-bold text-4xl">{totalCalls}</span>
          </CardContent>
          <CardFooter className="flex items-center gap-2" />
        </Card>

        <Card className="w-full mt-8">
          <CardHeader>
            <CardTitle className="mb-1">Historial Personal</CardTitle>
            <CardDescription>Total de llamadas por fecha</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingDateCalls ? (
              <span className="font-medium text-lg">Cargando...</span>
            ) : errorDateCalls ? (
              <span className="font-bold text-4xl text-red-500">{errorDateCalls}</span>
            ) : (
              <span className={`${callsByDate == 0 ? 'text-lg font-medium' : 'text-4xl font-bold'}`}>
                {callsByDate == 0 ? "Sin registro." : callsByDate}
              </span>
            )}
          </CardContent>
          <CardFooter className="flex items-center gap-2" />
        </Card>

        <Card className="w-full mt-8">
          <CardHeader>
            <CardTitle className="mb-1">Historial General</CardTitle>
            <CardDescription>Total de llamadas general por fecha.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTotalOperatorCallsByDate ? (
              <span className="font-medium text-lg">Cargando...</span>
            ) : errorTotalOperatorCallsByDate ? (
              <span className="font-bold text-4xl text-red-500">{errorTotalOperatorCallsByDate}</span>
            ) : (
              <span className={`${totalOperatorCallsByDate == 0 ? 'text-lg font-medium' : 'text-4xl font-bold'}`}>
                {selectedDate
                  ? totalOperatorCallsByDate == 0
                    ? 'Sin registro.'
                    : totalOperatorCallsByDate
                  : 'Seleccionar fecha.'}
              </span>
            )}
          </CardContent>
          <CardFooter className="flex items-center gap-2" />
        </Card>


        <Card className="w-full mt-8">
          <CardHeader>
            <CardTitle className="mb-1">Total Historico</CardTitle>
            <CardDescription>Todas las llamadas realizadas.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTotalCalls ? (
              <span className="font-bold text-lg">Cargando...</span>
            ) : errorTotalCalls ? (
              <span className="font-bold text-lg text-red-500">{errorTotalCalls}</span>
            ) : (
              <span className="font-bold text-4xl">{totalOperatorCalls}</span>
            )}
          </CardContent>
          <CardFooter className="flex items-center gap-2" />
        </Card>

        {/* Contenido para exportar */}
        <div id="pdf-content" className="mt-6 bg-black">
          <h2 className="text-2xl font-bold mb-4">Reporte de Llamadas</h2>
          <p className="text-lg mb-4">
            Usuario que exportó: <strong>{user?.username || "Cargando..."}</strong>
          </p>
          <Table>
            <TableCaption>Resumen de llamadas</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Métrica</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Total de llamadas hoy</TableCell>
                <TableCell className="text-right">{totalCalls}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total de llamadas por fecha</TableCell>
                <TableCell className="text-right">{callsByDate || "Seleccionar fecha"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total de llamadas general por fecha</TableCell>
                <TableCell className="text-right">{totalOperatorCallsByDate || "Seleccionar fecha"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Todas las llamadas realizadas</TableCell>
                <TableCell className="text-right">{totalOperatorCalls}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>


      </div>
    </section>
  );
}
