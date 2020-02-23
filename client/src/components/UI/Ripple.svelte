<script>
  import { onMount } from "svelte";

  let ripple;
  let parent;
  let color;

  let isVisible = false;
  let isMouseDown = false;
  let isTransitionEnded = false;

  function showRipple() {
    isVisible = true;
  }

  function hideRipple() {
    isVisible = false;
  }

  function setupRipple(e) {
    const rect = parent.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    const mouseX = e.clientX - rect.left;
    const top = (mouseY / parent.offsetHeight) * 100;
    const left = (mouseX / parent.offsetWidth) * 100;
    ripple.style.transformOrigin = `${left}% ${top}%`;

    isMouseDown = true;
    isTransitionEnded = false;
  }

  function onMouseDown(e) {
    hideRipple();
    setupRipple(e);
    setTimeout(() => {
      showRipple();
    }, 0);
  }

  function onMouseUp() {
    console.log("mouse up CALLED");
    isMouseDown = false;
    if (!isTransitionEnded) {
      return;
    }
    hideRipple();
  }

  function onTransitionEnd() {
    isTransitionEnded = true;
    if (isMouseDown) {
      return;
    }
    hideRipple();
  }

  onMount(() => {
    // Get parent element
    parent = ripple.parentElement;
    // Get parent styles
    const parentStyles = getComputedStyle(parent);
    // Apply necessary styles to ripple according to parent's styles
    color = parentStyles.color;
    if (parentStyles.position === "static") {
      parent.style.position = "relative";
    }
    if (parentStyles.overflow === "visible") {
      parent.style.overflow = "hidden";
    }
    let rippleWidth;
    let rippleHeight;
    if (parent.offsetHeight !== parent.offsetWidth) {
      rippleWidth = parent.offsetWidth * (120 / 100);
      rippleHeight = parent.offsetHeight * (320 / 100);
    } else {
      rippleWidth = parent.offsetWidth * (150 / 100);
      rippleHeight = parent.offsetHeight * (150 / 100);
    }
    ripple.style.width = `${rippleWidth}px`;
    ripple.style.height = `${rippleHeight}px`;
    // Add mouseout event listener to parent
    parent.addEventListener("mouseout", onMouseUp);
  });
</script>

<style>
  div {
    position: absolute;
    z-index: 10;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    transition: opacity 0.3s;
    background-color: var(--parent-color);
    box-shadow: 0 0 8px var(--parent-color);
  }

  .show-ripple {
    opacity: 0.4;
    animation: scale 0.25s forwards;
  }

  @keyframes scale {
    0% {
      transform: translate(-50%, -50%) scale(0);
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
    }
  }

  .hide-ripple {
    transform: translate(-50%, -50%);
    opacity: 0;
  }
</style>

<div
  style="--parent-color: {color}"
  bind:this={ripple}
  class:show-ripple={isVisible}
  class:hide-ripple={!isVisible}
  on:mousedown={onMouseDown}
  on:mouseup={onMouseUp}
  on:transitionend={onTransitionEnd} />
