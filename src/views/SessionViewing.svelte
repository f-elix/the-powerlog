<script lang="ts">
	// Types
	import type { View, ViewProps } from '../lib/router/types';
	import type { User } from 'netlify-identity-widget';
	// Stores
	import { session } from 'src/stores/session';

	export let props: ViewProps;
	export let children: View[];

	const { state, send, service } = session;

	const { context } = props;
	const user = context.user as User;
	const token = user.token?.access_token;
	const sessionId = context.$page?.params?.id;

	service.start();
	send({ type: 'VIEW', data: { token, sessionId } });

	$: sessionData = $state.context.session;
</script>

{#if $state.matches('displaying') && sessionData}
	<h1 class="p-50 text-center text-70 font-bold">{sessionData.title}</h1>
{/if}
