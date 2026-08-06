wit_bindgen::generate!({
    world: "tool-plugin",
});

use exports::zeroclaw::plugin::tool::{Guest, ToolResult};
use serde::{Deserialize, Serialize};

pub struct SafeSpendPlugin;

// -------------------------------------------------------------
// CENTRALIZED ERROR/WARNING CODES
// Docs can never drift from this single source of truth.
// -------------------------------------------------------------
pub mod codes {
    pub const ERR_EMPTY_RECIPIENT: &str = "ERR_EMPTY_RECIPIENT";
    pub const ERR_PAYLOAD_TOO_LARGE: &str = "ERR_PAYLOAD_TOO_LARGE";
    pub const ERR_BASE58_DECODE_FAIL: &str = "ERR_BASE58_DECODE_FAIL";
    pub const ERR_INVALID_PUBKEY_LENGTH: &str = "ERR_INVALID_PUBKEY_LENGTH";
    pub const ERR_SYSTEM_PROGRAM_TARGET: &str = "ERR_SYSTEM_PROGRAM_TARGET";
    pub const ERR_TOKEN_PROGRAM_TARGET: &str = "ERR_TOKEN_PROGRAM_TARGET";
    pub const WARN_SELF_TRANSFER: &str = "WARN_SELF_TRANSFER";
    pub const WARN_CANONICAL_DUPLICATE_TRANSFER: &str = "WARN_CANONICAL_DUPLICATE_TRANSFER";
    pub const ERR_ZERO_AMOUNT: &str = "ERR_ZERO_AMOUNT";
    pub const ERR_LAMPORT_OVERFLOW: &str = "ERR_LAMPORT_OVERFLOW";

    // New Stateful Policy Limits
    pub const ERR_TX_LIMIT_EXCEEDED: &str = "ERR_TX_LIMIT_EXCEEDED";
    pub const WARN_DAILY_LIMIT_EXCEEDED: &str = "WARN_DAILY_LIMIT_EXCEEDED";
    pub const WARN_VELOCITY_EXCEEDED: &str = "WARN_VELOCITY_EXCEEDED";
    pub const ERR_REPUTATION_DENY: &str = "ERR_REPUTATION_DENY";
    pub const REQUIRE_APPROVAL_UNKNOWN: &str = "REQUIRE_APPROVAL_UNKNOWN";
    
    // Success Condition
    pub const SUCCESS_ALLOW: &str = "OK";
}

// -------------------------------------------------------------
// EXTERNAL INGESTION CONFIGURATIONS & SCHEMAS
// -------------------------------------------------------------
#[derive(Deserialize, Default)]
struct PolicyConfig {
    max_per_tx_amount: Option<f64>,
    max_daily_amount: Option<f64>,
    max_velocity_transfers: Option<u32>,
}

#[derive(Deserialize, Default)]
struct ReputationConfig {
    allow_list: Option<Vec<String>>,
    deny_list: Option<Vec<String>>,
}

#[derive(Deserialize)]
struct AnalyzeRequest {
    sender: Option<String>,
    recipient: Option<String>,
    amount: Option<f64>,

    // Stateful host bounds
    daily_spend_so_far: Option<f64>,
    recent_transfer_count: Option<u32>,

    // Configuration rules loaded securely from host bundled state
    #[serde(default)]
    policy: Option<PolicyConfig>,
    #[serde(default)]
    reputation: Option<ReputationConfig>,
}

