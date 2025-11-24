# AI Yield Guard: Video Script

**Target Duration:** ~3-4 Minutes
**Theme:** Sovereign Financial Node (Autonomous, Self-Custodial, Resilient)

---

## **Narrative Arc**

1.  **The Hook (0:00-0:45):** "Most agents are tourists. This one is a Sovereign Node."
2.  **The Setup (0:45-1:30):** Environment config and "Identity Minting" (ERC-8004).
3.  **The Action (1:30-3:30):** Watch Mode loop. Sensing high balance -> Supplying -> Sensing low balance -> Withdrawing.
4.  **The Resilience (3:30-4:15):** "Error 51" protection (Robustness).
5.  **The Future (4:15-5:00):** Pear Runtime vision & Outro.

---

## **Scene-by-Scene Script**

### **Scene 1: The Vision (The Website)**
**Time:** 0:00 - 0:45

*   **Visual:**
    *   Open [AI Yield Guard Docs](https://ai-yield-guard-docs.vercel.app/#/) in Chrome.
    *   Set to Full Screen.
    *   Scroll slowly through the "Manifesto" section on the home page.
*   **Voiceover:**
    > "Hi, I'm [Name]. Tether envisions a world of trillions of autonomous agents. Today, most agents rely on centralized APIs and hosted wallets. I built **AI Yield Guard**—a reference implementation of a **Sovereign Financial Node** powered by the Tether WDK."

### **Scene 2: The Architecture (The Diagram)**
**Time:** 0:45 - 1:10

*   **Visual:**
    *   Click "Architecture" in the sidebar of the docs.
    *   Show the Mermaid diagram.
    *   Mouse hover over "Wallet Layer" and then "Agent Layer".
*   **Voiceover:**
    > "This isn't just a script. It has a modular architecture. The WDK manages keys locally. The Agent Engine makes deterministic decisions based on market data. And we interact with Aave V3 directly on-chain—no middlemen."

### **Scene 3: The Cold Start (Identity)**
**Time:** 1:10 - 1:50

*   **Visual:**
    *   Switch to VS Code Terminal.
    *   Run `clear` to clean the screen.
    *   Run: `npm start -- --watch --interval 5`
    *   *(Note: Using 5s interval for faster video pacing)*
*   **Voiceover:**
    > "Let's spin up a fresh node. Watch closely. The first thing it does is check the ERC-8004 Registry on Base Sepolia. It sees we are anonymous..."
*   **Visual:**
    *   *Highlight Log:* `⚠️ Agent Identity not found.`
*   **Voiceover:**
    > "...and because we are in Autonomous Mode, it self-mints its identity to establish trust on-chain."
*   **Visual:**
    *   *Highlight Log:* `✅ Identity Minted! Hash: 0x...`

### **Scene 4: The Supply Sweep (High Balance)**
**Time:** 1:50 - 2:40

*   **Pre-condition:** Wallet has ~20 USDT. Aave has 0.
*   **Visual:**
    *   The agent loop continues running.
*   **Voiceover:**
    > "Now the heartbeat kicks in. My wallet has 20 USDT. The idle target is set to 5 USDT. The agent detects this surplus..."
*   **Visual:**
    *   *Highlight Log:* `Action: SUPPLY. Transaction sent!`
*   **Voiceover:**
    > "...and automatically sweeps the excess capital into Aave to earn yield. No human intervention required."

### **Scene 5: The Withdrawal (Low Balance)**
**Time:** 2:40 - 3:30

*   **Visual:**
    *   *(While the agent sleeps)*
    *   "I will now simulate a spending event."
    *   *Edit Trick:* Stop the agent, change `MIN_IDLE_BALANCE` in `.env` to be *higher* than your current balance (e.g., set to 200 USDT), and restart.
*   **Voiceover:**
    > "Suddenly, the agent detects my operational funds are low. Maybe I paid for gas or a service. It calculates the deficit..."
*   **Visual:**
    *   *Highlight Log:* `Action: WITHDRAW. Transaction sent!`
*   **Voiceover:**
    > "...and liquidates just enough from Aave to keep the node operational."

### **Scene 6: The Resilience (Error 51)**
**Time:** 3:30 - 4:15

*   **Visual:**
    *   Switch back to Docs -> "Troubleshooting".
*   **Voiceover:**
    > "Real DeFi is messy. On testnets, pools often hit Supply Caps—known as Error 51. My agent checks these caps *off-chain* before every transaction. If the pool is full, it waits. It doesn't crash. It survives."

### **Scene 7: The Future (Pear)**
**Time:** 4:15 - 5:00

*   **Visual:**
    *   Click "Future Work" in the docs.
*   **Voiceover:**
    > "Today this is a Node.js CLI. Tomorrow, we package this on **Pear Runtime** to make it fully P2P and unstoppable. This is the financial backbone for the machine economy. Thank you."
