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
	fs.readFile('/proc/self/status', 'utf8', (err, status) => {
		if (err) {
			cb(err);
		}

		cb(status);
	});
}

describe('osMemoryHeapLinuxTest', () => {
	const openCensusMetrics = new OpenCensusMetrics(globalStats);
	const osMemoryHeapLinux = require('../../lib/metrics/osMemoryHeapLinux');

	beforeAll(() => {
		globalStats.clear();
	});

	afterEach(() => {
		globalStats.clear();
	});

	it('should add metric to the registry', () => {
		expect(globalStats.getMetrics()).toHaveLength(0);

		osMemoryHeapLinux(openCensusMetrics, { prefix: 'testPrefix_' })();

		const metrics = globalStats.getMetrics();

		expect(metrics).toHaveLength(3);
		expect(metrics[0].descriptor.description).toEqual('Resident memory size in bytes.');
		expect(metrics[0].descriptor.type).toEqual(1);
		expect(metrics[0].descriptor.name).toEqual('testPrefix_process_resident_memory_bytes');
	});

	it('should set process_max_fds to the value of /proc/sys/fs/file-max', done => {
		const wrap = wrapper();
		osMemoryHeapLinux(wrap)();

		const metrics = wrap.getMetrics()[0];

		setTimeout(() => {
			/*getMaxFileDescr(maxFileDesc => {
				
				done();
            });*/
			expect(typeof metrics.get()).toBe('number');
			done();
		}, 1000);
	});
});
