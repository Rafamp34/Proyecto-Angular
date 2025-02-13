import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'passwordVisibility'
})
export class PasswordVisibilityPipe implements PipeTransform {
    transform(type: boolean): string {
        return type ? 'text' : 'password';
    }
}