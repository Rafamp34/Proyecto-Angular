// src/app/shared/pipes/playlist-duration.pipe.spec.ts
import { PlaylistDurationPipe } from './playlist-duration.pipte';
import { Playlist } from '../../core/models/playlist.model';

describe('PlaylistDurationPipe', () => {
  let pipe: PlaylistDurationPipe;

  beforeEach(() => {
    pipe = new PlaylistDurationPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "0:00" for null playlist', () => {
    expect(pipe.transform(null)).toBe('0:00');
  });

  it('should handle playlist with defined duration string', () => {
    const playlist = {
      id: '1',
      name: 'Test Playlist',
      author: 'Test Author',
      duration: '5:35',
      song_IDS: ['1', '2'],
      users_IDS: ['1']
    } as Playlist;

    expect(pipe.transform(playlist)).toBe('5:35');
  });

  it('should format duration with hours correctly', () => {
    const playlist = {
      id: '1',
      name: 'Test Playlist',
      author: 'Test Author',
      duration: '1:25:30',
      song_IDS: ['1', '2'],
      users_IDS: ['1']
    } as Playlist;

    expect(pipe.transform(playlist)).toBe('1:25:30');
  });

  it('should handle numeric duration string', () => {
    const playlist = {
      id: '1',
      name: 'Test Playlist',
      author: 'Test Author',
      duration: '330', // 5:30
      song_IDS: ['1', '2'],
      users_IDS: ['1']
    } as Playlist;

    expect(pipe.transform(playlist)).toBe('5:30');
  });

  it('should return "0:00" for invalid duration string', () => {
    const playlist = {
      id: '1',
      name: 'Test Playlist',
      author: 'Test Author',
      duration: 'invalid',
      song_IDS: ['1', '2'],
      users_IDS: ['1']
    } as Playlist;

    expect(pipe.transform(playlist)).toBe('0:00');
  });

  it('should handle playlist with no duration but with song_IDS', () => {
    const playlist = {
      id: '1',
      name: 'Test Playlist',
      author: 'Test Author',
      duration: '',
      song_IDS: ['1', '2'],
      users_IDS: ['1']
    } as Playlist;

    expect(pipe.transform(playlist)).toBe('--:--');
  });

  it('should handle playlist with no duration and no songs', () => {
    const playlist = {
      id: '1',
      name: 'Test Playlist',
      author: 'Test Author',
      duration: '',
      song_IDS: [],
      users_IDS: ['1']
    } as Playlist;

    expect(pipe.transform(playlist)).toBe('0:00');
  });
});