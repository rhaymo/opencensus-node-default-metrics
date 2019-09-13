const openCensusDefaulMetrics = require("./index");
openCensusDefaulMetrics.collectDefaultMetrics(1000);

const { PrometheusStatsExporter } = require("@opencensus/exporter-prometheus");
const exporter = new PrometheusStatsExporter({
  port: 9464,
  startServer: true
});

openCensusDefaulMetrics.stats.registerExporter(exporter);

const client = require("prom-client");
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 1000, prefix: "pippo" });

const fastifyBuilder = require("fastify");
const fastify = fastifyBuilder({});

fastify.get(
  "/info",
  {
    schema: { hide: true }
  },
  async (request, reply) => {
    reply.send(client.register.metrics());
  }
);

fastify.listen(process.env.PORT || 5000, "0.0.0.0");
console.log("started");
