'use client';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { useEffect, useState } from 'react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function CallsChart({ selectedDate }) {
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });

    useEffect(() => {
        fetchChartData();
    }, [selectedDate]);

    const fetchChartData = async () => {
        try {
            const response = await fetch(`/api/calls?date=${selectedDate.toISOString()}`);
            const data = await response.json();

            // Filtrar datos para un rango de fechas, por ejemplo, el mes actual
            const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

            const filteredData = data.filter((call) => {
                const callDate = new Date(call.date);
                return callDate >= startOfMonth && callDate <= endOfMonth;
            });

            const labels = filteredData.map((call) => call.date);
            const counts = filteredData.map((call) => call.count);

            setChartData({
                labels,
                datasets: [
                    {
                        label: 'Llamadas',
                        data: counts,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    },
                ],
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            {chartData.labels.length > 0 ? (
                <Line data={chartData} />
            ) : (
                <div>No hay datos disponibles para mostrar el gráfico.</div>
            )}
        </div>
    );
}