// -------------------------------------------------------------
// STRUCTURED RETURN (VERDICTS)
// -------------------------------------------------------------
#[derive(Serialize, Clone, PartialEq, Debug)]
pub enum Verdict {
    Allow,
    RequireApproval,
    Deny,
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
struct VerdictResult {
    verdict: Verdict,
    code: String,
    reason: String,
    rules_triggered: Vec<RiskRule>,
}

// -------------------------------------------------------------
// GLOBALS & HELPER FUNCTIONS
// -------------------------------------------------------------
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
        "ZeroClaw Security Plugin: strict mathematical derivations and structured verdict matrices tracking velocities.".to_string()
    }

    fn parameters_schema() -> String {
        serde_json::json!({
            "type": "object",
            "properties": {
                "sender": { "type": "string", "description": "Sender Base58" },
                "recipient": { "type": "string", "description": "Recipient Base58" },
                "amount": { "type": "number", "description": "Transfer amount in SOL" },
                "daily_spend_so_far": { "type": "number", "description": "Accumulated usage metric" },
                "recent_transfer_count": { "type": "number", "description": "Rolling window event count" },
                "policy": { 
                    "type": "object",
                    "properties": {
                        "max_per_tx_amount": { "type": "number" },
                        "max_daily_amount": { "type": "number" },
                        "max_velocity_transfers": { "type": "number" }
                    }
                },
                "reputation": {
                    "type": "object",
                    "properties": {
                        "allow_list": { "type": "array", "items": { "type": "string" } },
                        "deny_list": { "type": "array", "items": { "type": "string" } }
                    }
                }
            },
            "required": []
        })
        .to_string()
    }

    fn execute(args: String) -> std::result::Result<ToolResult, String> {
        let req: AnalyzeRequest = serde_json::from_str(&args)
            .map_err(|e| format!("Failed to parse JSON parameters: {}", e))?;

        let mut rules_triggered = Vec::new();
        
        let mut final_verdict = Verdict::Allow;
        let mut final_code = codes::SUCCESS_ALLOW.to_string();
        let mut final_reason = "Transaction safe and mapped strictly within native execution thresholds.".to_string();

        let mut apply_verdict = |v_state: Verdict, code: &str, reason: &str, rule: RiskRule| {
            rules_triggered.push(rule);
            
            // Hierarchy: Deny > RequireApproval > Allow
            if v_state == Verdict::Deny {
                final_verdict = Verdict::Deny;
                final_code = code.to_string();
                final_reason = reason.to_string();
            } else if v_state == Verdict::RequireApproval && final_verdict != Verdict::Deny {
                final_verdict = Verdict::RequireApproval;
                final_code = code.to_string();
                final_reason = reason.to_string();
            }
        };

        let mut decoded_recipient = None;

        // 1. Core Recipient Validations
        let recipient_str = match &req.recipient {
            Some(r) if !r.trim().is_empty() => r.trim(),
            _ => {
                apply_verdict(
                    Verdict::Deny, 
                    codes::ERR_EMPTY_RECIPIENT, 
                    "Evaluation mandates a valid receiver string.",
                    RiskRule {
                        id: codes::ERR_EMPTY_RECIPIENT.to_string(),
                        title: "Missing Recipient".to_string(),
                        severity: "Critical".to_string(),
                        reason: "No recipient address was provided.".to_string(),
                        recommendation: "Provide a valid target.".to_string(),
                    }
                );
                ""
            }
        };

        if !recipient_str.is_empty() {
            // Buffer Constraints
            if recipient_str.len() > 44 {
                apply_verdict(
                    Verdict::Deny,
                    codes::ERR_PAYLOAD_TOO_LARGE,
                    "Payload violates memory constraints preventing panics.",
                    RiskRule {
                        id: codes::ERR_PAYLOAD_TOO_LARGE.to_string(),
                        title: "Buffer Limit Exceeded".to_string(),
                        severity: "Critical".to_string(),
                        reason: "Receiver address size violates mathematical Canonical length ceilings.".to_string(),
                        recommendation: "Reject non-standard derivations immediately.".to_string(),
                    }
                );
            } else {
                // Base58 Standard Fences
                match decode_address(recipient_str) {
                    Ok(bytes) => {
                        if bytes.len() != 32 {
                            apply_verdict(
                                Verdict::Deny,
                                codes::ERR_INVALID_PUBKEY_LENGTH,
                                "Physical derivation boundaries evaluated invalidly outside standard norms.",
                                RiskRule {
                                    id: codes::ERR_INVALID_PUBKEY_LENGTH.to_string(),
                                    title: "Invalid Pubkey Byte Length".to_string(),
                                    severity: "Critical".to_string(),
                                    reason: format!("Decoded representation is {} bytes, strictly failing the 32-byte canonical constraint.", bytes.len()),
                                    recommendation: "Verify destination address.".to_string(),
                                }
                            );
                        } else {
                            decoded_recipient = Some(bytes);
                        }
                    }
                    Err(e) => {
                        apply_verdict(
                            Verdict::Deny,
                            codes::ERR_BASE58_DECODE_FAIL,
                            "Signature alphabet fails evaluation boundaries inherently.",
                            RiskRule {
                                id: codes::ERR_BASE58_DECODE_FAIL.to_string(),
                                title: "Base58 Parsing Fault".to_string(),
                                severity: "Critical".to_string(),
                                reason: format!("The target string failed mathematical Base58 mapping. Cause: {}", e),
                                recommendation: "Ensure string excludes invalid alphabets (0, O, I, l).".to_string(),
                            }
                        );
                    }
                }

                // Core Logic System Defenses
                if recipient_str == SYSTEM_PROGRAM_ID {
                    apply_verdict(
                        Verdict::Deny,
                        codes::ERR_SYSTEM_PROGRAM_TARGET,
                        "System origin targeting is unconditionally blackholed bounds.",
                        RiskRule {
                            id: codes::ERR_SYSTEM_PROGRAM_TARGET.to_string(),
                            title: "Native System Program Injection".to_string(),
                            severity: "Critical".to_string(),
                            reason: "You are attempting to transfer SOL directly to the Solana System Program which operates without owner limits.".to_string(),
                            recommendation: "Change recipient immediately.".to_string(),
                        }
                    );
                } else if recipient_str == TOKEN_PROGRAM_ID {
                    apply_verdict(
                        Verdict::Deny,
                        codes::ERR_TOKEN_PROGRAM_TARGET,
                        "Origin execution program black-holing strictly trapped.",
                        RiskRule {
                            id: codes::ERR_TOKEN_PROGRAM_TARGET.to_string(),
                            title: "SPL Token Program Injection".to_string(),
                            severity: "Critical".to_string(),
                            reason: "Direct value transfers to the SPL Token Program instruction executable are lost.".to_string(),
                            recommendation: "Target a standard generated token account.".to_string(),
                        }
                    );
                }
            }
        }

        // 2. Sender vs Recipient Defenses
        if let Some(s) = &req.sender {
            let s_trim = s.trim();
            if s_trim.len() <= 44 {
                if s_trim == recipient_str {
                    apply_verdict(
                        Verdict::RequireApproval,
                        codes::WARN_SELF_TRANSFER,
                        "Originating signature loops recursively targeting sender.",
                        RiskRule {
                            id: codes::WARN_SELF_TRANSFER.to_string(),
                            title: "Sender & Recipient Match".to_string(),
                            severity: "Warning".to_string(),
                            reason: "Transferring bounds onto the exact originating sender.".to_string(),
                            recommendation: "Avoid duplicate targeting.".to_string(),
                        }
                    );
                } else if let Some(ref rec_bytes) = decoded_recipient {
                    if let Ok(sender_bytes) = decode_address(s_trim) {
                        if sender_bytes.len() == 32 && sender_bytes == *rec_bytes {
                            apply_verdict(
                                Verdict::RequireApproval,
                                codes::WARN_CANONICAL_DUPLICATE_TRANSFER,
                                "Sender explicitly translates into physical overlap with target mathematically.",
                                RiskRule {
                                    id: codes::WARN_CANONICAL_DUPLICATE_TRANSFER.to_string(),
                                    title: "Decoded Match Verification".to_string(),
                                    severity: "Warning".to_string(),
                                    reason: "Sender and Target decode to identical 32-byte arrays securely.".to_string(),
                                    recommendation: "Nullify self-execution.".to_string(),
                                }
                            );
                        }
                    }
                }
            }
        }

        // 3. Absolute Value Protections
        let amt = req.amount.unwrap_or(0.0);
        if req.amount.is_some() {
            if amt <= 0.0 {
                apply_verdict(
                    Verdict::Deny,
                    codes::ERR_ZERO_AMOUNT,
                    "Values bound mathematically towards invalid execution integers explicitly.",
                    RiskRule {
                        id: codes::ERR_ZERO_AMOUNT.to_string(),
                        title: "Zero or Negative Execution".to_string(),
                        severity: "Critical".to_string(),
                        reason: format!("Evaluation requests {} numeric bounds.", amt),
                        recommendation: "Apply positive logic.".to_string(),
                    }
                );
            } else if amt > MAX_SOL_AMOUNT {
                apply_verdict(
                    Verdict::Deny,
                    codes::ERR_LAMPORT_OVERFLOW,
                    "Execution arrays generate u64 Max bounds inherently executing panics.",
                    RiskRule {
                        id: codes::ERR_LAMPORT_OVERFLOW.to_string(),
                        title: "Lamport Integer Overflow".to_string(),
                        severity: "Critical".to_string(),
                        reason: format!("Requested sum {} generates u64::MAX instruction panics locally.", amt),
                        recommendation: "Diminish structural limits.".to_string(),
                    }
                );
            }
        }

        // 4. Configurable Policy Overrides 
        let pol = req.policy.unwrap_or_default();
        
        if let Some(limit) = pol.max_per_tx_amount {
            if amt > limit {
                apply_verdict(
                    Verdict::Deny,
                    codes::ERR_TX_LIMIT_EXCEEDED,
                    "Target volume exceeds the enforced physical maximum cap.",
                    RiskRule {
                        id: codes::ERR_TX_LIMIT_EXCEEDED.to_string(),
                        title: "Max Transaction Spend Exceeded".to_string(),
                        severity: "Critical".to_string(),
                        reason: format!("Attempting transfer of {}, explicitly overriding limits of {}.", amt, limit),
                        recommendation: "Shrink execution size safely.".to_string(),
                    }
                );
            }
        }
        
        if let Some(daily) = pol.max_daily_amount {
            let so_far = req.daily_spend_so_far.unwrap_or(0.0);
            if so_far + amt > daily {
                apply_verdict(
                    Verdict::RequireApproval,
                    codes::WARN_DAILY_LIMIT_EXCEEDED,
                    "Execution breaches cumulative daily boundaries effectively.",
                    RiskRule {
                        id: codes::WARN_DAILY_LIMIT_EXCEEDED.to_string(),
                        title: "Daily Spend Limit Warn".to_string(),
                        severity: "Warning".to_string(),
                        reason: format!("Combined daily totals ({} + {}) breaches mapping bounds ({}).", so_far, amt, daily),
                        recommendation: "Investigate unusual activity.".to_string(),
                    }
                );
            }
        }

        if let Some(vel) = pol.max_velocity_transfers {
            let count = req.recent_transfer_count.unwrap_or(0);
            if count >= vel {
                apply_verdict(
                    Verdict::RequireApproval,
                    codes::WARN_VELOCITY_EXCEEDED,
                    "Velocity boundaries mapping requests indicate excessive rapid usage execution.",
                    RiskRule {
                        id: codes::WARN_VELOCITY_EXCEEDED.to_string(),
                        title: "Velocity Count Flag".to_string(),
                        severity: "Warning".to_string(),
                        reason: "Requests evaluate higher than standard bounds.".to_string(),
                        recommendation: "Check automated scripts tracking logic closures.".to_string(),
                    }
                );
            }
        }

        // 5. Explicit Address Reputation Matrix
        let rep = req.reputation.unwrap_or_default();
        if !recipient_str.is_empty() {
            let in_deny = rep.deny_list.as_ref().is_some_and(|list| list.iter().any(|s| s == recipient_str));
            let in_allow = rep.allow_list.as_ref().is_some_and(|list| list.iter().any(|s| s == recipient_str));
            
            if in_deny {
                apply_verdict(
                    Verdict::Deny,
                    codes::ERR_REPUTATION_DENY,
                    "Global reputation flags mandate immediate rejection cleanly blocking drainer signatures.",
                    RiskRule {
                        id: codes::ERR_REPUTATION_DENY.to_string(),
                        title: "Drainer Deny List".to_string(),
                        severity: "Critical".to_string(),
                        reason: "Destination physically mapped in absolute deny-list matrix globally.".to_string(),
                        recommendation: "Revert interaction instantly.".to_string()
                    }
                );
            } else if !in_allow {
                // If not explicitly approved and not denied => Require Approval
                apply_verdict(
                    Verdict::RequireApproval,
                    codes::REQUIRE_APPROVAL_UNKNOWN,
                    "Unknown physical evaluation vector mandates signature verification.",
                    RiskRule {
                        id: codes::REQUIRE_APPROVAL_UNKNOWN.to_string(),
                        title: "Unknown Reputation Tier".to_string(),
                        severity: "Warning".to_string(),
                        reason: "Address unmapped amongst current allow-listed matrices explicitly.".to_string(),
                        recommendation: "Confirm intention manually.".to_string()
                    }
                );
            }
        }


        let result = VerdictResult {
            verdict: final_verdict,
            code: final_code,
            reason: final_reason,
            rules_triggered,
        };

        let output = serde_json::to_string_pretty(&result)
            .map_err(|e| format!("Serialization error: {}", e))?;

        Ok(ToolResult {
            success: true,
            output,
            error: None,
        })
    }
}

