# 🛡️ SafeSpend AI: Verifiable Plugin Evidence

This directory contains the machine-generated, strictly reproducible stdout capturing the runtime behavior of the ZeroClaw Security Plugin. 

**No terminal outputs in this repository are hand-written, mocked, or created by AI agents as text substitutions.**  
Every line within `test-output.txt` is an exact extraction executing the strict rules mapped inside `zeroclaw-plugin/tests/policy_cases.rs`.

## 🔄 How to Regenerate Evidence

The target artifacts can be robustly regenerated to ensure no manual modifications drift from physical capabilities. Run this from the repository root:

```bash
bash scripts/generate-evidence.sh
```

Any discrepancy between origin execution paths and `test-output.txt` invalidates local signatures inherently.
