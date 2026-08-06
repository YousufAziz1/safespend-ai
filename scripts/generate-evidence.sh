#!/bin/bash
if [ -f "$HOME/.cargo/env" ]; then
    # shellcheck source=/dev/null
    source "$HOME/.cargo/env"
fi

if command -v rustup &> /dev/null; then
    rustup target add wasm32-wasip2
fi
mkdir -p evidence

EVIDENCE_FILE="evidence/test-output.txt"

echo "===================================================" > "$EVIDENCE_FILE"
echo " SafeSpend AI - Verifiable Evidence  " >> "$EVIDENCE_FILE"
echo "===================================================" >> "$EVIDENCE_FILE"
echo "Timestamp: $(date -u +'%Y-%m-%dT%H:%M:%SZ')" >> "$EVIDENCE_FILE"
echo "Commit_SHA: $(git rev-parse HEAD 2>/dev/null || echo 'Unknown')" >> "$EVIDENCE_FILE"
HOST_TRIPLE=$(rustc -vV | grep "host:" | awk '{print $2}')
echo "Host Triple: $HOST_TRIPLE" >> "$EVIDENCE_FILE"
echo "---------------------------------------------------" >> "$EVIDENCE_FILE"
echo "" >> "$EVIDENCE_FILE"

cd zeroclaw-plugin
echo "Building for wasm32-wasip2..." >> "../$EVIDENCE_FILE"
cargo build --target wasm32-wasip2 >> "../$EVIDENCE_FILE" 2>&1
BUILD_RC=$?

echo "Running tests..." >> "../$EVIDENCE_FILE"
cargo test --test policy_cases -- --nocapture >> "../$EVIDENCE_FILE" 2>&1
TEST_RC=$?

echo "" >> "../$EVIDENCE_FILE"
echo "===================================================" >> "../$EVIDENCE_FILE"
echo " END OF MACHINE VALIDATION " >> "../$EVIDENCE_FILE"

if [ $BUILD_RC -ne 0 ]; then
    echo "WASM build failed. See $EVIDENCE_FILE"
    exit $BUILD_RC
fi

if [ $TEST_RC -ne 0 ]; then
    echo "Tests failed. See $EVIDENCE_FILE"
    exit $TEST_RC
fi

echo "Evidence generated successfully at $EVIDENCE_FILE"