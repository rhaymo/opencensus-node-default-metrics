const fs = require('fs');
const { MeasureUnit, MeasureType } = require('../metricsWrapper');

const values = ['VmSize', 'VmRSS', 'VmData'];

const PROCESS_RESIDENT_MEMORY = 'process_resident_memory_bytes';
const PROCESS_VIRTUAL_MEMORY = 'process_virtual_memory_bytes';
const PROCESS_HEAP = 'process_heap_bytes';

function structureOutput(input) {
	const returnValue = {};

	input
		.split('\n')
		.filter(s => values.some(value => s.indexOf(value) === 0))
		.forEach(string => {
			const split = string.split(':');

			// Get the value
			let value = split[1].trim();
			// Remove trailing ` kb`
			value = value.substr(0, value.length - 3);
			// Make it into a number in bytes bytes
			value = Number(value) * 1024;

			returnValue[split[0]] = value;
		});

	return returnValue;
}

module.exports = (openCensusMetrics, config = {}) => {
	const namePrefix = config.prefix ? config.prefix : '';

	const residentMemGauge = openCensusMetrics.createGaugeMetric({
		name: namePrefix + PROCESS_RESIDENT_MEMORY,
		desc: 'Resident memory size in bytes.',
		measure: {
			unit: MeasureUnit.BYTE,
			type: MeasureType.Int
		}
	});
	const virtualMemGauge = openCensusMetrics.createGaugeMetric({
		name: namePrefix + PROCESS_VIRTUAL_MEMORY,
		desc: 'Virtual memory size in bytes.',
		measure: {
			unit: MeasureUnit.BYTE,
			type: MeasureType.Int
		}
	});
	const heapSizeMemGauge = openCensusMetrics.createGaugeMetric({
		name: namePrefix + PROCESS_HEAP,
		desc: 'Process heap size in bytes.',
		measure: {
			unit: MeasureUnit.BYTE,
			type: MeasureType.Int
		}
	});

	return () => {
		fs.readFile('/proc/self/status', 'utf8', (err, status) => {
			if (err) {
				return;
			}

			const structuredOutput = structureOutput(status);

			residentMemGauge(structuredOutput.VmRSS);
			virtualMemGauge(structuredOutput.VmSize);
			heapSizeMemGauge(structuredOutput.VmData);
		});
	};
};

module.exports.metricNames = [PROCESS_RESIDENT_MEMORY, PROCESS_VIRTUAL_MEMORY, PROCESS_HEAP];
