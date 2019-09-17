const processCpuTotal = require('./metrics/processCpuTotal');
const processStartTime = require('./metrics/processStartTime');
const osMemoryHeap = require('./metrics/osMemoryHeap');
const processOpenFileDescriptors = require('./metrics/processOpenFileDescriptors');
const processMaxFileDescriptors = require('./metrics/processMaxFileDescriptors');
const eventLoopLag = require('./metrics/eventLoopLag');
const processHandles = require('./metrics/processHandles');
const processRequests = require('./metrics/processRequests');
const heapSizeAndUsed = require('./metrics/heapSizeAndUsed');
const heapSpacesSizeAndUsed = require('./metrics/heapSpacesSizeAndUsed');
const version = require('./metrics/version');
const gcStats = require('./metrics/gcStats');

const { OpenCensusMetrics } = require('./metricsWrapper');

const metrics = {
	gcStats,
	processCpuTotal,
	processStartTime,
	osMemoryHeap,
	processOpenFileDescriptors,
	processMaxFileDescriptors,
	eventLoopLag,
	processHandles,
	processRequests,
	heapSizeAndUsed,
	heapSpacesSizeAndUsed,
	version
};
const metricsList = Object.keys(metrics);

let existingInterval = null;

module.exports = function startDefaultMetrics(globalStats, config) {
	let normalizedConfig = config;

	normalizedConfig = Object.assign(
		{
			timeout: 10000,
			stats: globalStats
		},
		normalizedConfig
	);

	const openCensusMetrics = new OpenCensusMetrics(normalizedConfig.stats);

	if (existingInterval !== null) {
		clearInterval(existingInterval);
	}

	const initialisedMetrics = metricsList.map(metric => {
		const defaultMetric = metrics[metric];

		return defaultMetric(openCensusMetrics, normalizedConfig);
	});

	function updateAllMetrics() {
		initialisedMetrics.forEach(metric => metric.call());
	}

	updateAllMetrics();

	existingInterval = setInterval(updateAllMetrics, normalizedConfig.timeout).unref();

	return existingInterval;
};

module.exports.metricsList = metricsList;
