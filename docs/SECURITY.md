# SafeSpend AI - Threat Model & Security Philosophy 🛡️

The SafeSpend plugin applies rules evaluating Web3 interaction states safely. Because the component restricts dependencies to the ZeroClaw WebAssembly Component Model, it adheres to capability-based security ensuring sandboxed analysis.

## Custody Tier Declaration

This agent is configured defensively as a **Devnet Only** system. 

*   **Custody Risk**: The ZeroClaw host loads the `SOLANA_PRIVATE_KEY` stored within the `zeroclaw/.env` configuration. This singular key has full authority to move funds on Devnet.
*   **Compromise Assessment**: If an attacker compromises the underlying server operating system, they can leak the private key. Bypassing the agent costs the entire Devnet wallet balance. The plugin itself is stateless and holds zero custody.
*   **Checkpoint Defense**: To protect the active key from prompt-injection manipulation or hallucination overrides, the `zeroclaw/sop.yml` enforces a `human-review` approval checkpoint whenever the policy engine outputs `RequireApproval`. The transaction cannot proceed without human input, terminating the automated loop safely.

---

## 🛑 Input Validation vs Policy Enforcement

The engine deliberately isolates basic data integrity issues (Validation) from intent-based rule thresholds (Policy Enforcement).

### 1. Input Validation (Integrity Checks)
*These checks prevent malformed payloads. They are not threat detection tools—they verify input correctness.*
*   **ERR_EMPTY_RECIPIENT:** Rejects `null` or whitespace target formats.
*   **ERR_PAYLOAD_TOO_LARGE:** Rejects string byte sizes extending over 44 bytes to prevent OOM errors.
*   **ERR_BASE58_DECODE_FAIL:** Executes `bs58::decode()` verifying accurate alphanumeric framing.
*   **ERR_INVALID_PUBKEY_LENGTH:** Ensures the payload exactly models a 32-byte ed25519 constraint.
*   **ERR_ZERO_AMOUNT:** Enforces amounts are distinctly greater than `0.0`.
*   **ERR_LAMPORT_OVERFLOW:** Prevents amount values scaling over generic integer boundaries.

### 2. Policy Enforcement (Threat Detection)
*These checks evaluate functional state parameters detecting adversarial instructions overriding limits.*
*   **ERR_TX_LIMIT_EXCEEDED:** Halts execution if the transaction surpasses a strict single-transfer maximum.
*   **WARN_DAILY_LIMIT_EXCEEDED:** Pauses the agent, demanding approval for cumulative daily volumes breached.
*   **WARN_VELOCITY_EXCEEDED:** Pauses the agent if rapid sequential transfers are detected indicating automated extraction.
*   **ERR_REPUTATION_DENY:** Hardblocks transfers to explicit known drainer lists explicitly defined in state boundaries.
*   **REQUIRE_APPROVAL_UNKNOWN:** The default standard response escalating un-whitelisted targets to a manual human approval `checkpoint`.

---

## ⚠️ Known Limitations

This plugin contains the following architectural boundaries.

1.  **No Live Oracle Aggregations:** This runtime is entirely deterministic and stateless. Because we excluded live HTTP polling inside the `wasm32-wasip2` sandbox to ensure offline constraints, the plugin cannot query external APIs (GoPlus, Helius) mid-execution. It depends on state policies injected directly into the JSON argument by the host agent.
2.  **No Protection Against Malicious Approval:** If the `human-review` checkpoint is approved by a compromised administrator, the devnet funds will move unconditionally.
3.  **No Mainnet Integrity Assurances:** The components restrict connections to Devnet strictly. There are zero audited assurances protecting equivalent Mainnet evaluations securely.
