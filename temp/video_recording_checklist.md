# Video Recording Checklist

## 1. Environment & Wallet Setup
- [ ] **Wallet Funding**: Ensure your wallet (defined in `.env`) has:
    - [ ] **ETH** on Base Sepolia (for gas).
    - [ ] **USDT** on Base Sepolia (at least 20 USDT for Scene 4).
- [ ] **Identity State (Scene 3)**:
    - [ ] To show "Identity Minting", use a wallet address that has **NOT** registered yet.
    - [ ] *Option:* Generate a fresh account in `.env` just for this recording.
- [ ] **Aave State**:
    - [ ] Ensure Aave position is empty (or low) so "Supply" action makes sense.

## 2. Terminal Setup
- [ ] **Clean Slate**: Run `clear` before starting.
- [ ] **Directory**: Navigate to the project root.
- [ ] **Font Size**: Increase terminal font size (Cmd +) for readability.
- [ ] **Command Ready**: Have `npm start -- --watch --interval 5` ready in history (up arrow).

## 3. Browser Setup
- [ ] **Docsify**: Run `npm run docs:serve` in a separate terminal.
- [ ] **Tabs Open**:
    - [ ] [Docs Home](http://localhost:3000/#/) (Manifesto)
    - [ ] [Docs Architecture](http://localhost:3000/#/01-architecture) (Mermaid Diagram)
    - [ ] [Docs Troubleshooting](http://localhost:3000/#/07-troubleshooting) (Error 51)
    - [ ] [Docs Future Work](http://localhost:3000/#/05-future-work) (Pear)
- [ ] **Window Size**: Set browser to Full Screen or a clean 16:9 aspect ratio.

## 4. VS Code Setup
- [ ] **Files Open**:
    - [ ] `.env` (Hidden or obscured if it contains real secrets, but needed for Scene 5 edit).
    - [ ] *Tip:* Use a dummy `.env` for display if possible, or blur in post.
- [ ] **Theme**: Use a high-contrast theme if possible.

## 5. Scene-Specific Prep
- [ ] **Scene 5 (Withdrawal)**:
    - [ ] Practice the `.env` edit: Stop agent (Ctrl+C) -> Change `MIN_IDLE_BALANCE` to 200 -> Restart.

## 6. Audio/Recording
- [ ] **Microphone**: Check input levels.
- [ ] **Quiet Room**: Minimize background noise.
- [ ] **Screen Recorder**: Set to record system audio (if any) and microphone.
