type Card = {
  isFlipped: boolean;
  isMatched: boolean;
  color: string;
};

type Score = {
  moves: number;
  time: number;
};

let cards: Card[] = [];
let moves: number = 0;
let currentSelectedCardIndex: number | null = null;
let canClick: boolean = true;
let startTime: number; // To track the start time of the game
let highScore: Score | null = null; // Initialize high score

// Shuffle function
function shuffleArray(array: Card[]): Card[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Initialize game function
function initializeGame(): void {
  moves = 0;
  currentSelectedCardIndex = null;
  canClick = true;
  startTime = Date.now(); //start time of game

  const cardColors = [
    "red",
    "red",
    "blue",
    "blue",
    "green",
    "green",
    "pink",
    "pink",
    "white",
    "white",
  ]; // and more colors if you want add more cards

  cards = cardColors.map((color) => ({
    isFlipped: false,
    isMatched: false,
    color,
  }));

  cards = shuffleArray(cards);
  updateUI(); // Update UI right after initializing
  updateMoveCount(); // Initialize move count
}

// Update move count and check game over condition
function updateMoveCount(): void {
  const moveCountElement = document.getElementById("moveCount");
  if (moveCountElement) {
    moveCountElement.textContent = moves.toString();
  }
}

// Check win condition
function checkWinCondition(): boolean {
  return cards.every((card) => card.isMatched);
}

function handleCardClick(clickedCardIndex: number): void {
  if (
    !canClick ||
    cards[clickedCardIndex].isMatched ||
    cards[clickedCardIndex].isFlipped
  ) {
    return;
  }

  cards[clickedCardIndex].isFlipped = true; // Flip the clicked card

  if (currentSelectedCardIndex === null) {
    currentSelectedCardIndex = clickedCardIndex;
  } else {
    if (
      cards[clickedCardIndex].color === cards[currentSelectedCardIndex].color
    ) {
      cards[clickedCardIndex].isMatched = true;
      cards[currentSelectedCardIndex].isMatched = true;
      currentSelectedCardIndex = null;

      // Check if the player wins and update the high score if necessary
      if (checkWinCondition()) {
        const endTime = Date.now();
        const gameTime = (endTime - startTime) / 1000; // Convert time to seconds
        alert(`YOU WIN! Moves: ${moves} Time: ${gameTime.toFixed(2)} seconds`); // Use toFixed(2) to format the time with 2 decimal places
        updateHighScore(moves, gameTime); // Update the high score based on moves and time
        canClick = false; // Disable further clicks
        displayHighScore(); // Optional: Call displayHighScore if you want to update the display immediately after winning
      }
    } else {
      canClick = false; // Prevent further clicks
      setTimeout(() => {
        cards[clickedCardIndex].isFlipped = false;
        cards[currentSelectedCardIndex!].isFlipped = false;
        currentSelectedCardIndex = null;
        canClick = true; // Re-enable clicks
        updateUI();
      }, 1000);
    }
    moves++;
    updateMoveCount(); // Update the move count display
  }
  updateUI();
}

// When setting the high score
function updateHighScore(newMoves: number, newTime: number): void {
  const highScore = getHighScore();
  if (
    highScore === null ||
    newMoves < highScore.moves ||
    (newMoves === highScore.moves && newTime < highScore.time)
  ) {
    const newHighScore = { moves: newMoves, time: newTime };
    localStorage.setItem("highScore", JSON.stringify(newHighScore));
    displayHighScore(); // Update the display with the new high score
  }
}

function getHighScore(): Score {
  const highScoreString = localStorage.getItem("highScore");
  if (highScoreString) {
    const highScore = JSON.parse(highScoreString);
    // Ensure that both moves and time properties exist
    return {
      moves: highScore.moves ?? Infinity,
      time: highScore.time ?? Infinity,
    };
  } else {
    // Provide default values if high score is not set
    return { moves: Infinity, time: Infinity };
  }
}

// When displaying the high score
function displayHighScore(): void {
  const highScoreElement = document.getElementById("highScore");
  const highScore = getHighScore();
  if (highScoreElement) {
    let highScoreText = "No high score yet";
    if (highScore.moves !== Infinity && highScore.time !== Infinity) {
      highScoreText = `High Score: Moves - ${
        highScore.moves
      }, Time - ${highScore.time.toFixed(2)} seconds`;
    }
    highScoreElement.textContent = highScoreText;
  }
}

function updateUI(): void {
  const gameContainer = document.getElementById("game-container");
  if (!gameContainer) return;

  gameContainer.innerHTML = "";

  cards.forEach((card, index) => {
    const cardElement = document.createElement("div");
    cardElement.className = `card ${card.color} ${
      card.isFlipped || card.isMatched ? "flipped" : ""
    }`;

    cardElement.addEventListener("click", () => {
      handleCardClick(index);
    });

    gameContainer.appendChild(cardElement);
  });
}

function resetGame(): void {
  cards.forEach((card) => {
    card.isFlipped = false;
    card.isMatched = false;
  });
  moves = 0; // Reset moves
  canClick = true; // Enable clicking
  initializeGame(); // Re-initialize the game
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize the game
  initializeGame();

  // Display the high score
  displayHighScore();

  // Reset button event listener
  const resetButton = document.getElementById("resetButton");
  if (resetButton) {
    resetButton.addEventListener("click", resetGame);
  }
});
