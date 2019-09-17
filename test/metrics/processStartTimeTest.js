const { globalStats } = require('@opencensus/core');
const { OpenCensusMetrics } = require('../../lib/metricsWrapper');

describe('processStartTime', () => {
	const openCensusMetrics = new OpenCensusMetrics(globalStats);
	const processStartTime = require('../../lib/metrics/processStartTime');

	beforeAll(() => {
		globalStats.clear();
	});

	afterEach(() => {
		globalStats.clear();
	});

	it('should add metric to the registry', () => {
		expect(globalStats.getMetrics()).toHaveLength(0);

		processStartTime(openCensusMetrics)();

		const metrics = globalStats.getMetrics();

		expect(metrics).toHaveLength(1);
		expect(metrics[0].descriptor.description).toEqual(
			'Start time of the process since unix epoch in seconds.'
		);
		expect(metrics[0].descriptor.type).toEqual(2);
		expect(metrics[0].descriptor.name).toEqual('process_start_time_seconds');
	});
});
