// 取得 DOM 元素
const guessInput = document.getElementById("guess-input");
const submitBtn = document.getElementById("submit-btn");
const restartBtn = document.getElementById("restart-btn");
const historyList = document.getElementById("history-list");
const messageElement = document.getElementById("message");
const attemptsElement = document.getElementById("attempts");
const celebrationModal = document.getElementById("celebration-modal");
const celebrationCopy = document.getElementById("celebration-copy");
const closeCelebrationButton = document.getElementById("close-celebration");
const celebrationNewGameButton = document.getElementById("celebration-new-game");

// 遊戲狀態
const state = {
  secretNumber: "",
  attempts: 0,
  isComplete: false,
};

// 產生 4 個不重複的隨機數字
function generateSecretNumber() {
  const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  let result = "";
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    result += digits[randomIndex];
    digits.splice(randomIndex, 1); // 確保不重複
  }
  return result;
}

// 驗證玩家輸入
function validateInput(input) {
  if (input.length !== 4) return "請輸入 4 個數字。";
  if (!/^\d{4}$/.test(input)) return "只能輸入數字喔！";
  
  const uniqueDigits = new Set(input);
  if (uniqueDigits.size !== 4) return "數字不能重複喔！";

  return null; // 驗證通過
}

// 計算 ?A?B
function calculateResult(guess, secret) {
  let A = 0;
  let B = 0;
  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) {
      A++;
    } else if (secret.includes(guess[i])) {
      B++;
    }
  }
  return `${A}A${B}B`;
}

// UI 訊息更新
function setMessage(text) {
  messageElement.textContent = text;
}

// 顯示慶祝畫面
function showCelebration() {
  celebrationCopy.textContent = `太厲害了！你只猜了 ${state.attempts} 次就找到正確答案 ${state.secretNumber}！`;
  celebrationModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

// 隱藏慶祝畫面
function hideCelebration() {
  celebrationModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

// 處理猜測邏輯
function handleGuess() {
  if (state.isComplete) return;

  const guess = guessInput.value;
  const errorMsg = validateInput(guess);

  if (errorMsg) {
    setMessage(errorMsg);
    guessInput.focus();
    return;
  }

  // 更新次數
  state.attempts++;
  attemptsElement.textContent = state.attempts;

  // 計算結果
  const result = calculateResult(guess, state.secretNumber);
  
  // 新增紀錄到畫面
  const li = document.createElement("li");
  li.className = "history-item";
  li.innerHTML = `<span class="guess">${guess}</span><span class="result">${result}</span>`;
  historyList.prepend(li); // 新的紀錄放在最上面

  // 判斷輸贏
  if (result === "4A0B") {
    state.isComplete = true;
    setMessage(`恭喜過關！答案就是 ${state.secretNumber}。`);
    showCelebration();
  } else {
    setMessage(`「${guess}」的結果是 ${result}，繼續加油！`);
    guessInput.value = "";
    guessInput.focus();
  }
}

// 初始化/重新開始遊戲
function initGame() {
  state.secretNumber = generateSecretNumber();
  state.attempts = 0;
  state.isComplete = false;
  
  attemptsElement.textContent = "0";
  historyList.innerHTML = "";
  guessInput.value = "";
  setMessage("新的一局開始了！請輸入 4 個不重複的數字。");
  hideCelebration();
  guessInput.focus();
  
  // 開發時如果想偷看答案，可以把下面這行取消註解
  // console.log("Secret Number:", state.secretNumber); 
}

// 事件綁定
submitBtn.addEventListener("click", handleGuess);
restartBtn.addEventListener("click", initGame);

guessInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleGuess();
  }
});

closeCelebrationButton.addEventListener("click", hideCelebration);
celebrationNewGameButton.addEventListener("click", initGame);
celebrationModal.addEventListener("click", (event) => {
  if (event.target === celebrationModal) {
    hideCelebration();
  }
});

// 啟動遊戲
initGame();