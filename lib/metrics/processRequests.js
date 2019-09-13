const { MeasureUnit, MeasureType } = require("../metricsWrapper");
const { aggregateByObjectName } = require("./helpers/processMetricsHelpers");
const { updateMetrics } = require("./helpers/processMetricsHelpers");

const NODEJS_ACTIVE_REQUESTS = "nodejs_active_requests";
const NODEJS_ACTIVE_REQUESTS_TOTAL = "nodejs_active_requests_total";

module.exports = (openCensusMetrics, config = {}) => {
  // Don't do anything if the function is removed in later nodes (exists in node@6)
  if (typeof process._getActiveRequests !== "function") {
    return () => {};
  }

  const namePrefix = config.prefix ? config.prefix : "";

  const gauge = openCensusMetrics.createGaugeMetric({
    name: namePrefix + NODEJS_ACTIVE_REQUESTS,
    desc:
      "Number of active libuv requests grouped by request type. Every request type is C++ class name.",
    tags: ["type"],
    measure: {
      unit: MeasureUnit.UNIT,
      type: MeasureType.Int
    }
  });

  const totalGauge = openCensusMetrics.createGaugeMetric({
    name: namePrefix + NODEJS_ACTIVE_REQUESTS_TOTAL,
    desc: "Total number of active requests.",
    measure: {
      unit: MeasureUnit.UNIT,
      type: MeasureType.Int
    }
  });

  return () => {
    const requests = process._getActiveRequests();
    updateMetrics(gauge, aggregateByObjectName(requests));
    totalGauge(requests.length, Date.now());
  };
};

module.exports.metricNames = [NODEJS_ACTIVE_REQUESTS, NODEJS_ACTIVE_REQUESTS_TOTAL];
