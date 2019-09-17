const { MeasureUnit, MeasureType } = require('../metricsWrapper');

const nowInSeconds = Math.round(Date.now() / 1000 - process.uptime());

const PROCESS_START_TIME = 'process_start_time_seconds';

module.exports = (openCensusMetrics, config = {}) => {
	const namePrefix = config.prefix ? config.prefix : '';

	const cpuUserGauge = openCensusMetrics.createGaugeMetric({
		name: namePrefix + PROCESS_START_TIME,
		desc: 'Start time of the process since unix epoch in seconds.',
		measure: {
			unit: MeasureUnit.SEC,
			type: MeasureType.Double
		}
	});
	cpuUserGauge(nowInSeconds);

	return () => {};
};

module.exports.metricNames = [PROCESS_START_TIME];
