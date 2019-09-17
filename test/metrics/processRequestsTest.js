const { globalStats } = require('@opencensus/core');
const { OpenCensusMetrics } = require('../../lib/metricsWrapper');

describe('processRequests', () => {
	const openCensusMetrics = new OpenCensusMetrics(globalStats);
	const processRequests = require('../../lib/metrics/processRequests');

	beforeAll(() => {
		globalStats.clear();
	});

	afterEach(() => {
		globalStats.clear();
	});

	it('should add metric to the registry', () => {
		expect(globalStats.getMetrics()).toHaveLength(0);

		processRequests(openCensusMetrics)();

		const metrics = globalStats.getMetrics();

		expect(metrics).toHaveLength(2);
		expect(metrics[0].descriptor.description).toEqual(
			'Number of active libuv requests grouped by request type. Every request type is C++ class name.'
		);
		expect(metrics[0].descriptor.type).toEqual(1);
		expect(metrics[0].descriptor.name).toEqual('nodejs_active_requests');

		expect(metrics[1].descriptor.description).toEqual('Total number of active requests.');
		expect(metrics[1].descriptor.type).toEqual(1);
		expect(metrics[1].descriptor.name).toEqual('nodejs_active_requests_total');
	});
});
