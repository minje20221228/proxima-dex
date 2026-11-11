const MAX_BATTLES = 3;


function createEnemy() {
  // 이번 단계에서는 새 적 종류를 추가하지 않습니다.
  // 전투가 바뀔 때마다 같은 설계의 '새 인스턴스'만 생성합니다.
  return {
    name: "Void Sentinel",
    hp: 36,
    maxHp: 36,
    attack: 6,
    statusEffects: []
  };
}


const battleState = {
  player: {
    hp: 50,
    maxHp: 50,
    shield: 0,
    energy: 3,
    maxEnergy: 3,
    statusEffects: []
  },

  enemy: createEnemy(),

  // 런 전체에서 유지되는 영구 상태
  playerDeck: [],
  battleIndex: 1,

  // 전투 하나에서만 쓰는 임시 상태
  drawPile: [],
  hand: [],
  discardPile: [],

  turn: 1,
  phase: "idle",
  battleFinished: false,
  isProcessingTurn: false,
  isTransitioningBattle: false,
  runComplete: false,
  result: null,
  log: [],

  // 승리 보상 상태
  rewardCandidates: [],
  rewardClaimed: false,
  rewardScreenOpen: false,
  selectedRewardId: null
};


function startNewGame() {
  // 새 게임에서만 영구 상태를 완전히 초기화합니다.
  battleState.playerDeck = createStarterPlayerDeck();
  battleState.player.hp = battleState.player.maxHp;
  battleState.battleIndex = 1;
  battleState.runComplete = false;
  battleState.isTransitioningBattle = false;
  battleState.enemy = createEnemy();

  startBattle();
}


function startBattle() {
  if (battleState.playerDeck.length === 0) {
    battleState.playerDeck = createStarterPlayerDeck();
  }

  resetBattleTemporaryState();

  shuffle(battleState.drawPile);
  preparePlayerTurn();

  battleState.isTransitioningBattle = false;

  addBattleLog(
    `${battleState.battleIndex}번째 전투 시작. 덱 ${battleState.playerDeck.length}장을 다시 섞고 카드 5장을 뽑았습니다.`
  );
  renderBattle();
}


function resetBattleTemporaryState() {
  // 플레이어 HP와 playerDeck은 런 영구 상태이므로 유지합니다.
  battleState.player.shield = 0;
  battleState.player.energy = battleState.player.maxEnergy;
  battleState.player.statusEffects = [];

  // startNextBattle()에서 새 적을 생성하지만, 방어적으로 상태이상도 비웁니다.
  battleState.enemy.statusEffects = [];

  // 이전 전투의 패/버린 더미는 절대 다음 전투로 가져가지 않습니다.
  battleState.drawPile = createBattleDeck(battleState.playerDeck);
  battleState.hand = [];
  battleState.discardPile = [];

  battleState.turn = 1;
  battleState.phase = "player";
  battleState.battleFinished = false;
  battleState.isProcessingTurn = false;
  battleState.result = null;
  battleState.log = [];

  battleState.rewardCandidates = [];
  battleState.rewardClaimed = false;
  battleState.rewardScreenOpen = false;
  battleState.selectedRewardId = null;
}


function startNextBattle() {
  if (battleState.isTransitioningBattle) return;
  if (battleState.runComplete) return;
  if (battleState.result !== "victory") return;
  if (!battleState.rewardClaimed) return;
  if (battleState.battleIndex >= MAX_BATTLES) return;

  // 연속 클릭으로 battleIndex가 두 번 증가하지 않도록 먼저 잠급니다.
  battleState.isTransitioningBattle = true;

  // 요구사항대로 startNextBattle() 안에서 순서를 먼저 증가시킵니다.
  battleState.battleIndex += 1;

  // 이전 적 객체를 재사용하지 않고 새 적 인스턴스를 생성합니다.
  battleState.enemy = createEnemy();

  startBattle();
}


function continueAfterReward() {
  if (battleState.isTransitioningBattle) return;
  if (battleState.result !== "victory") return;
  if (!battleState.rewardClaimed) return;

  if (battleState.battleIndex >= MAX_BATTLES) {
    completeRun();
    return;
  }

  startNextBattle();
}


