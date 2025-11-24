
# **AI Yield Guard: Video Production PRD**

## **Objective**

Demonstrate the "AI Yield Guard" as a **Sovereign Financial Node** that runs autonomously, manages its own keys (WDK), and mints its own identity (ERC-8004).

## **Narrative Arc**

1. **The Hook (0:00-0:45):** "Most agents are tourists. This one is a Sovereign Node." (Show docs/vision).  
2. **The Setup (0:45-1:30):** Show env config and the "Identity Minting" flow.  
3. **The Action (1:30-3:30):** Watch Mode. Show it sensing high balance \-\> Supplying \-\> Sensing low balance \-\> Withdrawing.  
4. **The Resilience (3:30-4:15):** Explain the "Error 51" protection (Robustness).  
5. **The Future (4:15-5:00):** Pear Runtime vision & Outro.

## **Scene-by-Scene Script**

### **Scene 1: The Vision (The Website)**

* **Visual:** Open https://ai-yield-guard-docs.vercel.app/\#/ in Chrome. Full screen.  
* **Action:** Scroll slowly through the "Manifesto" on the home page.  
* **Voiceover:** "Hi, I'm \[Name\]. Tether envisions a world of trillions of autonomous agents. Today, most agents rely on centralized APIs. I built **AI Yield Guard**—a reference implementation of a **Sovereign Financial Node** powered by the Tether WDK."

### **Scene 2: The Architecture (The Diagram)**

* **Visual:** Click "Architecture" in the sidebar. Show the Mermaid diagram.  
* **Action:** Hover over "Wallet Layer" and "Agent Layer".  
* **Voiceover:** "This isn't just a script. It has a modular architecture. The WDK manages keys locally. The Agent Engine makes deterministic decisions. And we interact with Aave V3 directly on-chain."

### **Scene 3: The Cold Start (Identity)**

* **Visual:** Switch to VS Code Terminal. Clear screen (clear).  
* **Action:** Run: npx ai-yield-guard \--watch \--interval 5 (Note: Use 5s interval for video speed\!).  
* **Voiceover:** "Let's spin up a fresh node. Watch closely. The first thing it does is check the ERC-8004 Registry on Base Sepolia. It sees we are anonymous..."  
* **Visual:** Logs show: ⚠️ Agent Identity not found.  
* **Voiceover:** "...and because we are in Autonomous Mode, it self-mints its identity to establish trust."  
* **Visual:** Logs show: ✅ Identity Minted\! Hash: 0x...

### **Scene 4: The Supply Sweep (High Balance)**

* **Pre-condition:** Wallet has \~100 USDT. Aave has 0\.  
* **Visual:** The loop continues.  
* **Voiceover:** "Now the heartbeat kicks in. My wallet has 100 USDT. The idle target is 10 USDT. The agent detects this surplus..."  
* **Visual:** Logs show: Action: SUPPLY. Transaction sent\!.  
* **Voiceover:** "...and automatically sweeps the excess capital into Aave to earn yield. No human intervention."

### **Scene 5: The Withdrawal (Low Balance)**

* **Visual:** (While the agent sleeps) "I will now simulate a spending event by manually sending USDT away using MetaMask." (Or just say "Let's simulate a low balance").  
* **Action:** *Video Edit Trick:* You can just stop the agent, change MIN\_IDLE\_BALANCE in .env to be *higher* than your current balance, and restart.  
* **Voiceover:** "Suddenly, the agent detects my operational funds are low. It calculates the deficit..."  
* **Visual:** Logs show: Action: WITHDRAW. Transaction sent\!.  
* **Voiceover:** "...and liquidates just enough from Aave to keep the node operational."

### **Scene 6: The Resilience (Error 51\)**

* **Visual:** Switch back to Docs \-\> "Troubleshooting".  
* **Voiceover:** "Real DeFi is messy. On testnets, pools often hit Supply Caps (Error 51). My agent checks these caps *off-chain* before every transaction. If the pool is full, it waits. It doesn't crash. It survives."

### **Scene 7: The Future (Pear)**

* **Visual:** Click "Future Work".  
* **Voiceover:** "Today this is Node.js. Tomorrow, we package this on **Pear Runtime** to make it fully P2P and unstoppable. This is the financial backbone for the machine economy. Thank you."