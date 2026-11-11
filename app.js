const handElement = document.getElementById("hand");
const playerHpDisplay = document.getElementById("playerHpDisplay");
const enemyHpDisplay = document.getElementById("enemyHpDisplay");
const shieldDisplay = document.getElementById("shieldDisplay");
const energyDisplay = document.getElementById("energyDisplay");
const drawCount = document.getElementById("drawCount");
const discardCount = document.getElementById("discardCount");
const handCount = document.getElementById("handCount");
const playerDeckCount = document.getElementById("playerDeckCount");
const battleNumberDisplay = document.getElementById("battleNumberDisplay");
const turnDisplay = document.getElementById("turnDisplay");
const playerHpBar = document.getElementById("playerHpBar");
const enemyHpBar = document.getElementById("enemyHpBar");
const enemyIntent = document.getElementById("enemyIntent");
const statusText = document.getElementById("statusText");
const battleLog = document.getElementById("battleLog");

const startBattleBtn = document.getElementById("startBattleBtn");
const endTurnBtn = document.getElementById("endTurnBtn");
const restartBtn = document.getElementById("restartBtn");

const rewardOverlay = document.getElementById("rewardOverlay");
const rewardOptions = document.getElementById("rewardOptions");
const rewardStatus = document.getElementById("rewardStatus");
const skipRewardBtn = document.getElementById("skipRewardBtn");
const nextBattleBtn = document.getElementById("nextBattleBtn");

const resultOverlay = document.getElementById("resultOverlay");
const resultTitle = document.getElementById("resultTitle");
const resultMessage = document.getElementById("resultMessage");


function renderBattle() {
  renderStats();
  renderHand();
  renderLog();
  renderControls();
  renderReward();
  renderResult();
}


function renderStats() {
  const { player, enemy } = battleState;

  playerHpDisplay.textContent = `${player.hp} / ${player.maxHp}`;
  enemyHpDisplay.textContent = `${enemy.hp} / ${enemy.maxHp}`;
  shieldDisplay.textContent = player.shield;
  energyDisplay.textContent = `${player.energy} / ${player.maxEnergy}`;

  drawCount.textContent = battleState.drawPile.length;
  discardCount.textContent = battleState.discardPile.length;
  handCount.textContent = battleState.hand.length;
  playerDeckCount.textContent = battleState.playerDeck.length;
  battleNumberDisplay.textContent = `${battleState.battleIndex} / ${MAX_BATTLES}`;
  turnDisplay.textContent = battleState.turn;

  const playerHpPercent = (player.hp / player.maxHp) * 100;
  const enemyHpPercent = (enemy.hp / enemy.maxHp) * 100;

  playerHpBar.style.width = `${playerHpPercent}%`;
  enemyHpBar.style.width = `${enemyHpPercent}%`;

  enemyIntent.textContent = enemy.hp > 0
    ? `의도: ${enemy.attack} 피해`
    : "의도: 없음";

  if (battleState.runComplete) {
    statusText.textContent = "런 완료! 3회의 전투를 모두 마쳤습니다.";
  } else if (battleState.rewardScreenOpen) {
    statusText.textContent = battleState.rewardClaimed
      ? (battleState.battleIndex >= MAX_BATTLES
          ? "마지막 보상 처리 완료. 런 완료 화면으로 진행하세요."
          : "보상 선택 완료. 다음 전투로 진행하세요.")
      : "승리! 보상 카드를 선택하세요.";
  } else if (battleState.battleFinished) {
    statusText.textContent = "전투 종료";
  } else if (battleState.isProcessingTurn) {
    statusText.textContent = "턴 처리 중...";
  } else {
    statusText.textContent = "카드를 선택해 행동하세요.";
  }
}


function renderHand() {
  handElement.innerHTML = "";

  if (battleState.hand.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-hand";
    empty.textContent = battleState.battleFinished
      ? "전투가 종료되었습니다."
      : "현재 패에 카드가 없습니다.";

    handElement.appendChild(empty);
    return;
  }

  battleState.hand.forEach(card => {
    const button = createCardButton(card);

    const disabled =
      battleState.battleFinished ||
      battleState.isProcessingTurn ||
      battleState.phase !== "player" ||
      battleState.player.energy < card.cost;

    button.disabled = disabled;
    button.dataset.instanceId = card.instanceId;

    button.addEventListener("click", () => {
      playCard(card.instanceId);
    });

    handElement.appendChild(button);
  });
}


