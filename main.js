/** @ts-check */

import { buyPlot, clickPlot, sellPlot, tickGarden, updateDays } from './game.js';
import { load, save } from './storage.js';
import { createUI, render } from './ui.js';

const state = load();
const ui = createUI(/** @type {HTMLElement} */ (document.getElementById('game')));

/** @param {import('./game.js').Result} result */
function commit(result) {
    if (!result.ok) {
        alert(result.message);
    }
    save(state);
    render(ui, state);
}

ui.garden.addEventListener('click', (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    if (target.id === 'buy-plot') {
        commit(buyPlot(state, Date.now()));
    } else if (target.id === 'sell-plot') {
        commit(sellPlot(state));
    } else if (target.classList.contains('plot')) {
        commit(clickPlot(state, Number(target.dataset.key), Date.now()));
    }
});

function loop() {
    const now = Date.now();
    const daysChanged = updateDays(state, new Date(now));
    const gardenChanged = tickGarden(state, now);
    if (daysChanged || gardenChanged) {
        save(state);
    }
    render(ui, state);
}

loop();
setInterval(loop, 1000);
