// artists.page.ts
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AlertController, ModalController } from '@ionic/angular';
import { ArtistsService } from '../../core/services/impl/artists.service';
import { Artist } from '../../core/models/artist.model';
import { Paginated } from '../../core/models/paginated.model';
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
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadArtists();
  }

  loadArtists() {
    this.page = 1;
    this.artistsSvc.getAll(this.page, this.pageSize).subscribe({
      next: (response: Paginated<Artist>) => {
        this._artists.next([...response.data]);
        this.page++;
        this.pages = response.pages;
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
        this.artistsSvc.update(artist.id, result.data).subscribe({
          next: () => {
            this.loadArtists();
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

  onIonInfinite(ev: any) {
    if (this.page <= this.pages) {
      this.artistsSvc.getAll(this.page, this.pageSize).subscribe({
        next: (response: Paginated<Artist>) => {
          this._artists.next([...this._artists.value, ...response.data]);
          this.page++;
          ev.target.complete();
        }
      });
    } else {
      ev.target.complete();
    }
  }
}