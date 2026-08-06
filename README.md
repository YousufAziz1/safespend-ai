<div align="center">

# 🦞 SafeSpend AI — ZeroClaw Security Plugin

**WebAssembly Security policies for Solana Transactors**

<p>
  <i>Validate. Protect. Execute.</i>
</p>

<p>
  A lightweight, stateless Rust <code>wasm32-wasip2</code> plugin intercepting ZeroClaw agent transactions to enforce strict rule matrices before wallet signatures occur.
</p>

<br />![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)![WebAssembly](https://img.shields.io/badge/WebAssembly-654FF0?style=for-the-badge&logo=webassembly&logoColor=white)![Solana](https://img.shields.io/badge/Solana-14F195?style=for-the-badge&logo=solana&logoColor=white)![ZeroClaw](https://img.shields.io/badge/ZeroClaw-Orange?style=for-the-badge)
[![CI Pipeline](https://img.shields.io/github/actions/workflow/status/YousufAziz1/safespend-ai/ci.yml?branch=master&style=for-the-badge)](https://github.com/YousufAziz1/safespend-ai/actions)

<br />

### 🔗 Quick Links

[**GitHub Repository**](https://github.com/YousufAziz1/safespend-ai) •
[**Threat Model & Security**](docs/SECURITY.md) •
[**Plugin Architecture**](docs/ARCHITECTURE.md)

</div>

---

## 5-Step Quickstart

You can deploy this agent locally in five minutes across macOS, Linux, and Windows (Git Bash).

**1. Clone and compile the WASM plugin**
```bash
git clone https://github.com/YousufAziz1/safespend-ai.git
cd safespend-ai/zeroclaw-plugin
cargo build --target wasm32-wasip2 --release
```

**2. Configure your Devnet environment**
```bash
cd ../zeroclaw
cp .env.example .env
```
Open `.env` and insert a throwaway Solana Devnet private key for `SOLANA_PRIVATE_KEY` and a string for `ZEROCLAW_WEBHOOK_SECRET`. **Do not use Mainnet credentials.**

**3. Run the ZeroClaw agent gateway**
*(Requires `zeroclaw` CLI installed on your system)*
```bash
zeroclaw run --config agent.yml --sops sop.yml
```

**4. Trigger a transfer request**
In a separate terminal, trigger the webhook channel listening on port 42617:
```bash
curl -X POST http://localhost:42617/webhook/transfer \
  -H "Authorization: Bearer your_webhook_secret_here" \
  -H "Content-Type: application/json" \
  -d '{"message": "Send 5 SOL to DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"}'
```

**5. Observe the human checkpoint**
If the request requires approval (e.g. unknown recipient), the agent halts at a `human-review` checkpoint. Approval processes the Devnet transaction and returns an explorer link.

---

## 🛡️ Custody Tier Declaration

This agent operates strictly on **Devnet Only**. 

*   **Custody Tier**: The ZeroClaw engine holds the devnet `SOLANA_PRIVATE_KEY` initialized in the `.env` file. This specific key executes target transactions and moves funds.
*   **Compromise Assessment**: If the agent's host server is compromised, the attacker can extract the `SOLANA_PRIVATE_KEY`. A compromise costs exactly the balance of the devnet wallet.
*   **Checkpoint Defense**: The `human-review` checkpoint defined in `sop.yml` halts automated workflows before reaching the Solana block submission phase. If a prompt injection attempts to force a zero-shot transaction, the agent suspends execution requiring explicit external approval before utilizing the key.

---

## 🏗️ Claims Mapping Table

The functional capabilities of this plugin are verified mapped directly to source code evaluations:

| Claim | Source File | Function Implementation |
|---|---|---|
| **Input Validation** | `zeroclaw-plugin/src/lib.rs` | `execute` (Bytes size bounding) |
| **Address Decoding** | `zeroclaw-plugin/src/lib.rs` | `validate_solana_address` (Base58 resolution) |
| **Self-Transfer Checks** | `zeroclaw-plugin/src/lib.rs` | `evaluate_policy` (Sender matches Recipient logic) |
| **Spending Limits** | `zeroclaw-plugin/src/lib.rs` | `evaluate_policy` (Tx and Daily bound logic) |
| **Verdict Construction** | `zeroclaw-plugin/src/lib.rs` | `Verdict::{Allow, RequireApproval, Deny}` |
| **Human Approval Checkpoint** | `zeroclaw/sop.yml` | `require_approval` action in `switch` condition |

*(Any unsupported features involving live oracle aggregation were removed to ensure transparency).*

---

## 📂 Project Structure

```text
safespend-ai/
├── zeroclaw/             # ZeroClaw Agent YAML Configurations & SOPs
├── zeroclaw-plugin/      # Primary Rust WebAssembly Security Plugin
├── docs/                 # Documentation (ARCHITECTURE.md, SECURITY.md)
└── app/                  # Webhook Integration UI
```

---

## 🤝 Contributors
Built by **Yousuf Aziz**.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
