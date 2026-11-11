// Proxima Dex 카드 데이터
// 외부 이미지 파일 없이 카드 아트가 CSS + 문자 심볼로 표시되도록 구성했습니다.

const CARD_LIBRARY = {
  laser_shot: {
    id: "laser_shot",
    name: "레이저 샷",
    type: "attack",
    rarity: "COMMON",
    cost: 1,
    icon: "✦",
    description: "적에게 6 피해를 줍니다.",
    effects: [{ type: "damage", value: 6 }]
  },

  twin_laser: {
    id: "twin_laser",
    name: "트윈 레이저",
    type: "attack",
    rarity: "COMMON",
    cost: 1,
    icon: "✧",
    description: "적에게 4 피해를 2번 줍니다.",
    effects: [{ type: "damage", value: 8 }]
  },

  plasma_burst: {
    id: "plasma_burst",
    name: "플라즈마 버스트",
    type: "attack",
    rarity: "COMMON",
    cost: 2,
    icon: "☄",
    description: "적에게 11 피해를 줍니다.",
    effects: [{ type: "damage", value: 11 }]
  },

  railgun: {
    id: "railgun",
    name: "레일건",
    type: "attack",
    rarity: "RARE",
    cost: 3,
    icon: "➤",
    description: "적에게 18 피해를 줍니다.",
    effects: [{ type: "damage", value: 18 }]
  },

  nova_cannon: {
    id: "nova_cannon",
    name: "노바 캐논",
    type: "attack",
    rarity: "RARE",
    cost: 3,
    icon: "✺",
    description: "적에게 16 피해를 주고 카드 1장을 뽑습니다.",
    effects: [
      { type: "damage", value: 16 },
      { type: "draw", value: 1 }
    ]
  },

  photon_spear: {
    id: "photon_spear",
    name: "포톤 스피어",
    type: "attack",
    rarity: "UNCOMMON",
    cost: 2,
    icon: "⌁",
    description: "적에게 9 피해를 주고 실드 3을 얻습니다.",
    effects: [
      { type: "damage", value: 9 },
      { type: "shield", value: 3 }
    ]
  },

  shield_matrix: {
    id: "shield_matrix",
    name: "실드 매트릭스",
    type: "skill",
    rarity: "COMMON",
    cost: 1,
    icon: "⬡",
    description: "실드 5를 얻습니다.",
    effects: [{ type: "shield", value: 5 }]
  },

  reinforced_hull: {
    id: "reinforced_hull",
    name: "강화 선체",
    type: "skill",
    rarity: "COMMON",
    cost: 2,
    icon: "▣",
    description: "실드 10을 얻습니다.",
    effects: [{ type: "shield", value: 10 }]
  },

  quantum_step: {
    id: "quantum_step",
    name: "퀀텀 스텝",
    type: "skill",
    rarity: "UNCOMMON",
    cost: 1,
    icon: "◇",
    description: "실드 4를 얻고 카드 1장을 뽑습니다.",
    effects: [
      { type: "shield", value: 4 },
      { type: "draw", value: 1 }
    ]
  },

  repair_drone: {
    id: "repair_drone",
    name: "리페어 드론",
    type: "skill",
    rarity: "UNCOMMON",
    cost: 2,
    icon: "✚",
    description: "체력을 6 회복합니다.",
    effects: [{ type: "heal", value: 6 }]
  },

  combat_scan: {
    id: "combat_scan",
    name: "컴뱃 스캔",
    type: "skill",
    rarity: "COMMON",
    cost: 1,
    icon: "⌖",
    description: "카드 2장을 뽑습니다.",
    effects: [{ type: "draw", value: 2 }]
  },

  pulse_guard: {
    id: "pulse_guard",
    name: "펄스 가드",
    type: "skill",
    rarity: "UNCOMMON",
    cost: 1,
    icon: "◉",
    description: "실드 3을 얻고 카드 1장을 뽑습니다.",
    effects: [
      { type: "shield", value: 3 },
      { type: "draw", value: 1 }
    ]
  },

  overcharge: {
    id: "overcharge",
    name: "오버차지",
    type: "power",
    rarity: "UNCOMMON",
    cost: 0,
    icon: "ϟ",
    description: "에너지 1을 얻습니다.",
    effects: [{ type: "energy", value: 1 }]
  },

  reactor_sync: {
    id: "reactor_sync",
    name: "리액터 싱크",
    type: "power",
    rarity: "RARE",
    cost: 1,
    icon: "◎",
    description: "에너지 2를 얻습니다.",
    effects: [{ type: "energy", value: 2 }]
  },

  kinetic_recovery: {
    id: "kinetic_recovery",
    name: "키네틱 리커버리",
    type: "skill",
    rarity: "UNCOMMON",
    cost: 1,
    icon: "↻",
    description: "실드 4와 체력 2를 얻습니다.",
    effects: [
      { type: "shield", value: 4 },
      { type: "heal", value: 2 }
    ]
  },

  starfall: {
    id: "starfall",
    name: "스타폴",
    type: "attack",
    rarity: "RARE",
    cost: 2,
    icon: "✹",
    description: "적에게 12 피해를 줍니다.",
    effects: [{ type: "damage", value: 12 }]
  },

  emergency_cell: {
    id: "emergency_cell",
    name: "비상 전지",
    type: "power",
    rarity: "COMMON",
    cost: 0,
    icon: "▰",
    description: "에너지 1을 얻고 카드 1장을 뽑습니다.",
    effects: [
      { type: "energy", value: 1 },
      { type: "draw", value: 1 }
    ]
  },

  phase_barrier: {
    id: "phase_barrier",
    name: "페이즈 배리어",
    type: "skill",
    rarity: "RARE",
    cost: 2,
    icon: "⬢",
    description: "실드 8을 얻고 카드 1장을 뽑습니다.",
    effects: [
      { type: "shield", value: 8 },
      { type: "draw", value: 1 }
    ]
  }
};

// 현재 프로토타입 시작 덱: 12장
// 같은 카드도 별도 인스턴스로 생성해서 덱/패/버린 더미에서 중복 충돌이 나지 않게 합니다.
const STARTER_DECK_IDS = [
  "laser_shot",
  "laser_shot",
  "laser_shot",
  "laser_shot",
  "plasma_burst",
  "shield_matrix",
  "shield_matrix",
  "shield_matrix",
  "quantum_step",
  "combat_scan",
  "overcharge",
  "repair_drone"
];

let cardInstanceSequence = 0;

function cloneCardTemplate(card) {
  return {
    ...card,
    effects: card.effects.map(effect => ({ ...effect }))
  };
}

function createCardInstanceFromTemplate(template) {
  cardInstanceSequence += 1;

  return {
    ...cloneCardTemplate(template),
    instanceId: `${template.id}-${cardInstanceSequence}`
  };
}

function createCardInstance(cardId) {
  const template = CARD_LIBRARY[cardId];

  if (!template) {
    throw new Error(`존재하지 않는 카드 ID: ${cardId}`);
  }

  return createCardInstanceFromTemplate(template);
}

function createStarterPlayerDeck() {
  return STARTER_DECK_IDS.map(cardId => {
    const template = CARD_LIBRARY[cardId];

    if (!template) {
      throw new Error(`존재하지 않는 카드 ID: ${cardId}`);
    }

    return cloneCardTemplate(template);
  });
}

function createBattleDeck(playerDeck) {
  return playerDeck.map(createCardInstanceFromTemplate);
}
