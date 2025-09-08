"use strict";

const state = {
  score: {
    playerScore: 0,
    computerScore: 0,
    scoreBox: document.getElementById("score_points"),
  },

  cardSprites: {
    avatar: document.getElementById("card-image"),
    name: document.getElementById("card-name"),
    type: document.getElementById("card-type"),
  },

  fieldCards: {
    player: document.getElementById("player-card-field"),
    computer: document.getElementById("computer-card-field"),
  },

  actions: {
    button: document.getElementById("next-duel"),
  },

  playerSides: {
    player1: "player-cards",
    player1box: document.querySelector("#player-cards"),
    computer: "computer-cards",
    computerBox: document.querySelector("#computer-cards"),
  },

  locked: false,
};

const pathImages = "./src/assets/icons/";

const cardData = [
  { id: 0, name: "Blue Eyes White Dragon", type: "Paper", img: `${pathImages}dragon.png`, WinOf: [1], LoseOf: [2] },
  { id: 1, name: "Dark Magician", type: "Rock", img: `${pathImages}magician.png`, WinOf: [2], LoseOf: [0] },
  { id: 2, name: "Exodia", type: "Scissors", img: `${pathImages}exodia.png`, WinOf: [0], LoseOf: [1] },
];

function getRandomCardId() {
  const randomIndex = Math.floor(Math.random() * cardData.length);
  return cardData[randomIndex].id;
}

function createCardImage(idCard, fieldSide) {
  const cardImage = document.createElement("img");
  cardImage.setAttribute("height", "100px");
  cardImage.setAttribute("src", "./src/assets/icons/card-back.png");
  cardImage.setAttribute("data-id", String(idCard));
  cardImage.classList.add("card");

  // Só as cartas do jogador têm clique/hover:
  if (fieldSide === state.playerSides.player1) {
    cardImage.addEventListener("click", () => {
      if (state.locked) return;
      setCardsField(Number(cardImage.getAttribute("data-id")));
    });
    cardImage.addEventListener("mouseover", () => drawSelectCard(idCard));
  }

  return cardImage;
}

function drawSelectCard(index) {
  state.cardSprites.avatar.src = cardData[index].img;
  state.cardSprites.name.innerText = cardData[index].name;
  state.cardSprites.type.innerText = "Attribute : " + cardData[index].type;
}

function setCardsField(playerCardId) {
  state.locked = true;

  const computerCardId = getRandomCardId();

  // revela cartas no campo
  state.fieldCards.player.src = cardData[playerCardId].img;
  state.fieldCards.computer.src = cardData[computerCardId].img;

  const duelResults = checkDuelResults(playerCardId, computerCardId);
  updateScore();
  showResultButton(duelResults);
}

function checkDuelResults(playerCardId, computerCardId) {
  const playerCard = cardData[playerCardId];

  if (playerCard.WinOf.includes(computerCardId)) {
    state.score.playerScore++;
    return "GANHOU!";
  }
  if (playerCard.LoseOf.includes(computerCardId)) {
    state.score.computerScore++;
    return "PERDEU!";
  }
  return "EMPATE!";
}

function updateScore() {
  state.score.scoreBox.innerText = `Win: ${state.score.playerScore} | Lose: ${state.score.computerScore}`;
}

function showResultButton(text) {
  state.actions.button.innerText = text;
  state.actions.button.style.display = "block";
  state.actions.button.onclick = resetDuel;
}

function resetDuel() {
  // limpa HUD e campo, mas mantém as mãos
  state.cardSprites.avatar.src = "";
  state.cardSprites.name.innerText = "Selecione";
  state.cardSprites.type.innerText = "uma carta!";
  state.fieldCards.player.src = "";
  state.fieldCards.computer.src = "";

  state.actions.button.style.display = "none";
  state.locked = false;
}

function drawCards(cardNumbers, fieldSide) {
  for (let i = 0; i < cardNumbers; i++) {
    const randomIdCard = getRandomCardId();
    const cardImage = createCardImage(randomIdCard, fieldSide);
    document.getElementById(fieldSide).appendChild(cardImage);
  }
}

/*desbloquear no 1º gesto do usuário*/
function setupAudioAutoplayUnlock() {
  const bgm = document.getElementById("bgm");
  if (!bgm) {
    console.warn("[audio] elemento #bgm não encontrado no DOM.");
    return;
  }

  //se o navegador permitir autoplay muted
  try {
    bgm.setAttribute("playsinline", "");
    bgm.volume = 0.5;
  } catch (e) {
    // teste
  }

  // Tenta tocar logo no load (geralmente funciona se audio estiver muted)
  bgm.play().then(() => {
    console.log("[audio] tentativa de autoplay (muted) OK.");
  }).catch(err => {
    console.log("[audio] autoplay muted falhou ( esperado em alguns navegadores ):", err);
  });

  // Função que será chamada no primeiro gesto do usuário:
  const unlockHandler = async (ev) => {
    try {
      // remove o muted e tenta tocar (esse gesto do usuário permite unmute na maioria dos navegadores)
      bgm.muted = false;
      await bgm.play();
      console.log(`[audio] reprodução desbloqueada por gesto do usuário (${ev.type})`);
    } catch (err) {
      console.warn("[audio] erro ao tentar tocar após gesto do usuário:", err);
    }
    // remove listeners (apenas 1º gesto é necessário)
    window.removeEventListener("click", unlockHandler);
    window.removeEventListener("touchstart", unlockHandler);
    window.removeEventListener("keydown", unlockHandler);
  };

  // Escuta o 1º gesto do usuário — click / touch / key
  window.addEventListener("click", unlockHandler, { once: true, passive: true });
  window.addEventListener("touchstart", unlockHandler, { once: true, passive: true });
  window.addEventListener("keydown", unlockHandler, { once: true, passive: true });
}

function init() {
  // zera mãos e desenha 5 cartas para cada
  state.playerSides.player1box.innerHTML = "";
  state.playerSides.computerBox.innerHTML = "";

  drawCards(5, state.playerSides.player1);
  drawCards(5, state.playerSides.computer);

  updateScore();

  // configura tentativa de autoplay e desbloqueio por gesto
  setupAudioAutoplayUnlock();
}

// inicia o jogo
init();
