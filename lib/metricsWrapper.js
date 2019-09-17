const { AggregationType, TagMap, MeasureUnit } = require('@opencensus/core');

const MeasureType = {
	Double: 'Double',
	Int: 'Int'
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
		return createView({ name, desc, buckets, tags, measure }, AggregationType.DISTRIBUTION);
	}

	function createGaugeMetric({ name, desc, tags, measure }) {
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
