document.addEventListener("DOMContentLoaded", function () {
  const plusHrs = document.getElementById("plus-hrs");
  const minusHrs = document.getElementById("minus-hrs");
  const plusMin = document.getElementById("plus-min");
  const minusMin = document.getElementById("minus-min");
  const plusSec = document.getElementById("plus-sec");
  const minusSec = document.getElementById("minus-sec");

  const timeoutBanner = document.querySelector(".timeout-banner");

  const displayHrs = document.getElementById("display-hrs");
  const displayMin = document.getElementById("display-min");
  const displaySec = document.getElementById("display-sec");

  const tableButtons = document.querySelectorAll(".table-btn");
  const startBtn = document.getElementById("start-btn");
  const resetBtn = document.getElementById("reset-btn");
  // const testBtn = document.getElementById("test");

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  let intervalId;
  let updateIntervalId;
  let isTimerWorking = false;
  console.log(isTimerWorking);

  let timeOutBtn = document.createElement("button");
  timeOutBtn.className = "stopBtn";
  timeOutBtn.innerHTML = "OKAY!!!";
  document.getElementById("timer-timer-buttons").appendChild(timeOutBtn);
  timeOutBtn.style.display = "none";

  // ----- INCREASE / DECREASE

  function increaseHrs() {
    hours++;
    hours < 10 ? (displayHrs.innerHTML = "0" + hours) : (displayHrs.innerHTML = hours);
    if (hours > 23) {
      hours = 0;
      displayHrs.innerHTML = "0" + hours;
    }
  }

  function decreaseHrs() {
    hours--;
    if (hours < 0) {
      hours = 23;
    }
    hours < 10 ? (displayHrs.innerHTML = "0" + hours) : (displayHrs.innerHTML = hours);
  }

  function increaseMin() {
    minutes++;
    minutes < 10 ? (displayMin.innerHTML = "0" + minutes) : (displayMin.innerHTML = minutes);
    if (minutes > 59) {
      minutes = 0;
      displayMin.innerHTML = "0" + minutes;
    }
  }

  function decreaseMin() {
    minutes--;
    if (minutes < 0) {
      minutes = 59;
    }
    minutes < 10 ? (displayMin.innerHTML = "0" + minutes) : (displayMin.innerHTML = minutes);
  }

  function increaseSec() {
    seconds++;
    seconds < 10 ? (displaySec.innerHTML = "0" + seconds) : (displaySec.innerHTML = seconds);
    if (seconds > 59) {
      seconds = 0;
      displaySec.innerHTML = "0" + seconds;
    }
  }

  function decreaseSec() {
    seconds--;
    if (seconds < 0) {
      seconds = 59;
    }
    seconds < 10 ? (displaySec.innerHTML = "0" + seconds) : (displaySec.innerHTML = seconds);
  }

  // --------- HIDE TABLE BUTTONS
  function hideTableButtons() {
    tableButtons.forEach((el) => {
      el.style.display = "none";
    });
  }

  function showTableButtons() {
    tableButtons.forEach((el) => {
      el.style.display = "flex";
    });
  }

  // ----- ACTIVATE BUTTONS

  plusHrs.addEventListener("click", increaseHrs);
  plusHrs.addEventListener("mousedown", () => {
    intervalId = setInterval(increaseHrs, 60);
  });
  plusHrs.addEventListener("mouseup", () => {
    clearInterval(intervalId);
  });

  minusHrs.addEventListener("click", decreaseHrs);
  minusHrs.addEventListener("mousedown", () => {
    intervalId = setInterval(decreaseHrs, 60);
  });
  minusHrs.addEventListener("mouseup", () => {
    clearInterval(intervalId);
  });

  plusMin.addEventListener("click", increaseMin);
  plusMin.addEventListener("mousedown", () => {
    intervalId = setInterval(increaseMin, 60);
  });
  plusMin.addEventListener("mouseup", () => {
    clearInterval(intervalId);
  });

  minusMin.addEventListener("click", decreaseMin);
  minusMin.addEventListener("mousedown", () => {
    intervalId = setInterval(decreaseMin, 60);
  });
  minusMin.addEventListener("mouseup", () => {
    clearInterval(intervalId);
  });

  plusSec.addEventListener("click", increaseSec);
  plusSec.addEventListener("mousedown", () => {
    intervalId = setInterval(increaseSec, 60);
  });
  plusSec.addEventListener("mouseup", () => {
    clearInterval(intervalId);
  });

  minusSec.addEventListener("click", decreaseSec);
  minusSec.addEventListener("mousedown", () => {
    intervalId = setInterval(decreaseSec, 60);
  });
  minusSec.addEventListener("mouseup", () => {
    clearInterval(intervalId);
  });

  // ------- START PROGRAM
  chrome.runtime.sendMessage({ command: "check" }, (response) => {
    isTimerWorking = response.isWorking;
    console.log(isTimerWorking);

    if (response.status === "working") {
      startBtn.className = "stopBtn";
      startBtn.innerHTML = "Stop";
      resetBtn.style.display = "inline-block";
      update();
      hideTableButtons();
      // testBtn.innerHTML = "working";
      delayBeforeUpdate();
    } else if (response.status === "0") {
      showTableButtons();
      // testBtn.innerHTML = "0";
    } else if (response.status === "paused") {
      update();
      clearInterval(updateIntervalId);
      delayBeforeUpdate();
      startBtn.className = "timer-btn";
      startBtn.innerHTML = "Resume";
      resetBtn.style.display = "inline-block";
      isTimerWorking = false;
      showTableButtons();
      // testBtn.innerHTML = "paused";
    } else if (response.status === "timeIsOut") {
      timeRanOut();
      hideTableButtons();
    }
  });

  // ------- ACTIVATE MAIN BUTTONS
  startBtn.addEventListener("click", () => {
    if (isTimerWorking === false) {
      chrome.runtime.sendMessage(
        { command: "start", settledHrs: hours, settledMin: minutes, settledSec: seconds },
        (response) => {
          if (response.status === "working") {
            startBtn.className = "stopBtn";
            startBtn.innerHTML = "Stop";
            resetBtn.style.display = "inline-block";
            isTimerWorking = true;

            update();
            hideTableButtons();
          } else if (response.status === "set time!") {
            alert("Please set time");
          }
        }
      );
    } else if (isTimerWorking === true) {
      chrome.runtime.sendMessage({ command: "stop" }, (response) => {
        if (response.status === "paused") {
          clearInterval(updateIntervalId);
          startBtn.className = "timer-btn";
          startBtn.innerHTML = "Resume";
          isTimerWorking = false;
          showTableButtons();
        }
      });
    }
  });

  resetBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ command: "reset" }, (response) => {});

    clearInterval(updateIntervalId);
    hours = 0;
    minutes = 0;
    seconds = 0;
    seconds < 10 ? (displaySec.innerHTML = "0" + seconds) : (displaySec.innerHTML = seconds);
    minutes < 10 ? (displayMin.innerHTML = "0" + minutes) : (displayMin.innerHTML = minutes);
    hours < 10 ? (displayHrs.innerHTML = "0" + hours) : (displayHrs.innerHTML = hours);
    resetBtn.style.display = "none";
    startBtn.className = "timer-btn";
    startBtn.innerHTML = "Start";
    isTimerWorking = false;
    showTableButtons();
  });

  timeOutBtn.addEventListener("click", () => {
    timeOutBtn.style.display = "none";
    startBtn.style.display = "inline-block";
    startBtn.className = "timer-btn";
    startBtn.innerHTML = "Start";
    timeoutBanner.style.display = "none";
    showTableButtons();
    chrome.runtime.sendMessage({ command: "reset" }, (response) => {});
  });
  // --------- MAIN FUNCTIONS

  function update() {
    updateIntervalId = setInterval(() => {
      chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        hours = request.hrs;
        minutes = request.min;
        seconds = request.sec;

        seconds < 10 ? (displaySec.innerHTML = "0" + seconds) : (displaySec.innerHTML = seconds);
        minutes < 10 ? (displayMin.innerHTML = "0" + minutes) : (displayMin.innerHTML = minutes);
        hours < 10 ? (displayHrs.innerHTML = "0" + hours) : (displayHrs.innerHTML = hours);

        sendResponse({ status: "working" });

        if (request.status === "timeIsOut") {
          timeRanOut();

          seconds < 10 ? (displaySec.innerHTML = "0" + seconds) : (displaySec.innerHTML = seconds);
          minutes < 10 ? (displayMin.innerHTML = "0" + minutes) : (displayMin.innerHTML = minutes);
          hours < 10 ? (displayHrs.innerHTML = "0" + hours) : (displayHrs.innerHTML = hours);
        }
      });
    }, 1000);
  }

  function firstUpdate() {
    chrome.runtime.sendMessage({ command: "firstUpdate" }, (response) => {
      hours = response.hrs;
      minutes = response.min;
      seconds = response.sec;

      console.log("popup firstUpdate()" + hours + minutes + seconds);

      seconds < 10 ? (displaySec.innerHTML = "0" + seconds) : (displaySec.innerHTML = seconds);
      minutes < 10 ? (displayMin.innerHTML = "0" + minutes) : (displayMin.innerHTML = minutes);
      hours < 10 ? (displayHrs.innerHTML = "0" + hours) : (displayHrs.innerHTML = hours);
    });
  }

  function delayBeforeUpdate() {
    firstUpdate();
    setTimeout(() => {
      firstUpdate();
    }, 200);
    setTimeout(() => {
      firstUpdate();
    }, 400);
    setTimeout(() => {
      firstUpdate();
    }, 600);
    setTimeout(() => {
      firstUpdate();
    }, 800);
    setTimeout(() => {
      firstUpdate();
    }, 1000);
  }

  function timeRanOut() {
    // testBtn.innerHTML = "TIME IS OUT";
    resetBtn.style.display = "none";
    startBtn.style.display = "none";
    timeOutBtn.style.display = "inline-block";
    timeoutBanner.style.display = "block";
    isTimerWorking = false;
  }

  // let audio = new Audio();
  // audio.src = "https://zvukipro.com/uploads/files/2018-12/1544175006_technology-wrist-watch-digital-beep_zyol3_v_.mp3";
  // testBtn.addEventListener("click", () => {
  //   audio.play();
  // });
});
