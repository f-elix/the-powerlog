export interface Filter {
	name: string;
	component: string;
}

export type Ui = Record<string, string | Filter[] | Record<string, string>>;

export const ui: Ui = {
	appName: 'Powerlog',
	tagline: 'Log your training, get the results.',
	login: 'Login',
	signup: 'Sign Up',
	logout: 'Logout',
	dashboardTitle: 'Log History',
	filterBy: 'Filter by',
	filters: [
		{
			name: 'Name',
			component: 'Name'
		},
		{
			name: 'Days ago',
			component: 'DaysAgo'
		},
		{
			name: 'Weeks ago',
			component: 'WeeksAgo'
		},
		{
			name: 'Date',
			component: 'Date'
		},
		{
			name: 'Period',
			component: 'Period'
		}
	],
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
	newSession: 'New session'
};
