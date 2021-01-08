<script lang="ts">
	// Types
	import type { View, ViewProps } from '../lib/router/types';
	import type { User } from 'netlify-identity-widget';
	// Stores
	import { session } from 'src/stores/session';
	// Ui
	import { ui } from 'src/ui';
	// Components
	import SessionForm from 'coms/SessionForm.svelte';

	export let props: ViewProps;
	export let children: View[];

	const user = props.context.user as User;
	const token = user.token?.access_token;

	session.service.start();
	session.send({ type: 'CREATE', data: { token } });
</script>

<section class="space-y-100">
	<h1 class="mt-70 px-50 text-70 font-bold">{ui.creatingSession}</h1>
	<SessionForm {token} />
</section>
