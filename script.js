const boardElement = document.getElementById("sudoku-board");
const timerElement = document.getElementById("timer");
const mistakesElement = document.getElementById("mistakes");
const messageElement = document.getElementById("message");
const difficultyLabel = document.getElementById("difficulty-label");
const notesModeButton = document.getElementById("notes-mode");
const celebrationModal = document.getElementById("celebration-modal");
const celebrationCopy = document.getElementById("celebration-copy");
const closeCelebrationButton = document.getElementById("close-celebration");
const celebrationNewGameButton = document.getElementById("celebration-new-game");

const DIFFICULTIES = {
  easy: { label: "甜甜簡單", holes: 38 },
  medium: { label: "莓果普通", holes: 46 },
  hard: { label: "櫻花挑戰", holes: 54 },
};

const state = {
  difficulty: "easy",
  puzzle: [],
  solution: [],
  board: [],
  notes: createEmptyNotes(),
  selected: null,
  mistakes: 0,
  notesMode: false,
  timerSeconds: 0,
  timerId: null,
  flashCell: null,
  isComplete: false,
};

function createEmptyBoard() {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function createEmptyNotes() {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => new Set())
  );
}

function cloneBoard(board) {
  return board.map((row) => [...row]);
}

function shuffle(values) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function isPlacementValid(board, row, col, value) {
  for (let index = 0; index < 9; index += 1) {
    if (board[row][index] === value || board[index][col] === value) {
      return false;
    }
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let r = boxRow; r < boxRow + 3; r += 1) {
    for (let c = boxCol; c < boxCol + 3; c += 1) {
      if (board[r][c] === value) {
        return false;
      }
    }
  }

  return true;
}

function getCandidates(board, row, col) {
  if (board[row][col] !== 0) {
    return [];
  }

  const candidates = [];
  for (let value = 1; value <= 9; value += 1) {
    if (isPlacementValid(board, row, col, value)) {
      candidates.push(value);
    }
  }
  return candidates;
}

function findBestEmptyCell(board) {
  let best = null;

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (board[row][col] !== 0) {
        continue;
      }

      const candidates = getCandidates(board, row, col);
      if (candidates.length === 0) {
        return { row, col, candidates };
      }

      if (!best || candidates.length < best.candidates.length) {
        best = { row, col, candidates };
      }
    }
  }

  return best;
}

function fillBoard(board) {
  const next = findBestEmptyCell(board);
  if (!next) {
    return true;
  }

  const { row, col, candidates } = next;
  for (const value of shuffle(candidates)) {
    board[row][col] = value;
    if (fillBoard(board)) {
      return true;
    }
  }

  board[row][col] = 0;
  return false;
}

function countSolutions(board, limit = 2) {
  let count = 0;

  function search() {
    if (count >= limit) {
      return;
    }

    const next = findBestEmptyCell(board);
    if (!next) {
      count += 1;
      return;
    }

    const { row, col, candidates } = next;
    for (const value of candidates) {
      board[row][col] = value;
      search();
      board[row][col] = 0;
      if (count >= limit) {
        return;
      }
    }
  }

  search();
  return count;
}

function generatePuzzle(holeTarget) {
  const solution = createEmptyBoard();
  fillBoard(solution);

  const puzzle = cloneBoard(solution);
  const positions = shuffle(Array.from({ length: 81 }, (_, index) => index));
  let removed = 0;

  // 移除數字時持續檢查唯一解，讓遊戲體驗穩定。
  for (const position of positions) {
    if (removed >= holeTarget) {
      break;
    }

    const row = Math.floor(position / 9);
    const col = position % 9;
    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    const probe = cloneBoard(puzzle);
    if (countSolutions(probe, 2) !== 1) {
      puzzle[row][col] = backup;
      continue;
    }

    removed += 1;
  }

  return { puzzle, solution };
}

