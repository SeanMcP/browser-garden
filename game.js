/** @ts-check */

// Game rules. Pure state changes: no DOM and no localStorage.

/**
 * Storage keys are kept short to match existing saves.
 * @typedef {"SOWN" | "SPROUT" | "GROWTH" | "READY" | "SEED"} Stage
 * @typedef {{ s: Stage | null, t: "c", u: number }} Plot - s: stage, t: type (carrot), u: updated at
 * @typedef {{ c: number, s: number }} Inventory - c: carrots, s: seeds
 * @typedef {{ d: number, l: string | null }} DayRecord - d: days played, l: last day played (YYYY-MM-DD)
 * @typedef {{ record: DayRecord, garden: Plot[], inventory: Inventory }} State
 * @typedef {{ ok: true } | { ok: false, message: string }} Result
 */

/** @type {Stage[]} */
export const STAGES = ["SOWN", "SPROUT", "GROWTH", "READY", "SEED"];
export const TICK = ["127.0.0.1", "localhost"].includes(globalThis.location?.hostname) ? 5_000 : 60_000;
export const PLOT_COST = 5;

/** @returns {Plot} */
export function emptyPlot(now = Date.now()) {
    return { s: null, t: "c", u: now };
}

/** @returns {State} */
export function initialState(now = Date.now()) {
    return {
        record: { d: 0, l: null },
        garden: [emptyPlot(now)],
        inventory: { c: 4, s: 5 },
    };
}

const OK = /** @type {const} */ ({ ok: true });
/** @param {string} message @returns {Result} */
const fail = (message) => ({ ok: false, message });

/** @param {Plot} plot @param {number} now @returns {Stage | null} */
export function deriveStage(plot, now) {
    if (!plot.s) {
        return null;
    }
    const ticksElapsed = Math.floor((now - plot.u) / TICK);
    return STAGES[ticksElapsed % STAGES.length];
}

/**
 * Plant an empty plot, or harvest a planted one.
 * @param {State} state @param {number} index @param {number} now @returns {Result}
 */
export function clickPlot(state, index, now) {
    const plot = state.garden[index];
    if (!plot) {
        return OK;
    }
    const { inventory } = state;
    /** @type {Result} */
    let result = OK;
    /** @type {Stage | null} */
    let stage = null;
    switch (plot.s) {
        case "SOWN":
        case "SPROUT":
        case "GROWTH":
            inventory.s++;
            break;
        case "READY":
            inventory.c++;
            inventory.s++;
            break;
        case "SEED":
            inventory.s += 3;
            break;
        case null:
            if (inventory.s > 0) {
                inventory.s--;
                stage = "SOWN";
            } else {
                result = fail("Not enough seeds to plant.");
            }
            break;
    }
    state.garden[index] = { ...plot, s: stage, u: now };
    return result;
}

/** @param {State} state @param {number} now @returns {Result} */
export function buyPlot(state, now) {
    if (state.inventory.c < PLOT_COST) {
        return fail("You don't have enough carrots to buy a plot.");
    }
    state.inventory.c -= PLOT_COST;
    state.garden.push(emptyPlot(now));
    return OK;
}

/** @param {State} state @returns {Result} */
export function sellPlot(state) {
    if (state.garden.length <= 1) {
        return fail("You cannot sell the last plot.");
    }
    const soldPlot = /** @type {Plot} */ (state.garden.pop());
    // Every sold plot yields at least 1 seed and 5 carrots
    state.inventory.s += soldPlot.s === "SEED" ? 3 : 1;
    state.inventory.c += soldPlot.s === "READY" ? PLOT_COST + 1 : PLOT_COST;
    return OK;
}

/**
 * Advance each plot to the stage implied by elapsed time.
 * @param {State} state @param {number} now @returns {boolean} whether anything changed
 */
export function tickGarden(state, now) {
    let changed = false;
    state.garden.forEach((plot, index) => {
        const derivedStage = deriveStage(plot, now);
        if (derivedStage !== plot.s) {
            console.debug(`Plot ${index} derived stage changed from ${plot.s} to ${derivedStage}`);
            plot.s = derivedStage;
            changed = true;
        }
    });
    return changed;
}

/** @param {State} state @param {Date} date @returns {boolean} whether the record changed */
export function updateDays(state, date) {
    const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    if (state.record.l === today) {
        return false;
    }
    console.debug('New day detected: updating record');
    state.record.d++;
    state.record.l = today;
    return true;
}
