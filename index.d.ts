// Type definitions for prom-client
// Definitions by: Simon Nyberg http://twitter.com/siimon_nyberg

/**
 * Options pass to Registry.metrics()
 */
export interface MetricsOpts {
	/**
	 * Whether to include timestamps in the output, defaults to true
	 */
	timestamps?: boolean;
}

/**
 * Container for all registered metrics
 */
export class Registry {
	/**
	 * Get string representation for all metrics
	 */
	metrics(opts?: MetricsOpts): string;

	/**
	 * Remove all metrics from the registry
	 */
	clear(): void;

	/**
	 * Reset all metrics in the registry
	 */
	resetMetrics(): void;

	/**
	 * Register metric to register
	 * @param metric Metric to add to register
	 */
	registerMetric(metric: Metric): void;

	/**
	 * Get all metrics as objects
	 */
	getMetricsAsJSON(): metric[];

	/**
	 * Get all metrics as objects
	 */
	getMetricsAsArray(): metric[];

	/**
	 * Remove a single metric
	 * @param name The name of the metric to remove
	 */
	removeSingleMetric(name: string): void;

	/**
	 * Get a single metric
	 * @param name The name of the metric
	 */
	getSingleMetric(name: string): Metric;

	/**
	 * Set static labels to every metric emitted by this registry
	 * @param labels of name/value pairs:
	 * { defaultLabel: "value", anotherLabel: "value 2" }
	 */
	setDefaultLabels(labels: Object): void;

	/**
	 * Get a string representation of a single metric by name
	 * @param name The name of the metric
	 */
	getSingleMetricAsString(name: string): string;

	/**
	 * Gets the Content-Type of the metrics for use in the response headers.
	 */
	contentType: string;

	/**
	 * Merge registers
	 * @param registers The registers you want to merge together
	 */
	static merge(registers: Registry[]): Registry;
}

/**
 * The register that contains all metrics
 */
export const register: Registry;

export interface DefaultMetricsCollectorConfiguration {
	timeout?: number;
	timestamps?: boolean;
	register?: Registry;
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
 * Configure default metrics
 * @param timeout The interval how often the default metrics should be probed
 * @deprecated A number to defaultMetrics is deprecated, please use \`collectDefaultMetrics({ timeout: ${timeout} })\`.
 * @return The setInterval number
 */
export function collectDefaultMetrics(timeout: number): number;

export interface defaultMetrics {
	/**
	 * All available default metrics
	 */
	metricsList: string[];
}

/**
 * Validate a metric name
 * @param name The name to validate
 * @return True if the metric name is valid, false if not
 */
export function validateMetricName(name: string): boolean;
