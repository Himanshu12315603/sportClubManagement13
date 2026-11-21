import mongoose, { Document, Schema } from 'mongoose';

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

const aiInsightSchema = new Schema<AIInsightDocument>(
  {
    type: {
      type: String,
      enum: ['revenue_prediction', 'court_utilization', 'member_retention', 'inventory_optimization'],
      required: true,
    },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    metricValue: Number,
    metricLabel: String,
    confidenceScore: { type: Number, default: 0.85, min: 0, max: 1 },
    recommendations: [{ type: String }],
    dataPayload: Schema.Types.Mixed,
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

aiInsightSchema.index({ type: 1, generatedAt: -1 });

export const AIInsight = mongoose.model<AIInsightDocument>('AIInsight', aiInsightSchema);
