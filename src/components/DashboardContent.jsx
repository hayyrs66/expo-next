// components/DashboardContent.jsx
'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Table } from './ui/table';
import { Plus, Minus } from 'lucide-react';
import { DatePickerDemo } from './ui/DatePickerDemo';
import CallsChart from './CallsChart';

export default function DashboardContent() {
  const [calls, setCalls] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCall = () => {
    // Add call logic here
  };

  const handleSubtractCall = () => {
    // Subtract call logic here
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Registrar Llamadas</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <DatePickerDemo selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          <div className="flex items-center space-x-4">
            <Button onClick={handleAddCall} variant="primary" icon={<Plus />}>
              Agregar Llamada
            </Button>
            <Button onClick={handleSubtractCall} variant="danger" icon={<Minus />}>
              Restar Llamada
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Llamadas del Día</h2>
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
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Estadísticas de Llamadas</h2>
        <CallsChart selectedDate={selectedDate} />
      </Card>
    </div>
  );
}
