<script lang="ts">
	// Types
	import type { View, ViewProps } from '../lib/router/types';
	import type { User } from 'netlify-identity-widget';
	// Stores
	import { session } from 'src/stores/session';

	export let props: ViewProps;
	export let children: View[];

	const { context } = props;
	const user = context.user as User;
	const token = user.token?.access_token;
	const sessionId = context.$page?.params?.id;

	session.service.start();
	session.send({ type: 'VIEW', data: { token, sessionId } });
</script>

<h1>Session viewing</h1>
