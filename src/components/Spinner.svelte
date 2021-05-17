<div class="flex justify-center items-center">
	<svg class="w-130 origin-center" viewBox="25 25 50 50">
		<circle cx="50" cy="50" r="20" />
	</svg>
</div>

<style>
	svg {
		animation: rotate 2s linear infinite;
	}

	circle {
		fill: none;
		stroke: theme('colors.highlight.lighter');
		stroke-width: 2;
		stroke-dasharray: 1, 200;
		stroke-dashoffset: 0;
		stroke-linecap: round;
		animation: dash 1.5s ease-in-out infinite;
	}
	@keyframes rotate {
		100% {
			transform: rotate(360deg);
		}
	}
	@keyframes dash {
		0% {
			stroke-dasharray: 1, 200;
			stroke-dashoffset: 0;
		}
		50% {
			stroke-dasharray: 90, 200;
			stroke-dashoffset: -35px;
		}
		100% {
			stroke-dashoffset: -125px;
		}
	}

</style>
