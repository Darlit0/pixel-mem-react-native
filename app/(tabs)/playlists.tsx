import { PlaylistCreator } from '@/components/playlist-creator';
import { usePlaylistStorage } from '@/hooks/use-playlist-storage';
import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlaylistsScreen() {
  const { playlists, loading, addPlaylist, deletePlaylist } = usePlaylistStorage();
  const [isCreating, setIsCreating] = useState(false);

  const handlePlaylistCreated = async (name: string, photos: string[]) => {
    try {
      await addPlaylist(name, photos);
      setIsCreating(false);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la playlist');
    }
  };

  const handleDeletePlaylist = (id: string, name: string) => {
    Alert.alert(
      'Supprimer',
      `Êtes-vous sûr de vouloir supprimer "${name}"?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlaylist(id);
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer la playlist');
            }
          },
        },
      ]
    );
  };

  if (isCreating) {
    return (
      <PlaylistCreator
        onPlaylistCreated={handlePlaylistCreated}
        onCancel={() => setIsCreating(false)}
      />
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-purple-100">
      <View className="px-4 pt-4 pb-2">
        <View className="bg-white rounded-xl border-2 border-purple-300 px-4 py-3">
          <Text className="text-xl font-bold text-center text-purple-600">🎬 Mes playlists</Text>
          <Text className="text-sm text-center text-purple-500 mt-1">
            {playlists.length} playlist{playlists.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-purple-600 font-semibold">Chargement...</Text>
        </View>
      ) : playlists.length === 0 ? (
        <View className="flex-1 items-center justify-center px-5 gap-4">
          <Text className="text-5xl">🎬</Text>
          <Text className="text-lg font-semibold text-purple-600 text-center">
            Aucune playlist
          </Text>
          <Text className="text-sm text-purple-500 text-center">
            Créez votre première playlist pour commencer!
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 py-4">
          {playlists.map((playlist) => (
            <Pressable
              key={playlist.id}
              onLongPress={() => handleDeletePlaylist(playlist.id, playlist.name)}
              className="bg-white rounded-lg p-4 mb-4 border-2 border-purple-300 active:bg-purple-50"
            >
              <View className="flex-row items-center gap-4">
                {/* Thumbnail grid */}
                <View className="w-20 h-20 bg-purple-100 rounded-lg overflow-hidden">
                  <View className="flex-1 flex-row flex-wrap">
                    {playlist.photos.slice(0, 4).map((photo, idx) => (
                      <View
                        key={idx}
                        className="flex-1 border-r border-b border-purple-200"
                      >
                        {photo ? (
                          <Image
                            source={{ uri: photo }}
                            className="w-full h-full"
                          />
                        ) : (
                          <View className="flex-1 bg-purple-50 items-center justify-center">
                            <Text className="text-xs text-purple-300">+</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>

                {/* Info */}
                <View className="flex-1">
                  <Text className="text-lg font-bold text-purple-600 mb-1">
                    {playlist.name}
                  </Text>
                  <Text className="text-xs text-purple-500">
                    {playlist.photos.length} photo{playlist.photos.length !== 1 ? 's' : ''}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1">
                    {new Date(playlist.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </Text>
                </View>

                {/* Icon */}
                <Text className="text-2xl">▶️</Text>
              </View>

              <Text className="text-xs text-purple-400 mt-3 text-center">
                Appui long pour supprimer
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Create Button */}
      <View className="border-t-4 border-purple-600 px-5 py-4">
        <Pressable
          onPress={() => setIsCreating(true)}
          className="bg-green-500 rounded-lg py-4 items-center border-2 border-green-700 active:bg-green-600"
        >
          <Text className="text-white font-bold text-lg">+ Nouvelle Playlist</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
