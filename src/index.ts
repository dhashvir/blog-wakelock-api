const requestButton = document.querySelector("#request") as HTMLButtonElement;
const releaseButton = document.querySelector("#release") as HTMLButtonElement;
const info = document.querySelector("#info") as HTMLParagraphElement;

let wakeLock: WakeLockSentinel | null; // Global Wake Lock to keep track of.

// Check if the Wake Lock API is supported by the browser.
function isWakeLockSupported() {
  return "wakeLock" in navigator;
}

// Request a wake lock and update the UI accordingly.
async function requestFn() {
  await releaseFn(); // Release any existing wake lock.
  return (wakeLock = await requestWakeLock()); // Request a new wake lock.
}

// Release the wake lock and update the UI accordingly.
async function releaseFn() {
  const released = await wakeLock?.release(); // Release the wake lock if it exists.
  wakeLock = null; // Reset the wake lock.
  return released;
}

// Request a wake lock from the browser.
async function requestWakeLock() {
  let wakeLock: WakeLockSentinel | null = null;
  // Surround with try/catch since browser can reject the request.
  try {
    wakeLock = await navigator.wakeLock.request("screen"); // Request a screen wake lock.
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

// Attach event listeners and update the UI based on Wake Lock support.
if (isWakeLockSupported()) {
  requestButton.addEventListener("click", requestFn);
  releaseButton.addEventListener("click", releaseFn);
  info.textContent = "Wake Lock Supported.";
} else {
  requestButton.hidden = true;
  releaseButton.hidden = true;
  info.textContent = "Wake Lock Not Supported.";
}

// Reactivate the wake lock when the page becomes visible again.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    // Do some state checks to determine if you want to reactivate wake lock
    if (wakeLock?.released) {
      requestFn();
    }
  }
});
