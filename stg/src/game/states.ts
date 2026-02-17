import type { CountryTag } from "./countries";

type State = {
    id: number,
    owner: CountryTag
}

type StateArray = Array<State>;

const states: StateArray = [];

function add_state(input_state: State) {
    if (is_state(input_state.id)) {
        const last_index = states.length;
        states[last_index] = input_state;
    } else {}
}

/**
 * Checks if a given state exists in the StateArray states
 * @param id - ID of a potential state
 * @returns boolean for if the ID is present in states
 */
function is_state(search_id: number): Boolean {
    let found = false;
    for (let index = 0; index < states.length; index++) {
        const index_state = states[index];
        if (index_state.id === search_id) {
            found = true;
            break;
        } else {}
    }
    return found;
}