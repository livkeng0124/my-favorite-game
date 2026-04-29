  state.isComplete = true;
  hideCelebration();
  renderBoard();
  clearTimer();
  setMessage("已經幫你展開完整答案，也可以直接開一盤新的。");
}

function startNewGame(difficultyKey = state.difficulty) {
  state.difficulty = difficultyKey;
  state.notesMode = false;
  state.selected = null;
  state.mistakes = 0;
  state.timerSeconds = 0;
  state.flashCell = null;
  state.isComplete = false;

  const { puzzle, solution } = buildGame(difficultyKey);
  state.puzzle = puzzle;
  state.solution = solution;
  state.board = cloneBoard(puzzle);
  state.notes = createEmptyNotes();
  hideCelebration();

  document.querySelectorAll("[data-difficulty]").forEach((button) => {
    button.classList.toggle("active", button.dataset.difficulty === difficultyKey);
  });

  startTimer();
  refreshStatus();
  renderBoard();
  setMessage("新的一盤準備好了，從你最想解的地方開始。");
}

boardElement.addEventListener("click", (event) => {
  const button = event.target.closest(".cell");
  if (!button) {
    return;
  }

  selectCell(Number(button.dataset.row), Number(button.dataset.col));
});

document.getElementById("number-pad").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  if (button.dataset.action === "clear") {
    clearSelectedCell();
    return;
  }

  placeValue(Number(button.dataset.number));
});

document.getElementById("difficulty-buttons").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-difficulty]");
  if (!button) {
    return;
  }

  startNewGame(button.dataset.difficulty);
});

document.getElementById("new-game").addEventListener("click", () => {
  startNewGame(state.difficulty);
});

document.getElementById("reset-board").addEventListener("click", resetBoard);
document.getElementById("hint").addEventListener("click", giveHint);
document.getElementById("check-board").addEventListener("click", checkBoardProgress);
document.getElementById("solve-board").addEventListener("click", solveBoard);
closeCelebrationButton.addEventListener("click", hideCelebration);
celebrationNewGameButton.addEventListener("click", () => {
  startNewGame(state.difficulty);
});
celebrationModal.addEventListener("click", (event) => {
  if (event.target === celebrationModal) {
    hideCelebration();
  }
});

notesModeButton.addEventListener("click", () => {
  state.notesMode = !state.notesMode;
  refreshStatus();
  setMessage(
    state.notesMode
      ? "筆記模式已開啟，現在輸入數字會寫成小筆記。"
      : "筆記模式已關閉，現在輸入數字會直接填入格子。"
  );
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && celebrationModal.getAttribute("aria-hidden") === "false") {
    hideCelebration();
    return;
  }

  if (celebrationModal.getAttribute("aria-hidden") === "false") {
    return;
  }

  if (event.key >= "1" && event.key <= "9") {
    placeValue(Number(event.key));
  }

  if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") {
    clearSelectedCell();
  }

  if (event.key.toLowerCase() === "n") {
    state.notesMode = !state.notesMode;
    refreshStatus();
  }

  if (!state.selected) {
    return;
  }

  const moves = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
  };

  const move = moves[event.key];
  if (!move) {
    return;
  }

  event.preventDefault();
  const nextRow = Math.min(8, Math.max(0, state.selected.row + move[0]));
  const nextCol = Math.min(8, Math.max(0, state.selected.col + move[1]));
  selectCell(nextRow, nextCol);
});

startNewGame("easy");
showCelebrationPreview();