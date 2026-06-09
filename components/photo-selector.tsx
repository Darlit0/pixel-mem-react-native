import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';

interface PhotoSelectorProps {
  onPhotosSelected: (photos: string[]) => void;
  onSkip: () => void;
}

export const PhotoSelector: React.FC<PhotoSelectorProps> = ({
  onPhotosSelected,
  onSkip,
}) => {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const PHOTOS_NEEDED = 8;

  const pickImage = async (index: number) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newPhotos = [...selectedPhotos];
        newPhotos[index] = result.assets[0].uri;
        setSelectedPhotos(newPhotos);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger l\'image');
    }
  };

  const takePhoto = async (index: number) => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission', 'Accès à la caméra refusé');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newPhotos = [...selectedPhotos];
        newPhotos[index] = result.assets[0].uri;
        setSelectedPhotos(newPhotos);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'accéder à la caméra');
    }
  };

  const handlePlayWithPhotos = () => {
    const filledCount = selectedPhotos.filter((p) => p).length;
    if (filledCount === 0) {
      Alert.alert('Aucune photo', 'Sélectionnez au moins une photo');
      return;
    }
    // Pad missing photos with empty strings, will use emojis as fallback
    const finalPhotos = Array(PHOTOS_NEEDED)
      .fill('')
      .map((_, i) => selectedPhotos[i] || '');
    onPhotosSelected(finalPhotos);
  };

  const isFull = selectedPhotos.filter((p) => p).length === PHOTOS_NEEDED;

  return (
    <View className="flex-1 bg-purple-100">
      {/* Header */}
      <View className="border-b-4 border-purple-600 px-5 py-4">
        <Text className="text-3xl font-bold text-center text-purple-600 tracking-wider mb-2">
          📸 PHOTO MODE
        </Text>
        <Text className="text-sm text-center text-purple-600">
          Choisissez {PHOTOS_NEEDED} photos pour remplacer les emojis
        </Text>
      </View>

      {/* Instructions */}
      <View className="bg-white/50 mx-4 mt-4 rounded-lg p-3 border-2 border-purple-300">
        <Text className="text-xs text-gray-700 text-center">
          Appuyez sur chaque case pour prendre une photo ou en importer une
        </Text>
      </View>

      {/* Photo Grid */}
      <ScrollView className="flex-1 px-4 py-4">
        <View className="flex-row flex-wrap justify-around">
          {Array(PHOTOS_NEEDED)
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
                    <Text className="text-3xl">
                      {index < 5 ? '📷' : '🖼️'}
                    </Text>
                  )}
                </Pressable>
                <Text className="text-xs text-purple-600 mt-1 font-semibold">
                  {index + 1}/{PHOTOS_NEEDED}
                </Text>
              </View>
            ))}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="bg-white border-t-4 border-purple-600 px-4 py-4 gap-2">
        <Pressable
          onPress={handlePlayWithPhotos}
          disabled={selectedPhotos.filter((p) => p).length === 0}
          className={`rounded-lg py-4 items-center border-2 ${
            selectedPhotos.filter((p) => p).length === 0
              ? 'bg-gray-300 border-gray-400'
              : `${
                  isFull
                    ? 'bg-green-500 border-green-700'
                    : 'bg-purple-600 border-purple-800'
                }`
          }`}
        >
          <Text className="text-white font-bold text-lg">
            {isFull ? '✅ Jouer avec les photos!' : '▶️ Jouer'}
          </Text>
          <Text className="text-xs text-white mt-1">
            {selectedPhotos.filter((p) => p).length}/{PHOTOS_NEEDED} photos
          </Text>
        </Pressable>

        <Pressable
          onPress={onSkip}
          className="rounded-lg py-3 items-center border-2 border-gray-400 bg-gray-200"
        >
          <Text className="text-gray-700 font-semibold">
            ⏭️ Garder les emojis
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
