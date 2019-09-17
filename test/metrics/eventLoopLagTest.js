const { globalStats } = require('@opencensus/core');
const { OpenCensusMetrics } = require('../../lib/metricsWrapper');

describe('eventLoopLag', () => {
	const eventLoopLag = require('../../lib/metrics/eventLoopLag');
	const openCensusMetrics = new OpenCensusMetrics(globalStats);

	beforeAll(() => {
		globalStats.clear();
	});

	afterEach(() => {
		globalStats.clear();
	});

	it('should add metric to the registry', done => {
		expect(globalStats.getMetrics()).toHaveLength(0);
		eventLoopLag(openCensusMetrics)();

		setTimeout(() => {
			const metrics = globalStats.getMetrics();
			expect(metrics).toHaveLength(1);

			expect(metrics[0].descriptor.description).toEqual('Lag of event loop in seconds.');
			expect(metrics[0].descriptor.type).toEqual(2);
			expect(metrics[0].descriptor.name).toEqual('nodejs_eventloop_lag_seconds');

			done();
		}, 5);
	});
});
