const { MeasureUnit, MeasureType } = require("../metricsWrapper");
const safeMemoryUsage = require("./helpers/safeMemoryUsage");

const NODEJS_HEAP_SIZE_TOTAL = "nodejs_heap_size_total_bytes";
const NODEJS_HEAP_SIZE_USED = "nodejs_heap_size_used_bytes";
const NODEJS_EXTERNAL_MEMORY = "nodejs_external_memory_bytes";

module.exports = (openCensusMetrics, config = {}) => {
  if (typeof process.memoryUsage !== "function") {
    return () => {};
  }

  const namePrefix = config.prefix ? config.prefix : "";

  const heapSizeTotal = openCensusMetrics.createGaugeMetric({
    name: namePrefix + NODEJS_HEAP_SIZE_TOTAL,
    desc: "Process heap size from node.js in bytes.",
    measure: {
      unit: MeasureUnit.BYTE,
      type: MeasureType.Int
    }
  });
  const heapSizeUsed = openCensusMetrics.createGaugeMetric({
    name: namePrefix + NODEJS_HEAP_SIZE_USED,
    desc: "Process heap size used from node.js in bytes.",
    measure: {
      unit: MeasureUnit.BYTE,
      type: MeasureType.Int
    }
  });
  let externalMemUsed;

  const usage = safeMemoryUsage();
  if (usage && usage.external) {
    externalMemUsed = openCensusMetrics.createGaugeMetric({
      name: namePrefix + NODEJS_EXTERNAL_MEMORY,
      desc: "Nodejs external memory size in bytes.",
      measure: {
        unit: MeasureUnit.BYTE,
        type: MeasureType.Int
      }
    });
  }

  return () => {
    // process.memoryUsage() can throw EMFILE errors, see #67
    const memUsage = safeMemoryUsage();
    if (memUsage) {
      heapSizeTotal(memUsage.heapTotal);
      heapSizeUsed(memUsage.heapUsed);
      if (memUsage.external && externalMemUsed) {
        externalMemUsed(memUsage.external);
      }
    }

    return {
      total: heapSizeTotal,
      used: heapSizeUsed,
      external: externalMemUsed
    };
  };
};

module.exports.metricNames = [
  NODEJS_HEAP_SIZE_TOTAL,
  NODEJS_HEAP_SIZE_USED,
  NODEJS_EXTERNAL_MEMORY
];
