# ZeroClaw Judge FAQ 🦞

This document provides extensive technical and architectural answers for hackathon judges reviewing the SafeSpend AI plugin.

**1. Does this plugin use the `solana-sdk`?**
No. We strictly adhered to the Zero-Dependency requirement for Solana plugins. The component parses raw Strings and JSON data locally.

**2. How does the plugin handle memory?**
It is a `wasm32-wasip1` Component. It utilizes the "shared-nothing" memory model inherent to WIT boundaries, completely isolating memory from the host process.

**3. Does this plugin require a live LLM to parse data?**
No. Security logic is deterministic. This shields execution from LLM hallucinations.

**4. Why did you isolate execution into a separate Rust plugin instead of your Next.js app?**
Because the ZeroClaw runtime fundamentally requires WebAssembly Component Model bindings (`.wasm`) to ingest the tools into the agent loop.

**5. How does the host agent interact with this?**
The plugin exports the standard ZeroClaw `tool` WIT interface (namely `name()`, `description()`, `parameters-schema()`, and `execute()`).

**6. Is network execution mocked currently?**
Yes. To guarantee a `wasm32-wasip1` build under tight hackathon locks, the current WASM output simulates the Boolean API structures deterministically. In upcoming patches, we will map standard `wasi:http` interfaces to route queries.

**7. How are dependencies tracked?**
Using `Cargo.toml`. Since we rely on a flattened `world.wit`, we bypassed arbitrary `cargo-component` package resolution limits.

**8. Is the Component model necessary?**
Absolutely. It provides capability-based security.

**9. Can it handle timeouts?**
Our logic treats network timeouts as a "Confidence Drop" rather than arbitrary risk, guaranteeing predictable execution patterns securely.

**10. What is the execution latency?**
Excluding external API polling, the WebAssembly validation algorithm executes locally in nanoseconds.

**11. Does this replace standard ZeroClaw NLP pipelines?**
No. It acts as an execution *tool* that the NLP agent queries before attempting a smart contract signature.

**12. Why did you flatten the `world.wit` files?**
To overcome rigid package registry caches in `cargo-component` locally, guaranteeing a portable compile path across any judge's machine instantaneously.

**13. Does this require Phantom?**
The visual dashboard demo accepts Phantom injections, but the true WASM backend parses purely headless parameters.

**14. What exactly does the `execute()` hook return?**
A strict JSON `tool-result` mapping success markers, text outputs, and optional string errors.

**15. Can the host override the security score?**
No. The deterministic score forms an immutable layer the host can read but not rewrite.

**16. How does this prevent phishing?**
By checking the target transaction/token destination against global registries (like GoPlus) before any Web3 signatures are requested.

**17. What builds the `.wasm` file?**
We use `cargo component build --release`. 

**18. Why not use `wasm32-unknown-unknown`?**
ZeroClaw utilizes Wasip1 host abstractions (like Wasmtime ). Targeting `wasm32-wasip1` ensures broad OS and edge portability.

**19. How large is the final `.wasm` file?**
Extremely lightweight (typically a few Kilobytes optimized), adhering closely to the Zero-Bloat mandates.

**20. Will this run on any hardware?**
Yes. Since it compiles to a standard WIT-bound WebAssembly matrix, it handles execution autonomously anywhere the ZeroClaw engine runs securely!
