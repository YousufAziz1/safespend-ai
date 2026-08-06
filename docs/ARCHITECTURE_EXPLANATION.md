# Architecture Explanation 🏗️

SafeSpend AI's integration into the ZeroClaw agent ecosystem revolves exclusively around the **WebAssembly Component Model (WIT)**. 

### The Security Dilemma
Currently, Web3 agents executing financial parameters rely heavily on dynamic prompt generation (LLMs). This is fundamentally unsafe at the execution boundary (`sendTransaction` layers) due to hallucinations and network drift. The ZeroClaw architecture dictates that tools must be modular, deterministic, and sandboxed.

### SafeSpend AI Architecture 
We extracted our traditional Next.js multi-provider decision matrix (which aggregates Helius, GoPlus, and Birdeye metrics) entirely into a headless Rust `cdylib`.

1. **WIT Bindings (`wit/world.wit`)**
   We map the exact `zeroclaw:plugin/tool` structs natively via `wit_bindgen`. This enforces capability-based security. The ZeroClaw host knows strictly what our plugin accepts (JSON strings containing base58 addresses) and limits our execution purely to returning formatted risk assessments.

2. **Zero-Dependency Engine (`src/lib.rs`)**
   By abandoning monolithic crates like `solana-sdk` or standard asynchronous HTTP polluters temporarily, our plugin evaluates the base58 payloads through a simulated local matrix, extracting deterministic outcomes (`Safe` / `Danger`).

3. **Compiler Outputs (`cargo-component`)**
   We export into the `wasm32-wasip1` target. This output file acts purely as a secure "black-box" rule-chain the host agent queries explicitly before modifying the blockchain statically preventing catastrophic losses dynamically.
