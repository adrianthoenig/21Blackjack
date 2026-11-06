'use strict';


export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function launchFireworks() {
    const end = Date.now() + 2e3;
    const colors = ["#bb0000", "#ffffff"];
    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
}