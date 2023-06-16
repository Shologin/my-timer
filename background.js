console.log("Hello there");
console.log("Version 2.0");

let hours = 0;
let minutes = 0;
let seconds = 0;
let isWorking = false;
let isPaused = false;
let isStatusTimeOut = false;

let coundownInterval;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.command === "start" && (request.settledHrs > 0 || request.settledMin > 0 || request.settledSec > 0)) {
    hours = request.settledHrs;
    minutes = request.settledMin;
    seconds = request.settledSec;
    start();
    sendResponse({ status: "working" });
  } else if (request.command === "start" && (request.settledHrs === 0 || request.settledMin === 0 || request.settledSec === 0)) {
    sendResponse({ status: "set time!" });
  } else if (request.command === "check" && hours === 0 && minutes === 0 && seconds === 0 && isStatusTimeOut === true) {
    sendResponse({ status: "timeIsOut" });
    console.log("check & timeIsOut");
  } else if (request.command === "check" && hours === 0 && minutes === 0 && seconds === 0) {
    sendResponse({ status: "0", isWorking: isWorking });
    console.log("status: 0");
  } else if (request.command === "check" && (hours > 0 || minutes > 0 || seconds > 0) && isPaused === false) {
    sendResponse({ status: "working", isWorking: isWorking });
    console.log("check & > 0; NOT_PAUSED");
  } else if (request.command === "check" && (hours > 0 || minutes > 0 || seconds > 0) && isPaused === true) {
    sendResponse({ status: "paused", isWorking: isWorking });
    console.log("check & > 0 PAUSED");
  } else if (request.command === "stop") {
    stop();
    isWorking = false;
    isPaused = true;
    sendResponse({ status: "paused" });
    console.log("from background: STOPPED");
    console.log(`STOP Hours: ${hours} Minutes: ${minutes} Seconds: ${seconds}`);
  } else if (request.command === "reset") {
    reset();
    clearInterval(coundownInterval);
    isWorking = false;
    isStatusTimeOut = false;
    sendResponse({ status: "0" });
    console.log("from background: RESET");
    console.log(`RESET Hours: ${hours} Minutes: ${minutes} Seconds: ${seconds}`);
  } else if (request.command === "firstUpdate" && (hours > 0 || minutes > 0 || seconds > 0)) {
    sendResponse({ hrs: hours, min: minutes, sec: seconds });
    console.log("FIRST_UPDATE & > 0 ");
  }
});

function start() {
  coundownInterval = setInterval(() => {
    if (hours === 0 && minutes === 0 && seconds === 0) {
      console.log("from CHECK: time out");
      clearInterval(coundownInterval);
      isWorking = false;
      isStatusTimeOut = true;
      reset();
      chrome.runtime.sendMessage({ status: "timeIsOut", hrs: hours, min: minutes, sec: seconds }, (response) => {});
    } else {
      countdownHeart();
      chrome.runtime.sendMessage({ status: "working", hrs: hours, min: minutes, sec: seconds }, (response) => {
        if (response.status === "working") {
          console.log("status from START: working");
        }
      });
    }
  }, 1000);
}

function countdownHeart() {
  if (seconds > 0) {
    seconds--;
  } else if (minutes > 0) {
    minutes--;
    seconds += 59;
  } else if (hours > 0) {
    hours--;
    minutes += 59;
    seconds += 59;
  } else {
    console.log("from COUNTDOWN_HEART: Time out!");
    // console.log("countdownHeart ERROR");
  }
  isWorking = true;
  isPaused = false;
  isStatusTimeOut = false;

  console.log(`FROM COUNTDOWN HEART:     Hours: ${hours}  Minutes: ${minutes} Seconds: ${seconds}`);
}

function stop() {
  clearInterval(coundownInterval);
}

function reset() {
  clearInterval(coundownInterval);
  hours = 0;
  minutes = 0;
  seconds = 0;
}

// connection with content
chrome.runtime.onConnect.addListener(function (port) {
  console.log(port.name + " - Connected");

  port.onMessage.addListener(function (message) {
    if (message.command === "checkForContentScript") {
      if (isWorking === false && isPaused === false && isStatusTimeOut === false) {
        port.postMessage({ forContent: "status 0" });
      } else if (isWorking === true && isPaused === false && isStatusTimeOut === false) {
        port.postMessage({ forContent: "working" });
      } else if (isWorking === false && isPaused === true) {
        port.postMessage({ forContent: "paused" });
      } else if (isStatusTimeOut === true) {
        port.postMessage({ forContent: "timeIsOut" });
      }
    }
  });
});
