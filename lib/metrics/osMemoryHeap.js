const { MeasureUnit, MeasureType } = require('../metricsWrapper');
const linuxVariant = require('./osMemoryHeapLinux');
const safeMemoryUsage = require('./helpers/safeMemoryUsage');

const PROCESS_RESIDENT_MEMORY = 'process_resident_memory_bytes';

function notLinuxVariant(openCensusMetrics, config = {}) {
	const namePrefix = config.prefix ? config.prefix : '';

	const residentMemGauge = openCensusMetrics.createGaugeMetric({
		name: namePrefix + PROCESS_RESIDENT_MEMORY,
		desc: 'Resident memory size in bytes.',
		measure: {
			unit: MeasureUnit.BYTE,
			type: MeasureType.Int
		}
	});

	return () => {
		const memUsage = safeMemoryUsage();

		if (memUsage) {
			residentMemGauge(memUsage.rss);
		}
	};
}

module.exports = (registry, config) =>
	process.platform === 'linux' ? linuxVariant(registry, config) : notLinuxVariant(registry, config);

module.exports.metricNames =
	process.platform === 'linux' ? linuxVariant.metricNames : [PROCESS_RESIDENT_MEMORY];
