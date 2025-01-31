import { Component, Input, OnDestroy, OnInit, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

export const PICTURE_SELECTABLE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PictureSelectableComponent),
  multi: true
};

/**
 * Componente para seleccionar y gestionar imágenes
 * Implementa ControlValueAccessor para integrarse con formularios reactivos de Angular
 */
@Component({
  selector: 'app-picture-selectable',
  templateUrl: './picture-selectable.component.html',
  styleUrls: ['./picture-selectable.component.scss'],
  providers:[PICTURE_SELECTABLE_VALUE_ACCESSOR]
})
export class PictureSelectableComponent  implements OnInit, ControlValueAccessor, OnDestroy {

  /** Subject que mantiene el valor actual de la imagen */
  private _picture = new BehaviorSubject("");
  /** Observable público para la imagen seleccionada */
  public picture$ = this._picture.asObservable();
  /** Indica si el componente está deshabilitado */
  isDisabled:boolean = false;
  /** Indica si hay una imagen seleccionada */
  hasValue:boolean = false;
  constructor(
    private pictureModal:ModalController
  ) { }

  /** Limpia los recursos al destruir el componente */
  ngOnDestroy(): void {
    this._picture.complete();
  }

  ngOnInit() {}

  /** Función que propaga los cambios al formulario padre */
  propagateChange = (obj: any) => {
  }

  /**
   * Establece el valor del componente desde el formulario
   * @param obj Valor a establecer (URL de la imagen)
   */
  writeValue(value: any): void {
    console.log('PictureSelectable writeValue:', value); // Debug log
    if (value) {
      this._picture.next(value);
      this.hasValue = true;
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  /**
   * Cambia la imagen actual y propaga el cambio
   * @param picture Nueva URL de la imagen
   */
  changePicture(picture:string){
    this.hasValue = picture!='';
    this._picture.next(picture);
    this.propagateChange(picture);
  }

  /**
   * Maneja el evento de cambio de imagen desde un input file
   * @param event Evento del DOM
   * @param fileLoader Elemento input file
   */
  onChangePicture(event:Event, fileLoader:HTMLInputElement){
    event.stopPropagation();
    fileLoader.onchange = ()=>{
      if(fileLoader.files && fileLoader.files?.length>0){
        var file = fileLoader.files[0];
        var reader = new FileReader();
        reader.onload = () => {
          this.changePicture(reader.result as string);
        };
        reader.onerror = (error) =>{
          console.log(error);
        }
        reader.readAsDataURL(file);
      }
    }
    fileLoader.click();
  }

  /**
   * Elimina la imagen actual
   * @param event Evento del DOM
   */
  onDeletePicture(event:Event){
    event.stopPropagation();
    this.changePicture('');
  }

  /** Cierra el modal de selección de imagen */
  close(){
    this.pictureModal?.dismiss();
  }

  

}

