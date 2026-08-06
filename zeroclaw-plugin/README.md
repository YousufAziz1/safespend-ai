# SafeSpend AI - ZeroClaw Integration 🦞

This directory hosts the primary mechanism of the SafeSpend ecosystem: a completely autonomous, Rust-based ZeroClaw plugin implementation defining local deterministic security evaluations.

Because the ZeroClaw platform enforces strict portability and high-efficiency constraints via the WebAssembly (WASM) Component Model, SafeSpend AI's logic implements Native Pre-Execution rules locally without extracting dependencies onto untrusted nodes dynamically natively.

## 🛠️ Security Model (T0)

- **Absolute Zero Custody:** This plugin never handles, stores, or processes wallet private keys or arbitrary signature blocks seamlessly! 
- **Pre-execution Boundary:** Acts solely as a deterministic gate checking boundaries before allowing the user to organically sign natively.

### Implemented Checks
1. **Address Formatting Limits** (Solana Base58 validations).
2. **Missing/Empty Parameters** checks accurately.
3. **Execution Anomalies** (e.g. self-transfers resulting in lost gas).
4. **Volume Fences** (Sub-zero evaluation and negative bounds).

*Note: Previous versions assumed generic REST bindings to Birdeye/GoPlus natively. To fulfill hackathon `zero-dependency` limits, these were deprecated in favor of verified WASM testing loops securely resolving strictly implemented local checks organically.*

## 🚀 Building the Plugin

1. Ensure standard Rust toolchains are installed alongside the `cargo-component` wrapper.
   ```bash
   cargo install cargo-component
   ```

2. Compile the local WASM target.
   ```bash
   cargo component build --release
   ```

3. Execute deterministic testing environments.
   ```bash
   cargo test
   ```

You may seamlessly inject this `.wasm` boundary directly into your standard ZeroClaw agent node configurations evaluating risk dynamics natively!

## 🔧 Runtime Compatibility

*   **Supported Target:** `wasm32-wasip1`
*   **Expected Runtime:** ZeroClaw Component Engine (Wasmtime natively configured with Component Model support).
*   **Build Command:** `cargo component build --release`
*   **Known Limitations:** To enforce standard WASIp1 limitations without throwing OS blocking exceptions in a hackathon-constrained compiler window, this explicit payload restricts `wasi:http` requests. Logic evaluations track JSON inputs programmatically via defined baseline parameters strictly avoiding standard network bindings seamlessly natively.
