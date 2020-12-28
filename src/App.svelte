<script lang="ts">
	import RouterView from './lib/router/RouterView.svelte';
	import { router } from './router';
</script>

<ul>
	<h2 class="font-bold text-40">Links</h2>
	<li><a href="/">Home</a></li>
	<li><a href="/about?article=test">About</a></li>
	<li><a href="/blog">Blog</a></li>
	<li><a href="/blog/test-article">Test article</a></li>
	<li><a href="/test">Fallback</a></li>
</ul>
<ul>
	<h2 class="font-bold text-40">Buttons</h2>
	<li><button on:click={() => router.send('home')}>Home</button></li>
	<li><button on:click={() => router.send('about')}>About</button></li>
	<li>
		<button
			on:click={() => router.send('blog', {
					params: {
						post: 'test-article'
					},
					query: { article: 'test' }
				})}>Blog</button>
	</li>
</ul>
<RouterView {router} />
