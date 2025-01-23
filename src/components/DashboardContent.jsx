// components/DashboardContent.jsx
"use client";

import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Table } from "./ui/table";
import { Plus, Minus } from "lucide-react";
import { DatePickerDemo } from "./ui/DatePickerDemo";
import CallsChart from "./CallsChart";

export default function DashboardContent() {
  const [calls, setCalls] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCall = async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/addcall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1, // Replace with the authenticated user's ID
          date: selectedDate,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Call added successfully!");
        // Optionally, refetch call data here
      } else {
        alert(data.error || "Failed to add call.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubtractCall = async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/removecall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1, // Replace with the authenticated user's ID
          date: selectedDate,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Call removed successfully!");
        // Optionally, refetch call data here
      } else {
        alert(data.error || "Failed to remove call.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="flex flex-col p-6 h-full">
        <h2 className="text-lg font-semibold mb-4">Registrar Llamadas</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 flex-grow">
          <DatePickerDemo
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          <div className="flex items-center space-x-4">
            <Button onClick={handleAddCall} variant="primary" icon={<Plus />}>
              Agregar Llamada
            </Button>
            <Button
              onClick={handleSubtractCall}
              variant="danger"
              icon={<Minus />}
            >
              Restar Llamada
            </Button>
          </div>
        </div>
      </Card>
      <Card className="flex flex-col p-6 h-full">
        <h2 className="text-lg font-semibold mb-4">Llamadas del Día</h2>
        <div className="flex-grow">
          {isLoading ? (
            <div>Cargando...</div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {calls.length > 0 ? (
                  calls.map((call) => (
                    <tr key={call.id}>
                      <td>{call.date}</td>
                      <td>{call.count}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="text-center">
                      No hay llamadas registradas para esta fecha.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </div>
      </Card>

      <Card className="flex flex-col p-6 h-full">
        <h2 className="text-lg font-semibold mb-4">Estadísticas de Llamadas</h2>
        <div className="flex-grow">
          <CallsChart selectedDate={selectedDate} />
        </div>
      </Card>
    </div>
  );
}
