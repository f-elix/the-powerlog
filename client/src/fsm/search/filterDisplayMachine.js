import { Machine, assign } from 'xstate';

const filters = {
    name: 'session name',
    date: 'date',
    period: 'time period'
}

const actions = {
    updateCurrentFilter: assign({ currentFilter: (_, event) => event.params.filter })
}

export const filterDisplayMachine = Machine(
    {
        id: 'filterDisplay',
        context: {
            currentFilter: filters.name
        },
        initial: 'ready',
        states: {
            ready: {
                on: {
                    CHANGE: {
                        target: 'transitioning',
                        actions: ['updateCurrentFilter']
                    }
                }
            },
            transitioning: {
                on: {
                    TRANSITIONEND: 'ready'
                }
            }
        }
    },
    {
        actions
    }
);