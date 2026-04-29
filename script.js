const attemptCountElement = document.getElementById("attempt-count");
const timerElement = document.getElementById("timer");
const bestScoreElement = document.getElementById("best-score");
const guessInput = document.getElementById("guess-input");
const historyList = document.getElementById("history-list");
const messageElement = document.getElementById("message");
const answerMaskElement = document.getElementById("answer-mask");
const celebrationModal = document.getElementById("celebration-modal");
const celebrationCopy = document.getElementById("celebration-copy");

const BEST_SCORE_KEY = "strawberry-1a2b-best-score";

const state = {
  answer: [],
  history: [],
  timerSeconds: 0,
  timerId: null,
  isSolved: false,
};

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function setMessage(text) {
  messageElement.textContent = text;
}

function generateAnswer() {
  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const firstDigit = digits.splice(Math.floor(Math.random() * digits.length), 1)[0];
  const tailPool = [...digits, "0"];
  const answer = [firstDigit];

  while (answer.length < 4) {
    const index = Math.floor(Math.random() * tailPool.length);
    answer.push(tailPool.splice(index, 1)[0]);
  }

  return answer;
}

function isValidGuess(guess) {
  return /^\d{4}$/.test(guess) && guess[0] !== "0" && new Set(guess).size === 4;
}

function scoreGuess(guess, answer) {
  let a = 0;
  let b = 0;

  for (let index = 0; index < guess.length; index += 1) {
    if (guess[index] === answer[index]) {
      a += 1;
    } else if (answer.includes(guess[index])) {
      b += 1;
    }
  }

  return { a, b };
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

function readBestScore() {
  try {
    return window.localStorage.getItem(BEST_SCORE_KEY);
  } catch {
    return null;
  }
}

function writeBestScore(value) {
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, value);
  } catch {
    // localStorage 不可用時，直接略過最佳紀錄保存。
  }
}

function refreshBestScore() {
  const best = readBestScore();
  bestScoreElement.textContent = best || "未記錄";
}

function refreshStatus() {
  attemptCountElement.textContent = String(state.history.length);
  timerElement.textContent = formatTime(state.timerSeconds);
  refreshBestScore();
}

function renderHistory() {
  historyList.innerHTML = "";

  if (state.history.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "還沒有猜測紀錄，來試第一組數字吧。";
    historyList.appendChild(empty);
    return;
  }

  state.history
    .slice()
    .reverse()
    .forEach((entry) => {
      const item = document.createElement("article");
      item.className = "history-item";

      const order = document.createElement("div");
      order.className = "history-item-order";
      order.textContent = `#${entry.order}`;

      const guessWrap = document.createElement("div");
      const guess = document.createElement("div");
      guess.className = "history-item-guess";
      guess.textContent = entry.guess;

      const meta = document.createElement("div");
      meta.className = "history-item-meta";
      meta.textContent = entry.isSolved ? "猜中了" : "再縮小一點範圍";

      guessWrap.appendChild(guess);
      guessWrap.appendChild(meta);

      const score = document.createElement("div");
      score.className = "history-item-score";
      score.textContent = `${entry.a}A${entry.b}B`;

      item.appendChild(order);
      item.appendChild(guessWrap);
      item.appendChild(score);
      historyList.appendChild(item);
    });
}

function showCelebration() {
  celebrationCopy.textContent =
    `你用 ${state.history.length} 次、花了 ${formatTime(state.timerSeconds)} 猜中這組草莓密碼。`;
  celebrationModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function hideCelebration() {
  celebrationModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function revealAnswer() {
  answerMaskElement.textContent = `答案：${state.answer.join("")}`;
}

function maybeSaveBestScore() {
  const current = `${state.history.length} 次`;
  const stored = readBestScore();

  if (!stored) {
    writeBestScore(current);
    return;
  }

  const storedValue = Number.parseInt(stored, 10);
  if (Number.isNaN(storedValue) || state.history.length < storedValue) {
    writeBestScore(current);
  }
}

function handleSolvedGuess() {
  state.isSolved = true;
  clearTimer();
  revealAnswer();
  maybeSaveBestScore();
  refreshStatus();
  setMessage("大功告成，你猜中這組 1A2B 了。");
  showCelebration();
}

function submitGuess() {
  const guess = guessInput.value.trim();

  if (state.isSolved) {
    setMessage("這局已經完成了，按新遊戲再來一輪吧。");
    return;
  }

  if (!isValidGuess(guess)) {
    setMessage("請輸入 4 位不重複數字，而且第一位不能是 0。");
    return;
  }

  const { a, b } = scoreGuess(guess, state.answer);
  const entry = {
    order: state.history.length + 1,
    guess,
    a,
    b,
    isSolved: a === 4,
  };

  state.history.push(entry);
  guessInput.value = "";
  renderHistory();
  refreshStatus();

  if (entry.isSolved) {
    handleSolvedGuess();
    return;
  }

  setMessage(`這次是 ${a}A${b}B，再試一組更接近的。`);
}

function startNewGame() {
  state.answer = generateAnswer();
  state.history = [];
  state.timerSeconds = 0;
  state.isSolved = false;

  hideCelebration();
  answerMaskElement.textContent = "答案保密中";
  guessInput.value = "";
  renderHistory();
  refreshStatus();
  setMessage("新的一局開始了，先猜一組四位數。");
  startTimer();
}

document.getElementById("guess-form").addEventListener("submit", (event) => {
  event.preventDefault();
  submitGuess();
});

document.getElementById("new-game").addEventListener("click", startNewGame);
document.getElementById("show-answer").addEventListener("click", () => {
  revealAnswer();
  setMessage(`答案是 ${state.answer.join("")}。想再挑戰可以直接開新遊戲。`);
});
document.getElementById("clear-input").addEventListener("click", () => {
  guessInput.value = "";
  guessInput.focus();
});
document.getElementById("close-celebration").addEventListener("click", hideCelebration);
document.getElementById("celebration-new-game").addEventListener("click", startNewGame);

celebrationModal.addEventListener("click", (event) => {
  if (event.target === celebrationModal) {
    hideCelebration();
  }
});

guessInput.addEventListener("input", () => {
  guessInput.value = guessInput.value.replace(/\D/g, "").slice(0, 4);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && celebrationModal.getAttribute("aria-hidden") === "false") {
    hideCelebration();
    return;
  }

  if (celebrationModal.getAttribute("aria-hidden") === "false") {
    return;
  }

  if (event.key === "Enter" && document.activeElement !== guessInput) {
    event.preventDefault();
    submitGuess();
  }
});

startNewGame();
