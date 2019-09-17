const { MeasureUnit, MeasureType } = require('../metricsWrapper');

const { aggregateByObjectName } = require('./helpers/processMetricsHelpers');
const { updateMetrics } = require('./helpers/processMetricsHelpers');

const NODEJS_ACTIVE_HANDLES = 'nodejs_active_handles';
const NODEJS_ACTIVE_HANDLES_TOTAL = 'nodejs_active_handles_total';

module.exports = (openCensusMetrics, config = {}) => {
	// Don't do anything if the function is removed in later nodes (exists in node@6)
	if (typeof process._getActiveHandles !== 'function') {
		return () => {};
	}

	const namePrefix = config.prefix ? config.prefix : '';

	const gauge = openCensusMetrics.createGaugeMetric({
		name: namePrefix + NODEJS_ACTIVE_HANDLES,
		desc:
			'Number of active libuv handles grouped by handle type. Every handle type is C++ class name.',
		tags: ['type'],
		measure: {
			unit: MeasureUnit.UNIT,
			type: MeasureType.Int
		}
	});
	const totalGauge = openCensusMetrics.createGaugeMetric({
		name: namePrefix + NODEJS_ACTIVE_HANDLES_TOTAL,
		desc: 'Total number of active handles.',
		measure: {
			unit: MeasureUnit.UNIT,
			type: MeasureType.Int
		}
	});

	const updater = () => {
		const handles = process._getActiveHandles();
		updateMetrics(gauge, aggregateByObjectName(handles));
		totalGauge(handles.length);
	};

	return updater;
};

module.exports.metricNames = [NODEJS_ACTIVE_HANDLES, NODEJS_ACTIVE_HANDLES_TOTAL];
