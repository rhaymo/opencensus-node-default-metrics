const { MeasureUnit, MeasureType } = require('../metricsWrapper');

const NODEJS_EVENTLOOP_LAG = 'nodejs_eventloop_lag_seconds';

function reportEventloopLag(start, gauge) {
	const delta = process.hrtime(start);
	const nanosec = delta[0] * 1e9 + delta[1];
	const seconds = nanosec / 1e9;

	gauge(seconds);
}

module.exports = (openCensusMetrics, config = {}) => {
	const namePrefix = config.prefix ? config.prefix : '';

	const gauge = openCensusMetrics.createGaugeMetric({
		name: namePrefix + NODEJS_EVENTLOOP_LAG,
		desc: 'Lag of event loop in seconds.',
		measure: {
			unit: MeasureUnit.SEC,
			type: MeasureType.Double
		}
	});

	return () => {
		const start = process.hrtime();
		setImmediate(reportEventloopLag, start, gauge);
	};
};

module.exports.metricNames = [NODEJS_EVENTLOOP_LAG];