impl exports::zeroclaw::plugin::plugin_info::Guest for SafeSpendPlugin {
    fn version() -> String { "0.2.0".to_string() }
    fn author() -> String { "SafeSpend AI".to_string() }
}

#[cfg(target_arch = "wasm32")]
export!(SafeSpendPlugin);

pub fn test_execute(args: String) -> String {
    let res = <SafeSpendPlugin as exports::zeroclaw::plugin::tool::Guest>::execute(args).unwrap();
    res.output
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_valid_address_known() {
        // Must be in allow_list to avoid require_approval
        let args = json!({
            "recipient": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
            "amount": 10.0,
            "reputation": {
                "allow_list": ["metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"]
            }
        }).to_string();
        let res = SafeSpendPlugin::execute(args).unwrap();
        assert!(res.output.contains(codes::SUCCESS_ALLOW));
        assert!(res.output.contains(r#""verdict": "Allow""#));
    }

    #[test]
    fn test_invalid_alphabet_base58() {
        let args = json!({
            "recipient": "4q7177B43973xX8j1tW32h5J2mG817E2IO", 
            "amount": 1.0
        }).to_string();
        let res = SafeSpendPlugin::execute(args).unwrap();
        assert!(res.output.contains(codes::ERR_BASE58_DECODE_FAIL));
        assert!(res.output.contains(r#""verdict": "Deny""#));
    }

    #[test]
    fn test_policy_tx_limit_exceeded() {
        let args = json!({
            "recipient": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
            "amount": 500.0,
            "policy": {
                "max_per_tx_amount": 100.0
            }
        }).to_string();
        let res = SafeSpendPlugin::execute(args).unwrap();
        assert!(res.output.contains(codes::ERR_TX_LIMIT_EXCEEDED));
        assert!(res.output.contains(r#""verdict": "Deny""#));
    }

    #[test]
    fn test_policy_daily_limit_warn() {
        let args = json!({
            "recipient": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
            "amount": 50.0,
            "daily_spend_so_far": 1000.0,
            "policy": {
                "max_daily_amount": 1000.0
            }
        }).to_string();
        let res = SafeSpendPlugin::execute(args).unwrap();
        assert!(res.output.contains(codes::WARN_DAILY_LIMIT_EXCEEDED));
        assert!(res.output.contains(r#""verdict": "RequireApproval""#));
    }
    
    #[test]
    fn test_velocity_limit_warn() {
        let args = json!({
            "recipient": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
            "amount": 1.0,
            "recent_transfer_count": 50,
            "policy": {
                "max_velocity_transfers": 10
            }
        }).to_string();
        let res = SafeSpendPlugin::execute(args).unwrap();
        assert!(res.output.contains(codes::WARN_VELOCITY_EXCEEDED));
        assert!(res.output.contains(r#""verdict": "RequireApproval""#));
    }
    
    #[test]
    fn test_reputation_deny() {
        let args = json!({
            "recipient": "BxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1sxxU1U",
            "amount": 1.0,
            "reputation": {
                "deny_list": ["BxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1sxxU1U"]
            }
        }).to_string();
        let res = SafeSpendPlugin::execute(args).unwrap();
        assert!(res.output.contains(codes::ERR_REPUTATION_DENY));
        assert!(res.output.contains(r#""verdict": "Deny""#));
    }

    #[test]
    fn test_require_approval_unknown() {
        let args = json!({
            "recipient": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", // valid 32-byte base58 address
            "amount": 1.0
        }).to_string();
        let res = SafeSpendPlugin::execute(args).unwrap();
        assert!(res.output.contains(codes::REQUIRE_APPROVAL_UNKNOWN));
        assert!(res.output.contains(r#""verdict": "RequireApproval""#));
    }

    #[test]
    fn test_system_program() {
        let args = json!({
            "recipient": "11111111111111111111111111111111",
            "amount": 1.0
        }).to_string();
        let res = SafeSpendPlugin::execute(args).unwrap();
        assert!(res.output.contains(codes::ERR_SYSTEM_PROGRAM_TARGET));
    }
}
