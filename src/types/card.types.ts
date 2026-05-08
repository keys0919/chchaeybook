// 16_implementation_plan 4-1 Card 타입 (Phase 2 고정)

export type CardInputMode = 'text' | 'voice' | 'photo';
export type CardType = 'blank' | 'one_sentence' | 'two_sentence' | 'kit' | 'expanded';

export interface Card {
  card_id: string;
  level: 1 | 2 | 3 | 4 | 5;
  type: CardType;
  category: string;
  question: string;
  sentence_starter: string;
  hints: string[];
  input_modes: CardInputMode[];
  parent_coaching: string;
  is_free: boolean;
  tags: string[];
}
