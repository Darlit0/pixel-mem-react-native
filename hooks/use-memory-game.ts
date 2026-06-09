import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const SYMBOLS = ['🌟', '🎮', '🍕', '🎵', '🦄', '🎨', '🔥', '💎'];

export interface UseMemoryGameOptions {
  mode?: 'emoji' | 'playlist';
  count?: 4 | 6 | 8;
  playlistPhotos?: string[];
}

export const useMemoryGame = (options?: UseMemoryGameOptions) => {
  const mode = options?.mode || 'emoji';
  const count = options?.count || 8;
  
  // Stabilize playlistPhotos using useMemo
  const stablePhotos = useMemo(() => options?.playlistPhotos || [], [options?.playlistPhotos?.join('|') || '']);

  const [cards, setCards] = useState<Card[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameRound, setGameRound] = useState(0);
  const gameRoundRef = useRef(0);
  const processingRef = useRef(false);
  const openedIdsRef = useRef<number[]>([]);
  const mismatchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearMismatchTimeout = useCallback(() => {
    if (mismatchTimeoutRef.current) {
      clearTimeout(mismatchTimeoutRef.current);
      mismatchTimeoutRef.current = null;
    }
  }, []);

  // Initialize game
  const initGame = useCallback(() => {
    clearMismatchTimeout();
    processingRef.current = false;
    openedIdsRef.current = [];
    const nextRound = gameRoundRef.current + 1;
    gameRoundRef.current = nextRound;
    setGameRound(nextRound);
    const roundOffset = nextRound * 1000;

    // Create pairs of cards based on count
    const cardArray: Card[] = [];
    
    // Select symbols or photos based on mode.
    // Always produce exactly `count` non-empty entries to avoid blank cards.
    const safePhotos = stablePhotos.filter((photo) => typeof photo === 'string' && photo.trim().length > 0);
    let symbols: string[] = [];
    if (mode === 'playlist' && safePhotos.length > 0) {
      symbols = safePhotos.slice(0, count);
    } else {
      symbols = SYMBOLS.slice(0, count);
    }

    while (symbols.length < count) {
      const fallback = SYMBOLS[symbols.length % SYMBOLS.length];
      symbols.push(fallback);
    }

    // Create pairs
    for (let i = 0; i < count; i++) {
      const symbol = symbols[i] || SYMBOLS[i % SYMBOLS.length];
      cardArray.push(
        { id: roundOffset + i * 2, symbol, isFlipped: false, isMatched: false },
        { id: roundOffset + i * 2 + 1, symbol, isFlipped: false, isMatched: false }
      );
    }

    // Shuffle
    const shuffled = cardArray.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setMoves(0);
    setMatches(0);
    setGameWon(false);
    setIsProcessing(false);
  }, [clearMismatchTimeout, mode, count, stablePhotos]);

  // Handle card flip
  const flipCard = useCallback(
    (cardId: number) => {
      if (processingRef.current || gameWon) return;

      if (openedIdsRef.current.includes(cardId)) return;

      const card = cards.find((c) => c.id === cardId);
      if (!card || card.isMatched || card.isFlipped) return;

      if (openedIdsRef.current.length >= 2) return;

      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const nextCards = cards.map((c) =>
        c.id === cardId ? { ...c, isFlipped: true } : c
      );
      setCards(nextCards);
      openedIdsRef.current = [...openedIdsRef.current, cardId];

      if (openedIdsRef.current.length === 2) {
        processingRef.current = true;
        setIsProcessing(true);
        setMoves((m) => m + 1);

        const card1 = cards.find((c) => c.id === openedIdsRef.current[0]);
        const card2 = cards.find((c) => c.id === openedIdsRef.current[1]);
        if (!card1 || !card2) {
          openedIdsRef.current = [];
          processingRef.current = false;
          setIsProcessing(false);
          return;
        }
        const openedIds = [card1.id, card2.id];

        // Check if match
        if (card1?.symbol === card2?.symbol) {
          // Match! 🎉
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          const matchedCards = nextCards.map((c) =>
            openedIds.includes(c.id)
              ? { ...c, isMatched: true, isFlipped: true }
              : c
          );
          setCards(matchedCards);
          setMatches((m) => {
            const nextMatches = m + 1;
            if (nextMatches >= count) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setGameWon(true);
            }
            return nextMatches;
          });
          openedIdsRef.current = [];
          processingRef.current = false;
          setIsProcessing(false);
        } else {
          // No match, flip back after 1 second
          clearMismatchTimeout();
          mismatchTimeoutRef.current = setTimeout(() => {
            setCards((currentCards) =>
              currentCards.map((c) =>
                openedIds.includes(c.id) && !c.isMatched
                  ? { ...c, isFlipped: false }
                  : c
              )
            );
            openedIdsRef.current = [];
            processingRef.current = false;
            setIsProcessing(false);
            mismatchTimeoutRef.current = null;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }, 1000);
        }
      }
    },
    [cards, clearMismatchTimeout, count, gameWon]
  );

  useEffect(() => {
    return () => {
      clearMismatchTimeout();
    };
  }, [clearMismatchTimeout]);

  return {
    cards,
    moves,
    matches,
    gameWon,
    flippedCards: cards.filter((c) => c.isFlipped && !c.isMatched).map((c) => c.id),
    isProcessing,
    initGame,
    flipCard,
    totalPairs: count,
    gameRound,
  };
};
