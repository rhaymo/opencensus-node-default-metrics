const { globalStats } = require("@opencensus/core");
const { OpenCensusMetrics } = require("../../lib/metricsWrapper");

describe("heapSizeAndUsed", () => {
  const heapSizeAndUsed = require("../../lib/metrics/heapSizeAndUsed");
  const openCensusMetrics = new OpenCensusMetrics(globalStats);

  const memoryUsedFn = process.memoryUsage;

  afterEach(() => {
    process.memoryUsage = memoryUsedFn;
    globalStats.clear();
  });

  it("should return an empty function if memoryUsed does not exist", () => {
    process.memoryUsage = null;
    expect(heapSizeAndUsed(openCensusMetrics)()).toBeUndefined();
  });

  it("should set total heap size gauge with total from memoryUsage", () => {
    process.memoryUsage = function() {
      return { heapTotal: 1000, heapUsed: 500, external: 100 };
    };
    const totalGauge = heapSizeAndUsed(openCensusMetrics)().total.get();
    expect(totalGauge.values[0].value).toEqual(1000);
  });

  it("should set used gauge with used from memoryUsage", () => {
    process.memoryUsage = function() {
      return { heapTotal: 1000, heapUsed: 500, external: 100 };
    };
    const gauge = heapSizeAndUsed(openCensusMetrics)().used.get();
    expect(gauge.values[0].value).toEqual(500);
  });

  it("should set external gauge with external from memoryUsage", () => {
    process.memoryUsage = function() {
      return { heapTotal: 1000, heapUsed: 500, external: 100 };
    };
    const gauge = heapSizeAndUsed(openCensusMetrics)().external.get();
    expect(gauge.values[0].value).toEqual(100);
  });
});
