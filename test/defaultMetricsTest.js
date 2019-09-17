const { globalStats } = require('@opencensus/core');
const { OpenCensusMetrics } = require('../lib/metricsWrapper');

describe('collectDefaultMetrics', () => {
	const openCensusMetrics = new OpenCensusMetrics(globalStats);
	const collectDefaultMetrics = require('../index').collectDefaultMetrics;
	let platform;
	let cpuUsage;
	let interval;

	beforeAll(() => {
		platform = process.platform;
		cpuUsage = process.cpuUsage;

		Object.defineProperty(process, 'platform', {
			value: 'my-bogus-platform'
		});

		if (cpuUsage) {
			Object.defineProperty(process, 'cpuUsage', {
				value() {
					return { user: 1000, system: 10 };
				}
			});
		} else {
			process.cpuUsage = function() {
				return { user: 1000, system: 10 };
			};
		}

		globalStats.clear();
	});

	afterAll(() => {
		Object.defineProperty(process, 'platform', {
			value: platform
		});

		if (cpuUsage) {
			Object.defineProperty(process, 'cpuUsage', {
				value: cpuUsage
			});
		} else {
			delete process.cpuUsage;
		}
	});

	afterEach(() => {
		globalStats.clear();
		clearInterval(interval);
	});

	it('should add metrics to the registry', () => {
		expect(globalStats.getMetrics()).toHaveLength(0);
		interval = collectDefaultMetrics();
		expect(globalStats.getMetrics()).not.toHaveLength(0);
	});

	it('should allow blacklisting all metrics', () => {
		expect(globalStats.getMetrics()).toHaveLength(0);
		clearInterval(collectDefaultMetrics());
		globalStats.clear();
		expect(globalStats.getMetrics()).toHaveLength(0);
	});

	it('should prefix metric names when configured', () => {
		interval = collectDefaultMetrics({ prefix: 'some_prefix_' });
		expect(globalStats.getMetrics()).not.toHaveLength(0);
		globalStats.getMetrics().forEach(metric => {
			expect(metric.descriptor.name.substring(0, 12)).toEqual('some_prefix_');
		});
	});

	describe('disabling', () => {
		it('should not throw error', () => {
			const fn = function() {
				delete require.cache[require.resolve('../index')];
				const client = require('../index');
				clearInterval(client.collectDefaultMetrics());
				globalStats.clear();
			};

			expect(fn).not.toThrowError(Error);
		});
	});

	describe('custom registry', () => {
		it('should allow to register metrics to custom registry', () => {
			expect(globalStats.getMetrics()).toHaveLength(0);
			expect(globalStats.getMetrics()).toHaveLength(0);

			interval = collectDefaultMetrics({ stats: globalStats });

			expect(globalStats.getMetrics()).not.toHaveLength(0);
		});
	});
});
