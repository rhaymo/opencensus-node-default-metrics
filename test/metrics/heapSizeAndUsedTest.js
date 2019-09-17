const wrapper = {
	createGaugeMetric() {
		let value;
		const setter = _value => (value = _value);
		const get = () => value;
		const objReturn = setter;
		objReturn.get = get;
		return objReturn;
	}
};

describe('heapSizeAndUsed', () => {
	const heapSizeAndUsed = require('../../lib/metrics/heapSizeAndUsed');

	const memoryUsedFn = process.memoryUsage;

	afterEach(() => {
		process.memoryUsage = memoryUsedFn;
	});

	it('should return an empty function if memoryUsed does not exist', () => {
		process.memoryUsage = null;
		expect(heapSizeAndUsed(wrapper)()).toBeUndefined();
	});

	it('should set total heap size gauge with total from memoryUsage', () => {
		process.memoryUsage = function() {
			return { heapTotal: 1000, heapUsed: 500, external: 100 };
		};
		const totalGauge = heapSizeAndUsed(wrapper)().total.get();
		expect(totalGauge).toEqual(1000);
	});

	it('should set used gauge with used from memoryUsage', () => {
		process.memoryUsage = function() {
			return { heapTotal: 1000, heapUsed: 500, external: 100 };
		};
		const gauge = heapSizeAndUsed(wrapper)().used.get();
		expect(gauge).toEqual(500);
	});

	it('should set external gauge with external from memoryUsage', () => {
		process.memoryUsage = function() {
			return { heapTotal: 1000, heapUsed: 500, external: 100 };
		};
		const gauge = heapSizeAndUsed(wrapper)().external.get();
		expect(gauge).toEqual(100);
	});
});
