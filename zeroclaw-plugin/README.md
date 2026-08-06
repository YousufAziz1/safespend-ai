# SafeSpend AI - ZeroClaw Integration 🦞

This directory contains the completely autonomous, Rust-based ZeroClaw plugin implementation of our Multi-Provider Security Engine!

Because the ZeroClaw platform enforces strict portability and high-efficiency constraints via the WebAssembly (WASM) Component Model, SafeSpend AI's logic has been fundamentally extracted from our standard Next.js TypeScript orchestrators and transplanted natively into this standalone module.

## 🛠️ Architecture

*   **WASM Component Model:** Built utilizing `cargo-component` exporting explicit functions to the `zeroclaw:plugin/tool` ecosystem.
*   **Zero Dependencies:** The plugin is 100% independent of typical Web3 bloat (such as `solana-sdk` or frontend libraries), compiling down to a highly optimized `wasm32-wasip1` payload that the ZeroClaw core agent can securely sandbox!
*   **Deterministic Security Engine:** Replaces generic LLM hallucinated analysis with a firm Boolean constraint checking mechanism exposing risk boundaries directly to the conversational agents natively.

## 🚀 Building the Plugin

1. Ensure standard Rust toolchains are installed alongside the `cargo-component` wrapper.
   ```bash
   cargo install cargo-component
   ```

2. Compile the local WASM target.
   ```bash
   cargo component build --release
   ```

3. The final Component file is located safely within:
   ```text
   target/wasm32-wasip1/release/zeroclaw_plugin.wasm
   ```

You may seamlessly inject this `.wasm` boundary directly into your standard ZeroClaw agent node configurations evaluating risk dynamics organically!