function buildGame(difficultyKey) {
  const { holes } = DIFFICULTIES[difficultyKey];
  let result = null;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const generated = generatePuzzle(holes);
    const emptyCount = generated.puzzle.flat().filter((value) => value === 0).length;

    if (emptyCount >= holes - 2) {
      result = generated;
      break;
    }
  }

  return result || generatePuzzle(holes);
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function clearTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function startTimer() {
  clearTimer();
  state.timerId = window.setInterval(() => {
    state.timerSeconds += 1;
    timerElement.textContent = formatTime(state.timerSeconds);
  }, 1000);
}

function setMessage(text) {
  messageElement.textContent = text;
}

function showCelebration() {
  celebrationCopy.textContent =
    `你用 ${formatTime(state.timerSeconds)} 完成這盤草莓數獨，送你一塊草莓蛋糕。`;
  celebrationModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function hideCelebration() {
  celebrationModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function showCelebrationPreview() {
  if (window.location.hash !== "#celebration-preview") {
    return;
  }

  state.board = cloneBoard(state.solution);
  state.notes = createEmptyNotes();
  state.selected = null;
  state.mistakes = 0;
  state.timerSeconds = 125;
  state.flashCell = null;
  state.isComplete = true;
  clearTimer();
  refreshStatus();
  renderBoard();
  setMessage(`大功告成。你用 ${formatTime(state.timerSeconds)} 解開這盤草莓數獨！`);
  showCelebration();
}

function isFixedCell(row, col) {
  return state.puzzle[row][col] !== 0;
}

function isRelatedCell(row, col, selected) {
  if (!selected) {
    return false;
  }

  const sameRow = row === selected.row;
  const sameCol = col === selected.col;
  const sameBox =
    Math.floor(row / 3) === Math.floor(selected.row / 3) &&
    Math.floor(col / 3) === Math.floor(selected.col / 3);

  return sameRow || sameCol || sameBox;
}

function renderBoard() {
  const selectedValue = state.selected
    ? state.board[state.selected.row][state.selected.col]
    : 0;

  boardElement.innerHTML = "";

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const cell = document.createElement("button");
      const value = state.board[row][col];

      cell.type = "button";
      cell.className = "cell";
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);
      cell.setAttribute("aria-label", `第 ${row + 1} 列，第 ${col + 1} 欄`);

      if (isFixedCell(row, col)) {
        cell.classList.add("fixed");
      }

      if (isRelatedCell(row, col, state.selected)) {
        cell.classList.add("related");
      }

      if (selectedValue && value === selectedValue) {
        cell.classList.add("same-number");
      }

      if (state.selected && state.selected.row === row && state.selected.col === col) {
        cell.classList.add("selected");
      }

      if (state.flashCell && state.flashCell.row === row && state.flashCell.col === col) {
        cell.classList.add("flash-error");
      }

      if (value !== 0) {
        cell.textContent = String(value);
      } else {
        const notes = state.notes[row][col];
        if (notes.size > 0) {
          const noteGrid = document.createElement("div");
          noteGrid.className = "notes-grid";

          for (let noteValue = 1; noteValue <= 9; noteValue += 1) {
            const note = document.createElement("span");
            note.className = "note";
            note.textContent = notes.has(noteValue) ? String(noteValue) : "";
            noteGrid.appendChild(note);
          }

          cell.appendChild(noteGrid);
        }
      }

      boardElement.appendChild(cell);
    }
  }
}

function refreshStatus() {
  timerElement.textContent = formatTime(state.timerSeconds);
  mistakesElement.textContent = String(state.mistakes);
  difficultyLabel.textContent = DIFFICULTIES[state.difficulty].label;
  notesModeButton.setAttribute("aria-pressed", String(state.notesMode));
}

function selectCell(row, col) {
  state.selected = { row, col };
  renderBoard();
}

function clearNotes(row, col) {
  state.notes[row][col].clear();
}

function removePlacedValueFromNotes(row, col, value) {
  for (let index = 0; index < 9; index += 1) {
    state.notes[row][index].delete(value);
    state.notes[index][col].delete(value);
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r += 1) {
    for (let c = boxCol; c < boxCol + 3; c += 1) {
      state.notes[r][c].delete(value);
    }
  }
}

