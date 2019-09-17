const { MeasureUnit, MeasureType } = require('../metricsWrapper');

const version = process.version;
const versionSegments = version
	.slice(1)
	.split('.')
	.map(Number);

const NODE_VERSION_INFO = 'nodejs_version_info';

module.exports = (openCensusMetrics, config = {}) => {
	const namePrefix = config.prefix ? config.prefix : '';

	const nodeVersionGauge = openCensusMetrics.createGaugeMetric({
		name: namePrefix + NODE_VERSION_INFO,
		desc: 'Node.js version info.',
		tags: ['version', 'major', 'minor', 'patch'],
		measure: {
			unit: MeasureUnit.UNIT,
			type: MeasureType.Int
		}
	});
	let isSet = false;

	return () => {
		if (isSet) {
			return;
		}
		nodeVersionGauge(1, [
			version,
			`${versionSegments[0]}`,
			`${versionSegments[1]}`,
			`${versionSegments[2]}`
		]);
		isSet = true;
	};
};

module.exports.metricNames = [NODE_VERSION_INFO];
