export type Ui = Record<string, any>;

export const ui: Ui = {
	appName: 'Powerlog',
	tagline: 'Log your training, get the results.',
	login: 'Login',
	signup: 'Sign Up',
	createAccount: 'Create Account',
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
	noSessions: 'No sessions logged yet',
	noFilteredSessions: 'No sessions found',
	newSession: 'New session',
	clearFilters: 'Clear',
	exercisesTitle: 'My Exercises',
	exerciseFilterLabel: 'Search Exercises',
	creatingSession: 'Creating session...',
	editingSession: 'Editing session...',
	newExercise: 'New exercise',
	exerciseRequired: 'Exercise is required',
	historyTitle: (exerciseName: string) => `Latest ${exerciseName.toLowerCase()} performance`
};
