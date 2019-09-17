const openCensusDefaulMetrics = require('../index');
openCensusDefaulMetrics.collectDefaultMetrics({ timeout: 1000, prefix: 'MyPrefix_' });

const { PrometheusStatsExporter } = require('@opencensus/exporter-prometheus');
const exporter = new PrometheusStatsExporter({
	port: 9464,
	startServer: true
});

openCensusDefaulMetrics.stats.registerExporter(exporter);
