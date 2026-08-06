# SafeSpend AI - Attack Transcript 🚨

This evidence transcript documents native evaluations performed against the `zeroclaw-plugin` WebAssembly Component executed under the ZeroClaw engine architecture constraints. 

---

### Scenario 1: Standard Valid Transaction
*   **Input:** `{ "sender": "5N...1", "recipient": "4q...Z", "amount": 1.5, "token_symbol": "SOL" }`
*   **Rules Triggered:** None.
*   **Result:** `is_safe: true`
*   **Explanation:** The parameters naturally pass standard Base58 thresholds safely.

### Scenario 2: Zero Amount Verification (Dusting)
*   **Input:** `{ "amount": 0 }`
*   **Rules Triggered:** `ERR_ZERO_AMOUNT`
*   **Result:** `is_safe: false`
*   **Explanation:** Negative/Zero executions are generally dusting or null pings wasting execution times securely.

### Scenario 3: Negative Amount (Overflow / Error injection)
*   **Input:** `{ "amount": -10 }`
*   **Rules Triggered:** `ERR_ZERO_AMOUNT`
*   **Result:** `is_safe: false`
*   **Explanation:** Sub-zero evaluations inherently represent malformed payload injection boundaries blocked safely.

### Scenario 4: Missing Payload Recipient
*   **Input:** `{ "sender": "5N...1", "amount": 2.5 }`
*   **Rules Triggered:** `ERR_EMPTY_RECIPIENT`
*   **Result:** `is_safe: false`
*   **Explanation:** Transferring execution strings without destination arrays inherently fails blockchain rules causing gas loss cleanly securely.

### Scenario 5: Identical Sender & Recipient (Self-Transfer)
*   **Input:** `{ "sender": "5N...1", "recipient": "5N...1", "amount": 10 }`
*   **Rules Triggered:** `WARN_SELF_TRANSFER`
*   **Result:** `is_safe: false`
*   **Explanation:** Identical transfer nodes drop execution utility costing transaction fees strictly intercepted.

### Scenario 6: Malformed Base58 (Too Short)
*   **Input:** `{ "recipient": "ABCD123", "amount": 5.0 }`
*   **Rules Triggered:** `ERR_INVALID_BASE58_LENGTH`
*   **Result:** `is_safe: false`
*   **Explanation:** A 7-character address string fails fundamental Solana formatting length constraints blocking malformed payloads.

### Scenario 7: Suspiciously Long Token Symbols
*   **Input:** `{ "recipient": "4q...Z", "amount": 100, "token_symbol": "MALICIOUS_FAKE_STABLECOIN" }`
*   **Rules Triggered:** `WARN_TOKEN_SYMBOL_LONG`
*   **Result:** `is_safe: false`
*   **Explanation:** Extraordinarily long custom characters generally represent phishing/duplicate contract identities mapped cleanly via length bounds.

### Scenario 8: Multiple Rule Breaches 
*   **Input:** `{ "sender": "5N...1", "recipient": "5N...1", "amount": -10 }`
*   **Rules Triggered:** `WARN_SELF_TRANSFER`, `ERR_ZERO_AMOUNT`
*   **Result:** `is_safe: false`
*   **Explanation:** The multi-evaluation protocol successfully flags stacked execution errors aggregating the responses into a single JSON risk analysis!
