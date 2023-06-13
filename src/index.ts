const requestButton = document.querySelector("#request") as HTMLButtonElement;
const releaseButton = document.querySelector("#release") as HTMLButtonElement;
const info = document.querySelector("#info") as HTMLParagraphElement;

let wakeLock: WakeLockSentinel | null; // Global Wake Lock to keep track of.

function isWakeLockSupported() {
  return "wakeLock" in navigator;
}

async function requestFn() {
  await releaseFn();
  return (wakeLock = await requestWakeLock());
}

async function releaseFn() {
  const released = await wakeLock?.release();
  wakeLock = null;
  return released;
}

async function requestWakeLock() {
  let wakeLock: WakeLockSentinel | null = null;
  // Surround with try/catch since browser can reject the request.
  try {
    wakeLock = await navigator.wakeLock.request("screen");
    // Listen if screen waked has been released.
    wakeLock.addEventListener("release", () => {
      console.log(`Wake Lock released. Released: ${wakeLock?.released}`);
      info.textContent = `Wake Lock released. Released: ${wakeLock?.released}`;
    });

    info.textContent = `Wake Lock is active. Released: ${wakeLock?.released}`;
    console.log(`Wake Lock is active. Released: ${wakeLock?.released}`);
  } catch (err: unknown) {
    // The Wake Lock request has failed - usually system related, such as battery.
    if (err instanceof Error) {
      console.log(`${err.name}, ${err.message}`);
    }
  }
  return wakeLock;
}

if (isWakeLockSupported()) {
  requestButton.addEventListener("click", requestFn);
  releaseButton.addEventListener("click", releaseFn);
  info.textContent = "Wake Lock Supported.";
} else {
  requestButton.hidden = true;
  releaseButton.hidden = true;
  info.textContent = "Wake Lock Not Supported.";
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    // Do some state checks to determine if you want to reactivate wake lock
    if (wakeLock?.released) {
      requestFn();
    }
  }
});
