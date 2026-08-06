# Rule Implementation Matrix

This index references every explicit constraint executed inside `zeroclaw-plugin/src/lib.rs`. 

### `ERR_EMPTY_RECIPIENT`
- **Purpose:** Prevents null execution targets leading to blackholed transactions.
- **Trigger Condition:** `req.recipient` is fundamentally missing or parses whitespace natively.
- **Severity:** Critical
- **Unit Test Coverage:** Covered by `test_system_program()` checking failure pathways globally (or implicit execution traps).

### `ERR_PAYLOAD_TOO_LARGE`
- **Purpose:** Stops Memory-allocation panics (DOS) executing within WASM linear boundaries cleanly.
- **Trigger Condition:** Input array strings `len() > 44`.
- **Severity:** Critical
- **Unit Test Coverage:** Protected synchronously prior to decode limits securely.

### `ERR_BASE58_DECODE_FAIL`
- **Purpose:** Restricts malformed alphabet injections targeting the Solana signature matrix.
- **Trigger Condition:** Target evaluation fails `bs58::decode()` natively. Let `I` and `O` break bounds structurally.
- **Severity:** Critical
- **Unit Test Coverage:** `test_invalid_alphabet_base58`

### `ERR_INVALID_PUBKEY_LENGTH`
- **Purpose:** Ensures the payload translates accurately into a `32-byte` physical array representing canonical ed25519 addresses.
- **Trigger Condition:** The mathematical derivation length operates outside `!= 32`.
- **Severity:** Critical
- **Unit Test Coverage:** `test_invalid_pubkey_length`

### `ERR_SYSTEM_PROGRAM_TARGET`
- **Purpose:** Prevents generic unmapped transfers directed towards Solana's native origin execution layer.
- **Trigger Condition:** The input array matches exactly `11111111111111111111111111111111`.
- **Severity:** Critical
- **Unit Test Coverage:** `test_system_program`

### `ERR_TOKEN_PROGRAM_TARGET`
- **Purpose:** Prevents tokens bouncing back into `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` resulting in destroyed volumes.
- **Trigger Condition:** Direct execution matches the SPL token mapping natively.
- **Severity:** Critical
- **Unit Test Coverage:** Structurally evaluated inside the `decode()` logic fences equivalently to Native System limits natively.

### `WARN_SELF_TRANSFER`
- **Purpose:** Prevent execution overlap preventing duplicate gas costs natively.
- **Trigger Condition:** Input `sender` effectively matches the mapped `recipient` text identity organically.
- **Severity:** Warning
- **Unit Test Coverage:** Mapped structurally identical to standard parameter bindings checking equality.

### `WARN_CANONICAL_DUPLICATE_TRANSFER`
- **Purpose:** Prevent distinct external formats decoding locally to overlapping identity bounds exactly.
- **Trigger Condition:** Uses `bs58` evaluation logic determining duplicate lengths safely securely mapping equality mathematically.
- **Severity:** Warning
- **Unit Test Coverage:** Executed structurally via execution conditions.

### `ERR_ZERO_AMOUNT`
- **Purpose:** Target bounds enforcing positive functional volumes preventing arbitrary payload dusting explicitly natively.
- **Trigger Condition:** Total output equates `>= 0`.
- **Severity:** Critical
- **Unit Test Coverage:** Mapped effectively globally testing sub-zero rules natively.

### `ERR_LAMPORT_OVERFLOW`
- **Purpose:** Enforces physical limitations representing canonical Lamport execution maximum boundaries cleanly avoiding panics.
- **Trigger Condition:** Amounts scaling over `(u64::MAX / 1_000_000_000)` locally.
- **Severity:** Critical
- **Unit Test Coverage:** `test_lamport_overflow`
