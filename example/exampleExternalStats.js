const { globalStats } = require('@opencensus/core');
const openCensusDefaulMetrics = require('../index');
openCensusDefaulMetrics.collectDefaultMetrics({ timeout: 1000, stats: globalStats });

const { PrometheusStatsExporter } = require('@opencensus/exporter-prometheus');
const exporter = new PrometheusStatsExporter({
	port: 9464,
	startServer: true
});

globalStats.registerExporter(exporter);
