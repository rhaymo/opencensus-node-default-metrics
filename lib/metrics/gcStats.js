// Credits go to @tcolgate

const { MeasureUnit, MeasureType } = require('../metricsWrapper');

const gc = require('gc-stats');

const gcTypes = {
	0: 'Unknown',
	1: 'Scavenge',
	2: 'MarkSweepCompact',
	3: 'ScavengeAndMarkSweepCompact',
	4: 'IncrementalMarking',
	8: 'WeakPhantom',
	15: 'All'
};

const noop = () => {};

function statListener(stats, gcCount, gcTimeCount, gcReclaimedCount) {
	const gcType = gcTypes[stats.gctype];

	gcCount(1, [gcType]);
	gcTimeCount(stats.pause / 1e9, [gcType]);

	if (stats.diff.usedHeapSize < 0) {
		gcReclaimedCount(stats.diff.usedHeapSize * -1, [gcType]);
	}
}

module.exports = (openCensusMetrics, config = {}) => {
	if (typeof gc !== 'function') {
		return noop;
	}

	const tags = ['gctype'];

	const namePrefix = config.prefix ? config.prefix : '';

	const gcCount = openCensusMetrics.createCounterMetric({
		name: `${namePrefix}nodejs_gc_runs_total`,
		desc: 'Count of total garbage collections.',
		tags,
		measure: {
			unit: MeasureUnit.UNIT,
			type: MeasureType.Int
		}
	});
	const gcTimeCount = openCensusMetrics.createSumMetric({
		name: `${namePrefix}nodejs_gc_pause_seconds_total`,
		desc: 'Time spent in GC Pause in seconds.',
		tags,
		measure: {
			unit: MeasureUnit.SEC,
			type: MeasureType.Int
		}
	});
	const gcReclaimedCount = openCensusMetrics.createSumMetric({
		name: `${namePrefix}nodejs_gc_reclaimed_bytes_total`,
		desc: 'Total number of bytes reclaimed by GC.',
		tags,
		measure: {
			unit: MeasureUnit.BYTE,
			type: MeasureType.Int
		}
	});

	gc().on('stats', stats => {
		statListener(stats, gcCount, gcTimeCount, gcReclaimedCount);
	});

	return () => {};
};

module.exports.statListener = statListener;
