const fs = require("fs");

const { MeasureUnit, MeasureType } = require("../metricsWrapper");

const PROCESS_MAX_FDS = "process_max_fds";

module.exports = (openCensusMetrics, config = {}) => {
  let isSet = false;

  if (process.platform !== "linux") {
    return () => {};
  }

  const namePrefix = config.prefix ? config.prefix : "";

  const fileDescriptorsGauge = openCensusMetrics.createGaugeMetric({
    name: namePrefix + PROCESS_MAX_FDS,
    desc: "Maximum number of open file descriptors.",
    measure: {
      unit: MeasureUnit.UNIT,
      type: MeasureType.Int
    }
  });

  return () => {
    if (isSet) {
      return;
    }

    fs.readFile("/proc/sys/fs/file-max", "utf8", (err, maxFds) => {
      if (err) {
        return;
      }

      isSet = true;

      fileDescriptorsGauge(Number(maxFds));
    });
  };
};

module.exports.metricNames = [PROCESS_MAX_FDS];
