const fs = require('fs');

const { globalStats } = require('@opencensus/core');
const { OpenCensusMetrics } = require('../../lib/metricsWrapper');

const wrapper = () => {
	const metrics = [];
	function createGaugeMetric() {
		let value;
		const setter = _value => (value = _value);
		const get = () => value;
		const objReturn = setter;
		objReturn.get = get;
		metrics.push(objReturn);
		return objReturn;
	}

	function getMetrics() {
		return metrics;
	}

	return { createGaugeMetric, getMetrics };
};

describe('osMemoryHeap', () => {
	const openCensusMetrics = new OpenCensusMetrics(globalStats);
	const osMemoryHeap = require('../../lib/metrics/osMemoryHeap');

	const memoryUsedFn = process.memoryUsage;
	const platform = process.platform;

	beforeEach(() => {
		Object.defineProperty(process, 'platform', {
			value: 'my-bogus-platform'
		});
		globalStats.clear();
	});

	afterEach(() => {
		Object.defineProperty(process, 'platform', {
			value: platform
		});

		process.memoryUsage = memoryUsedFn;
		globalStats.clear();
	});

	it('should add metric to the registry', () => {
		expect(globalStats.getMetrics()).toHaveLength(0);

		osMemoryHeap(openCensusMetrics, { prefix: 'testPrefix_' })();

		const metrics = globalStats.getMetrics();

		expect(metrics).toHaveLength(1);
		expect(metrics[0].descriptor.description).toEqual('Resident memory size in bytes.');
		expect(metrics[0].descriptor.type).toEqual(1);
		expect(metrics[0].descriptor.name).toEqual('testPrefix_process_resident_memory_bytes');
	});

	it('if memusage is not defined, metric is not updated', () => {
		process.memoryUsage = null;
		const wrap = wrapper();

		osMemoryHeap(wrap)();

		expect(wrap.getMetrics()).toHaveLength(1);
		const metrics = wrap.getMetrics()[0];
		expect(metrics.get()).toEqual(undefined);
	});
});
