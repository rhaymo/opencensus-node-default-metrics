const { MeasureUnit, MeasureType } = require('../metricsWrapper');

const PROCESS_CPU_USER_SECONDS = 'process_cpu_user_seconds_total';
const PROCESS_CPU_SYSTEM_SECONDS = 'process_cpu_system_seconds_total';
const PROCESS_CPU_SECONDS = 'process_cpu_seconds_total';

module.exports = (openCensusMetrics, config = {}) => {
	const namePrefix = config.prefix ? config.prefix : '';

	const cpuUserUsageCounter = openCensusMetrics.createGaugeMetric({
		name: namePrefix + PROCESS_CPU_USER_SECONDS,
		desc: 'Total user CPU time spent in seconds.',
		measure: {
			unit: MeasureUnit.SEC,
			type: MeasureType.Int
		}
	});
	const cpuSystemUsageCounter = openCensusMetrics.createGaugeMetric({
		name: namePrefix + PROCESS_CPU_SYSTEM_SECONDS,
		desc: 'Total system CPU time spent in seconds.',
		measure: {
			unit: MeasureUnit.SEC,
			type: MeasureType.Int
		}
	});
	const cpuUsageCounter = openCensusMetrics.createGaugeMetric({
		name: namePrefix + PROCESS_CPU_SECONDS,
		desc: 'Total user and system CPU time spent in seconds.',
		measure: {
			unit: MeasureUnit.SEC,
			type: MeasureType.Int
		}
	});

	return () => {
		const cpuUsage = process.cpuUsage();

		const userUsageMicros = cpuUsage.user;
		const systemUsageMicros = cpuUsage.system;

		cpuUserUsageCounter(userUsageMicros / 1e6);
		cpuSystemUsageCounter(systemUsageMicros / 1e6);
		cpuUsageCounter((userUsageMicros + systemUsageMicros) / 1e6);
	};
};

module.exports.metricNames = [
	PROCESS_CPU_USER_SECONDS,
	PROCESS_CPU_SYSTEM_SECONDS,
	PROCESS_CPU_SECONDS
];
