const { globalStats } = require('@opencensus/core');
const { OpenCensusMetrics } = require('../../lib/metricsWrapper');

describe('processHandles', () => {
	const register = require('../../index').register;
	const processHandles = require('../../lib/metrics/processHandles');
	const openCensusMetrics = new OpenCensusMetrics(globalStats);

	beforeAll(() => {
		globalStats.clear();
	});

	afterEach(() => {
		globalStats.clear();
	});

	it('should add metric to the registry', () => {
		expect(globalStats.getMetrics()).toHaveLength(0);

		processHandles(openCensusMetrics)();

		const metrics = globalStats.getMetrics();

		expect(metrics).toHaveLength(2);

		expect(metrics[0].descriptor.description).toEqual(
			'Number of active libuv handles grouped by handle type. Every handle type is C++ class name.'
		);
		expect(metrics[0].descriptor.labelKeys[0].key).toEqual('type');
		expect(metrics[0].descriptor.type).toEqual(1);
		expect(metrics[0].descriptor.name).toEqual('nodejs_active_handles');

		expect(metrics[1].descriptor.description).toEqual('Total number of active handles.');
		expect(metrics[1].descriptor.type).toEqual(1);
		expect(metrics[1].descriptor.name).toEqual('nodejs_active_handles_total');
	});
});
