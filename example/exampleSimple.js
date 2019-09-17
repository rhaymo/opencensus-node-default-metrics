const openCensusDefaulMetrics = require('../index');
openCensusDefaulMetrics.collectDefaultMetrics({ timeout: 1000 });

const { PrometheusStatsExporter } = require('@opencensus/exporter-prometheus');
const exporter = new PrometheusStatsExporter({
	port: 9464,
	startServer: true
});

openCensusDefaulMetrics.stats.registerExporter(exporter);
console.log(openCensusDefaulMetrics.metricsList);
/*
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 1000, prefix: 'pippo' });

const gcStats = require('prometheus-gc-stats');
gcStats(client.register, { prefix: 'pippo_' })();

const fastify = require('fastify')({});

fastify.get(
	'/info',
	{
		schema: { hide: true }
	},
	async (request, reply) => {
		reply.send(client.register.metrics());
	}
);

fastify.listen(process.env.PORT || 5000, '0.0.0.0');
console.log('started');
*/