function renderControls() {
  const disabled =
    battleState.battleFinished ||
    battleState.isProcessingTurn ||
    battleState.phase !== "player";

  endTurnBtn.disabled = disabled;
}


function renderReward() {
  if (!battleState.rewardScreenOpen || battleState.result !== "victory") {
    rewardOverlay.classList.add("hidden");
    return;
  }

  rewardOverlay.classList.remove("hidden");
  rewardOptions.innerHTML = "";

  battleState.rewardCandidates.forEach(card => {
    const button = createCardButton(card);
    button.classList.add("reward-option");
    button.disabled = battleState.rewardClaimed;

    if (battleState.selectedRewardId === card.id) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      claimReward(card.id);
    });

    rewardOptions.appendChild(button);
  });

  skipRewardBtn.disabled = battleState.rewardClaimed;
  nextBattleBtn.disabled = !battleState.rewardClaimed || battleState.isTransitioningBattle;
  nextBattleBtn.textContent = battleState.battleIndex >= MAX_BATTLES
    ? "런 완료"
    : "다음 전투";

  if (!battleState.rewardClaimed) {
    rewardStatus.textContent = "서로 다른 카드 3장 중 1장을 선택하거나 건너뛰세요.";
  } else if (battleState.selectedRewardId) {
    const selected = battleState.rewardCandidates.find(
      card => card.id === battleState.selectedRewardId
    );

    rewardStatus.textContent = selected
      ? `${selected.name}이(가) 덱에 1장 추가되었습니다. 현재 덱 ${battleState.playerDeck.length}장.`
      : `보상 선택 완료. 현재 덱 ${battleState.playerDeck.length}장.`;
  } else {
    rewardStatus.textContent = `보상을 건너뛰었습니다. 현재 덱 ${battleState.playerDeck.length}장.`;
  }
}


function renderLog() {
  battleLog.innerHTML = "";

  [...battleState.log].reverse().forEach((message, index) => {
    const line = document.createElement("div");
    line.className = "log-line";

    const turnLabel = index === 0 ? "<strong>NOW</strong> " : "";
    line.innerHTML = `${turnLabel}${escapeHtml(message)}`;

    battleLog.appendChild(line);
  });
}


function renderResult() {
  if (battleState.runComplete) {
    resultOverlay.classList.remove("hidden");
    resultTitle.textContent = "RUN COMPLETE";
    resultMessage.textContent = `3회의 전투를 모두 완료했습니다. 최종 덱은 ${battleState.playerDeck.length}장입니다.`;
    restartBtn.textContent = "새 런 시작";
    return;
  }

  if (!battleState.battleFinished || battleState.result !== "defeat") {
    resultOverlay.classList.add("hidden");
    return;
  }

  resultOverlay.classList.remove("hidden");
  resultTitle.textContent = "DEFEAT";
  resultMessage.textContent = "기체가 전투 불능 상태가 되었습니다. 패배 후에는 다음 전투로 진행할 수 없습니다.";
  restartBtn.textContent = "새 게임";
}


function createCardButton(card) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `card ${card.type}`;

  button.innerHTML = `
    <div class="card-top">
      <div>
        <div class="card-rarity">${escapeHtml(card.rarity)}</div>
      </div>
      <div class="card-cost">${card.cost}</div>
    </div>

    <div class="card-art" aria-hidden="true">${escapeHtml(card.icon)}</div>

    <div class="card-type">${getTypeLabel(card.type)}</div>
    <h3>${escapeHtml(card.name)}</h3>
    <p class="card-description">${escapeHtml(card.description)}</p>
  `;

  return button;
}


function getTypeLabel(type) {
  const labels = {
    attack: "ATTACK",
    skill: "SKILL",
    power: "POWER"
  };

  return labels[type] || type.toUpperCase();
}


function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


startBattleBtn.addEventListener("click", startNewGame);
endTurnBtn.addEventListener("click", endTurn);
restartBtn.addEventListener("click", startNewGame);
skipRewardBtn.addEventListener("click", skipReward);
nextBattleBtn.addEventListener("click", continueAfterReward);

// 첫 실행은 항상 보상 카드가 없는 새 게임으로 시작합니다.
startNewGame();
