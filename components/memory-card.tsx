import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface MemoryCardProps {
  resetToken: number;
  isFlipped: boolean;
  symbol: string;
  onPress: () => void;
  isMatched: boolean;
}

const CARD_RADIUS = 8;
const CARD_BORDER = '#333';
const CARD_BACK = '#9B59B6';
const CARD_MATCH = '#00D95F';

const cardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 8,
};

const isImageUri = (symbol: string): boolean => {
  return symbol.includes('file://') || symbol.includes('http');
};

export const MemoryCard: React.FC<MemoryCardProps> = ({
  resetToken,
  isFlipped,
  symbol,
  onPress,
  isMatched,
}) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = 0;
  }, [resetToken, rotation]);

  useEffect(() => {
    rotation.value = withTiming(isFlipped ? 180 : 0, {
      duration: 400,
      easing: Easing.inOut(Easing.ease),
    });
  }, [isFlipped, rotation]);

  const backAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1200 },
        { rotateY: `${rotation.value}deg` },
      ],
    };
  });

  const frontAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1200 },
        { rotateY: `${rotation.value + 180}deg` },
      ],
    };
  });

  return (
    <Pressable
      onPress={onPress}
      disabled={isFlipped || isMatched}
      style={styles.cardContainer}
    >
      <Animated.View style={styles.card}>
        {/* Back - Shows ? (rendered first, positioned back) */}
        <Animated.View
          style={[
            styles.cardFace,
            styles.cardBack,
            backAnimatedStyle,
          ]}
        >
          <Text style={styles.backText}>?</Text>
        </Animated.View>

        {/* Front - Shows Symbol or Image (rendered second, positioned front) */}
        <Animated.View
          style={[
            styles.cardFace,
            styles.cardFront,
            isMatched && styles.matched,
            frontAnimatedStyle,
          ]}
        >
          {isImageUri(symbol) ? (
            <Animated.View style={[styles.imageFrame, isMatched && styles.matchedFrame]}>
              <Image
                source={{ uri: symbol }}
                style={styles.image}
                resizeMode="cover"
              />
              {isMatched && <Animated.View style={styles.matchedOverlay} />}
            </Animated.View>
          ) : (
            <Text
              style={[
                styles.symbol,
                isMatched && styles.matchedText,
              ]}
            >
              {symbol}
            </Text>
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
  },
  card: {
    flex: 1,
    position: 'relative',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: CARD_RADIUS,
    borderWidth: 2,
    borderColor: CARD_BORDER,
    backfaceVisibility: 'hidden' as any,
  },
  cardFront: {
    backgroundColor: '#fff',
    ...cardShadow,
  },
  cardBack: {
    backgroundColor: CARD_BACK,
    ...cardShadow,
  },
  symbol: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  backText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  matched: {
    backgroundColor: CARD_MATCH,
    borderColor: CARD_MATCH,
    borderWidth: 4,
  },
  matchedText: {
    color: '#fff',
  },
  imageFrame: {
    width: '100%',
    height: '100%',
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
  },
  matchedFrame: {
    borderWidth: 4,
    borderColor: CARD_MATCH,
  },
  matchedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 217, 95, 0.22)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
