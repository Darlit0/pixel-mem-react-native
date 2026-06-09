import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

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

interface GameState {
  cards: Card[];
  moves: number;
  matches: number;
  gameWon: boolean;
  isProcessing: boolean;
  openedIds: number[];
  gameRound: number;
}

type GameAction =
  | { type: 'INIT'; cards: Card[] }
  | { type: 'FLIP'; cardId: number; totalPairs: number }
  | { type: 'RESOLVE_MISMATCH'; ids: number[] };

const initialState: GameState = {
  cards: [],
  moves: 0,
  matches: 0,
  gameWon: false,
  isProcessing: false,
  openedIds: [],
  gameRound: 0,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT':
      return {
        cards: action.cards,
        moves: 0,
        matches: 0,
        gameWon: false,
        isProcessing: false,
        openedIds: [],
        gameRound: state.gameRound + 1,
      };

    case 'FLIP': {
      if (state.isProcessing || state.gameWon || state.openedIds.length >= 2) {
        return state;
      }

      const targetCard = state.cards.find((card) => card.id === action.cardId);
      if (!targetCard || targetCard.isMatched || targetCard.isFlipped) {
        return state;
      }

      const nextCards = state.cards.map((card) =>
        card.id === action.cardId ? { ...card, isFlipped: true } : card
      );

      const nextOpenedIds = [...state.openedIds, action.cardId];
      if (nextOpenedIds.length < 2) {
        return {
          ...state,
          cards: nextCards,
          openedIds: nextOpenedIds,
        };
      }

      const first = nextCards.find((card) => card.id === nextOpenedIds[0]);
      const second = nextCards.find((card) => card.id === nextOpenedIds[1]);

      if (!first || !second) {
        return {
          ...state,
          cards: nextCards,
          openedIds: [],
          isProcessing: false,
        };
      }

      if (first.symbol === second.symbol) {
        const matchedCards = nextCards.map((card) =>
          nextOpenedIds.includes(card.id)
            ? { ...card, isMatched: true, isFlipped: true }
            : card
        );

        const nextMatches = state.matches + 1;
        return {
          ...state,
          cards: matchedCards,
          openedIds: [],
          isProcessing: false,
          moves: state.moves + 1,
          matches: nextMatches,
          gameWon: nextMatches >= action.totalPairs,
        };
      }

      return {
        ...state,
        cards: nextCards,
        openedIds: nextOpenedIds,
        isProcessing: true,
        moves: state.moves + 1,
      };
    }

    case 'RESOLVE_MISMATCH': {
      if (state.openedIds.length !== 2) {
        return {
          ...state,
          openedIds: [],
          isProcessing: false,
        };
      }

      const shouldResolve = action.ids.every((id) => state.openedIds.includes(id));
      if (!shouldResolve) {
        return state;
      }

      const resetCards = state.cards.map((card) =>
        action.ids.includes(card.id) && !card.isMatched
          ? { ...card, isFlipped: false }
          : card
      );

      return {
        ...state,
        cards: resetCards,
        openedIds: [],
        isProcessing: false,
      };
    }

    default:
      return state;
  }
}

export const useMemoryGame = (options?: UseMemoryGameOptions) => {
  const mode = options?.mode || 'emoji';
  const count = options?.count || 8;

  const stablePhotos = useMemo(() => options?.playlistPhotos || [], [options?.playlistPhotos?.join('|') || '']);

  const [state, dispatch] = useReducer(gameReducer, initialState);
  const roundRef = useRef(0);
  const mismatchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearMismatchTimeout = useCallback(() => {
    if (mismatchTimeoutRef.current) {
      clearTimeout(mismatchTimeoutRef.current);
      mismatchTimeoutRef.current = null;
    }
  }, []);

  const initGame = useCallback(() => {
    clearMismatchTimeout();
    roundRef.current += 1;
    const roundOffset = roundRef.current * 1000;

    const cardArray: Card[] = [];

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

    const shuffled = cardArray.sort(() => Math.random() - 0.5);
    dispatch({ type: 'INIT', cards: shuffled });
  }, [clearMismatchTimeout, mode, count, stablePhotos]);

  const flipCard = useCallback(
    (cardId: number) => {
      if (state.gameWon || state.isProcessing) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      dispatch({ type: 'FLIP', cardId, totalPairs: count });
    },
    [count, state.gameWon, state.isProcessing]
  );

  useEffect(() => {
    if (!state.isProcessing || state.openedIds.length !== 2) {
      return;
    }

    const openedIds = [...state.openedIds];
    clearMismatchTimeout();
    mismatchTimeoutRef.current = setTimeout(() => {
      dispatch({ type: 'RESOLVE_MISMATCH', ids: openedIds });
      mismatchTimeoutRef.current = null;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 1000);

    return () => {
      clearMismatchTimeout();
    };
  }, [clearMismatchTimeout, state.isProcessing, state.openedIds]);

  const previousMatchesRef = useRef(0);
  useEffect(() => {
    if (state.matches > previousMatchesRef.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    previousMatchesRef.current = state.matches;
  }, [state.matches]);

  const previousGameWonRef = useRef(false);
  useEffect(() => {
    if (state.gameWon && !previousGameWonRef.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    previousGameWonRef.current = state.gameWon;
  }, [state.gameWon]);

  useEffect(() => {
    return () => {
      clearMismatchTimeout();
    };
  }, [clearMismatchTimeout]);

  return {
    cards: state.cards,
    moves: state.moves,
    matches: state.matches,
    gameWon: state.gameWon,
    isProcessing: state.isProcessing,
    initGame,
    flipCard,
    totalPairs: count,
    gameRound: state.gameRound,
  };
};
