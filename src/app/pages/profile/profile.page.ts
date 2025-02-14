// profile.page.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { BaseAuthenticationService } from 'src/app/core/services/impl/base-authentication.service';
import { PlaylistsService } from 'src/app/core/services/impl/playlists.service';
import { User } from 'src/app/core/models/user.model';
import { Playlist } from 'src/app/core/models/playlist.model';
import { BaseMediaService } from 'src/app/core/services/impl/base-media.service';
import { EditProfileModalComponent } from '../../shared/components/edit-profile-modal/edit-profile-modal.component';
import { UserService } from 'src/app/core/services/impl/user.service';
import { PlaylistModalComponent } from 'src/app/shared/components/playlist-modal/playlist-modal.component';

function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  page: number = 1;
  pageSize: number = 25;
  pages: number = 0;

  user?: User | null;
  followingCount = 4;
  private _playlists = new BehaviorSubject<Playlist[]>([]);
  playlists$ = this._playlists.asObservable();
  
  formGroup: FormGroup;
  changePasswordForm: FormGroup;
  profilePictureControl = new FormControl('');

  constructor(
    private authService: BaseAuthenticationService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private translateService: TranslateService,
    private playlistsService: PlaylistsService,
    private router: Router,
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private mediaService: BaseMediaService,
    private userService: UserService,
    private authSvc: BaseAuthenticationService,
  ) {
    this.formGroup = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      image: ['']
    });

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    });

    this.profilePictureControl.valueChanges.subscribe(value => {
      console.log('Profile picture value changed:', value);
    });
  }

  async ngOnInit() {
    this.loadPlaylists();
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      this.user = await this.authService.getCurrentUser();
      if(this.user) {
        console.log('User image URL:', this.user.image?.url);
        this.formGroup.patchValue({
          username: this.user.username,
          email: this.user.email,
          image: typeof this.user.image === 'object' ? 
          this.user.image.url : 
          undefined
        });
        console.log('Setting profile picture URL:', this.user.image?.url);

        this.profilePictureControl.setValue(this.user.image?.url || '');
        const playlists = await lastValueFrom(this.playlistsService.getByUserId(this.user.id));
        this._playlists.next(playlists || []);
      }
    } catch (error) {
      console.error(error);
      this.showErrorToast('COMMON.ERROR.LOAD');
    } finally {
      await loading.dismiss();
    }
  }

  async onPhotoClick() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = async (e: any) => {
      if (e.target?.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        
        try {
          const loadingElement = await this.loadingController.create();
          await loadingElement.present();
          
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              if (typeof reader.result === 'string') {
                await this.onProfilePictureChange(reader.result);
              }
            } catch (error) {
              console.error('Error processing image:', error);
              this.showErrorToast('COMMON.ERROR.UPLOAD');
            } finally {
              loadingElement.dismiss();
            }
          };
          reader.readAsDataURL(file);
          
        } catch (error) {
          console.error(error);
          this.showErrorToast('COMMON.ERROR.UPLOAD');
        }
      }
    };
    
    fileInput.click();
  }
  
  async onProfilePictureChange(newPicture: string) {
    if (!this.user?.id) return;
  
    const loadingElement = await this.loadingController.create({
      message: await lastValueFrom(this.translateService.get('COMMON.LOADING'))
    });
  
    try {
      await loadingElement.present();
  
      if (newPicture) {
        const blob = dataURLtoBlob(newPicture);
        console.log('Blob created:', blob);
        
        const uploadResult = await lastValueFrom(this.mediaService.upload(blob));
        console.log('Upload result:', uploadResult);
        
        if (uploadResult && uploadResult[0]) {
          const imageUrl = uploadResult[0] as unknown as string;
          console.log('Image URL:', imageUrl);
  
          const updateData: Partial<User> = {
            image: {
              url: imageUrl,
              large: imageUrl,
              medium: imageUrl,
              small: imageUrl,
              thumbnail: imageUrl
            }
          };
  
          const updatedUser = await lastValueFrom(this.userService.updateProfile(this.user.id, updateData));
          
          if (updatedUser) {
            this.user = {
              ...this.user,
              ...updatedUser,
              image: updateData.image
            };
            
            this.profilePictureControl.setValue(imageUrl);
            console.log('Updated user image:', this.user.image);
          }
  
          this.showSuccessToast('PROFILE.PHOTO_UPDATED');
        }
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      this.showErrorToast('COMMON.ERROR.UPLOAD');
    } finally {
      await loadingElement.dismiss();
    }
  }

  async openEditProfileModal() {
    console.log('Opening modal with user:', this.user);
    const modal = await this.modalCtrl.create({
      component: EditProfileModalComponent,
      componentProps: {
        user: this.user,
        profile: this.formGroup.value
      },
      cssClass: 'custom-modal'
    });
    return await modal.present();
  }

  async changePassword() {
    if (this.changePasswordForm.valid) {
      try {
        this.showSuccessToast('PROFILE.PASSWORD_CHANGED');
      } catch (error) {
        this.showErrorToast('COMMON.ERROR.SAVE');
      }
    }
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: await lastValueFrom(this.translateService.get(message)),
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }

  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message: await lastValueFrom(this.translateService.get(message)),
      duration: 3000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }

  logout() {
    this.authService.signOut().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  async openPlaylistModal() {
    const user = await this.authSvc.getCurrentUser();
    if (!user) {
      console.error('No user found');
      return;
    }

    const modal = await this.modalCtrl.create({
      component: PlaylistModalComponent,
      componentProps: {},
      cssClass: 'custom-modal spotify-theme'
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'create') {
        const newPlaylist: Playlist = {
          name: result.data.name,
          author: user.username,
          duration: '0:00',
          song_IDS: [],
          users_IDS: [user.id],
          ...(result.data.image && {
            image: {
              url: result.data.image.url,
              thumbnail: result.data.image.url,
              large: result.data.image.url,
              medium: result.data.image.url,
              small: result.data.image.url
            }
          })
        };

        this.playlistsService.add(newPlaylist).subscribe({
          next: () => {
            this.loadPlaylists();
          },
          error: (err) => {
            console.error('Error creating playlist:', err);
          }
        });
      }
    });

    await modal.present();
  }

  async loadPlaylists() {
    const user = await this.authService.getCurrentUser();
    if (!user) {
      console.error('No user found');
      return;
    }

    this.playlistsService.getByUserId(user.id).subscribe({
      next: (playlists: Playlist[] | null) => {
        this._playlists.next(playlists ?? []);
      },
      error: (err) => {
        console.error('Error loading playlists:', err);
      }
    });
  }
}