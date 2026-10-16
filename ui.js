/** @ts-check */

// DOM only. Builds the UI once, then `render` syncs it to the current state.

/** @typedef {import('./game.js').State} State */
/** @typedef {ReturnType<typeof createUI>} UI */

/** @param {HTMLElement} gameElement */
export function createUI(gameElement) {
    const header = document.createElement('header');
    header.innerHTML = `
        <dl id="inventory">
            <dt id="days-label" aria-label="Days played"></dt>
            <dd id="days-definition"></dd>
            <dt id="plots-label" aria-label="Plots owned"></dt>
            <dd id="plots-definition"></dd>
            <dt id="item-label" aria-label="Carrots"></dt>
            <dd id="item-definition"></dd>
            <dt id="seed-label" aria-label="Seeds"></dt>
            <dd id="seed-definition"></dd>
        </dl>
    `;

    const garden = document.createElement('div');
    garden.id = 'garden';
    garden.innerHTML = `
        <div id="plot-action-container">
            <button id="buy-plot">Buy -5¢</button>
            <button id="sell-plot">Sell +5¢</button>
        </div>
    `;

    gameElement.append(header, garden);

    /** @param {HTMLElement} parent @param {string} id */
    const byId = (parent, id) => /** @type {HTMLElement} */ (parent.querySelector(`#${id}`));
    return {
        garden,
        plotActions: byId(garden, 'plot-action-container'),
        days: byId(header, 'days-definition'),
        plots: byId(header, 'plots-definition'),
        carrots: byId(header, 'item-definition'),
        seeds: byId(header, 'seed-definition'),
    };
}

/** @type {Record<string, string>} */
const STAGE_LABELS = {
    null: 'empty',
    SOWN: 'sown',
    SPROUT: 'sprouting',
    GROWTH: 'growing',
    READY: 'ready to harvest',
    SEED: 'gone to seed',
};

/** @param {UI} ui @param {State} state */
export function render(ui, state) {
    ui.days.textContent = String(state.record.d);
    ui.plots.textContent = String(state.garden.length);
    ui.carrots.textContent = String(state.inventory.c);
    ui.seeds.textContent = String(state.inventory.s);

    /** @type {NodeListOf<HTMLButtonElement>} */
    const plotElements = ui.garden.querySelectorAll('.plot');
    state.garden.forEach((plot, index) => {
        let plotElement = plotElements[index];
        if (!plotElement) {
            // Only after buying a plot
            plotElement = document.createElement('button');
            plotElement.classList.add('plot');
            plotElement.dataset.key = String(index);
            ui.garden.insertBefore(plotElement, ui.plotActions);
        }
        plotElement.dataset.stage = String(plot.s);
        plotElement.setAttribute('aria-label', `Plot ${index + 1}: ${STAGE_LABELS[String(plot.s)]}`);
    });
    // Only after selling a plot
    for (let i = state.garden.length; i < plotElements.length; i++) {
        plotElements[i].remove();
    }
}
