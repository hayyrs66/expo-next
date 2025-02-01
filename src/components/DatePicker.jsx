"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function DatePicker({ onChange }) {
  // El estado es inicialmente una cadena vacía
  const [date, setDate] = React.useState('');

  const handleDateSelect = (selectedDate) => {
    // Si ya hay una fecha (objeto Date) y se vuelve a seleccionarla, se limpia
    if (date instanceof Date && selectedDate && date.getTime() === selectedDate.getTime()) {
      setDate('');
      if (onChange) {
        onChange('');
      }
      return;
    }

    setDate(selectedDate);
    if (onChange) {
      const formattedDate = selectedDate
        ? selectedDate.toLocaleDateString("en-CA", {
            timeZone: "America/Guatemala",
          })
        : '';
      onChange(formattedDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date || undefined} // Si date es '', se pasa undefined para que no haya selección
          onSelect={handleDateSelect}
          initialFocus
          locale={es}
        />
      </PopoverContent>
    </Popover>
  );
}