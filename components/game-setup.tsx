import { MemoryGame } from '@/components/memory-game';
import { PlaylistCreator } from '@/components/playlist-creator';
import { usePlaylistStorage } from '@/hooks/use-playlist-storage';
import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';

type GameMode = 'menu' | 'emoji-setup' | 'playlist-select' | 'create-playlist' | 'summary' | 'game';

interface GameConfig {
  mode: 'emoji' | 'playlist';
  count: number;
  playlistId?: string;
  playlistName?: string;
  photos?: string[];
}

export const GameSetup: React.FC = () => {
  const { playlists, addPlaylist } = usePlaylistStorage();
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [gameSessionKey, setGameSessionKey] = useState(0);

  const resetToMenu = () => {
    setGameMode('menu');
    setGameConfig(null);
  };

  // Step 1: Menu - Choose between emojis or playlist
  if (gameMode === 'create-playlist') {
    const handlePlaylistCreated = async (name: string, photos: string[]) => {
      await addPlaylist(name, photos);
      setGameMode('playlist-select');
    };

    return (
      <PlaylistCreator
        onPlaylistCreated={handlePlaylistCreated}
        onCancel={() => setGameMode('playlist-select')}
      />
    );
  }

  // Step 2: Menu - Choose between emojis or playlist
  if (gameMode === 'menu') {
    return (
      <View className="flex-1 bg-[#f0e6ff]">
        <View className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-[#9B59B6]/15" />
        <View className="absolute top-28 -right-10 h-28 w-28 rounded-full bg-[#FF3B9A]/15" />
        <View className="absolute bottom-24 -left-12 h-32 w-32 rounded-full bg-[#00D95F]/10" />

        <View className="flex-1 px-5 py-6 justify-center gap-5">
          {/* Emoji Mode */}
          <Pressable
            onPress={() => setGameMode('emoji-setup')}
            className="rounded-3xl border-4 border-[#005fcc] bg-[#0099FF] px-5 py-7 shadow-lg active:opacity-90"
          >
            <View className="flex-row items-center">
              <View className="h-16 w-16 items-center justify-center rounded-2xl bg-white/20 mr-4">
                <Text className="text-4xl">😀</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-2xl">Jouer avec des Emojis</Text>
                <Text className="text-white/85 text-sm mt-1">{8} paires disponibles, ambiance rapide et fun</Text>
              </View>
            </View>
            <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-white/15 px-4 py-3">
              <Text className="text-white font-semibold">Mode classique</Text>
              <Text className="text-white font-bold">→</Text>
            </View>
          </Pressable>

          {/* Playlist Mode */}
          <Pressable
            onPress={() => setGameMode('playlist-select')}
            className="rounded-3xl border-4 border-[#b3126f] bg-[#FF3B9A] px-5 py-7 shadow-lg active:opacity-90"
          >
            <View className="flex-row items-center">
              <View className="h-16 w-16 items-center justify-center rounded-2xl bg-white/20 mr-4">
                <Text className="text-4xl">📸</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-2xl">Jouer avec vos Photos</Text>
                <Text className="text-white/85 text-sm mt-1">{playlists.length} playlist{playlists.length !== 1 ? 's' : ''} enregistrée{playlists.length !== 1 ? 's' : ''}</Text>
              </View>
            </View>
            <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-white/15 px-4 py-3">
              <Text className="text-white font-semibold">Mode personnalisé</Text>
              <Text className="text-white font-bold">→</Text>
            </View>
          </Pressable>

        </View>
      </View>
    );
  }

  // Step 2: Emoji Setup - Choose count (4, 6, or 8)
  if (gameMode === 'emoji-setup') {
    return (
      <View className="flex-1 bg-purple-100">
        <View className="border-b-4 border-purple-600 px-5 py-4">
          <Text className="text-3xl font-bold text-center text-purple-600">
            😀 EMOJIS
          </Text>
          <Text className="text-sm text-center text-purple-600 mt-2">
            Choisir la difficulté
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-5 gap-4">
          {[4, 6, 8].map((count) => (
            <Pressable
              key={count}
              onPress={() => {
                setGameConfig({
                  mode: 'emoji',
                  count,
                });
                setGameMode('summary');
              }}
              className="w-full bg-blue-500 rounded-lg py-5 items-center border-2 border-blue-700 active:bg-blue-600"
            >
              <Text className="text-white font-bold text-lg">
                {count === 4 ? '🔹' : count === 6 ? '🔸' : '⭐'} {count} Paires ({count * 2} cartes)
              </Text>
            </Pressable>
          ))}

          <Pressable
            onPress={() => setGameMode('menu')}
            className="mt-10 bg-gray-400 rounded-lg py-3 px-8"
          >
            <Text className="text-white font-semibold">← Retour</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Step 3: Playlist Select - Choose or create playlist
  if (gameMode === 'playlist-select') {
    return (
      <View className="flex-1 bg-purple-100">
        <View className="border-b-4 border-purple-600 px-5 py-4">
          <Text className="text-3xl font-bold text-center text-purple-600">
            📸 PLAYLISTS
          </Text>
          <Text className="text-sm text-center text-purple-600 mt-2">
            Choisir une playlist
          </Text>
        </View>

        {playlists.length === 0 ? (
          <View className="flex-1 items-center justify-center px-5 gap-4">
            <Text className="text-5xl">📂</Text>
            <Text className="text-lg font-semibold text-purple-600">Aucune playlist</Text>
            <Text className="text-sm text-purple-500 text-center">Créez votre première playlist pour commencer!</Text>
          </View>
        ) : (
          <ScrollView className="flex-1 px-4 py-4">
            {playlists.map((playlist) => (
              <Pressable
                key={playlist.id}
                onPress={() => {
                  const validPhotos = playlist.photos.filter((photo) => photo && photo.trim().length > 0);
                  if (![4, 6, 8].includes(validPhotos.length)) {
                    Alert.alert(
                      'Playlist invalide',
                      'Cette playlist doit contenir exactement 4, 6 ou 8 photos. Modifiez-la ou créez-en une nouvelle.'
                    );
                    return;
                  }

                  setGameConfig({
                    mode: 'playlist',
                    count: validPhotos.length,
                    playlistId: playlist.id,
                    playlistName: playlist.name,
                    photos: validPhotos,
                  });
                  setGameMode('summary');
                }}
                className="bg-white rounded-lg p-4 mb-3 border-2 border-pink-300 active:bg-pink-50"
              >
                <View className="flex-row items-center gap-4">
                  {/* Thumbnail */}
                  <View className="w-16 h-16 bg-pink-100 rounded-lg overflow-hidden">
                    <View className="flex-1 flex-row flex-wrap">
                      {playlist.photos.slice(0, 4).map((photo, idx) => (
                        <View
                          key={idx}
                          className="flex-1 border border-pink-200"
                        >
                          {photo ? (
                            <Image
                              source={{ uri: photo }}
                              className="w-full h-full"
                            />
                          ) : (
                            <View className="flex-1 bg-pink-50" />
                          )}
                        </View>
                      ))}
                    </View>
                  </View>

                  <View className="flex-1">
                    <Text className="text-lg font-bold text-purple-600">
                      {playlist.name}
                    </Text>
                    <Text className="text-xs text-purple-500 mt-1">
                      {playlist.photos.length} photo{playlist.photos.length !== 1 ? 's' : ''}
                    </Text>
                  </View>

                  <Text className="text-2xl">▶️</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View className="border-t-4 border-purple-600 px-5 py-4 gap-2">
          <Pressable
            onPress={() => setGameMode('create-playlist')}
            className="bg-green-500 rounded-lg py-3 items-center border-2 border-green-700 active:bg-green-600 mb-2"
          >
            <Text className="text-white font-semibold">+ Créer une nouvelle</Text>
          </Pressable>

          <Pressable
            onPress={() => setGameMode('menu')}
            className="bg-gray-400 rounded-lg py-3 items-center border-2 border-gray-500"
          >
            <Text className="text-white font-semibold">← Retour</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Step 5: Summary - Review before launching
  if (gameMode === 'summary' && gameConfig) {
    const isEmoji = gameConfig.mode === 'emoji';
    const SYMBOLS = ['🌟', '🎮', '🍕', '🎵', '🦄', '🎨', '🔥', '💎'];
    const pairCount = isEmoji ? gameConfig.count : (gameConfig.photos?.length ?? gameConfig.count);

    return (
      <View className="flex-1 bg-purple-100">
        <View className="border-b-4 border-purple-600 px-5 py-4">
          <Text className="text-3xl font-bold text-center text-purple-600">
            ✅ RÉSUMÉ
          </Text>
        </View>

        <ScrollView className="flex-1 px-5 py-4">
          {/* Mode */}
          <View className="bg-white rounded-lg p-4 mb-4 border-2 border-purple-300">
            <Text className="text-sm text-purple-500 font-semibold mb-1">Mode de jeu</Text>
            <Text className="text-lg text-purple-600 font-bold">
              {isEmoji ? '😀 Emojis' : `📸 ${gameConfig.playlistName}`}
            </Text>
          </View>

          {/* Count */}
          <View className="bg-white rounded-lg p-4 mb-4 border-2 border-purple-300">
            <Text className="text-sm text-purple-500 font-semibold mb-1">Difficulté</Text>
            <Text className="text-lg text-purple-600 font-bold">
              {isEmoji
                ? gameConfig.count === 4
                  ? '🔹 Facile'
                  : gameConfig.count === 6
                    ? '🔸 Normal'
                    : '⭐ Difficile'
                : '📸 Selon la playlist'}
            </Text>
            <Text className="text-xs text-purple-400 mt-2">
              {pairCount} paires = {pairCount * 2} cartes
            </Text>
          </View>

          {/* Preview */}
          <View className="bg-white rounded-lg p-4 mb-4 border-2 border-purple-300">
            <Text className="text-sm text-purple-500 font-semibold mb-3">Aperçu</Text>
            <View className="flex-row flex-wrap justify-around">
              {isEmoji ? (
                SYMBOLS.slice(0, pairCount).map((emoji, idx) => (
                  <Text key={idx} className="text-4xl mb-3">
                    {emoji}
                  </Text>
                ))
              ) : (
                gameConfig.photos?.slice(0, pairCount).map((photo, idx) => (
                  <View
                    key={idx}
                    className="w-20 h-20 bg-purple-100 rounded-lg overflow-hidden mb-3 border-2 border-purple-300"
                  >
                    {photo ? (
                      <Image source={{ uri: photo }} className="w-full h-full" />
                    ) : (
                      <View className="flex-1 bg-purple-50 items-center justify-center">
                        <Text className="text-xs text-purple-300">+</Text>
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>

        {/* Action buttons */}
        <View className="border-t-4 border-purple-600 px-5 py-4 gap-2">
          <Pressable
            onPress={() => setGameMode('game')}
            className="bg-green-500 rounded-lg py-4 items-center border-2 border-green-700 active:bg-green-600"
          >
            <Text className="text-white font-bold text-lg">🚀 Lancer la partie</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setGameMode('menu');
              setGameConfig(null);
            }}
            className="bg-gray-400 rounded-lg py-3 items-center border-2 border-gray-500"
          >
            <Text className="text-white font-semibold">← Menu</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Step 6: Game - Launch the game
  if (gameMode === 'game' && gameConfig) {
    return (
      <MemoryGame
        key={gameSessionKey}
        mode={gameConfig.mode}
        count={(gameConfig.mode === 'playlist' ? (gameConfig.photos?.length ?? gameConfig.count) : gameConfig.count) as 4 | 6 | 8}
        playlistPhotos={gameConfig.photos}
        onRestartGame={() => {
          setGameSessionKey((value) => value + 1);
        }}
        onBackToSetup={() => {
          resetToMenu();
        }}
        onGameEnd={() => {
          resetToMenu();
        }}
      />
    );
  }

  return null;
};
