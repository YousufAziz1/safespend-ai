<div align="center">

# 🦞 SafeSpend AI — ZeroClaw Security Plugin

**Deterministic WebAssembly Security boundaries for Solana Transactors**

<p>
  <i>Validate. Protect. Execute.</i>
</p>

<p>
  A lightweight, stateless Rust <code>wasm32-wasip1</code> plugin intercepting native ZeroClaw agent transactions enforcing hard deterministic rule matrices seamlessly before wallet signatures are queried.
</p>

<br />

![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white) 
![WebAssembly](https://img.shields.io/badge/WebAssembly-654FF0?style=for-the-badge&logo=webassembly&logoColor=white) 
![Solana](https://img.shields.io/badge/Solana-14F195?style=for-the-badge&logo=solana&logoColor=white) 
![ZeroClaw](https://img.shields.io/badge/ZeroClaw-Orange?style=for-the-badge)

<br />

### 🔗 Quick Links

[**GitHub Repository**](https://github.com/YousufAziz1/safespend-ai) •
[**Threat Model**](docs/THREAT_MODEL.md) •
[**Attack Transcript Evidence**](evidence/ATTACK_TRANSCRIPT.md) •
[**Optional Demo Viz**](https://safespend-ai.vercel.app/demo)

</div>

---

## 🛡️ Security Model
- **Custody Tier: T0**
- **No Keystore Limits:** The plugin NEVER stores, touches, or requests native private keys natively. 
- **Human Authority:** The agent simply evaluates and suggests; the human always signs transactions.
- **Deterministic Pre-Execution:** Operates entirely autonomously processing structural parameters avoiding LLM hallucination overrides dynamically natively.

---

## 🏗️ The ZeroClaw Component Model

SafeSpend AI is built first and foremost as a standard **ZeroClaw `tool` Plugin**. 
It guarantees **zero `solana-sdk` dependency bloat**, exporting exact `wit` bindings evaluating `base58` destination arrays reliably within the host `wasm32-wasip1` sandbox execution. 

### Implemented Native Checks

| Rule ID | Check | Severity | Deterministic Logic |
|---|---|---|---|
| `ERR_EMPTY_RECIPIENT` | Missing Recipient | **Critical** | Rejects `null` or whitespace-only destination targets. |
| `ERR_INVALID_BASE58_LENGTH` | Address Length | **Critical** | Triggers if string length is strictly outside Solana Base58 standards (`< 32` or `> 44`). |
| `WARN_SELF_TRANSFER` | Duplicate Recipient | **Warning** | Flags execution if the `sender` and `recipient` addresses correlate identically statically natively. |
| `ERR_ZERO_AMOUNT` | Invalid Amount | **Critical** | Evaluates boundaries to ensure token values are expressly positive scalars securely (`> 0.0`). |
| `WARN_TOKEN_SYMBOL_LONG` | Invalid Token Symbol | **Warning** | Restricts standard `spl` symbols to conventional lengths rejecting unreadable arbitrary tokens natively (`> 10` chars). |

---

## 📂 Project Structure

```text
safespend-ai/
├── zeroclaw-plugin/      # 🦞 Primary Project: ZeroClaw Rust/WASM Security Plugin
│   ├── src/lib.rs        # Core deterministic logic engine
│   └── wit/world.wit     # Explicit ZeroClaw trait interfaces
├── docs/                 # Documentation (Threat Models, Architecture, Judge FAQs)
├── evidence/             # Attack transcripts and test case executions
└── app/                  # 🌐 Optional Next.js Dashboard Visualizer 
```

---

## 🖼️ Optional Dashboard Visualizer

While the core project resides in the `/zeroclaw-plugin` backend, this repository natively includes a full **Next.js/React** web dashboard serving strictly as an optional visual front-end simulation allowing judges to test scenarios rapidly organically.

<div align="center">
  <img src="docs/screenshots/demo.gif" alt="Animated Demo GIF" width="85%">
</div>

*(Full Demo Video Link: <b>Coming Soon</b>)*

---

## 🚀 Installation & Setup (ZeroClaw Plugin)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YousufAziz1/safespend-ai.git
   cd safespend-ai/zeroclaw-plugin
   ```

2. **Install Rust and the Component compiler:**
   ```bash
   cargo install cargo-component
   ```

3. **Build the WASM payload natively:**
   ```bash
   cargo component build --release
   ```

4. **Run Native Logic Fuzzers & Tests:**
   ```bash
   cargo test
   ```

---

## 🤝 Contributors
Built computationally mapping ZeroClaw standards explicitly by **Yousuf Aziz**.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
