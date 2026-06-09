import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

interface PlaylistCreatorProps {
  onPlaylistCreated: (name: string, photos: string[]) => void;
  onCancel: () => void;
}

export const PlaylistCreator: React.FC<PlaylistCreatorProps> = ({
  onPlaylistCreated,
  onCancel,
}) => {
  const [step, setStep] = useState<'select-count' | 'select-photos' | 'name'>('select-count');
  const [photoCount, setPhotoCount] = useState(0);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [playlistName, setPlaylistName] = useState('');

  const takePhoto = async (index: number) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newPhotos = [...selectedPhotos];
        newPhotos[index] = result.assets[0].uri;
        setSelectedPhotos(newPhotos);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'accéder à la caméra');
    }
  };

  const pickImage = async (index: number) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newPhotos = [...selectedPhotos];
        newPhotos[index] = result.assets[0].uri;
        setSelectedPhotos(newPhotos);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger l\'image');
    }
  };

  const handleSelectCount = (count: number) => {
    setPhotoCount(count);
    setSelectedPhotos(Array(count).fill(''));
    setStep('select-photos');
  };

  const handlePhotosConfirm = () => {
    const filledCount = selectedPhotos.filter((p) => p).length;
    if (filledCount !== photoCount) {
      Alert.alert('Erreur', `Ajoutez toutes les photos (${photoCount}) avant de continuer`);
      return;
    }
    setStep('name');
  };

  const handleCreatePlaylist = () => {
    if (!playlistName.trim()) {
      Alert.alert('Erreur', 'Donnez un nom à la playlist');
      return;
    }

    const cleanedPhotos = selectedPhotos.filter(Boolean);
    if (cleanedPhotos.length !== photoCount) {
      Alert.alert('Erreur', 'Playlist incomplète: ajoutez toutes les photos');
      return;
    }

    onPlaylistCreated(playlistName.trim(), cleanedPhotos);
  };

  // Step 1: Select photo count
  if (step === 'select-count') {
    return (
      <View className="flex-1 bg-purple-100">
        <View className="border-b-4 border-purple-600 px-5 py-4">
          <Text className="text-3xl font-bold text-center text-purple-600">
            📸 NOUVELLE PLAYLIST
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-5 gap-4">
          <Text className="text-lg text-purple-600 text-center font-semibold mb-6">
            Combien de photos?
          </Text>

          {[
            { count: 4, emoji: '🔹' },
            { count: 6, emoji: '🔸' },
            { count: 8, emoji: '⭐' },
          ].map(({ count, emoji }) => (
            <Pressable
              key={count}
              onPress={() => handleSelectCount(count)}
              className="w-full bg-purple-600 rounded-lg py-5 items-center border-2 border-purple-700 active:bg-purple-700"
            >
              <Text className="text-white font-bold text-xl">
                {emoji} {count} Photos
              </Text>
            </Pressable>
          ))}

          <Pressable
            onPress={onCancel}
            className="mt-10 bg-gray-400 rounded-lg py-3 px-8"
          >
            <Text className="text-white font-semibold">Annuler</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Step 2: Select photos
  if (step === 'select-photos') {
    const filledCount = selectedPhotos.filter((p) => p).length;

    return (
      <View className="flex-1 bg-purple-100">
        <View className="border-b-4 border-purple-600 px-5 py-4">
          <Text className="text-3xl font-bold text-center text-purple-600">
            📸 PHOTOS
          </Text>
          <Text className="text-sm text-center text-purple-600 mt-2">
            {filledCount}/{photoCount} photos sélectionnées
          </Text>
        </View>

        <ScrollView className="flex-1 px-4 py-4">
          <View className="flex-row flex-wrap justify-around">
            {Array(photoCount)
              .fill(null)
              .map((_, index) => (
                <View key={index} className="items-center mb-4">
                  <Pressable
                    onPress={() => takePhoto(index)}
                    onLongPress={() => pickImage(index)}
                    className="relative bg-purple-200 border-2 border-purple-600 rounded-lg overflow-hidden w-20 h-20 items-center justify-center active:bg-purple-300"
                  >
                    {selectedPhotos[index] ? (
                      <Image
                        source={{ uri: selectedPhotos[index] }}
                        className="w-full h-full"
                      />
                    ) : (
                      <Text className="text-3xl">📷</Text>
                    )}
                  </Pressable>
                  <Text className="text-xs text-purple-600 mt-1 font-semibold">
                    {index + 1}/{photoCount}
                  </Text>
                </View>
              ))}
          </View>
        </ScrollView>

        <View className="bg-white border-t-4 border-purple-600 px-4 py-4 gap-2">
          <Pressable
            onPress={handlePhotosConfirm}
            disabled={filledCount !== photoCount}
            className={`rounded-lg py-4 items-center border-2 ${
              filledCount !== photoCount
                ? 'bg-gray-300 border-gray-400'
                : 'bg-green-500 border-green-700'
            }`}
          >
            <Text className="text-white font-bold text-lg">
              ✅ Continuer ({filledCount})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setStep('select-count')}
            className="rounded-lg py-3 items-center border-2 border-gray-400 bg-gray-200"
          >
            <Text className="text-gray-700 font-semibold">← Retour</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Step 3: Name playlist
  if (step === 'name') {
    return (
      <View className="flex-1 bg-purple-100">
        <View className="border-b-4 border-purple-600 px-5 py-4">
          <Text className="text-3xl font-bold text-center text-purple-600">
            📝 NOM
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-5 gap-6">
          <Text className="text-lg text-purple-600 text-center font-semibold">
            Donnez un nom à votre playlist
          </Text>

          <TextInput
            placeholder="Ex: Mes emojis préférés"
            placeholderTextColor="#9B59B6"
            value={playlistName}
            onChangeText={setPlaylistName}
            maxLength={30}
            className="w-full bg-white border-2 border-purple-600 rounded-lg px-4 py-3 text-lg text-purple-600 font-semibold"
          />

          <Text className="text-xs text-purple-500">
            {playlistName.length}/30 caractères
          </Text>

          <Pressable
            onPress={handleCreatePlaylist}
            disabled={!playlistName.trim()}
            className={`w-full rounded-lg py-4 items-center border-2 ${
              playlistName.trim()
                ? 'bg-green-500 border-green-700'
                : 'bg-gray-300 border-gray-400'
            }`}
          >
            <Text className="text-white font-bold text-lg">
              ✨ Créer la playlist
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setStep('select-photos')}
            className="mt-10 bg-gray-400 rounded-lg py-3 px-8"
          >
            <Text className="text-white font-semibold">← Retour</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return null;
};
