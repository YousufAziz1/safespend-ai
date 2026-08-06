# SafeSpend AI - Threat Model 🛡️

## Security Philosophy

The SafeSpend plugin applies deterministic rules evaluating Web3 interaction states. Since the component complies strictly with the ZeroClaw WebAssembly Component Model, it adheres to capability-based security. 

### Custody Tier: T0
- **No Keystores:** The plugin never requests wallet private keys nor accesses host keychains.
- **Pre-Execution Evaluation:** Evaluates addresses without modifying blockchain state autonomously.

---

## 🛑 What Attacks ARE Detected

1. **Self-Transfers (Gas Drainers):**
   - The plugin evaluates the matching signatures preventing users from executing duplicate receiver requests effectively avoiding accidental gas expenditures efficiently.
2. **Missing/Malformed Receivers (Blackhole prevention):**
   - Eliminates standard input errors by enforcing strict Base58 mathematical derivations translating to exact 32-byte arrays exclusively.
3. **Malicious Zero/Negative Pings (Dusting / Sub-Zero bounds):**
   - Drops arbitrary token transactions that specify non-positive absolute states preventing dust vector pollutions safely.

---

## ⚠️ What Attacks are NOT Detected (Current Limitations)

- **Network-Level Phishing (Live Blacklists):** Currently, real-time live polling against GoPlus or Helius is mocked/disconnected owing to synchronous compilation stability bounds under tightly contested WASIp2 compile frameworks. Thus, live network checks against active malicious actors on the current block are excluded.

### Future Integration with `wasi:http`
To solve the live-polling limits explicitly moving forward without sacrificing the Zero-Dependency component requirement, transitioning toward full `wasi:http/outgoing-handler` implementations will allow standard network calls without breaking sandbox execution limits statically! This transition meshes with our current structural `RiskAnalysis` endpoints automatically!
