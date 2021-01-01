export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
	ID: string;
	String: string;
	Boolean: boolean;
	Int: number;
	Float: number;
};

export type User = {
	__typename?: 'User';
	_id?: Scalars['ID'];
	netlifyId?: Scalars['ID'];
	exercises?: Maybe<Array<Maybe<UserExercise>>>;
	sessions?: Maybe<Array<Maybe<Session>>>;
};

export type UserResponse = {
	_id?: Scalars['ID'];
	exercises: {
		data: Array<Maybe<UserExercise>>;
	};
	sessions: {
		data: Array<Maybe<Session>>;
	};
};

export type UserExercise = {
	__typename?: 'UserExercise';
	creator: User;
	name: Scalars['String'];
	history?: Maybe<Array<Maybe<Exercise>>>;
};

export type Session = {
	__typename?: 'Session';
	_id: Scalars['ID'];
	creator: User;
	name: Scalars['String'];
	date: Scalars['String'];
	performances?: Array<Maybe<Performance>>;
	bodyweight?: Maybe<Weight>;
};

export type Performance = {
	__typename?: 'Performance';
	session?: Maybe<Session>;
	exercise?: Maybe<Array<Maybe<Exercise>>>;
};

export type Exercise = {
	__typename?: 'Exercise';
	performance?: Maybe<Performance>;
	movement: UserExercise;
	executions?: Maybe<Array<Maybe<Execution>>>;
	date: Scalars['String'];
};

export type Execution = {
	__typename?: 'Execution';
	sets?: Maybe<Scalars['Int']>;
	reps?: Maybe<Scalars['Int']>;
	duration?: Maybe<Duration>;
	load?: Maybe<Weight>;
};

export type Weight = {
	__typename?: 'Weight';
	amount?: Maybe<Scalars['Float']>;
	unit?: Maybe<Scalars['String']>;
};

export type Duration = {
	__typename?: 'Duration';
	amount?: Maybe<Scalars['Float']>;
	unit?: Maybe<Scalars['String']>;
};

export type Query = {
	__typename?: 'Query';
	getUserById?: Maybe<User>;
};

export type QueryGetUserByIdArgs = {
	_id: Scalars['ID'];
	exercises?: Maybe<Array<Maybe<UserExercise>>>;
	sessions?: Maybe<Array<Maybe<Session>>>;
};
