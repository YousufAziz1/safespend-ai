wit_bindgen::generate!({
    world: "tool-plugin",
});

use exports::zeroclaw::plugin::tool::{Guest, ToolResult};
use serde::{Deserialize, Serialize};

struct SafeSpendPlugin;

#[derive(Deserialize)]
struct AnalyzeRequest {
    sender: Option<String>,
    recipient: Option<String>,
    amount: Option<f64>,
}

#[derive(Serialize, Clone)]
struct RiskRule {
    id: String,
    title: String,
    severity: String,
    reason: String,
    recommendation: String,
}

#[derive(Serialize)]
struct RiskAnalysis {
    is_safe: bool,
    rules_triggered: Vec<RiskRule>,
}

const SYSTEM_PROGRAM_ID: &str = "11111111111111111111111111111111";
const TOKEN_PROGRAM_ID: &str = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const MAX_SOL_AMOUNT: f64 = (u64::MAX / 1_000_000_000) as f64; // ~18.4 billion SOL

fn decode_address(address: &str) -> std::result::Result<Vec<u8>, String> {
    bs58::decode(address)
        .into_vec()
        .map_err(|e| format!("Base58 decode error: {}", e))
}

impl Guest for SafeSpendPlugin {
    fn name() -> String {
        "safespend-security-analysis".to_string()
    }

    fn description() -> String {
        "Executes strict mathematical Solana constraints: verified Base58 parsing, 32-byte canonical checks, Lamport overflows, and System/Token program collisions.".to_string()
    }

    fn parameters_schema() -> String {
        serde_json::json!({
            "type": "object",
            "properties": {
                "sender": { "type": "string", "description": "Sender Base58" },
                "recipient": { "type": "string", "description": "Recipient Base58" },
                "amount": { "type": "number", "description": "Transfer amount in SOL" }
            },
            "required": []
        })
        .to_string()
    }

    fn execute(args: String) -> std::result::Result<ToolResult, String> {
        let req: AnalyzeRequest = serde_json::from_str(&args)
            .map_err(|e| format!("Failed to parse JSON parameters: {}", e))?;

        let mut rules_triggered = Vec::new();
        let mut is_safe = true;

        let mut decoded_recipient = None;

        // 1. Recipient Address Verification
        let recipient_str = match &req.recipient {
            Some(r) if !r.trim().is_empty() => r.trim(),
            _ => {
                is_safe = false;
                rules_triggered.push(RiskRule {
                    id: "ERR_EMPTY_RECIPIENT".to_string(),
                    title: "Missing Recipient".to_string(),
                    severity: "Critical".to_string(),
                    reason: "No recipient address was provided.".to_string(),
                    recommendation: "Provide a valid target.".to_string(),
                });
                ""
            }
        };

        if !recipient_str.is_empty() {
            // Buffer Limit (DOS Protection against arbitrary WASM allocations)
            if recipient_str.len() > 44 {
                is_safe = false;
                rules_triggered.push(RiskRule {
                    id: "ERR_PAYLOAD_TOO_LARGE".to_string(),
                    title: "Buffer Limit Exceeded".to_string(),
                    severity: "Critical".to_string(),
                    reason: "Receiver address size structurally violates mathematical Canonical length ceilings natively.".to_string(),
                    recommendation: "Reject non-standard derivations immediately.".to_string(),
                });
            } else {
                // Validate Base58 & Invalid Alphabet
                match decode_address(recipient_str) {
                    Ok(bytes) => {
                        // Exact 32-byte public key mapping
                        if bytes.len() != 32 {
                            is_safe = false;
                            rules_triggered.push(RiskRule {
                                id: "ERR_INVALID_PUBKEY_LENGTH".to_string(),
                                title: "Invalid Pubkey Byte Length".to_string(),
                                severity: "Critical".to_string(),
                                reason: format!("Decoded representation is {} bytes, strictly failing the 32-byte canonical constraint.", bytes.len()),
                                recommendation: "Verify destination address.".to_string(),
                            });
                        } else {
                            decoded_recipient = Some(bytes);
                        }
                    }
                    Err(e) => {
                        is_safe = false;
                        rules_triggered.push(RiskRule {
                            id: "ERR_BASE58_DECODE_FAIL".to_string(),
                            title: "Base58 Parsing Fault".to_string(),
                            severity: "Critical".to_string(),
                            reason: format!(
                                "The target string failed mathematical Base58 mapping. Cause: {}",
                                e
                            ),
                            recommendation: "Ensure string excludes invalid alphabets (0, O, I, l)."
                                .to_string(),
                        });
                    }
                }

                // Target overlaps Core System Contracts
                if recipient_str == SYSTEM_PROGRAM_ID {
                    is_safe = false;
                    rules_triggered.push(RiskRule {
                        id: "ERR_SYSTEM_PROGRAM_TARGET".to_string(),
                        title: "Native System Program Injection".to_string(),
                        severity: "Critical".to_string(),
                        reason: "You are attempting to transfer SOL directly to the Solana System Program which operates without owner limits.".to_string(),
                        recommendation: "Change recipient immediately.".to_string(),
                    });
                } else if recipient_str == TOKEN_PROGRAM_ID {
                    is_safe = false;
                    rules_triggered.push(RiskRule {
                        id: "ERR_TOKEN_PROGRAM_TARGET".to_string(),
                        title: "SPL Token Program Injection".to_string(),
                        severity: "Critical".to_string(),
                        reason: "Direct value transfers to the SPL Token Program instruction executable are lost.".to_string(),
                        recommendation: "Target a standard generated token account.".to_string(),
                    });
                }
            }
        }

        // 3. Sender Verification and Duplicate/Self Transfer (with Memory Allocation Defenses)
        if let Some(s) = &req.sender {
            let s_trim = s.trim();
            if s_trim.len() <= 44 {
                if s_trim == recipient_str {
                    is_safe = false;
                    rules_triggered.push(RiskRule {
                        id: "WARN_SELF_TRANSFER".to_string(),
                        title: "Sender & Recipient Match".to_string(),
                        severity: "Warning".to_string(),
                        reason: "Transferring bounds onto the exact originating sender."
                            .to_string(),
                        recommendation: "Avoid duplicate targeting.".to_string(),
                    });
                } else if let Some(ref rec_bytes) = decoded_recipient {
                    // Determine equality through decoding mapping to catch canonical duplicates
                    if let Ok(sender_bytes) = decode_address(s_trim) {
                        if sender_bytes.len() == 32 && sender_bytes == *rec_bytes {
                            is_safe = false;
                            rules_triggered.push(RiskRule {
                                id: "WARN_CANONICAL_DUPLICATE_TRANSFER".to_string(),
                                title: "Decoded Match Verification".to_string(),
                                severity: "Warning".to_string(),
                                reason:
                                    "Sender and Target decode to identical 32-byte arrays securely."
                                        .to_string(),
                                recommendation: "Nullify self-execution.".to_string(),
                            });
                        }
                    }
                }
            }
        }

        // 4. Amount Verification & Lamport Overflows
        if let Some(amt) = req.amount {
            if amt <= 0.0 {
                is_safe = false;
                rules_triggered.push(RiskRule {
                    id: "ERR_ZERO_AMOUNT".to_string(),
                    title: "Zero or Negative Execution".to_string(),
                    severity: "Critical".to_string(),
                    reason: format!("Evaluation requests {} numeric bounds natively.", amt),
                    recommendation: "Apply positive logic.".to_string(),
                });
            } else if amt > MAX_SOL_AMOUNT {
                is_safe = false;
                rules_triggered.push(RiskRule {
                    id: "ERR_LAMPORT_OVERFLOW".to_string(),
                    title: "Lamport Integer Overflow".to_string(),
                    severity: "Critical".to_string(),
                    reason: format!(
                        "Requested sum {} generates u64::MAX instruction panics locally.",
                        amt
                    ),
                    recommendation: "Diminish structural limits.".to_string(),
                });
            }
        }

        let analysis = RiskAnalysis {
            is_safe,
            rules_triggered,
        };

        let output = serde_json::to_string_pretty(&analysis)
            .map_err(|e| format!("Serialization error: {}", e))?;

        Ok(ToolResult {
            success: true,
            output,
            error: None,
        })
    }
}

