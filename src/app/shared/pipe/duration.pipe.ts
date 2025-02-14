// duration.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'duration'
})
export class DurationPipe implements PipeTransform {
    transform(value: string | number): string {
        if (!value) return '00:00';
        
        let seconds: number;
        
        if (typeof value === 'string') {
        // Si es una cadena, intentamos convertirla a número
        seconds = parseInt(value, 10);
        } else {
        seconds = value;
        }
        
        if (isNaN(seconds)) return '00:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
        
        return `${formattedMinutes}:${formattedSeconds}`;
    }
}