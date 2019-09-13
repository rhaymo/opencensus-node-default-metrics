"use strict";

const deprecationsEmitted = {};

function printDeprecation(msg) {
  if (deprecationsEmitted[msg]) {
    return;
  }

  deprecationsEmitted[msg] = true;

  if (process.emitWarning) {
    process.emitWarning(msg, "DeprecationWarning");
  } else {
    // Check can be removed when we only support node@>=6
    // eslint-disable-next-line no-console
    console.warn(new Error(msg));
  }
}

exports.printDeprecationObjectConstructor = () => {
  printDeprecation("prom-client - Passing a non-object to metrics constructor is deprecated");
};

exports.printDeprecationCollectDefaultMetricsNumber = timeout => {
  printDeprecation(
    `prom-client - A number to defaultMetrics is deprecated, please use \`collectDefaultMetrics({ timeout: ${timeout} })\`.`
  );
};
