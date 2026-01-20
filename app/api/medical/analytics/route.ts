import { NextRequest, NextResponse } from "next/server";
import { EnhancedMedicalCoordinatorAgent } from "@/lib/enhanced-medical-agents";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = (searchParams.get('timeframe') || 'day') as 'day' | 'week' | 'month';

    const coordinator = new EnhancedMedicalCoordinatorAgent();
    const analytics = await coordinator.getSystemAnalytics(timeframe);

    if (!analytics) {
      return NextResponse.json(
        { error: "Failed to generate analytics" },
        { status: 500 }
      );
    }

    // Calculate additional metrics
    const totalSessions = analytics.sessionStats.reduce((sum, stat) => sum + stat.count, 0);
    const completedSessions = analytics.sessionStats.find(s => s._id === 'completed')?.count || 0;
    const successRate = totalSessions > 0 ? (completedSessions / totalSessions * 100).toFixed(1) : '0';

    const avgProcessingTime = analytics.agentMetrics.length > 0
      ? (analytics.agentMetrics.reduce((sum, agent) => sum + agent.avgProcessingTime, 0) / analytics.agentMetrics.length / 1000).toFixed(2)
      : '0';

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalSessions,
          completedSessions,
          successRate: `${successRate}%`,
          avgProcessingTime: `${avgProcessingTime}s`
        },
        sessionStats: analytics.sessionStats,
        agentMetrics: analytics.agentMetrics.map(agent => ({
          ...agent,
          avgProcessingTime: (agent.avgProcessingTime / 1000).toFixed(2) + 's',
          successRate: (agent.successRate * 100).toFixed(1) + '%'
        })),
        timeframe: analytics.timeframe,
        generatedAt: analytics.generatedAt
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch analytics",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}