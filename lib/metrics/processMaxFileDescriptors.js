const fs = require('fs');

const { MeasureUnit, MeasureType } = require('../metricsWrapper');

const PROCESS_MAX_FDS = 'process_max_fds';

module.exports = (openCensusMetrics, config = {}) => {
	if (process.platform !== 'linux') {
		return () => {};
	}

	const namePrefix = config.prefix ? config.prefix : '';

	const fileDescriptorsGauge = openCensusMetrics.createGaugeMetric({
		name: namePrefix + PROCESS_MAX_FDS,
		desc: 'Maximum number of open file descriptors.',
		measure: {
			unit: MeasureUnit.UNIT,
			type: MeasureType.Int
		}
	});

	fs.readFile('/proc/sys/fs/file-max', 'utf8', (err, maxFds) => {
		if (err) {
			return;
		}

		fileDescriptorsGauge(Number(maxFds));
	});

	return () => {};
};

module.exports.metricNames = [PROCESS_MAX_FDS];
