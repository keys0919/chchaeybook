export type CardInputMode = 'text' | 'voice' | 'photo';
export type CardType =
  | 'focus_scene'
  | 'character_choice'
  | 'evidence_reason'
  | 'theme_thinking'
  | 'life_connection'
  | 'essay_builder';

export interface Card {
  card_id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  type: CardType;
  category: string;
  title: string;
  question: string;
  guide: string[];
  sentence_starters: string[];
  output_goal: string;
  input_modes: CardInputMode[];
  parent_coaching: string;
  is_free: boolean;
  tags: string[];
}
