function aggregateByObjectName(list) {
  const data = {};

  for (let i = 0; i < list.length; i++) {
    const listElement = list[i];

    if (!listElement || typeof listElement.constructor === "undefined") {
      continue;
    }

    if (data.hasOwnProperty(listElement.constructor.name)) {
      data[listElement.constructor.name] += 1;
    } else {
      data[listElement.constructor.name] = 1;
    }
  }
  return data;
}

function updateMetrics(gauge, data) {
  for (const key in data) {
    gauge(data[key], [key]);
  }
}

module.exports = {
  aggregateByObjectName,
  updateMetrics
};
