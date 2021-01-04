// 4) Delete all exercises by sessionId
// 5) Insert all exercises by sessionId (https://hasura.io/docs/1.0/graphql/core/mutations/update.html#update-an-object-by-its-primary-key)
// 6) Update session with the rest of the fields
import type { APIGatewayEvent } from 'aws-lambda';
import type { ExerciseInstance, Exercise, Session } from 'types';
import { gqlQuery } from './utils/gql-query';

export const handler: (
	event: APIGatewayEvent,
	context: any
) => Promise<{ statusCode: number; session?: Session }> = async (event, context) => {
	const { user } = context.clientContext;

	if (!user) {
		return {
			statusCode: 403
		};
	}

	const { session } = JSON.parse(event.body || '{}');

	if (!session) {
		return {
			statusCode: 400
		};
	}

	let updatedSession = session;

	// 1) Filter exercise instances with an exercise that doesnt have an id
	const idlessExercises: Exercise[] = session.exercises
		.map((instance: ExerciseInstance) => instance.exercise)
		.filter((exercise: Exercise) => !exercise?.id);

	if (idlessExercises.length) {
		// 2) Create filtered exercises and get their ids
		const newExercisesRes = await fetch(<RequestInfo>process.env.HASURA_ENDPOINT, {
			method: 'POST',
			headers: {
				'x-hasura-admin-secret': <string>process.env.HASURA_GRAPHQL_ADMIN_SECRET
			},
			body: JSON.stringify({
				query: `
					mutation createExercises($exercises: [exercises_insert_input!]!) {
						insert_exercises(objects: $exercises) {
							returning {
								id
								name
								userId
							}
						}
					}
				`,
				variables: {
					exercises: idlessExercises
				}
			})
		});
		const newExercisesData = await newExercisesRes.json();
		const newExercises = newExercisesData.data.insert_exercises.returning;

		// 3) Map exercise instances and add ids to the exercises that don't have one
		const updatedInstances = session.exercises.map((instance: ExerciseInstance) => {
			if (!instance.exercise?.id) {
				const exercise = newExercises.find(
					(ex: Exercise) => ex.name === instance.exercise?.name
				);
				return {
					...instance,
					exercise
				};
			}
			return instance;
		});
		updatedSession = {
			...session,
			exercises: updatedInstances
		};
	}

	// 4) Delete all exercises by sessionId (https://hasura.io/docs/1.0/graphql/core/mutations/update.html#replace-all-nested-array-objects-of-an-object)
	// 5) Insert all exercises by sessionId
	// 6) Update session with the rest of the fields
	return gqlQuery({
		query: `
		mutation replaceInstances($sessionId: Int!, $instances: [exercise_instances_insert_input!]!, $session: sessions_pk_columns_input!, $date: timestamptz!, $title:String!) {
			delete_exercise_instances(where: {sessionId: {_eq: $sessionId}}) {
			  affected_rows
			}
			insert_exercise_instances(objects: $instances) {
			  affected_rows
			},
			update_sessions_by_pk(pk_columns: $sessionId, _set:{date:$date, title:$title}) {
				id
				date
				title
			}
		  }
		`,
		variables: {
			sessionId: updatedSession.id,
			instances: updatedSession.exercises,
			session: {
				id: updatedSession.id
			},
			date: updatedSession.date,
			title: updatedSession.title
		}
	});
};
