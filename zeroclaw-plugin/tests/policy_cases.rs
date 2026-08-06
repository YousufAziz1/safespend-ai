use zeroclaw_plugin::SafeSpendPlugin;
use zeroclaw_plugin::exports::zeroclaw::plugin::tool::Guest;
use serde_json::json;

struct TestCase<'a> {
    name: &'a str,
    args: serde_json::Value,
    expect_code: &'a str,
    expect_verdict: &'a str,
}

#[test]
fn execute_policy_matrix_transparently() {
    println!("--- SAFE_SPEND AI PLUGIN: DETERMINISTIC POLICY EVALUATION MATRIX ---");

    let cases = vec![
        TestCase {
            name: "Valid Transfer (Known Recipient, Healthy Velocity, Normal Amount)",
            args: json!({
                "recipient": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
                "amount": 10.0,
                "reputation": { "allow_list": ["metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"] }
            }),
            expect_code: "OK",
            expect_verdict: "Allow",
        },
        TestCase {
            name: "Malformed Base58 (Invalid Alphabet / Drainer Obfuscation)",
            args: json!({ "recipient": "4q7177B43973xX8j1tW32h5J2mG817E2IO" }),
            expect_code: "ERR_BASE58_DECODE_FAIL",
            expect_verdict: "Deny",
        },
        TestCase {
            name: "Invalid Canonical Length (Wrong Pubkey Derivation)",
            args: json!({ "recipient": "2s122d" }),
            expect_code: "ERR_INVALID_PUBKEY_LENGTH",
            expect_verdict: "Deny",
        },
        TestCase {
            name: "Zero Amount Request (Dusting / Sub-Zero bounds)",
            args: json!({ "recipient": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", "amount": 0.0 }),
            expect_code: "ERR_ZERO_AMOUNT",
            expect_verdict: "Deny",
        },
        TestCase {
            name: "Self-Transfer Loop (Gas Waste Protection)",
            args: json!({
                "sender": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
                "recipient": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
                "amount": 1.0
            }),
            expect_code: "WARN_SELF_TRANSFER",
            expect_verdict: "RequireApproval",
        },
        TestCase {
            name: "Per-Transaction Limit Exceeded (Spending Bound)",
            args: json!({
                "recipient": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
                "amount": 5000.0,
                "policy": { "max_per_tx_amount": 1000.0 }
            }),
            expect_code: "ERR_TX_LIMIT_EXCEEDED",
            expect_verdict: "Deny",
        },
        TestCase {
            name: "Daily Cumulative Limit Reached",
            args: json!({
                "recipient": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
                "amount": 50.0,
                "daily_spend_so_far": 980.0,
                "policy": { "max_daily_amount": 1000.0 }
            }),
            expect_code: "WARN_DAILY_LIMIT_EXCEEDED",
            expect_verdict: "RequireApproval",
        },
        TestCase {
            name: "Velocity Transfer Limit Breached (Spam Filter)",
            args: json!({
                "recipient": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
                "amount": 5.0,
                "recent_transfer_count": 25,
                "policy": { "max_velocity_transfers": 20 }
            }),
            expect_code: "WARN_VELOCITY_EXCEEDED",
            expect_verdict: "RequireApproval",
        },
        TestCase {
            name: "Deny-Listed Drainer Account Intercepted",
            args: json!({
                "recipient": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
                "amount": 1.0,
                "reputation": { "deny_list": ["DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"] }
            }),
            expect_code: "ERR_REPUTATION_DENY",
            expect_verdict: "Deny",
        },
        TestCase {
            name: "Unknown Recipient Escalation (Escort to Human Signature)",
            args: json!({
                "recipient": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
                "amount": 1.0,
                "reputation": { "allow_list": ["metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"] }
            }),
            expect_code: "REQUIRE_APPROVAL_UNKNOWN",
            expect_verdict: "RequireApproval",
        },
    ];

    let mut success_count = 0;
    for (i, case) in cases.iter().enumerate() {
        println!("\n[{}] TEST CASE: {}", i + 1, case.name);
        println!("Input state bounds: {}", case.args.to_string());
        
        let res = SafeSpendPlugin::execute(case.args.to_string()).expect("Plugin panicked");
        
        let output = res.output;
        
        let found_code = output.contains(case.expect_code);
        let found_verdict = output.contains(&format!("\"verdict\": \"{}\"", case.expect_verdict)) || output.contains(&format!("\"Verdict\": \"{}\"", case.expect_verdict));
        
        if found_code && found_verdict {
            println!("✅ PASS => Correctly mapping struct {{ Verdict: {}, Code: {} }}", case.expect_verdict, case.expect_code);
            success_count += 1;
        } else {
            println!("❌ FAIL => Output did not match expectations.");
            println!("Expected Code: {} | Expected Verdict: {}", case.expect_code, case.expect_verdict);
            println!("Raw Output: {}", output);
        }
        assert!(found_code && found_verdict, "Test case failed: {}", case.name);
    }

    println!("\n---------------------------------------------------");
    println!("MATRIX STATUS: {}/{} tests passed identically.", success_count, cases.len());
    println!("---------------------------------------------------");
}
