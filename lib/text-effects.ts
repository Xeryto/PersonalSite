const SCRAMBLE_CHARS = "!@#$%^&*";

export function scrambleText(
  element: HTMLElement,
  finalText: string,
  duration = 600
): void {
  const len = finalText.length;
  const startTime = performance.now();

  const update = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const revealIndex = Math.floor(progress * len);

    let display = "";
    for (let i = 0; i < len; i++) {
      if (finalText[i] === " ") {
        display += " ";
      } else if (i < revealIndex) {
        display += finalText[i];
      } else {
        display +=
          SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
    }

    element.textContent = display;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = finalText;
    }
  };

  requestAnimationFrame(update);
}
