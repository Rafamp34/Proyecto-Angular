import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AlertController, ModalController } from '@ionic/angular';
import { ArtistsService } from '../../core/services/impl/artists.service';
import { Artist } from '../../core/models/artist.model';
import { Paginated } from '../../core/models/paginated.model';
import { Router } from '@angular/router';
import { ArtistModalComponent } from 'src/app/shared/components/artist-modal.component/artist-modal.component';

@Component({
  selector: 'app-artists',
  templateUrl: './artists.page.html',
  styleUrls: ['./artists.page.scss'],
})
export class ArtistsPage implements OnInit {
  private _artists = new BehaviorSubject<Artist[]>([]);
  artists$ = this._artists.asObservable();
  
  page: number = 1;
  pageSize: number = 25;
  pages: number = 0;

  constructor(
    private artistsSvc: ArtistsService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('ArtistsPage - ngOnInit');
    this.loadArtists();
  }

  loadArtists() {
    console.log('Loading artists - Page:', this.page);
    this.page = 1;
    this.artistsSvc.getAll(this.page, this.pageSize).subscribe({
      next: (response: Paginated<Artist>) => {
        console.log('Artists response:', response);
        this._artists.next([...response.data]);
        this.page++;
        this.pages = response.pages;
      },
      error: (error) => {
        console.error('Error loading artists:', error);
      }
    });
  }

  async onAddArtist() {
    const modal = await this.modalCtrl.create({
      component: ArtistModalComponent,
      componentProps: {}
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'create') {
        this.artistsSvc.add(result.data).subscribe({
          next: () => {
            this.loadArtists();
          },
          error: (err) => {
            console.error('Error creating artist:', err);
          }
        });
      }
    });

    await modal.present();
  }

  async onUpdateArtist(artist: Artist) {
    const modal = await this.modalCtrl.create({
      component: ArtistModalComponent,
      componentProps: {
        artist: artist
      }
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.role === 'update') {
        const formData = result.data; // Obtén el FormData enviado desde el modal
  
        console.log('Datos actualizados:', formData); // Verifica los datos actualizados
  
        // Llama al servicio para actualizar el artista
        this.artistsSvc.update(artist.id, formData).subscribe({
          next: (updatedArtist) => {
            console.log('Artista actualizado:', updatedArtist); // Verifica el artista devuelto por el servidor
            // Actualiza la lista de artistas con el objeto devuelto por el servidor
            const currentArtists = this._artists.value;
            const index = currentArtists.findIndex(a => a.id === artist.id);
            if (index !== -1) {
              currentArtists[index] = updatedArtist; // Reemplaza el artista antiguo con el actualizado
              this._artists.next([...currentArtists]); // Notifica el cambio
            }
          },
          error: (err) => {
            console.error('Error updating artist:', err);
          }
        });
      }
    });
  
    await modal.present();
  }

  async onDeleteArtist(artist: Artist) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Artist',
      message: 'Are you sure you want to delete this artist?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.artistsSvc.delete(artist.id).subscribe({
              next: () => this.loadArtists(),
              error: console.error
            });
          }
        }
      ]
    });

    await alert.present();
  }

  onSelectArtist(artist: Artist) {
    this.router.navigate(['/artists', artist.id]);
  }

  onIonInfinite(ev: any) {
    if (this.page <= this.pages) {
      this.artistsSvc.getAll(this.page, this.pageSize).subscribe({
        next: (response: Paginated<Artist>) => {
          console.log('Loading more artists - Page:', this.page, 'Response:', response);
          this._artists.next([...this._artists.value, ...response.data]);
          this.page++;
          ev.target.complete();
        },
        error: (error) => {
          console.error('Error loading more artists:', error);
          ev.target.complete();
        }
      });
    } else {
      ev.target.complete();
    }
  }
}