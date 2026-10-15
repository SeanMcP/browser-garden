/** @ts-check */

const gameElement = document.getElementById('game');

// State
const TICK = ["127.0.0.1", "localhost"].includes(location.hostname)  ? 5_000 : 60_000;
const garden = JSON.parse(localStorage.getItem('garden') || JSON.stringify([{ s: null, t: "c", u: Date.now() }]));
const inventory = JSON.parse(localStorage.getItem('inventory') || `{"c": 4, "s": 5}`);
function save() {
    localStorage.setItem('garden', JSON.stringify(garden));
    localStorage.setItem('inventory', JSON.stringify(inventory));
}
let paused = false;

// Create UI
const headerElement = document.createElement('header');
gameElement.appendChild(headerElement);
const inventoryElement = document.createElement('dl');
inventoryElement.id = 'inventory';
inventoryElement.innerHTML = `
    <dt id="plots-label" aria-label="Plots"></dt>
    <dd id="plots-definition">${garden.length}</dd>
    <dt id="item-label" aria-label="Items"></dt>
    <dd id="item-definition">${inventory.c}</dd>
    <dt id="seed-label" aria-label="Seeds"></dt>
    <dd id="seed-definition">${inventory.s}</dd>
`;
headerElement.appendChild(inventoryElement);

function updateInventoryElement() {
    document.getElementById('plots-definition').textContent = garden.length;
    document.getElementById('item-definition').textContent = inventory.c;
    document.getElementById('seed-definition').textContent = inventory.s;
}
updateInventoryElement();

const gardenElement = document.createElement('div');
gardenElement.id = 'garden';
gameElement.appendChild(gardenElement);

// Events
gardenElement.addEventListener('click', (event) => {
    const {target} = event;
    if (target.id === 'buy-plot') {
        if (inventory.c < 5) {
            alert('Not enough currency to buy a plot.');
            return;
        }
        inventory.c -= 5;
        garden.push({ s: null, t: "c", u: Date.now() });
        updateInventoryElement();
        save();
        const plotElement = document.createElement('button');
        updatePlotElement(garden[garden.length - 1], garden.length - 1, plotElement);
        // add to garden element as the second-to-last element (before the buy button)
        gardenElement.insertBefore(plotElement, buyPlotButton);
        return;
    }
    if (!target.classList.contains('plot')) {
        return;
    }
    const index = target.dataset.key;
    const plot = garden[index];
    if (!plot) {
        return;
    }
    console.debug(`Clicked on plot ${index}:`, plot);
    garden[index] = {
        ...plot,
        s: handlePlotAction(plot.s),
        u: Date.now()
    };
    save();
    updatePlotElement(garden[index], index, target);
});

// Render
function updatePlotElement(plot, i, el) {
    el.classList.add('plot');
    el.dataset.key = i;
    el.dataset.stage = plot.s;
}
garden.forEach((plot, index) => {
    const plotElement = document.createElement('button');
    updatePlotElement(plot, index, plotElement);
    gardenElement.appendChild(plotElement);
});
const buyPlotButton = document.createElement('button');
buyPlotButton.id = 'buy-plot';
buyPlotButton.innerHTML = 'Buy Plot<br/>(5 Carrots)';
gardenElement.appendChild(buyPlotButton);

function walkGarden() {
    console.debug('Walking the garden...', garden);
    let changed = false;
    gardenElement.querySelectorAll('.plot').forEach((plotElement) => {
        const index = plotElement.dataset.key;
        const plot = garden[index];
        const derivedStage = deriveStage(plot);
        if (derivedStage !== plot.s) {
            console.debug(`Plot ${index} derived stage changed from ${plot.s} to ${derivedStage}`);
            plot.s = derivedStage;
            changed = true;
        }
        updatePlotElement(plot, index, plotElement);
    });
    if (changed) {
        save();
    }
}

function loop() {
    if (paused) {
        return;
    }
    updateInventoryElement();
    walkGarden();
}

walkGarden();
setInterval(loop, 1000);

// Utils
function deriveStage(plot) {
    const stages = ["SOWN", "SPROUT", "GROWTH", "READY", "SEED"];   
    if (!plot.s) {
        return null;
    }
    const elapsed = Date.now() - plot.u;
    const ticksElapsed = Math.floor(elapsed / TICK);
    const stageIndex = ticksElapsed % stages.length;
    return stages[stageIndex];
}

function nextStage(stage) {
    switch (stage) {
        case "SOWN":
            return "SPROUT";
        case "SPROUT":
            return "GROWTH";
        case "GROWTH":
            return "READY";
        case "READY":
            return "SEED";
        case "SEED":
            return "SOWN";
        case null:
            return stage;
    }
}

function handlePlotAction(stage) {
    switch (stage) {
        case "SOWN":
        case "SPROUT":
        case "GROWTH":
            inventory.s++;
            updateInventoryElement();
            save();
            return null;
        case "READY":
            inventory.c++;
            inventory.s++;
            updateInventoryElement();
            save();
            return null;
        case "SEED":
            inventory.s += 3;
            updateInventoryElement();
            save();
            return null;
        case null:
            if (inventory.s > 0) {
                inventory.s--;
                updateInventoryElement();
                save();
                return "SOWN";
            } else {
                alert("Not enough seeds to plant.");
                return null;
            }
    }
}