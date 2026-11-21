import { Document } from 'mongoose';

export type InsightType = 'revenue_prediction' | 'court_utilization' | 'member_retention' | 'inventory_optimization';

export interface IAIInsight {
  type: InsightType;
  title: string;
  summary: string;
  metricValue?: number;
  metricLabel?: string;
  confidenceScore: number;
  recommendations: string[];
  dataPayload?: Record<string, unknown>;
  generatedAt: Date;
}

export interface AIInsightDocument extends IAIInsight, Document {}

export interface AIRevenuePrediction {
  currentMonthRevenue: number;
  projectedMonthRevenue: number;
  growthRatePercentage: number;
  confidence: number;
  breakdown: Record<string, number>;
}
