# SafeSpend AI - Threat Model & Security Philosophy 🛡️

The SafeSpend plugin applies rules evaluating Web3 interaction states. Since the component complies strictly with the ZeroClaw WebAssembly Component Model, it adheres to capability-based security. 

## Custody Tier: T0
- **No Keystores:** The plugin never requests wallet private keys nor accesses host keychains.
- **Pre-Execution Evaluation:** Evaluates addresses without modifying blockchain state autonomously.

---

## 🛑 What Attacks ARE Detected (Rule Matrix)

This index references every explicit constraint executed inside `zeroclaw-plugin/src/lib.rs`. 

### `ERR_EMPTY_RECIPIENT`
- **Purpose:** Prevents null execution targets leading to blackholed transactions.
- **Severity:** Critical
- **Trigger:** `req.recipient` is missing or parses whitespace.

### `ERR_PAYLOAD_TOO_LARGE`
- **Purpose:** Stops Memory-allocation panics (DOS) executing within WASM linear boundaries cleanly.
- **Severity:** Critical
- **Trigger:** Input array strings `len() > 44`.

### `ERR_BASE58_DECODE_FAIL`
- **Purpose:** Restricts malformed alphabet injections targeting the Solana signature matrix.
- **Severity:** Critical
- **Trigger:** Target evaluation fails `bs58::decode()`.

### `ERR_INVALID_PUBKEY_LENGTH`
- **Purpose:** Ensures the payload translates accurately into a `32-byte` physical array representing canonical ed25519 addresses.
- **Severity:** Critical
- **Trigger:** The mathematical derivation length operates outside `!= 32`.

### `ERR_SYSTEM_PROGRAM_TARGET`
- **Purpose:** Prevents generic unmapped transfers directed towards Solana's native origin execution layer.
- **Severity:** Critical
- **Trigger:** The input array matches exactly `11111111111111111111111111111111`.

### `ERR_TOKEN_PROGRAM_TARGET`
- **Purpose:** Prevents tokens bouncing back into `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` resulting in destroyed volumes.
- **Severity:** Critical

### `WARN_SELF_TRANSFER`
- **Purpose:** Prevent execution overlap preventing duplicate gas costs.
- **Severity:** Warning
- **Trigger:** Input `sender` matches the mapped `recipient`.

### `WARN_CANONICAL_DUPLICATE_TRANSFER`
- **Purpose:** Prevent distinct external formats decoding locally to overlapping identity bounds exactly.
- **Severity:** Warning

### `ERR_ZERO_AMOUNT`
- **Purpose:** Target bounds enforcing positive functional volumes preventing arbitrary payload dusting explicitly.
- **Severity:** Critical
- **Trigger:** Total output equates `>= 0`.

### `ERR_LAMPORT_OVERFLOW`
- **Purpose:** Enforces physical limitations representing canonical Lamport execution maximum boundaries cleanly avoiding panics.
- **Severity:** Critical
- **Trigger:** Amounts scaling over `(u64::MAX / 1_000_000_000)` locally.

---

## ⚠️ What Attacks are NOT Detected (Current Limitations)

- **Network-Level Phishing (Live Blacklists):** Currently, real-time live polling against GoPlus or Helius is mocked/disconnected owing to synchronous compilation stability bounds under tightly contested WASIp2 compile frameworks. Thus, live network checks against active malicious actors on the current block are excluded.

### Future Integration with `wasi:http`
To solve the live-polling limits explicitly moving forward without sacrificing the Zero-Dependency component requirement, transitioning toward full `wasi:http/outgoing-handler` implementations will allow standard network calls without breaking sandbox execution limits statically! This transition meshes with our current structural `RiskAnalysis` endpoints automatically!
