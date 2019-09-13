const { AggregationType, TagMap, MeasureUnit } = require("@opencensus/core");

/* const MeasureUnit = {
    UNIT = "UNIT",
    BYTE = "BYTE",
    KBYTE = "KBYTE",
    SEC = "SEC",
    MS = "MS",
    NS = "NS"
}; */
const MeasureType = {
  Double: "Double",
  Int: "Int"
};

function OpenCensusMetrics(stats) {
  function createTagsObjectArrayFromString(tags) {
    const tagsObjectArray = [];
    if (tags) {
      tags.forEach(element => {
        tagsObjectArray.push({ name: element });
      });
    }
    return tagsObjectArray;
  }

  function createMetrics({ name, desc, unit, type }) {
    // The latency in milliseconds
    if (type === MeasureType.Double) {
      return stats.createMeasureDouble(name, MeasureUnit[unit], desc);
    }
    if (type === MeasureType.Int) {
      return stats.createMeasureInt64(name, MeasureUnit[unit], desc);
    }
  }

  function createView({ name, desc, buckets, tags, measure }, aggregation) {
    let _measure = measure;
    if (measure.unit && measure.type) {
      _measure = createMetrics({
        name,
        desc,
        unit: measure.unit,
        type: measure.type
      });
    }
    const tagsObjectArray = createTagsObjectArrayFromString(tags);
    const metric = stats.createView(name, _measure, aggregation, tagsObjectArray, desc, buckets);
    stats.registerView(metric);
    const recordValue = recordMeasurement.bind(recordMeasurement, _measure, tagsObjectArray);
    return (value, tagsValue) => recordValue(value, tagsValue);
  }

  function createDistributionMetric({ name, desc, buckets, tags, measure }) {
    /* const tagsObjectArray = createTagsObjectArrayFromString(tags);
         const distributionMetric = stats.createView(
             name,
             measure,
             AggregationType.DISTRIBUTION,
             tagsObjectArray,
             desc,
             buckets
         );
         stats.registerView(distributionMetric);

         const recordValue = recordMeasurement.bind(recordMeasurement,measure, tagsObjectArray);
         return (value, tagsValue)=>recordValue(value, tagsValue); */

    return createView({ name, desc, buckets, tags, measure }, AggregationType.DISTRIBUTION);
  }

  function createGaugeMetric({ name, desc, tags, measure }) {
    /* const tagsObjectArray = createTagsObjectArrayFromString(tags);
         const gaugeMetric = stats.createView(
             name,
             this.mLatency,
             AggregationType.LastValue,
             tagsObjectArray,
             desc
         );
         stats.registerView(gaugeMetric);

         const recordValue = recordMeasurement.bind(recordMeasurement,measure, tagsObjectArray);
         return (value, tagsValue)=>recordValue(value, tagsValue); */

    return createView(
      {
        name,
        desc,
        tags,
        measure
      },
      AggregationType.LAST_VALUE
    );
  }

  function createCounterMetric({ name, desc, tags, measure }) {
    /* const tagsObjectArray = createTagsObjectArrayFromString(tags);
        const counterMetric = stats.createView(
            name,
            measure,
            AggregationType.COUNT,
            tagsObjectArray,
            desc
        );
        stats.registerView(counterMetric);

        const recordValue = recordMeasurement.bind(recordMeasurement,measure, tagsObjectArray);
        return (value, tagsValue)=>recordValue(value, tagsValue); */

    return createView(
      {
        name,
        desc,
        tags,
        measure
      },
      AggregationType.COUNT
    );
  }

  function createSumMetric({ name, desc, tags, measure }) {
    /* const tagsObjectArray = createTagsObjectArrayFromString(tags);
        const sumMetric = stats.createView(
            name,
            this.mLatency,
            AggregationType.SUM,
            tagsObjectArray,
            desc
        );
        stats.registerView(sumMetric);

        const recordValue = recordMeasurement.bind(recordMeasurement,measure, tagsObjectArray);
        return (value, tagsValue)=>recordValue(value, tagsValue); */

    return createView({ name, desc, tags, measure }, AggregationType.SUM);
  }

  function recordMeasurement(measure, tagsKey, value, tagsValue) {
    const tags = new TagMap();
    if (tagsValue) {
      for (let index = 0; index < tagsValue.length; index++) {
        tags.set(tagsKey[index], { value: tagsValue[index] });
      }
    }
    stats.record([{ measure, value }], tags);
  }

  return Object.freeze({
    createDistributionMetric,
    createGaugeMetric,
    createCounterMetric,
    createSumMetric
  });
}

module.exports.OpenCensusMetrics = OpenCensusMetrics;

module.exports.MeasureUnit = MeasureUnit;

module.exports.MeasureType = MeasureType;
