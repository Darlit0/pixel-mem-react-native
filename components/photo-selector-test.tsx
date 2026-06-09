import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface PhotoSelectorProps {
  onPhotosSelected: (photos: string[]) => void;
  onSkip: () => void;
}

export const PhotoSelector: React.FC<PhotoSelectorProps> = ({
  onPhotosSelected,
  onSkip,
}) => {
  return (
    <View className="flex-1 bg-purple-100">
      <View className="border-b-4 border-purple-600 px-5 py-4">
        <Text className="text-3xl font-bold text-center text-purple-600">
          📸 PHOTO MODE
        </Text>
      </View>

      <View className="flex-1 items-center justify-center">
        <Text className="text-lg text-purple-600 mb-5 text-center px-5">
          Sélectionnez les photos depuis la galerie ou votre caméra
        </Text>
        
        <Pressable
          onPress={() => onPhotosSelected(Array(8).fill(''))}
          className="bg-green-500 rounded-lg px-8 py-4 mb-4"
        >
          <Text className="text-white font-bold">✅ Jouer (test)</Text>
        </Pressable>

        <Pressable
          onPress={onSkip}
          className="bg-gray-400 rounded-lg px-8 py-4"
        >
          <Text className="text-white font-bold">⏭️ Garder les emojis</Text>
        </Pressable>
      </View>
    </View>
  );
};
