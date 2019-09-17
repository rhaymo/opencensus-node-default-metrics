const { globalStats } = require('@opencensus/core');
const collectDefaultMetrics = require('./lib/defaultMetrics');

module.exports.stats = globalStats;
module.exports.collectDefaultMetrics = collectDefaultMetrics.bind(
	collectDefaultMetrics,
	globalStats
);
module.exports.metricsList = collectDefaultMetrics.metricsList;
