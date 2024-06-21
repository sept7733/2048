
var utils = {}

function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : "0" + n;
}

utils.formatTime = function (timestamp, format) {
  var formateArr = ["Y", "M", "D", "h", "m", "s"];
  var returnArr = [];
  var date = new Date(timestamp);
  if (typeof timestamp === "object") {
    date = new Date();
  }
  returnArr.push(date.getFullYear());
  returnArr.push(formatNumber(date.getMonth() + 1));
  returnArr.push(formatNumber(date.getDate()));
  returnArr.push(formatNumber(date.getHours()));
  returnArr.push(formatNumber(date.getMinutes()));
  returnArr.push(formatNumber(date.getSeconds()));
  for (var i = 0; i < returnArr.length; i++) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
};

utils.toHHmmss = function (timestamp) {
  var time;
  var hours = parseInt((timestamp % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = parseInt((timestamp % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = parseInt((timestamp % (1000 * 60)) / 1000);
  return formatNumber(hours) + ':' + formatNumber(minutes) + ':' + formatNumber(seconds);
}


utils.debounce = function (func, timeout = 300){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}
