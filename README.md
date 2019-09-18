# Default metrics for node.js using opencensus

[![Node version](https://img.shields.io/node/v/opencensus-node-default-metrics)]()
[![Downloads Count](https://img.shields.io/npm/dm/opencensus-node-default-metrics)](https://travis-ci.org/rhaymo/opencensus-node-default-metrics)
[![Build Status](https://travis-ci.org/rhaymo/opencensus-node-default-metrics.svg?branch=master)](https://travis-ci.org/rhaymo/opencensus-node-default-metrics)
[![Known Vulnerabilities](https://snyk.io//test/github/rhaymo/opencensus-node-default-metrics/badge.svg?targetFile=package.json)](https://snyk.io//test/github/rhaymo/opencensus-node-default-metrics?targetFile=package.json)
[![Coverage Status](https://coveralls.io/repos/github/rhaymo/opencensus-node-default-metrics/badge.svg?branch=master)](https://coveralls.io/github/rhaymo/opencensus-node-default-metrics?branch=master)
[![License](https://img.shields.io/github/license/rhaymo/opencensus-node-default-metrics)](https://github.com/rhaymo/opencensus-node-default-metrics/blob/master/LICENSE)
[![Npm Size](https://img.shields.io/bundlephobia/min/opencensus-node-default-metrics/0.0.1?label=size)]()

Collect default nodejs metrics using opencensus framework.
This module is inspired and based on the [prom-client](https://github.com/siimon/prom-client) and [node-prometheus-gc-stats](https://github.com/SimenB/node-prometheus-gc-stats) package.

## Usage

See example folder for a sample usage. The library does not bundle any web
framework. To expose the metrics you have to use the opencensus exporters.

## Default metrics

There are some default metrics recommended by Prometheus
[itself](https://prometheus.io/docs/instrumenting/writing_clientlibs/#standard-and-runtime-collectors).
To collect these, call `collectDefaultMetrics`

NOTE: Some of the metrics, concerning File Descriptors and Memory, are only
available on Linux.

In addition, some Node-specific metrics are included, such as event loop lag,
active handles and Node.js version. See what metrics there are in
[lib/metrics](lib/metrics).

`collectDefaultMetrics` takes 1 options object with 3 entries, a timeout for how
often the probe should be fired, an optional prefix for metric names
and an opencensus stats object to which metrics should be registered. By default probes are
launched every 10 seconds, but this can be modified like this:

```js
const client = require('opencensus-default-metrics');

const collectDefaultMetrics = client.collectDefaultMetrics;

// Probe every 5th second.
collectDefaultMetrics({ timeout: 5000 });
```

To register metrics to another stats instance, pass it in as `stats`:

```js
const { globalStats } = require('@opencensus/core');
const client = require('opencensus-default-metrics');

const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics({ stats: globalStats });
```

To prefix metric names with your own arbitrary string, pass in a `prefix`:

```js
const client = require('opencensus-default-metrics');

const collectDefaultMetrics = client.collectDefaultMetrics;

// Probe every 5th second.
collectDefaultMetrics({ prefix: 'my_application_' });
```

You can get the full list of metrics by inspecting
`client.metricsList`.

`collectDefaultMetrics` returns an identification when invoked, which is a
reference to the `Timer` used to keep the probes going. This can be passed to
`clearInterval` in order to stop all probes.

NOTE: Existing intervals are automatically cleared when calling
`collectDefaultMetrics`.

```js
const client = require('opencensus-default-metrics');

const collectDefaultMetrics = client.collectDefaultMetrics;

const interval = collectDefaultMetrics();

// ... some time later

clearInterval(interval);
```

NOTE: `unref` is called on the `interval` internally, so it will not keep your
node process going indefinitely if it's the only thing keeping it from shutting
down.

#### Stop polling default metrics

To stop collecting the default metrics, you have to call the function and pass
it to `clearInterval`.

```js
const client = require('opencensus-default-metrics');

clearInterval(client.collectDefaultMetrics());

// Clear the stats
client.stats.clear();
```
