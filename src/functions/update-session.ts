import type { APIGatewayEvent } from 'aws-lambda';
import type {
	ExerciseInstance,
	Session,
	ExerciseInstanceInput,
	Performance,
	ExerciseInput,
	PerformanceInput
} from 'types';
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

	const updatedSession = session;

	const performances: PerformanceInput[] = updatedSession.performances.map(
		(perf: Performance) => {
			const instances: ExerciseInstanceInput[] = perf.exerciseInstances.map(
				(instance: ExerciseInstance): ExerciseInstanceInput => {
					if (instance.exercise?.id) {
						const updatedInstance: ExerciseInstanceInput = {
							...instance,
							id: undefined,
							exerciseId: instance.exercise.id,
							performanceId: undefined,
							exercise: undefined
						};
						return updatedInstance;
					}
					if (instance.exercise) {
						const { exercise } = instance;
						delete exercise.id;
						const exerciseInput: ExerciseInput = {
							data: {
								...exercise
							}
						};
						const updatedInstance: ExerciseInstanceInput = {
							...instance,
							id: undefined,
							performanceId: undefined,
							exercise: exerciseInput
						};
						return updatedInstance;
					}
					return {
						...instance,
						id: undefined,
						performanceId: undefined,
						exercise: undefined
					};
				}
			);
			return {
				id: undefined,
				sessionId: updatedSession.id,
				exerciseInstances: {
					data: instances
				}
			};
		}
	);

	return gqlQuery({
		query: `
		mutation updateSession($sessionId: Int!, $performances: [performances_insert_input!]!, $sessionPk: sessions_pk_columns_input!, $date: timestamptz!, $title: String!, $bodyweightUnit: String!, $bodyweightAmount: numeric) {
			delete_exercise_instances(where: {performance: {sessionId: {_eq: $sessionId}}}) {
				affected_rows
			}
			delete_performances(where: {sessionId: {_eq: $sessionId}}) {
				affected_rows
			}
			insert_performances(objects: $performances) {
				affected_rows
			}
			update_sessions_by_pk(pk_columns: $sessionPk, _set:{date: $date, title: $title, bodyweightAmount: $bodyweightAmount, bodyweightUnit: $bodyweightUnit}) {
				id
				date
				title
			}
		  }
		`,
		variables: {
			sessionId: updatedSession.id,
			performances,
			sessionPk: {
				id: updatedSession.id
			},
			date: updatedSession.date,
			title: updatedSession.title,
			bodyweightAmount: updatedSession.bodyweightAmount || undefined,
			bodyweightUnit: updatedSession.bodyweightUnit
		}
	});
};
