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

	const { context } = props;
	const user = context.user as User;
	const token = user.token?.access_token;
	const exercises = context.exercises;

	session.service.start();
	session.send({ type: 'CREATE', data: { token } });
</script>

<SessionForm {token} {exercises} title={ui.creatingSession} />
