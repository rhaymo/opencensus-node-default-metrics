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

describe('gcStats', () => {
	const openCensusMetrics = new OpenCensusMetrics(globalStats);
	const gcStats = require('../../lib/metrics/gcStats');

	beforeAll(() => {
		globalStats.clear();
	});

	afterEach(() => {
		globalStats.clear();
	});

	it('should add metric to the registry', () => {
		expect(globalStats.getMetrics()).toHaveLength(0);

		gcStats(openCensusMetrics, { prefix: 'testPrefix_' })();

		const metrics = globalStats.getMetrics();

		expect(metrics).toHaveLength(3);
		expect(metrics[0].descriptor.description).toEqual('Count of total garbage collections.');
		expect(metrics[0].descriptor.type).toEqual(4);
		expect(metrics[0].descriptor.name).toEqual('testPrefix_nodejs_gc_runs_total');
	});

	it('listener should extract metric from gc stats event', () => {
		const statEvent = {
			startTime: 9426055813976,
			endTime: 9426057735390,
			pause: 1921414,
			pauseMS: 1,
			gctype: 2,
			before: {
				totalHeapSize: 11354112,
				totalHeapExecutableSize: 3670016,
				usedHeapSize: 7457184,
				heapSizeLimit: 1501560832,
				totalPhysicalSize: 9725880,
				totalAvailableSize: 1488434544,
				mallocedMemory: 8192,
				peakMallocedMemory: 1186040
			},
			after: {
				totalHeapSize: 12402688,
				totalHeapExecutableSize: 3670016,
				usedHeapSize: 6485792,
				heapSizeLimit: 1501560832,
				totalPhysicalSize: 10166144,
				totalAvailableSize: 1489388528,
				mallocedMemory: 8192,
				peakMallocedMemory: 1186040
			},
			diff: {
				totalHeapSize: 1048576,
				totalHeapExecutableSize: 0,
				usedHeapSize: -971392,
				heapSizeLimit: 0,
				totalPhysicalSize: 440264,
				totalAvailableSize: 953984,
				mallocedMemory: 0,
				peakMallocedMemory: 0
			}
		};
		gcStats.statListener(
			statEvent,
			(value, type) => {
				expect(value).toEqual(1);
				expect(type).toEqual(['MarkSweepCompact']);
			},
			(value, type) => {
				expect(typeof value).toBe('number');
				expect(type).toEqual(['MarkSweepCompact']);
			},
			(value, type) => {
				expect(typeof value).toBe('number');
				expect(type).toEqual(['MarkSweepCompact']);
			}
		);
	});

	it('if usedHeapSize>0 it is not reported', () => {
		const statEvent = {
			startTime: 9426055813976,
			endTime: 9426057735390,
			pause: 1921414,
			pauseMS: 1,
			gctype: 2,
			before: {
				totalHeapSize: 11354112,
				totalHeapExecutableSize: 3670016,
				usedHeapSize: 7457184,
				heapSizeLimit: 1501560832,
				totalPhysicalSize: 9725880,
				totalAvailableSize: 1488434544,
				mallocedMemory: 8192,
				peakMallocedMemory: 1186040
			},
			after: {
				totalHeapSize: 12402688,
				totalHeapExecutableSize: 3670016,
				usedHeapSize: 6485792,
				heapSizeLimit: 1501560832,
				totalPhysicalSize: 10166144,
				totalAvailableSize: 1489388528,
				mallocedMemory: 8192,
				peakMallocedMemory: 1186040
			},
			diff: {
				totalHeapSize: 1048576,
				totalHeapExecutableSize: 0,
				usedHeapSize: 98,
				heapSizeLimit: 0,
				totalPhysicalSize: 440264,
				totalAvailableSize: 953984,
				mallocedMemory: 0,
				peakMallocedMemory: 0
			}
		};
		gcStats.statListener(
			statEvent,
			(value, type) => {
				expect(value).toEqual(1);
				expect(type).toEqual(['MarkSweepCompact']);
			},
			(value, type) => {
				expect(typeof value).toBe('number');
				expect(type).toEqual(['MarkSweepCompact']);
			}
		);
	});
});
