console.log("Hello there!");

let contentIntervalID;
let soundIntervalID;
let isTimeIsOut = false;
let isSoundPlaying = false;

// audio setup
let audio = new Audio();
audio.src = "https://zvukipro.com/uploads/files/2022-08/1660071021_8691e3664e67b7b.mp3";

function soundPlay() {
  soundIntervalID = setInterval(() => {
    audio.play();
  }, 1000);
}

// working with window
const port = chrome.runtime.connect({ name: "knockknock" });
console.log(port.name + " - Connected");

contentIntervalID = setInterval(() => {
  port.postMessage({ command: "checkForContentScript" });
  console.log("check");
}, 1000);

port.onMessage.addListener(function (message) {
  if (message.forContent === "timeIsOut") {
    console.log("Time ran out");
    if (!isSoundPlaying) {
      soundPlay();
      isSoundPlaying = true;
    }
  } else if (message.forContent === "status 0") {
    console.log("Status 0");
    clearInterval(soundIntervalID);
    isSoundPlaying = false;
  } else if (message.forContent === "working") {
    console.log("Working...");
  } else if (message.forContent === "paused") {
    console.log("Paused");
  }
});