impl exports::zeroclaw::plugin::plugin_info::Guest for SafeSpendPlugin {
    fn version() -> String {
        "0.1.0".to_string()
    }
    fn author() -> String {
        "SafeSpend AI".to_string()
    }
}

export!(SafeSpendPlugin);

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_valid_address() {
        let args = json!({
            "recipient": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
            "amount": 10.0
        })
        .to_string();
        let res = SafeSpendPlugin::execute(args).unwrap();
        assert!(res.output.contains("\"is_safe\": true"));
    }

    #[test]
    fn test_invalid_alphabet_base58() {
        let args = json!({
            "recipient": "4q7177B43973xX8j1tW32h5J2mG817E2IO", // I and O are invalid
            "amount": 1.0
        })
        .to_string();
        let res = SafeSpendPlugin::execute(args).unwrap();
        assert!(res.output.contains("ERR_BASE58_DECODE_FAIL"));
        assert!(res.output.contains("\"is_safe\": false"));
    }

    #[test]
    fn test_invalid_pubkey_length() {
        let args = json!({
            "recipient": "2s122d", // short base58
            "amount": 1.0
        })
        .to_string();
        let res = SafeSpendPlugin::execute(args).unwrap();
        assert!(res.output.contains("ERR_INVALID_PUBKEY_LENGTH"));
    }

    #[test]
    fn test_lamport_overflow() {
        let args = json!({
            "recipient": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
            "amount": 20_000_000_000.0
        })
        .to_string();
        let res = SafeSpendPlugin::execute(args).unwrap();
        assert!(res.output.contains("ERR_LAMPORT_OVERFLOW"));
    }

    #[test]
    fn test_system_program() {
        let args = json!({
            "recipient": "11111111111111111111111111111111",
            "amount": 1.0
        })
        .to_string();
        let res = SafeSpendPlugin::execute(args).unwrap();
        assert!(res.output.contains("ERR_SYSTEM_PROGRAM_TARGET"));
    }
}
