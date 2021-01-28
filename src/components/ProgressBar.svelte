<div class="flex fixed top-0 left-0 w-full h-20 bg-highlight overflow-hidden">
	<div class="_progress w-2/3 h-full bg-highlight-lighter" />
</div>

<style>
	._progress {
		animation: progress 1600ms linear infinite;
		transform-origin: left center;
	}

	@keyframes progress {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(200%);
		}
	}
</style>
