import { useMemoryGame } from '@/hooks/use-memory-game';
import React, { useEffect, useMemo } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MemoryCard } from './memory-card';

const windowWidth = Dimensions.get('window').width;

interface MemoryGameProps {
  mode?: 'emoji' | 'playlist';
  count?: 4 | 6 | 8;
  playlistPhotos?: string[];
  onGameEnd?: () => void;
  onBackToSetup?: () => void;
  onRestartGame?: () => void;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({
  mode = 'emoji',
  count = 8,
  playlistPhotos,
  onGameEnd,
  onBackToSetup,
  onRestartGame,
}) => {
  // Stabilize playlistPhotos to avoid infinite loops
  const memoizedPhotos = useMemo(() => playlistPhotos || [], [playlistPhotos?.join('|') || '']);

  const { cards, moves, matches, gameWon, initGame, flipCard, totalPairs, gameRound } =
    useMemoryGame({ mode, count, playlistPhotos: memoizedPhotos });

  // Initialize game on mount
  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (gameWon && onGameEnd) {
      // Give a moment for the celebration animation
      const timer = setTimeout(onGameEnd, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameWon, onGameEnd]);

  const handleNewGame = () => {
    if (onRestartGame) {
      onRestartGame();
      return;
    }

    initGame();
  };

  // Calculate grid size based on count
  const gridSize = count === 4 ? 2 : count === 6 ? 3 : 4;
  const CARD_SCALE = 0.82; // reduce cards to 82% of calculated size
  const cardWidth = ((windowWidth - 80) / gridSize) * CARD_SCALE;

  return (
    <View className="flex-1 bg-purple-100">
      {/* Header */}
      <View className="border-b-4 border-purple-600 px-5 py-4">
        <Text className="text-3xl font-bold text-center text-purple-600 tracking-wider mb-3">🧠 PIXEL MEM</Text>
        <View className="flex-row justify-around">
          <View className="flex-1 bg-purple-600 rounded-lg p-2 mr-2 items-center">
            <Text className="text-xs text-white font-semibold">Moves</Text>
            <Text className="text-2xl font-bold text-white">{moves}</Text>
          </View>
          <View className="flex-1 bg-purple-600 rounded-lg p-2 ml-2 items-center">
            <Text className="text-xs text-white font-semibold">Matches</Text>
            <Text className="text-2xl font-bold text-white">{matches}/{totalPairs}</Text>
          </View>
        </View>
      </View>

      {/* Game Board */}
      <ScrollView
        style={styles.boardContainer}
        contentContainerStyle={styles.boardContent}
        scrollEnabled
      >
        <View key={gameRound} style={{ width: '100%', alignItems: 'center', paddingHorizontal: 20 }}>
          {Array.from({ length: Math.ceil(cards.length / gridSize) }).map((_, rowIdx) => (
              <View
              key={rowIdx}
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                  gap: 8,
                  marginBottom: 8,
              }}
            >
              {cards.slice(rowIdx * gridSize, (rowIdx + 1) * gridSize).map((card) => (
                <View
                  key={`${gameRound}-${card.id}`}
                  style={{
                    width: cardWidth,
                    height: cardWidth,
                  }}
                >
                  <MemoryCard
                    resetToken={gameRound}
                    symbol={card.symbol}
                    isFlipped={card.isFlipped}
                    isMatched={card.isMatched}
                    onPress={() => flipCard(card.id)}
                  />
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Game Won Screen */}
      {gameWon && (
        <View className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <View className="bg-white rounded-3xl p-7 items-center border-4 border-green-500">
            <Text className="text-8xl mb-4">🎉</Text>
            <Text className="text-4xl font-bold text-green-500 mb-2">YOU WON!</Text>
            <Text className="text-base text-gray-600 mb-4">Completed in {moves} moves</Text>
            <Pressable className="bg-purple-600 rounded-lg px-8 py-3" onPress={handleNewGame}>
              <Text className="text-base font-bold text-white text-center">Play Again</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Reset Button */}
      <View className="border-t-4 border-purple-600 px-5 py-5">
        <View className="flex-row gap-3">
          <Pressable className="flex-1 bg-purple-600 rounded-lg py-3" onPress={handleNewGame}>
            <Text className="text-lg font-bold text-white text-center">🔄 New Game</Text>
          </Pressable>

          <Pressable
            className="flex-1 bg-gray-500 rounded-lg py-3"
            onPress={onBackToSetup}
            disabled={!onBackToSetup}
          >
            <Text className="text-lg font-bold text-white text-center">⚙️ Paramètres</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  boardContainer: {
    flex: 1,
  },
  boardContent: {
    justifyContent: 'center',
    paddingVertical: 20,
  },
});
