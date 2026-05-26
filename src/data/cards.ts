import type { Card } from '../types/card.types';

const CARDS: Card[] = [
  // ── Level 1: 핵심 장면 잡기 ─────────────────────────────────────────────
  {
    card_id: 'l1_01',
    level: 1,
    type: 'focus_scene',
    category: '핵심장면',
    title: '이야기를 바꾼 장면',
    question: '이 책에서 이야기를 가장 크게 바꾼 장면은 무엇인가요?',
    guide: [
      '그 장면에서 무슨 일이 일어났나요?',
      '그 일이 없었다면 이야기는 어떻게 달라졌을까요?',
      '왜 그 장면을 중심 장면으로 골랐나요?'
    ],
    sentence_starters: [
      '이 책에서 이야기를 가장 크게 바꾼 장면은',
      '그 장면에서는',
      '내가 이 장면을 고른 이유는'
    ],
    output_goal: '2~3문장',
    parent_coaching: '재미있던 장면보다 이야기가 달라지는 장면을 고르게 도와주세요.',
    input_modes: ['text'],
    is_free: true,
    tags: ['장면', '핵심', '구조']
  },
  {
    card_id: 'l1_02',
    level: 1,
    type: 'focus_scene',
    category: '핵심장면',
    title: '마음이 드러난 장면',
    question: '인물의 마음이 가장 잘 드러난 장면은 무엇인가요?',
    guide: [
      '그 장면에서 인물은 어떤 표정, 말, 행동을 했나요?',
      '그 행동에서 어떤 마음이 느껴졌나요?',
      '그 마음이 이야기에서 왜 중요했나요?'
    ],
    sentence_starters: [
      '인물의 마음이 가장 잘 드러난 장면은',
      '그때 인물은',
      '나는 그 장면에서 인물이'
    ],
    output_goal: '2~3문장',
    parent_coaching: '아이에게 "무슨 일이 있었니?" 다음에 "그때 마음은 어땠을까?"를 물어봐 주세요.',
    input_modes: ['text'],
    is_free: true,
    tags: ['장면', '인물', '감정']
  },
  {
    card_id: 'l1_03',
    level: 1,
    type: 'focus_scene',
    category: '핵심장면',
    title: '가장 오래 남은 장면',
    question: '책을 덮은 뒤에도 가장 오래 기억에 남은 장면은 무엇인가요?',
    guide: [
      '그 장면을 한 문장으로 설명해보세요.',
      '왜 그 장면이 계속 생각났나요?',
      '그 장면은 책 전체와 어떤 관련이 있나요?'
    ],
    sentence_starters: [
      '책을 덮은 뒤에도 가장 오래 기억에 남은 장면은',
      '그 장면이 계속 생각난 이유는',
      '이 장면은 책 전체에서'
    ],
    output_goal: '2~3문장',
    parent_coaching: '단순히 웃기거나 슬픈 장면보다 아이의 생각이 멈춘 장면을 고르게 해주세요.',
    input_modes: ['text'],
    is_free: true,
    tags: ['장면', '기억', '감상']
  },
  {
    card_id: 'l1_04',
    level: 1,
    type: 'focus_scene',
    category: '핵심장면',
    title: '문제가 시작된 장면',
    question: '이야기에서 가장 중요한 문제가 시작된 장면은 어디인가요?',
    guide: [
      '어떤 문제가 생겼나요?',
      '그 문제 때문에 인물은 어떤 어려움을 겪었나요?',
      '이 문제가 이야기 끝까지 어떤 영향을 주었나요?'
    ],
    sentence_starters: [
      '이야기에서 가장 중요한 문제가 시작된 장면은',
      '그 문제 때문에',
      '이 사건은 나중에'
    ],
    output_goal: '3문장',
    parent_coaching: '줄거리 전체를 쓰기보다 "문제가 시작된 지점" 하나만 찾게 해주세요.',
    input_modes: ['text'],
    is_free: true,
    tags: ['사건', '문제', '구조']
  },

  // ── Level 2: 인물의 선택 보기 ─────────────────────────────────────────────
  {
    card_id: 'l2_01',
    level: 2,
    type: 'character_choice',
    category: '인물의선택',
    title: '주인공의 중요한 선택',
    question: '주인공이 한 선택 중 가장 중요하다고 생각한 것은 무엇인가요?',
    guide: [
      '주인공은 어떤 상황에 있었나요?',
      '주인공은 어떤 선택을 했나요?',
      '그 선택 때문에 어떤 일이 생겼나요?'
    ],
    sentence_starters: [
      '주인공이 한 선택 중 가장 중요하다고 생각한 것은',
      '그때 주인공은',
      '그 선택 때문에'
    ],
    output_goal: '3문장',
    parent_coaching: '"착했다/나빴다"보다 어떤 상황에서 어떤 선택을 했는지 먼저 쓰게 해주세요.',
    input_modes: ['text'],
    is_free: true,
    tags: ['인물', '선택', '사건']
  },
  {
    card_id: 'l2_02',
    level: 2,
    type: 'character_choice',
    category: '인물의선택',
    title: '동의하는 선택',
    question: '주인공의 선택 중 동의하는 선택은 무엇인가요?',
    guide: [
      '어떤 선택에 동의하나요?',
      '그 선택이 왜 괜찮다고 생각하나요?',
      '나라도 그렇게 했을까요?'
    ],
    sentence_starters: [
      '나는 주인공의 선택 중',
      '그 선택에 동의하는 이유는',
      '나라면 그 상황에서'
    ],
    output_goal: '3문장',
    parent_coaching: '정답을 찾기보다 아이가 자기 판단을 말하게 해주세요.',
    input_modes: ['text'],
    is_free: true,
    tags: ['인물', '판단', '동의']
  },
  {
    card_id: 'l2_03',
    level: 2,
    type: 'character_choice',
    category: '인물의선택',
    title: '아쉬운 선택',
    question: '주인공의 선택 중 아쉬웠던 선택은 무엇인가요?',
    guide: [
      '어떤 선택이 아쉬웠나요?',
      '왜 다르게 했으면 좋았을까요?',
      '더 좋은 방법이 있었다면 무엇일까요?'
    ],
    sentence_starters: [
      '주인공의 선택 중 아쉬웠던 것은',
      '내가 아쉽다고 생각한 이유는',
      '더 좋은 방법은'
    ],
    output_goal: '3~4문장',
    parent_coaching: '비판은 비난이 아니라 더 나은 방법을 생각하는 것이라고 안내해주세요.',
    input_modes: ['text'],
    is_free: true,
    tags: ['인물', '비판', '대안']
  },
  {
    card_id: 'l2_04',
    level: 2,
    type: 'character_choice',
    category: '인물의선택',
    title: '변화한 인물',
    question: '처음과 나중에 가장 많이 달라진 인물은 누구인가요?',
    guide: [
      '처음에 그 인물은 어떤 모습이었나요?',
      '나중에는 어떻게 달라졌나요?',
      '무엇 때문에 달라졌다고 생각하나요?'
    ],
    sentence_starters: [
      '처음과 나중에 가장 많이 달라진 인물은',
      '처음에는',
      '나중에는',
      '그 인물이 달라진 이유는'
    ],
    output_goal: '3~4문장',
    parent_coaching: '성장이나 변화가 있는 책에서는 이 카드가 독서록의 중심이 될 수 있습니다.',
    input_modes: ['text'],
    is_free: true,
    tags: ['인물', '변화', '성장']
  },

  // ── Level 3: 이유와 근거 붙이기 ───────────────────────────────────────────
  {
    card_id: 'l3_01',
    level: 3,
    type: 'evidence_reason',
    category: '이유와근거',
    title: '내 생각의 이유',
    question: '그렇게 생각한 이유를 자세히 써보세요.',
    guide: [
      '왜 그렇게 생각했나요?',
      '책 속 어떤 장면 때문에 그런 생각을 했나요?',
      '다른 사람도 이해할 수 있게 설명해보세요.'
    ],
    sentence_starters: [
      '내가 그렇게 생각한 이유는',
      '책에서 특히',
      '이 부분을 보면'
    ],
    output_goal: '3문장',
    parent_coaching: '"그냥"이라는 답이 나오면 책 속 장면 하나를 다시 짚어주세요.',
    input_modes: ['text'],
    is_free: true,
    tags: ['이유', '근거', '설명']
  },
  {
    card_id: 'l3_02',
    level: 3,
    type: 'evidence_reason',
    category: '이유와근거',
    title: '책 속 근거 찾기',
    question: '내 생각을 뒷받침하는 책 속 근거는 무엇인가요?',
    guide: [
      '인물의 말 중 근거가 되는 부분이 있나요?',
      '인물의 행동 중 근거가 되는 부분이 있나요?',
      '사건의 결과가 내 생각을 어떻게 뒷받침하나요?'
    ],
    sentence_starters: [
      '내 생각을 뒷받침하는 부분은',
      '주인공이',
      '이 장면은 내가 생각한 것처럼'
    ],
    output_goal: '3~4문장',
    parent_coaching: '직접 인용이 어렵다면 장면을 자기 말로 설명해도 됩니다.',
    input_modes: ['text'],
    is_free: true,
    tags: ['근거', '장면', '인용']
  },
  {
    card_id: 'l3_03',
    level: 3,
    type: 'evidence_reason',
    category: '이유와근거',
    title: '감정의 이유',
    question: '이 책을 읽으며 가장 강하게 느낀 감정과 그 이유는 무엇인가요?',
    guide: [
      '어떤 감정이 가장 크게 느껴졌나요?',
      '어느 장면에서 그런 감정이 생겼나요?',
      '왜 그 장면이 그렇게 느껴졌나요?'
    ],
    sentence_starters: [
      '이 책을 읽으며 가장 크게 느낀 감정은',
      '그 감정은',
      '내가 그렇게 느낀 이유는'
    ],
    output_goal: '3문장',
    parent_coaching: '감정 단어만 쓰지 말고, 감정이 생긴 장면까지 연결하게 해주세요.',
    input_modes: ['text'],
    is_free: true,
    tags: ['감정', '이유', '장면']
  },
  {
    card_id: 'l3_04',
    level: 3,
    type: 'evidence_reason',
    category: '이유와근거',
    title: '다른 생각도 가능할까',
    question: '내 생각과 다르게 볼 수도 있는 부분이 있나요?',
    guide: [
      '다른 사람은 이 장면을 어떻게 볼 수 있을까요?',
      '주인공의 행동을 좋게 볼 수도 있나요?',
      '반대로 아쉽게 볼 수도 있나요?'
    ],
    sentence_starters: [
      '이 장면은 다르게 보면',
      '어떤 사람은',
      '하지만 나는'
    ],
    output_goal: '3~4문장',
    parent_coaching: '상위 단계 카드입니다. 아이가 어려워하면 건너뛰어도 됩니다.',
    input_modes: ['text'],
    is_free: true,
    tags: ['비판적읽기', '관점', '판단']
  },

  // ── Level 4: 책이 남긴 말 찾기 ───────────────────────────────────────────
  {
    card_id: 'l4_01',
    level: 4,
    type: 'theme_thinking',
    category: '책이남긴말',
    title: '이 책이 말하고 싶은 것',
    question: '이 책은 어떤 이야기를 통해 무엇을 말하고 싶었던 것 같나요?',
    guide: [
      '이 책에서 계속 중요하게 나온 문제는 무엇인가요?',
      '그 문제를 통해 무엇을 생각하게 되었나요?',
      '이 책이 말하고 싶은 것을 한 문장으로 써보세요.'
    ],
    sentence_starters: [
      '이 책은',
      '이야기를 통해',
      '내가 생각한 이 책의 메시지는'
    ],
    output_goal: '2~3문장',
    parent_coaching: '"주제"라는 말이 어렵다면 "책이 나에게 남긴 말"로 바꿔 물어봐 주세요.',
    input_modes: ['text'],
    is_free: true,
    tags: ['주제', '메시지', '해석']
  },
  {
    card_id: 'l4_02',
    level: 4,
    type: 'theme_thinking',
    category: '책이남긴말',
    title: '제목 다시 생각하기',
    question: '책을 다 읽고 나니 제목은 어떤 뜻으로 느껴지나요?',
    guide: [
      '처음 제목을 봤을 때는 어떤 느낌이었나요?',
      '책을 다 읽은 뒤 제목의 뜻이 달라졌나요?',
      '나라면 이 책의 제목을 어떻게 바꾸고 싶나요?'
    ],
    sentence_starters: [
      '처음 이 책의 제목을 봤을 때는',
      '책을 다 읽고 나니 제목은',
      '내가 제목을 다시 붙인다면'
    ],
    output_goal: '3문장',
    parent_coaching: '제목 해석은 주제를 부드럽게 끌어내는 좋은 방법입니다.',
    input_modes: ['text'],
    is_free: true,
    tags: ['제목', '주제', '해석']
  },
  {
    card_id: 'l4_03',
    level: 4,
    type: 'theme_thinking',
    category: '책이남긴말',
    title: '작가가 던진 질문',
    question: '이 책이 독자에게 던지는 질문은 무엇일까요?',
    guide: [
      '책을 읽고 나서 계속 생각난 질문이 있나요?',
      '인물의 선택을 보며 내가 고민한 것은 무엇인가요?',
      '이 책은 나에게 무엇을 물어보는 것 같나요?'
    ],
    sentence_starters: [
      '이 책은 나에게',
      '책을 읽고 나서 나는',
      '작가는 독자에게'
    ],
    output_goal: '2~3문장',
    parent_coaching: '정답형 주제보다 질문형 주제가 더 좋은 독서록을 만들 때가 많습니다.',
    input_modes: ['text'],
    is_free: true,
    tags: ['질문', '주제', '생각']
  },
  {
    card_id: 'l4_04',
    level: 4,
    type: 'theme_thinking',
    category: '책이남긴말',
    title: '한 문장 메시지',
    question: '이 책이 나에게 남긴 말을 한 문장으로 정리해보세요.',
    guide: [
      '이 책을 읽고 가장 크게 남은 생각은 무엇인가요?',
      '그 생각을 짧고 분명하게 써보세요.',
      '그 문장이 책의 내용과 잘 연결되나요?'
    ],
    sentence_starters: [
      '이 책이 나에게 남긴 말은',
      '나는 이 책을 읽고',
      '이 책은 결국'
    ],
    output_goal: '1~2문장',
    parent_coaching: '짧아도 괜찮습니다. 이 문장이 독서록의 중심 문장이 됩니다.',
    input_modes: ['text'],
    is_free: true,
    tags: ['메시지', '요약', '주제']
  },

  // ── Level 5: 나와 연결하기 ───────────────────────────────────────────────
  {
    card_id: 'l5_01',
    level: 5,
    type: 'life_connection',
    category: '나와연결',
    title: '내 경험과 연결하기',
    question: '이 책을 읽으며 떠오른 내 경험은 무엇인가요?',
    guide: [
      '책 속 상황과 비슷한 경험이 있었나요?',
      '그때 나는 어떻게 행동했나요?',
      '책 속 인물과 나는 어떤 점이 비슷하거나 달랐나요?'
    ],
    sentence_starters: [
      '이 책을 읽으며 내가 떠올린 경험은',
      '그때 나는',
      '책 속 인물과 나는'
    ],
    output_goal: '3문장',
    parent_coaching: '경험이 꼭 크지 않아도 됩니다. 학교, 친구, 가족, 습관과 연결해도 좋습니다.',
    input_modes: ['text'],
    is_free: true,
    tags: ['연결', '경험', '자기표현']
  },
  {
    card_id: 'l5_02',
    level: 5,
    type: 'life_connection',
    category: '나와연결',
    title: '내가 배운 점',
    question: '이 책을 읽고 내가 배운 점은 무엇인가요?',
    guide: [
      '새롭게 알게 된 점이 있나요?',
      '다르게 생각하게 된 점이 있나요?',
      '앞으로 기억하고 싶은 점은 무엇인가요?'
    ],
    sentence_starters: [
      '이 책을 읽고 내가 배운 점은',
      '전에는',
      '하지만 이 책을 읽고'
    ],
    output_goal: '3문장',
    parent_coaching: '"착하게 살아야 한다"처럼 너무 넓은 말보다 책 내용과 연결된 배움을 쓰게 해주세요.',
    input_modes: ['text'],
    is_free: true,
    tags: ['배움', '성장', '연결']
  },
  {
    card_id: 'l5_03',
    level: 5,
    type: 'life_connection',
    category: '나와연결',
    title: '앞으로의 행동',
    question: '이 책을 읽고 앞으로 내가 다르게 해보고 싶은 것은 무엇인가요?',
    guide: [
      '책을 읽고 바꾸고 싶은 생각이나 행동이 있나요?',
      '작게 실천할 수 있는 행동은 무엇인가요?',
      '왜 그렇게 해보고 싶나요?'
    ],
    sentence_starters: [
      '이 책을 읽고 앞으로 나는',
      '작게 실천해보고 싶은 것은',
      '그렇게 해보고 싶은 이유는'
    ],
    output_goal: '3문장',
    parent_coaching: '실천은 거창하지 않아도 됩니다. 작은 행동 하나를 구체적으로 쓰게 해주세요.',
    input_modes: ['text'],
    is_free: true,
    tags: ['실천', '성장', '마무리']
  },
  {
    card_id: 'l5_04',
    level: 5,
    type: 'life_connection',
    category: '나와연결',
    title: '나와 다른 인물',
    question: '책 속 인물과 나는 어떤 점이 다르다고 느꼈나요?',
    guide: [
      '인물과 나의 다른 점은 무엇인가요?',
      '그 차이가 부럽거나 아쉬웠나요?',
      '그 차이를 보며 어떤 생각이 들었나요?'
    ],
    sentence_starters: [
      '책 속 인물과 나는',
      '내가 그 인물과 다르다고 느낀 점은',
      '그 차이를 보며 나는'
    ],
    output_goal: '3문장',
    parent_coaching: '비교는 우열이 아니라 자기 이해를 위한 도구라고 안내해주세요.',
    input_modes: ['text'],
    is_free: true,
    tags: ['비교', '자기이해', '연결']
  },

  // ── Level 6: 한 페이지 독서록 완성 ───────────────────────────────────────
  {
    card_id: 'l6_01',
    level: 6,
    type: 'essay_builder',
    category: '한페이지독서록',
    title: '기본 한 페이지 독서록',
    question: '앞에서 생각한 내용을 이어서 한 편의 독서록으로 완성해보세요.',
    guide: [
      '1문단: 책 소개와 중심 장면을 씁니다.',
      '2문단: 인물의 선택과 그 선택에 대한 내 생각을 씁니다.',
      '3문단: 그렇게 생각한 이유와 책 속 근거를 씁니다.',
      '4문단: 책이 나에게 남긴 말과 내 생활과 연결되는 점을 씁니다.',
      '마지막 문장: 읽고 난 뒤 남은 생각으로 마무리합니다.'
    ],
    sentence_starters: [
      '내가 읽은 책은',
      '이 책에서 가장 중요하다고 생각한 장면은',
      '나는 주인공의 선택이',
      '왜냐하면',
      '이 책이 나에게 남긴 말은',
      '이 책을 읽고 나는'
    ],
    output_goal: '8~12문장',
    parent_coaching: '줄거리는 3문장 이내, 내 생각은 5문장 이상이 되도록 도와주세요.',
    input_modes: ['text'],
    is_free: true,
    tags: ['독서록', '완성', '기본']
  },
  {
    card_id: 'l6_02',
    level: 6,
    type: 'essay_builder',
    category: '한페이지독서록',
    title: '인물 중심 독서록',
    question: '인물의 선택과 변화를 중심으로 독서록을 완성해보세요.',
    guide: [
      '1문단: 책과 주요 인물을 소개합니다.',
      '2문단: 인물이 처한 상황과 중요한 선택을 씁니다.',
      '3문단: 그 선택에 대한 내 생각과 이유를 씁니다.',
      '4문단: 인물이 처음과 나중에 어떻게 달라졌는지 씁니다.',
      '마무리: 그 인물을 보며 내가 배운 점을 씁니다.'
    ],
    sentence_starters: [
      '이 책에서 가장 중요하게 본 인물은',
      '처음에 이 인물은',
      '하지만 중요한 사건을 겪으며',
      '나는 이 인물의 선택이',
      '이 인물을 보며 내가 배운 점은'
    ],
    output_goal: '8~12문장',
    parent_coaching: '인물 중심 글은 줄거리보다 선택, 변화, 배움이 핵심입니다.',
    input_modes: ['text'],
    is_free: true,
    tags: ['독서록', '인물', '성장']
  },
  {
    card_id: 'l6_03',
    level: 6,
    type: 'essay_builder',
    category: '한페이지독서록',
    title: '주제 중심 독서록',
    question: '책이 남긴 메시지를 중심으로 독서록을 완성해보세요.',
    guide: [
      '1문단: 책의 내용과 중심 문제를 간단히 소개합니다.',
      '2문단: 그 문제가 잘 드러난 장면을 씁니다.',
      '3문단: 그 장면을 통해 책이 말하고 싶은 것을 씁니다.',
      '4문단: 그 메시지에 대한 내 생각을 씁니다.',
      '마무리: 내 생활과 연결되는 점을 씁니다.'
    ],
    sentence_starters: [
      '이 책은',
      '이 책에서 가장 중요한 문제는',
      '그 문제가 잘 드러난 장면은',
      '나는 이 책이',
      '이 책의 메시지는 내 생활과도 연결된다'
    ],
    output_goal: '8~12문장',
    parent_coaching: '주제 중심 글은 조금 어렵습니다. 아이가 힘들어하면 기본 독서록부터 사용하세요.',
    input_modes: ['text'],
    is_free: true,
    tags: ['독서록', '주제', '심화']
  },
  {
    card_id: 'l6_04',
    level: 6,
    type: 'essay_builder',
    category: '한페이지독서록',
    title: '비판적 독서록',
    question: '책 속 인물의 선택에 대한 내 판단을 중심으로 독서록을 완성해보세요.',
    guide: [
      '1문단: 책과 판단하고 싶은 장면을 소개합니다.',
      '2문단: 인물이 어떤 선택을 했는지 씁니다.',
      '3문단: 그 선택에 동의하는지 반대하는지 씁니다.',
      '4문단: 그렇게 생각한 이유와 책 속 근거를 씁니다.',
      '마무리: 더 좋은 방법이나 내가 배운 점을 씁니다.'
    ],
    sentence_starters: [
      '이 책에서 내가 판단해보고 싶은 장면은',
      '그 장면에서 인물은',
      '나는 그 선택에',
      '그렇게 생각한 이유는',
      '만약 나라면',
      '이 장면을 통해 나는'
    ],
    output_goal: '8~12문장',
    parent_coaching: '비판적 독서록은 상위 단계입니다. 아이가 자기 생각을 말할 수 있을 때 사용하세요.',
    input_modes: ['text'],
    is_free: true,
    tags: ['독서록', '비판', '판단']
  }
];

export function getCardsByLevel(level: number): Card[] {
  return CARDS.filter((c) => c.level === level);
}

export function getAllCards(): Card[] {
  return CARDS;
}
