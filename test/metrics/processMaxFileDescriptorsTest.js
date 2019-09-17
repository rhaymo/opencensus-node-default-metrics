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

function getMaxFileDescr(cb) {
	fs.readFile('/proc/sys/fs/file-max', 'utf8', (err, maxFds) => {
		if (err) {
			cb(err);
		}

		cb(Number(maxFds));
	});
}

describe('processMaxFileDescriptors', () => {
	const openCensusMetrics = new OpenCensusMetrics(globalStats);
	const processMaxFileDescriptors = require('../../lib/metrics/processMaxFileDescriptors');

	jest.mock(
		'process',
		() => Object.assign({}, jest.requireActual('process'), { platform: 'linux' }) // This metric only works on Linux
	);

	beforeAll(() => {
		globalStats.clear();
	});

	afterEach(() => {
		globalStats.clear();
	});

	it('should add metric to the registry', () => {
		expect(globalStats.getMetrics()).toHaveLength(0);

		processMaxFileDescriptors(openCensusMetrics, { prefix: 'testPrefix_' })();

		const metrics = globalStats.getMetrics();

		expect(metrics).toHaveLength(1);
		expect(metrics[0].descriptor.description).toEqual('Maximum number of open file descriptors.');
		expect(metrics[0].descriptor.type).toEqual(1);
		expect(metrics[0].descriptor.name).toEqual('testPrefix_process_max_fds');
	});

	it('should set process_max_fds to the value of /proc/sys/fs/file-max', done => {
		const wrap = wrapper();
		processMaxFileDescriptors(wrap)();

		const metrics = wrap.getMetrics()[0];

		setTimeout(() => {
			getMaxFileDescr(maxFileDesc => {
				expect(metrics.get()).toEqual(maxFileDesc);
				done();
			});
		}, 1000);
	});
});
