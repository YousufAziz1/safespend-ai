export type RiskLevel = 'safe' | 'warning' | 'danger';
export type RiskColor = 'green' | 'yellow' | 'red';
export type Recommendation = 'approve' | 'reject' | 'manual_review';
export type ReasonType = 'positive' | 'warning' | 'critical';

export interface TransactionDetails {
    recipient: string;
    amount: number;
    fee: number;
    memo?: string;
    network: 'devnet';
}

export interface RiskReason {
    id: string;
    type: ReasonType;
    message: string;
}

export interface RiskAnalysis {
    score: number; // 0-100
    color: RiskColor;
    status: RiskLevel;
    reasons: RiskReason[];
    recommendation: Recommendation;
}

export interface TransactionRequest {
    details: TransactionDetails;
}
