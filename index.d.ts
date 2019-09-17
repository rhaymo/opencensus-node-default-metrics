import { Stats } from '@opencensus/core';

export interface DefaultMetricsCollectorConfiguration {
	timeout?: number;
	stats?: Stats;
	prefix?: string;
}

/**
 * Configure default metrics
 * @param config Configuration object for default metrics collector
 * @return The setInterval number
 */
export function collectDefaultMetrics(
	config?: DefaultMetricsCollectorConfiguration
): ReturnType<typeof setInterval>;

/**
 * The opencensus global stats object
 */
export const stats: Stats;

/**
 * The metrics list
 */
export const metricsList: string[];
