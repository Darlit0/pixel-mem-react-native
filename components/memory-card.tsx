import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
    Easing,
    Extrapolate,
    interpolate,
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

  const animatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      rotation.value,
      [0, 90, 180],
      [0, 90, 180],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { perspective: 1200 },
        { rotateY: `${rotateY}deg` },
      ],
    };
  });

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      rotation.value,
      [0, 90, 180],
      [0, 0, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      rotation.value,
      [0, 90, 180],
      [1, 0, 0],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  return (
    <Pressable
      onPress={onPress}
      disabled={isFlipped || isMatched}
      style={styles.cardContainer}
    >
      <Animated.View style={[styles.card, animatedStyle]}>
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
    perspective: 1200,
  },
  card: {
    flex: 1,
    position: 'relative',
    transformOrigin: '50% 50%',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
    backfaceVisibility: 'hidden' as any,
  },
  cardFront: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  cardBack: {
    backgroundColor: '#9B59B6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
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
    backgroundColor: '#00D95F',
    borderColor: '#00D95F',
    borderWidth: 4,
  },
  matchedText: {
    color: '#fff',
  },
  imageFrame: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  matchedFrame: {
    borderWidth: 4,
    borderColor: '#00D95F',
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
