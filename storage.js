/** @ts-check */

import { initialState } from './game.js';

/** @typedef {import('./game.js').State} State */

/** @param {string} key @param {any} fallback */
function read(key, fallback) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
}

/** @returns {State} */
export function load() {
    const defaults = initialState();
    return {
        record: read('record', defaults.record),
        garden: read('garden', defaults.garden),
        inventory: read('inventory', defaults.inventory),
    };
}

/** @param {State} state */
export function save(state) {
    localStorage.setItem('record', JSON.stringify(state.record));
    localStorage.setItem('garden', JSON.stringify(state.garden));
    localStorage.setItem('inventory', JSON.stringify(state.inventory));
}
