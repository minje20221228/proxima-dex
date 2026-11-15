"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

function loadEngine(configSource = read("config.js")) {
  const context = vm.createContext({ console, Math });
  vm.runInContext("function renderBattle() {}", context);
  for (const source of [configSource, read("cards.js"), read("battle.js")]) {
    vm.runInContext(source, context);
  }
  return vm.runInContext("({get state(){return battleState}, startNewGame, finishBattle, claimReward, skipReward, continueAfterReward, playCard, createCardInstance})", context);
}

test("downloaded HTML references real local scripts and stylesheet", () => {
  const html = read("index.html");
  const css = [...html.matchAll(/<link[^>]*href="([^"]+\.css)"/g)].map(m => m[1]);
  const scripts = [...html.matchAll(/<script[^>]*src="([^"]+\.js)"/g)].map(m => m[1]);
  assert.ok(css.length > 0 && scripts.length >= 4);
  for (const resource of [...css, ...scripts]) {
    assert.ok(fs.existsSync(path.join(root, resource)), `Missing: ${resource}`);
  }
});

test("game creates 12-card deck and 5-card opening hand", () => {
  const game = loadEngine();
  game.startNewGame();
  assert.equal(game.state.battleIndex, 1);
  assert.equal(game.state.playerDeck.length, 12);
  assert.equal(game.state.hand.length, 5);
  assert.equal(game.state.player.energy, 3);
});

test("3 battles: reward chosen once, next battle and run complete", () => {
  const game = loadEngine();
  game.startNewGame();
  for (let battle = 1; battle <= 3; battle += 1) {
    assert.equal(game.state.battleIndex, battle);
    game.finishBattle("victory");
    assert.equal(game.state.result, "victory");
    assert.equal(game.state.rewardCandidates.length, 3);
    const candidate = game.state.rewardCandidates[0];
    const before = game.state.playerDeck.length;
    game.claimReward(candidate.id);
    game.claimReward(candidate.id);
    assert.equal(game.state.playerDeck.length, before + 1, "duplicate click must not grant extra card");
    game.continueAfterReward();
  }
  assert.equal(game.state.runComplete, true);
  assert.equal(game.state.playerDeck.length, 15);
  game.continueAfterReward();
  assert.equal(game.state.battleIndex, 3);
});

test("a new game resets persistent deck and run state", () => {
  const game = loadEngine();
  game.startNewGame();
  game.finishBattle("victory");
  game.claimReward(game.state.rewardCandidates[0].id);
  game.startNewGame();
  assert.equal(game.state.battleIndex, 1);
  assert.equal(game.state.playerDeck.length, 12);
  assert.equal(game.state.runComplete, false);
  assert.equal(game.state.result, null);
});

test("card attack actually damages the enemy and triggers victory", () => {
  const game = loadEngine();
  game.startNewGame();
  const card = game.createCardInstance("laser_shot");
  game.state.hand = [card];
  game.state.enemy.hp = 6;
  game.playCard(card.instanceId);
  assert.equal(game.state.enemy.hp, 0);
  assert.equal(game.state.result, "victory");
});

test("buyer can change enemy HP in config.js", () => {
  const updatedConfig = read("config.js").replace("enemyHp: 36", "enemyHp: 20");
  assert.notEqual(updatedConfig, read("config.js"), "expected default setting was missing");
  const game = loadEngine(updatedConfig);
  game.startNewGame();
  assert.equal(game.state.enemy.hp, 20);
  assert.equal(game.state.enemy.maxHp, 20);
});

test("defeat cannot claim reward or proceed", () => {
  const game = loadEngine();
  game.startNewGame();
  game.state.player.hp = 0;
  game.finishBattle("defeat");
  assert.equal(game.state.rewardScreenOpen, false);
  const currentIndex = game.state.battleIndex;
  game.claimReward("laser_shot");
  game.continueAfterReward();
  assert.equal(game.state.playerDeck.length, 12);
  assert.equal(game.state.battleIndex, currentIndex);
});
