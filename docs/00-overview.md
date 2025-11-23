# The Manifesto: Financial Sovereignty for the Machine Economy

> "We imagine a world where humans, autonomous machines, and AI Agents have the freedom to control their own finances." — Paolo Ardoino

## The Problem: Fragile Agents
Most AI agents today are "financial tourists." They rely on custodial wallets, API keys, and centralized servers. If the server goes down or the API key is revoked, the agent dies. They are not sovereign; they are tethered.

## The Solution: Local-First Financial Nodes
The **AI Yield Guard** is a reference implementation of a **Sovereign Financial Node**. Powered by the **WDK (Wallet Development Kit)**, it runs where you run—on a laptop, a Raspberry Pi, or a server—retaining full sovereignty over its funds.

This agent does not ask for permission. It:
1.  **Holds its own keys** (Self-Custody via WDK).
2.  **Mints its own identity** (ERC-8004 Registration).
3.  **Optimizes its own capital** (Autonomous Aave V3 Yield Farming).

## Why WDK?
The WDK provides the critical "Financial Layer" for the AI stack. Unlike complex MPC solutions which are overkill for single-agent bots, WDK offers:
*   **Simplicity**: Direct BIP-39 seed phrase management.
*   **Control**: Full access to signing capabilities without external dependencies.
*   **Portability**: Runs anywhere Node.js runs.

This project demonstrates how to build an unstoppable financial agent today.
