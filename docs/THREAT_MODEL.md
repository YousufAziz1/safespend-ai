# SafeSpend AI - Threat Model 🛡️

## Security Philosophy

The SafeSpend plugin applies deterministic rules evaluating Web3 interaction states. Since the component complies strictly with the ZeroClaw WebAssembly Component Model, it adheres perfectly to capability-based security. 

### Custody Tier: T0
- **No Keystores:** The plugin never requests wallet private keys nor accesses host keychains.
- **Pre-Execution Evaluation:** Evaluates addresses organically without modifying blockchain state autonomously.

---

## 🛑 What Attacks ARE Detected

1. **Self-Transfers (Gas Drainers):**
   - The plugin evaluates the matching signatures preventing users from executing duplicate receiver requests effectively avoiding accidental gas expenditures efficiently natively.
2. **Missing/Malformed Receivers (Blackhole prevention):**
   - Eliminates standard input errors by enforcing bounds on the payload (length constraint >32 chars) avoiding lost funds.
3. **Malicious Zero/Negative Pings (Dusting / Sub-Zero bounds):**
   - Drops arbitrary token transactions that specify non-positive absolute states preventing dust vector pollutions natively safely.
4. **Suspicious Contract Architectures (SPL Length bounds):**
   - By limiting standard token strings organically, arbitrary long hex contracts mimicking assets generate warning signs intelligently natively.

---

## ⚠️ What Attacks are NOT Detected (Current Limitations)

- **Network-Level Phishing (Live Blacklists):** Currently, real-time live polling against GoPlus or Helius is mocked/disconnected owing to synchronous compilation stability bounds under tightly contested WASIp1 compile frameworks. Thus, live network checks against active malicious actors on the current block are excluded natively natively.

### Future Integration with `wasi:http`
To solve the live-polling limits explicitly smoothly moving forward without sacrificing the Zero-Dependency component requirement, transitioning toward full `wasi:http/outgoing-handler` implementations will allow standard network calls without breaking sandbox execution limits statically natively! This transition perfectly meshes with our current structural `RiskAnalysis` endpoints automatically!
