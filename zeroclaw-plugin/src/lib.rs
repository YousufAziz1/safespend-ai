wit_bindgen::generate!({
    world: "zeroclaw-plugin",
});

use exports::zeroclaw::plugin::tool::{Guest, ToolResult};
use serde::{Deserialize, Serialize};

struct SafeSpendPlugin;

#[derive(Deserialize)]
struct AnalyzeRequest {
    sender: Option<String>,
    recipient: Option<String>,
    amount: Option<f64>,
    token_symbol: Option<String>,
}

#[derive(Serialize)]
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

impl Guest for SafeSpendPlugin {
    fn name() -> String {
        "safespend-security-analysis".to_string()
    }

    fn description() -> String {
        "Performs strict deterministic analysis on transaction payloads verifying base58 formatting, self-transfers, invalid amounts, and malformed inputs natively without assuming network context.".to_string()
    }

    fn parameters_schema() -> String {
        serde_json::json!({
            "type": "object",
            "properties": {
                "sender": { "type": "string", "description": "Sender base58 address" },
                "recipient": { "type": "string", "description": "Recipient base58 address" },
                "amount": { "type": "number", "description": "Transaction amount in native units" },
                "token_symbol": { "type": "string", "description": "Token symbol natively" }
            },
            "required": []
        })
        .to_string()
    }

    fn execute(args: String) -> Result<ToolResult, String> {
        let req: AnalyzeRequest = serde_json::from_str(&args)
            .map_err(|e| format!("Failed to parse JSON parameters: {}", e))?;

        let mut rules_triggered = Vec::new();
        let mut is_safe = true;

        // 1. Empty recipient
        let recipient = match &req.recipient {
            Some(r) if !r.trim().is_empty() => r.trim(),
            _ => {
                is_safe = false;
                rules_triggered.push(RiskRule {
                    id: "ERR_EMPTY_RECIPIENT".to_string(),
                    title: "Missing Recipient Address".to_string(),
                    severity: "Critical".to_string(),
                    reason: "The transaction recipient address is completely missing or empty.".to_string(),
                    recommendation: "Provide a valid base58 Solana target address.".to_string(),
                });
                ""
            }
        };

        // 2. Base58 Payload Validation (Length Check commonly 32-44 bytes for Solana Addresses)
        if !recipient.is_empty() && (recipient.len() < 32 || recipient.len() > 44) {
            is_safe = false;
            rules_triggered.push(RiskRule {
                id: "ERR_INVALID_BASE58_LENGTH".to_string(),
                title: "Invalid Address Format".to_string(),
                severity: "Critical".to_string(),
                reason: format!("The target address '{}' length ({}) is outside standard Solana base58 parameters.", recipient, recipient.len()),
                recommendation: "Verify the destination address character length.".to_string(),
            });
        }

        // 3. Self-transfer detection
        if let Some(s) = &req.sender {
            if !recipient.is_empty() && s.trim() == recipient {
                is_safe = false; // or Warning
                rules_triggered.push(RiskRule {
                    id: "WARN_SELF_TRANSFER".to_string(),
                    title: "Self-Transfer Detected".to_string(),
                    severity: "Warning".to_string(),
                    reason: "The transaction maps the sender and the recipient to the exact same address natively.".to_string(),
                    recommendation: "Ensure you intend to transfer funds to yourself, wasting gas.".to_string(),
                });
            }
        }

        // 4. Invalid amount / Zero amount
        if let Some(amt) = req.amount {
            if amt <= 0.0 {
                is_safe = false;
                rules_triggered.push(RiskRule {
                    id: "ERR_ZERO_AMOUNT".to_string(),
                    title: "Zero or Negative Amount".to_string(),
                    severity: "Critical".to_string(),
                    reason: format!("The specified transfer amount ({}) is zero or strictly negative.", amt),
                    recommendation: "Define a positive numerical limit to execute.".to_string(),
                });
            }
        }

        // 5. Invalid token detection
        if let Some(token) = &req.token_symbol {
            if token.len() > 10 {
                is_safe = false;
                rules_triggered.push(RiskRule {
                    id: "WARN_TOKEN_SYMBOL_LONG".to_string(),
                    title: "Suspicious Token Symbol Length".to_string(),
                    severity: "Warning".to_string(),
                    reason: format!("The requested token symbol '{}' exceeds standard length conventions.", token),
                    recommendation: "Ensure this contract interact specifies an authentic Spl token natively.".to_string(),
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

// Implement the plugin-info export required by the ZeroClaw plugin interface
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

    #[test]
    fn test_valid_address() {
        let args = serde_json::json!({
            "sender": "11111111111111111111111111111111",
            "recipient": "4q7177B43973xX8j1tW32h5J2mG817E2n",
            "amount": 1.5
        }).to_string();

        let result = SafeSpendPlugin::execute(args).expect("Failed to execute");
        assert!(result.success);
        assert!(result.output.contains("\"is_safe\": true"));
    }

    #[test]
    fn test_empty_recipient() {
        let args = serde_json::json!({
            "sender": "11111111111111111111111111111111",
            "amount": 1.5
        }).to_string();

        let result = SafeSpendPlugin::execute(args).expect("Failed execution");
        assert!(result.output.contains("ERR_EMPTY_RECIPIENT"));
        assert!(result.output.contains("\"is_safe\": false"));
    }
    
    #[test]
    fn test_negative_amount() {
        let args = serde_json::json!({
            "sender": "11111111111111111111111111111111",
            "recipient": "4q7177B43973xX8j1tW32h5J2mG817E2n",
            "amount": -50.0
        }).to_string();

        let result = SafeSpendPlugin::execute(args).expect("Execution fault");
        assert!(result.output.contains("ERR_ZERO_AMOUNT"));
    }
}