function completeRun() {
  if (battleState.runComplete) return;
  if (battleState.battleIndex !== MAX_BATTLES) return;
  if (battleState.result !== "victory") return;
  if (!battleState.rewardClaimed) return;

  battleState.runComplete = true;
  battleState.rewardScreenOpen = false;
  battleState.phase = "run-complete";
  battleState.isProcessingTurn = false;
  battleState.isTransitioningBattle = false;

  addBattleLog(`총 ${MAX_BATTLES}회 전투를 완료했습니다. 런 완료!`);
  renderBattle();
}


function healAfterVictory() {
  const healAmount = Math.floor(battleState.player.maxHp * 0.2);
  const before = battleState.player.hp;

  battleState.player.hp = Math.min(
    battleState.player.maxHp,
    battleState.player.hp + healAmount
  );

  return battleState.player.hp - before;
}


function preparePlayerTurn() {
  if (battleState.battleFinished) return;

  battleState.phase = "player";
  battleState.player.energy = battleState.player.maxEnergy;
  battleState.player.shield = 0;

  drawCards(5);
}


function playCard(instanceId) {
  if (battleState.battleFinished) return;
  if (battleState.isProcessingTurn) return;
  if (battleState.isTransitioningBattle) return;
  if (battleState.phase !== "player") return;

  const cardIndex = battleState.hand.findIndex(
    card => card.instanceId === instanceId
  );

  if (cardIndex < 0) return;

  const card = battleState.hand[cardIndex];

  if (battleState.player.energy < card.cost) {
    addBattleLog(`${card.name}: 에너지가 부족합니다.`);
    renderBattle();
    return;
  }

  battleState.isProcessingTurn = true;
  battleState.player.energy -= card.cost;
  applyCardEffects(card);

  battleState.hand.splice(cardIndex, 1);
  battleState.discardPile.push(card);

  addBattleLog(`${card.name} 사용. 에너지 ${card.cost} 소모.`);

  if (battleState.enemy.hp <= 0) {
    finishBattle("victory");
    return;
  }

  battleState.isProcessingTurn = false;
  renderBattle();
}


function applyCardEffects(card) {
  card.effects.forEach(effect => {
    switch (effect.type) {
      case "damage":
        battleState.enemy.hp = Math.max(
          0,
          battleState.enemy.hp - effect.value
        );
        addBattleLog(`${battleState.enemy.name}에게 ${effect.value} 피해.`);
        break;

      case "shield":
        battleState.player.shield += effect.value;
        addBattleLog(`실드 ${effect.value} 획득.`);
        break;

      case "heal": {
        const before = battleState.player.hp;

        battleState.player.hp = Math.min(
          battleState.player.maxHp,
          battleState.player.hp + effect.value
        );

        const healed = battleState.player.hp - before;
        addBattleLog(`체력 ${healed} 회복.`);
        break;
      }

      case "draw":
        drawCards(effect.value);
        addBattleLog(`카드 ${effect.value}장 드로우.`);
        break;

      case "energy":
        battleState.player.energy += effect.value;
        addBattleLog(`에너지 ${effect.value} 획득.`);
        break;

      default:
        console.warn("지원하지 않는 카드 효과:", effect);
    }
  });
}


function endTurn() {
  if (battleState.battleFinished) return;
  if (battleState.isProcessingTurn) return;
  if (battleState.isTransitioningBattle) return;
  if (battleState.phase !== "player") return;

  battleState.isProcessingTurn = true;
  battleState.phase = "enemy";

  if (battleState.hand.length > 0) {
    battleState.discardPile.push(...battleState.hand);
    battleState.hand = [];
  }

  addBattleLog(`${battleState.turn}턴 종료. 남은 패를 버렸습니다.`);

  if (battleState.enemy.hp > 0) {
    enemyTurn();
  }

  if (battleState.player.hp <= 0) {
    finishBattle("defeat");
    return;
  }

  battleState.turn += 1;
  preparePlayerTurn();

  battleState.isProcessingTurn = false;
  addBattleLog(`${battleState.turn}턴 시작. 에너지 3, 카드 5장 준비.`);
  renderBattle();
}


