const { globalStats } = require('@opencensus/core');
const { OpenCensusMetrics } = require('../../lib/metricsWrapper');
jest.mock('v8', () => {
	return {
		getHeapSpaceStatistics() {
			return [
				{
					space_name: 'new_space',
					space_size: 100,
					space_used_size: 50,
					space_available_size: 500,
					physical_space_size: 100
				},
				{
					space_name: 'old_space',
					space_size: 100,
					space_used_size: 50,
					space_available_size: 500,
					physical_space_size: 100
				},
				{
					space_name: 'code_space',
					space_size: 100,
					space_used_size: 50,
					space_available_size: 500,
					physical_space_size: 100
				},
				{
					space_name: 'map_space',
					space_size: 100,
					space_used_size: 50,
					space_available_size: 500,
					physical_space_size: 100
				},
				{
					space_name: 'large_object_space',
					space_size: 100,
					space_used_size: 50,
					space_available_size: 500,
					physical_space_size: 100
				}
			];
		}
	};
});

describe('heapSpacesSizeAndUsed', () => {
	let heapSpacesSizeAndUsed;

	beforeEach(() => {
		heapSpacesSizeAndUsed = require('../../lib/metrics/heapSpacesSizeAndUsed');
	});

	afterEach(() => {
		globalStats.clear();
	});

	it('should set total heap spaces size gauges with from v8', () => {
		const openCensusMetrics = new OpenCensusMetrics(globalStats);
		const expectedObj = {
			total: { new: 100, old: 100, code: 100, map: 100, large_object: 100 },
			used: { new: 50, old: 50, code: 50, map: 50, large_object: 50 },
			available: { new: 500, old: 500, code: 500, map: 500, large_object: 500 }
		};

		expect(heapSpacesSizeAndUsed(openCensusMetrics)()).toEqual(expectedObj);
	});
});
