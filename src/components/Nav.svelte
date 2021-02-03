<script lang="ts">
	// Types
	import type { ViewProps } from '../lib/router/types';
	import type { User } from 'netlify-identity-widget';
	// Components
	import Logout from 'coms/Logout.svelte';
	import Dashboard from 'coms/svg/Dashboard.svelte';
	import Exercises from 'coms/svg/Exercises.svelte';

	export let props: ViewProps;

	const user = props.context.user as User;
	const userName = user.user_metadata?.full_name;
	const { email } = user;
	const currentPath = props.context.$page.path;
</script>

<nav class="flex items-center p-50">
	<div class="flex items-center space-x-80">
		<Logout />
		{#if !currentPath.includes('dashboard')}
			<a class="text-info-light" href="/dashboard">
				<Dashboard />
			</a>
		{/if}
		{#if !currentPath.includes('exercises')}
			<a class="text-info-light" href="/exercises">
				<Exercises />
			</a>
		{/if}
	</div>
	<div class="ml-auto text-right">
		{#if userName}
			<p>{userName}</p>
		{/if}
		{#if email}
			<p>{email}</p>
		{/if}
	</div>
</nav>