function enemyTurn() {
  if (battleState.battleFinished) return;
  if (battleState.enemy.hp <= 0) return;

  const rawDamage = battleState.enemy.attack;
  const blocked = Math.min(battleState.player.shield, rawDamage);
  const hpDamage = Math.max(0, rawDamage - blocked);

  battleState.player.shield = Math.max(
    0,
    battleState.player.shield - blocked
  );

  battleState.player.hp = Math.max(
    0,
    battleState.player.hp - hpDamage
  );

  if (blocked > 0) {
    addBattleLog(`적 공격 ${rawDamage}. 실드가 ${blocked} 피해를 막았습니다.`);
  } else {
    addBattleLog(`적 공격! 플레이어가 ${hpDamage} 피해를 받았습니다.`);
  }

  if (hpDamage > 0 && blocked > 0) {
    addBattleLog(`남은 ${hpDamage} 피해가 체력에 적용되었습니다.`);
  }
}


function drawCards(count) {
  for (let i = 0; i < count; i += 1) {
    if (battleState.drawPile.length === 0) {
      if (battleState.discardPile.length === 0) {
        break;
      }

      battleState.drawPile = battleState.discardPile.splice(
        0,
        battleState.discardPile.length
      );

      shuffle(battleState.drawPile);
      addBattleLog("덱이 비어 버린 더미를 섞어 새 덱으로 만들었습니다.");
    }

    const drawnCard = battleState.drawPile.pop();

    if (drawnCard) {
      battleState.hand.push(drawnCard);
    }
  }
}


function finishBattle(result) {
  if (battleState.battleFinished) return;

  battleState.battleFinished = true;
  battleState.isProcessingTurn = false;
  battleState.phase = "finished";
  battleState.result = result;

  if (result === "victory") {
    addBattleLog(`${battleState.enemy.name} 격파. 전투 승리!`);

    // 승리한 전투가 끝날 때 최대 HP의 20%를 회복합니다.
    const healed = healAfterVictory();
    addBattleLog(`전투 종료 회복: 체력 ${healed} 회복 (${battleState.player.hp}/${battleState.player.maxHp}).`);

    battleState.rewardCandidates = createRewardCandidates(3);
    battleState.rewardClaimed = false;
    battleState.rewardScreenOpen = true;
    battleState.selectedRewardId = null;
  } else {
    // 패배 시에는 HP 0을 유지하고 보상/다음 전투를 열지 않습니다.
    addBattleLog("PX-01이 전투 불능 상태가 되었습니다.");
    battleState.rewardCandidates = [];
    battleState.rewardClaimed = false;
    battleState.rewardScreenOpen = false;
    battleState.selectedRewardId = null;
  }

  renderBattle();
}


function createRewardCandidates(count = 3) {
  const uniqueCardsById = new Map();

  Object.values(CARD_LIBRARY).forEach(card => {
    uniqueCardsById.set(card.id, card);
  });

  const uniqueCards = [...uniqueCardsById.values()];
  shuffle(uniqueCards);

  return uniqueCards
    .slice(0, Math.min(count, uniqueCards.length))
    .map(cloneCardTemplate);
}


function claimReward(cardId) {
  if (battleState.result !== "victory") return;
  if (!battleState.rewardScreenOpen) return;
  if (battleState.rewardClaimed) return;

  const selectedCard = battleState.rewardCandidates.find(
    card => card.id === cardId
  );

  if (!selectedCard) return;

  // 빠른 연속 클릭보다 먼저 잠금 상태를 설정합니다.
  battleState.rewardClaimed = true;
  battleState.selectedRewardId = selectedCard.id;

  // 원본 카드와 보상 후보를 직접 수정하지 않고 복사본 1장만 영구 덱에 추가합니다.
  const rewardCopy = {
    ...selectedCard,
    effects: selectedCard.effects.map(effect => ({ ...effect }))
  };

  battleState.playerDeck.push(rewardCopy);
  addBattleLog(`${selectedCard.name}을(를) 덱에 추가했습니다.`);

  if (typeof saveGame === "function") {
    saveGame();
  }

  renderBattle();
}


function skipReward() {
  if (battleState.result !== "victory") return;
  if (!battleState.rewardScreenOpen) return;
  if (battleState.rewardClaimed) return;

  battleState.rewardClaimed = true;
  battleState.selectedRewardId = null;
  addBattleLog("카드 보상을 건너뛰었습니다.");
  renderBattle();
}


function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}


function addBattleLog(message) {
  battleState.log.push(message);

  if (battleState.log.length > 40) {
    battleState.log.shift();
  }
}
