const fs = require("fs");
const process = require("process");

const { MeasureUnit, MeasureType } = require("../metricsWrapper");

const PROCESS_OPEN_FDS = "process_open_fds";

module.exports = (openCensusMetrics, config = {}) => {
  if (process.platform !== "linux") {
    return () => {};
  }

  const namePrefix = config.prefix ? config.prefix : "";

  const fileDescriptorsGauge = openCensusMetrics.createGaugeMetric({
    name: namePrefix + PROCESS_OPEN_FDS,
    desc: "Number of open file descriptors.",
    measure: {
      unit: MeasureUnit.UNIT,
      type: MeasureType.Int
    }
  });

  return () => {
    fs.readdir("/proc/self/fd", (err, list) => {
      if (err) {
        return;
      }

      // Minus 1, as this invocation created one
      fileDescriptorsGauge(list.length - 1);
    });
  };
};

module.exports.metricNames = [PROCESS_OPEN_FDS];
