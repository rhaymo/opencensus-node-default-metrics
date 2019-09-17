const { MeasureUnit, MeasureType } = require('../metricsWrapper');
let v8;

try {
	v8 = require('v8');
} catch (e) {
	// node version is too old
	// probably we can use v8-heap-space-statistics for >=node-4.0.0 and <node-6.0.0
}

const METRICS = ['total', 'used', 'available'];

const NODEJS_HEAP_SIZE = {};

METRICS.forEach(metricType => {
	NODEJS_HEAP_SIZE[metricType] = `nodejs_heap_space_size_${metricType}_bytes`;
});

module.exports = (openCensusMetrics, config = {}) => {
	if (typeof v8 === 'undefined' || typeof v8.getHeapSpaceStatistics !== 'function') {
		return () => {};
	}

	const namePrefix = config.prefix ? config.prefix : '';

	const gauges = {};

	METRICS.forEach(metricType => {
		gauges[metricType] = openCensusMetrics.createGaugeMetric({
			name: namePrefix + NODEJS_HEAP_SIZE[metricType],
			desc: `Process heap space size ${metricType} from node.js in bytes.`,
			tags: ['space'],
			measure: {
				unit: MeasureUnit.BYTE,
				type: MeasureType.Int
			}
		});
	});

	return () => {
		const data = {
			total: {},
			used: {},
			available: {}
		};
		const now = Date.now();

		v8.getHeapSpaceStatistics().forEach(space => {
			const spaceName = space.space_name.substr(0, space.space_name.indexOf('_space'));

			data.total[spaceName] = space.space_size;
			data.used[spaceName] = space.space_used_size;
			data.available[spaceName] = space.space_available_size;

			gauges.total(space.space_size, [spaceName], now);
			gauges.used(space.space_used_size, [spaceName], now);
			gauges.available(space.space_available_size, [spaceName], now);
		});

		return data;
	};
};

module.exports.metricNames = METRICS.map(metricType => NODEJS_HEAP_SIZE[metricType]);
