import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlaylistDetailPage } from './playlist-detail.page';

describe('PlaylistDetailPage', () => {
  let component: PlaylistDetailPage;
  let fixture: ComponentFixture<PlaylistDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
