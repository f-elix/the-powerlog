export type Ui = Record<string, any>;

export const ui: Ui = {
	appName: 'Powerlog',
	tagline: 'Log your training, get the results.',
	login: 'Login',
	signup: 'Sign Up',
	logout: 'Logout',
	dashboardTitle: 'Log History',
	filterBy: 'Filter by',
	labels: {
		sessionName: 'Session name',
		daysAgo: 'days ago',
		weeksAgo: 'weeks ago',
		sessionDate: 'Session date',
		from: 'From',
		to: 'To'
	},
	loadMore: 'Load More',
	noSessions: 'No sessions entered yet.',
	newSession: 'New session',
	clearFilters: 'Clear',
	creatingSession: 'Creating session...',
	newExercise: 'New exercise',
	exerciseRequired: 'Exercise is required'
};
