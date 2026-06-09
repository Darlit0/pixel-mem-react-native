import { documentDirectory, getInfoAsync, readAsStringAsync, writeAsStringAsync } from 'expo-file-system/legacy';
import { useCallback, useEffect, useState } from 'react';

export interface Playlist {
  id: string;
  name: string;
  photos: string[];
  createdAt: number;
}

const STORAGE_FILE = `${documentDirectory}pixel_mem_playlists.json`;

const sanitizePhotos = (photos: string[] = []) =>
  photos.filter((photo) => typeof photo === 'string' && photo.trim().length > 0);

const sanitizePlaylist = (playlist: Playlist): Playlist => ({
  ...playlist,
  name: playlist.name?.trim() || 'Playlist',
  photos: sanitizePhotos(playlist.photos),
});

export const usePlaylistStorage = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  // Load playlists from storage
  const loadPlaylists = useCallback(async () => {
    try {
      setLoading(true);
      const fileExists = await getInfoAsync(STORAGE_FILE);
      if (fileExists.exists) {
        const data = await readAsStringAsync(STORAGE_FILE);
        const parsed = JSON.parse(data) as Playlist[];
        const sanitized = parsed.map(sanitizePlaylist);
        setPlaylists(sanitized);

        // Persist sanitized data to heal previously saved invalid playlists.
        await writeAsStringAsync(STORAGE_FILE, JSON.stringify(sanitized));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des playlists:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load playlists on mount
  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  // Add new playlist
  const addPlaylist = useCallback(
    async (name: string, photos: string[]) => {
      try {
        const newPlaylist: Playlist = {
          id: Date.now().toString(),
          name: name.trim(),
          photos: sanitizePhotos(photos),
          createdAt: Date.now(),
        };

        const updated = [...playlists, newPlaylist];
        setPlaylists(updated);
        await writeAsStringAsync(STORAGE_FILE, JSON.stringify(updated));
        return newPlaylist;
      } catch (error) {
        console.error('Erreur lors de la création de la playlist:', error);
        throw error;
      }
    },
    [playlists]
  );

  // Delete playlist
  const deletePlaylist = useCallback(
    async (id: string) => {
      try {
        const updated = playlists.filter((p) => p.id !== id);
        setPlaylists(updated);
        await writeAsStringAsync(STORAGE_FILE, JSON.stringify(updated));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        throw error;
      }
    },
    [playlists]
  );

  return {
    playlists,
    loading,
    addPlaylist,
    deletePlaylist,
    refreshPlaylists: loadPlaylists,
  };
};
