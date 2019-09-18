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

function getOpenFileDescr(cb) {
	fs.readdir('/proc/self/fd', (err, list) => {
		if (err) {
			cb(err);
		}

		cb(list.length - 1);
	});
}

describe('processOpenFileDescriptors', () => {
	const openCensusMetrics = new OpenCensusMetrics(globalStats);
	const processOpenFileDescriptors = require('../../lib/metrics/processOpenFileDescriptors');

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

		processOpenFileDescriptors(openCensusMetrics, { prefix: 'testPrefix_' })();

		const metrics = globalStats.getMetrics();

		expect(metrics).toHaveLength(1);
		expect(metrics[0].descriptor.description).toEqual('Number of open file descriptors.');
		expect(metrics[0].descriptor.type).toEqual(1);
		expect(metrics[0].descriptor.name).toEqual('testPrefix_process_open_fds');
	});

	it('should set process_open_fds to the value of /proc/self/fd', done => {
		const wrap = wrapper();
		processOpenFileDescriptors(wrap)();

		getOpenFileDescr(maxOpenFileDesc => {
			setTimeout(() => {
				const metrics = wrap.getMetrics()[0];
				expect(metrics.get()).toEqual(maxOpenFileDesc);
				done();
			}, 1000);
		});
	});
});
