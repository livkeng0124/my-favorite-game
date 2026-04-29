# 草莓小遊戲收藏

一組粉色系、可直接在瀏覽器玩的迷你遊戲，目前包含：

- 草莓數獨樂園
- 草莓 1A2B

## 特色

- 粉色系介面設計
- 數獨：三種難度、提示、筆記模式、完成獎勵視窗
- 1A2B：四位不重複數字猜謎、歷史紀錄、計時與最佳結果
- 兩個遊戲可在頁面上互相切換

## 線上遊玩

上傳到 GitHub 並開啟 GitHub Pages 後，網站網址會是：

- 數獨首頁：`https://<你的 GitHub 帳號>.github.io/<repo 名稱>/`
- 1A2B：`https://<你的 GitHub 帳號>.github.io/<repo 名稱>/1a2b/`
- 如果 repo 名稱剛好是 `<你的 GitHub 帳號>.github.io`，首頁網址會是：`https://<你的 GitHub 帳號>.github.io/`

## 本機開啟

- 直接打開 `index.html` 可以玩數獨
- 打開 `1a2b/index.html` 可以玩 1A2B

## 專案檔案

- `index.html`：數獨頁面
- `styles.css`：數獨樣式與完成彈窗動畫
- `script.js`：數獨生成、遊戲邏輯與互動
- `1a2b/index.html`：1A2B 頁面
- `1a2b/styles.css`：1A2B 樣式
- `1a2b/script.js`：1A2B 邏輯
- `celebration-preview.svg`：完成畫面預覽圖

## 上傳到 GitHub

如果你這台電腦目前沒有可用的 `git`，最簡單的方法是直接用 GitHub 網站上傳：

1. 在 GitHub 建立一個新的 repository。
2. 把這個資料夾中的檔案上傳到 repo 根目錄：
   - `index.html`
   - `styles.css`
   - `script.js`
   - `README.md`
   - `.nojekyll`
   - `.gitignore`
   - `celebration-preview.svg`
   - `1a2b/` 資料夾整個一起上傳
3. 上傳後到 repo 的 `Settings`。
4. 打開 `Pages`。
5. 在 `Build and deployment` 的 `Source` 選擇 `Deploy from a branch`。
6. Branch 選 `main`，資料夾選 `/ (root)`，然後儲存。
7. 等 GitHub 幾分鐘後發布完成，就能用公開網址遊玩。

## 預覽圖

![完成畫面預覽](./celebration-preview.svg)
