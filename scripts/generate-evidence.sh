#!/bin/bash
set -e
mkdir -p evidence

EVIDENCE_FILE="evidence/test-output.txt"

echo "===================================================" > "$EVIDENCE_FILE"
echo " SafeSpend AI - Verifiable Deterministic Evidence  " >> "$EVIDENCE_FILE"
echo "===================================================" >> "$EVIDENCE_FILE"
echo "Timestamp: $(date -u +'%Y-%m-%dT%H:%M:%SZ')" >> "$EVIDENCE_FILE"
echo "Commit_SHA: $(git rev-parse HEAD 2>/dev/null || echo 'Unknown')" >> "$EVIDENCE_FILE"
echo "Runtime: wasm32-wasi Native Bound Evaluations" >> "$EVIDENCE_FILE"
echo "---------------------------------------------------" >> "$EVIDENCE_FILE"
echo "" >> "$EVIDENCE_FILE"

# Run tests and capture stdout mapping the specific table-driven tests
cd zeroclaw-plugin
cargo test --test policy_cases -- --nocapture >> "../$EVIDENCE_FILE" 2>&1

echo "" >> "../$EVIDENCE_FILE"
echo "===================================================" >> "../$EVIDENCE_FILE"
echo " END OF MACHINE VALIDATION " >> "../$EVIDENCE_FILE"

echo "Evidence generated successfully at $EVIDENCE_FILE"
