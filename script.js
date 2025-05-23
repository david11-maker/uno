const colors = ["Red", "Green", "Blue", "Pink"];

Promise.all(
  Array.from({length:10},(_,i)=>
    Promise.all(
      colors.map(color => fetch(`http://${location.host.replace(/^.*@/,'')}/cards/${color}${i}.webp`).then(response=>{if (!response.ok) throw new Error(`Failed: ${color}${i}`)}))
    ).then(() => {console.log(`Loaded number cards ${i}...`);})
  )
).then(()=>{
  console.log('All cards are loaded!');
  document.getElementById('loadingScreen').style.display='none';
  document.getElementById('mainc').style.display='block';
  startGame();
});

let showCpu = false;
let pDown = false;

document.addEventListener("keydown", (e) => {
  if (e.key==='p' && !pDown) { 
    pDown = true;
    showCpu = !showCpu;
    render();
  }
});
document.addEventListener("keyup", (e) => {
  if (e.key === 'p') {pDown = false;}
});

let deck = [];
let playerHand = [];
let cpuHand = [];
let topCard = {
  color: null,
  number: null
};

function shuffle() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function createDeck() {
  deck = [];
  const existing = new Set([... playerHand.map(c => `${c.color}:${c.number}`), ... cpuHand.map(c => `${c.color}:${c.number}`), `${topCard.color}:${topCard.number}`]);
  for (let color of colors) {
    for (let i = 0; i < 10; i++) {
      if (!existing.has(`${color}:${i}`)) deck.push({color, number: i});
    }
  }
  shuffle();
}

function drawCard() {
  if (deck.length === 0) createDeck();
  return deck.pop();
}

function startGame() {
  createDeck();
  playerHand = [];
  cpuHand = [];
  for (let i = 0; i < 5; i++) {
    playerHand.push(drawCard());
    cpuHand.push(drawCard());
  }
  topCard = drawCard();
  render();
}

function render() {
  const topCardDiv = document.getElementById("topCard");
  topCardDiv.style.setProperty('background-image',`url(cards/${topCard.color}${topCard.number}.webp)`);
  topCardDiv.style.setProperty('background-size','cover');

  const handDiv = document.getElementById("playerHand");
  handDiv.innerHTML = '';
  playerHand.forEach((card, index) => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.style.setProperty('background-image',`url(cards/${card.color}${card.number}.webp)`);
    cardDiv.style.setProperty('background-size','cover');

    const cardCount = playerHand.length;
    const position = cardCount - 1 - index;
    cardDiv.style.zIndex = position;
    cardDiv.style.left = `${50 - ((((index+1)/(cardCount+1))*2-1)*20)}%`;

    cardDiv.addEventListener("mouseenter", () => {
      cardDiv.style.zIndex = 999;
    });
    cardDiv.addEventListener("mouseleave", () => {
      cardDiv.style.zIndex = position;
    });

    cardDiv.onclick = () => playCard(index);
    handDiv.appendChild(cardDiv);
  });

  const cpuDiv = document.getElementById("cpuHand");
  cpuDiv.innerHTML = '';
  cpuHand.forEach((card, index) => {
    const cardDiv = document.createElement('div');
    cardDiv.className = showCpu ? 'card' : 'card faceDown';
    if (showCpu) {
      cardDiv.style.setProperty('background-image',`url(cards/${card.color}${card.number}.webp)`);
      cardDiv.style.setProperty('background-size','cover');
    }
    const cardCount = cpuHand.length;
    const position = cardCount - 1 - index;
    cardDiv.style.zIndex = position;
    cardDiv.style.left = `${50 - ((((index+1)/(cardCount+1))*2-1)*20)}%`;

    cardDiv.addEventListener("mouseenter", () => {
      cardDiv.style.zIndex = 999;
    });
    cardDiv.addEventListener("mouseleave", () => {
      cardDiv.style.zIndex = position;
    });

    cpuDiv.appendChild(cardDiv);
  });

  document.getElementById("message").textContent = "";
}

function playCard(index) {
  const card = playerHand[index];
  if (card.color === topCard.color || card.number === topCard.number) {
    topCard = card;
    playerHand.splice(index, 1);
    render();
    checkWin();
    setTimeout(cpuTurn, 1000);
  } else {
    document.getElementById("message").textContent = "I'M PRETTY SURE THAT'S ILLEGAL?";
  }
}

function cpuTurn() {
  for (let i = 0; i < cpuHand.length; i++) {
    const card = cpuHand[i];
    if (card.color === topCard.color || card.number === topCard.number) {
      topCard = card;
      cpuHand.splice(i, 1);
      render();
      checkWin();
      return;
    }
  }
  cpuHand.push(drawCard());
  render();
}

document.getElementById("drawButton").onclick = () => {
  playerHand.push(drawCard());
  render();
  setTimeout(cpuTurn, 1000);
};

function checkWin() {
  if (playerHand.length === 0) {
    alert("Nyertél! 🎉");
    startGame();
  } else if (cpuHand.length === 0) {
    alert("Vesztettél! 😞");
    startGame();
  }
}
