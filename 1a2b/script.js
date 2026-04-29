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
