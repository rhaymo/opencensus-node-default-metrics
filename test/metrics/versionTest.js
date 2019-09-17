const { globalStats } = require('@opencensus/core');
const { OpenCensusMetrics } = require('../../lib/metricsWrapper');

const nodeVersion = process.version;
const versionSegments = nodeVersion
	.slice(1)
	.split('.')
	.map(Number);

describe('version', () => {
	const openCensusMetrics = new OpenCensusMetrics(globalStats);

	const version = require('../../lib/metrics/version');

	beforeAll(() => {
		globalStats.clear();
	});

	afterEach(() => {
		globalStats.clear();
	});

	it('should add metric to the registry', done => {
		expect(globalStats.getMetrics()).toHaveLength(0);
		expect(typeof versionSegments[0]).toEqual('number');
		expect(typeof versionSegments[1]).toEqual('number');
		expect(typeof versionSegments[2]).toEqual('number');

		version(openCensusMetrics)();

		setTimeout(() => {
			const metrics = globalStats.getMetrics();
			expect(metrics).toHaveLength(1);

			expect(metrics[0].descriptor.description).toEqual('Node.js version info.');
			expect(metrics[0].descriptor.type).toEqual(1);
			expect(metrics[0].descriptor.name).toEqual('nodejs_version_info');
			/*	expect(metrics[0].values[0].labels.version).toEqual(nodeVersion);
			expect(metrics[0].values[0].labels.major).toEqual(versionSegments[0]);
			expect(metrics[0].values[0].labels.minor).toEqual(versionSegments[1]);
			expect(metrics[0].values[0].labels.patch).toEqual(versionSegments[2]);*/

			done();
		}, 5);
	});
});