function flashError(row, col) {
  state.flashCell = { row, col };
  renderBoard();
  window.setTimeout(() => {
    state.flashCell = null;
    renderBoard();
  }, 280);
}

function checkWin() {
  const solved = state.board.every((row, rowIndex) =>
    row.every((value, colIndex) => value === state.solution[rowIndex][colIndex])
  );

  if (!solved) {
    return false;
  }

  if (state.isComplete) {
    return true;
  }

  state.isComplete = true;
  clearTimer();
  setMessage(`大功告成。你用 ${formatTime(state.timerSeconds)} 解開這盤草莓數獨！`);
  showCelebration();
  renderBoard();
  return true;
}

function toggleNote(value) {
  if (!state.selected) {
    setMessage("先選一格空白格子，再寫筆記。");
    return;
  }

  const { row, col } = state.selected;
  if (isFixedCell(row, col) || state.board[row][col] !== 0) {
    setMessage("筆記只能放在還沒填數字的格子。");
    return;
  }

  const noteSet = state.notes[row][col];
  if (noteSet.has(value)) {
    noteSet.delete(value);
  } else {
    noteSet.add(value);
  }

  setMessage(`已${noteSet.has(value) ? "加入" : "移除"} ${value} 的筆記。`);
  renderBoard();
}

function placeValue(value) {
  if (!state.selected) {
    setMessage("先點一格，再輸入數字。");
    return;
  }

  const { row, col } = state.selected;
  if (isFixedCell(row, col)) {
    setMessage("這格是題目原本就有的數字，不能修改。");
    return;
  }

  if (state.notesMode) {
    toggleNote(value);
    return;
  }

  if (state.solution[row][col] !== value) {
    state.mistakes += 1;
    refreshStatus();
    setMessage(`這個位置不是 ${value}，再看看同列、同欄或九宮格。`);
    flashError(row, col);
    return;
  }

  state.board[row][col] = value;
  clearNotes(row, col);
  removePlacedValueFromNotes(row, col, value);
  setMessage(`放入 ${value}，很順。`);
  renderBoard();
  checkWin();
}

function clearSelectedCell() {
  if (!state.selected) {
    setMessage("先選一格再清除。");
    return;
  }

  const { row, col } = state.selected;
  if (isFixedCell(row, col)) {
    setMessage("這格不能清除，因為它是題目提供的數字。");
    return;
  }

  state.board[row][col] = 0;
  clearNotes(row, col);
  renderBoard();
  setMessage("已清除這一格。");
}

function resetBoard() {
  state.board = cloneBoard(state.puzzle);
  state.notes = createEmptyNotes();
  state.selected = null;
  state.mistakes = 0;
  state.timerSeconds = 0;
  state.flashCell = null;
  state.isComplete = false;
  hideCelebration();
  startTimer();
  refreshStatus();
  renderBoard();
  setMessage("這盤重新開始，慢慢解也沒關係。");
}

function giveHint() {
  const empties = [];

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (state.board[row][col] === 0) {
        empties.push({ row, col });
      }
    }
  }

  if (empties.length === 0) {
    checkWin();
    return;
  }

  const target = state.selected &&
    state.board[state.selected.row][state.selected.col] === 0
    ? state.selected
    : empties[Math.floor(Math.random() * empties.length)];

  const answer = state.solution[target.row][target.col];
  state.board[target.row][target.col] = answer;
  clearNotes(target.row, target.col);
  removePlacedValueFromNotes(target.row, target.col, answer);
  state.selected = target;
  renderBoard();
  setMessage(`提示來了：這格可以放 ${answer}。`);
  checkWin();
}

function checkBoardProgress() {
  let filled = 0;
  let remaining = 0;

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (state.board[row][col] === 0) {
        remaining += 1;
      } else {
        filled += 1;
      }
    }
  }

  if (remaining === 0) {
    checkWin();
    return;
  }

  setMessage(`目前已填 ${filled} 格，還有 ${remaining} 格等你完成。`);
}

function solveBoard() {
  state.board = cloneBoard(state.solution);
  state.notes = createEmptyNotes();
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
