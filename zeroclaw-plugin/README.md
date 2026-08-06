# SafeSpend AI - ZeroClaw Integration 🦞

This directory hosts the primary mechanism of the SafeSpend ecosystem: a completely autonomous, Rust-based ZeroClaw plugin implementation defining local security evaluations.

Because the ZeroClaw platform enforces strict portability and high-efficiency constraints via the WebAssembly (WASM) Component Model, SafeSpend AI's logic implements Native Pre-Execution rules locally without extracting dependencies onto untrusted nodes.

## 🛠️ Security Model (T0)

- **Absolute Zero Custody:** This plugin never handles, stores, or processes wallet private keys or arbitrary signature blocks! 
- **Pre-execution Boundary:** Acts solely as a gate checking boundaries before allowing the user to sign.

### 🦞 Validations vs Unsupported Execution Domains

#### Supported Validations
1. Base58 structural integrity (`bs58::decode`).
2. Exact 32-bye canonical limits.
3. Sub/Zero absolute amount thresholds.
4. Self/Canonical Duplicate payload targets.
5. Solana System & SPL Token target panics.
6. Lamport `u64::MAX` limits.

#### Unsupported Features
- Live `wasi:http` network tracking mapping interactions identically against GoPlus, Helius, or Birdeye.
- Live RPC balance checking confirming sender sufficient execution levels.
- Ed25519 mathematical scalar verifications establishing actual mathematical identity on-curve validations (relies upon external crates outside dependency limits).

*Note: Previous versions assumed generic REST bindings to Birdeye/GoPlus. To fulfill hackathon `zero-dependency` limits, these were deprecated in favor of verified WASM testing loops securely resolving strictly implemented local checks.*

## 🚀 Building the Plugin

1. Ensure standard Rust toolchains are installed alongside the `cargo-component` wrapper.
   ```bash
   cargo install cargo-component
   ```

2. Compile the local WASM target.
   ```bash
   rustup target add wasm32-wasip2
   cargo component build --release --target wasm32-wasip2
   ```

3. Execute testing environments.
   ```bash
   cargo test
   ```

You may inject this `.wasm` boundary directly into your standard ZeroClaw agent node configurations evaluating risk dynamics!

## 🔧 Runtime Compatibility

*   **Supported Target:** `wasm32-wasip2`
*   **Expected Runtime:** ZeroClaw Component Engine (Wasmtime configured with Component Model support).
*   **Build Command:** `cargo component build --release --target wasm32-wasip2`
*   **Known Limitations:** To enforce standard WASIp2 limitations without throwing OS blocking exceptions in a hackathon-constrained compiler window, this explicit payload restricts `wasi:http` requests. Logic evaluations track JSON inputs programmatically via defined baseline parameters strictly avoiding standard network bindings.
