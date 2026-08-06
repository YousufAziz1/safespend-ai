# SafeSpend AI Architecture 🏗️

This document outlines the strict workflows mapping intent pipelines through complex multi-provider security engines reliably.

## 1. Top-Level Ecosystem Architecture
```mermaid
graph TD
    User([End User]) --> |Web Interface| Copilot(AI Copilot UI)
    User --> |Direct Send| Composer(Native Composer)
    
    Copilot --> Intent[Intent Parser]
    Intent --> Memory[Contact Memory resolving base58]
    Memory --> Policy[Policy Engine Validations]
    
    Composer --> Policy
    
    Policy --> SecEngine[Security Orchestrator]
    
    SecEngine --> |RPC Check| Helius[Helius Engine]
    SecEngine --> |REST Check| GoPlus[GoPlus Blacklists]
    SecEngine --> |GraphQL| Birdeye[Birdeye Token API]
    
    Helius --> SecAggregator(Risk Aggregator)
    GoPlus --> SecAggregator
    Birdeye --> SecAggregator
    
    SecAggregator --> |Threat Found| Explainer[Explainability Engine]
    Explainer --> Copilot
    
    SecAggregator --> |Approved| Simulator[Web3 Simulator]
    
    Simulator --> |Success| Phantom[Wallet Signature]
    Simulator --> |Fail| Explainer
    
    Phantom --> Ledger[(Local Ledger)]
    Ledger --> Analytics[Analytics Dashboard]
```

## 2. Complete Transaction Lifecycle (System Flow)
```mermaid
sequenceDiagram
    participant U as User
    participant CP as Copilot
    participant Engine as Security Engine
    participant API as External Providers (Helius/GoPlus)
    participant Sim as Web3 Sandbox
    participant Wallet as Phantom/Solana
    
    U->>CP: "Send 2 SOL to John"
    CP-->>CP: Parse Intent [Amount: 2, Token: SOL, Name: John]
    CP-->>CP: Resolve Alias to Address
    CP-->>CP: Check Payment Policy/Limits
    
    alt Policy Violated
        CP->>U: Block Execution (Limits Exceeded)
    else Policy Valid
        CP->>Engine: triggerSecurityAnalysis()
        Engine->>API: Aggregate Provider Data Globally
        API-->>Engine: Return Health Payloads
        Engine-->>CP: Return `SecurityAnalysis` struct
        
        alt Threat Found (Reject)
            CP->>U: Auto-block & Display Transparent Reasoning
        else Safe (Approve)
            CP->>Sim: simulateTransaction()
            Sim-->>CP: Instruction Result
            
            alt Compute Failed
                CP->>U: Block Execution (Revert Detected)
            else Success
                CP->>Wallet: Request Signature
                Wallet-->>CP: txSignature
                CP->>U: Transaction Complete
            end
        end
    end
```
