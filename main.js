/** @ts-check */

const gameElement = document.getElementById('game');

// State
const TICK = ["127.0.0.1", "localhost"].includes(location.hostname)  ? 5_000 : 60_000;
const garden = JSON.parse(localStorage.getItem('garden') || JSON.stringify([{ s: null, t: "c", u: Date.now() }]));
const inventory = JSON.parse(localStorage.getItem('inventory') || `{"c": 0, "s": 5}`);
function save() {
    localStorage.setItem('garden', JSON.stringify(garden));
    localStorage.setItem('inventory', JSON.stringify(inventory));
}
let paused = false;

// Create UI
const headerElement = document.createElement('header');
const titleElement = document.createElement('span');
titleElement.textContent = 'Browser Garden';
headerElement.appendChild(titleElement);
gameElement.appendChild(headerElement);
const inventoryElement = document.createElement('dl');
const scoreDT = document.createElement('dt');
scoreDT.id = 'item-label';
scoreDT.ariaLabel = 'Items';
const scoreDD = document.createElement('dd');
scoreDD.id = 'item-definition';
scoreDD.textContent = inventory.c;
inventoryElement.appendChild(scoreDT);
inventoryElement.appendChild(scoreDD);

const seedDT = document.createElement('dt');
seedDT.id = 'seed-label';
seedDT.ariaLabel = 'Seeds';
const seedDD = document.createElement('dd');
seedDD.id = 'seed-definition';
seedDD.textContent = inventory.s;
inventoryElement.appendChild(seedDT);
inventoryElement.appendChild(seedDD);

inventoryElement.id = 'inventory';
function updateInventoryElement() {
    scoreDD.textContent = inventory.c;
    seedDD.textContent = inventory.s;
}
updateInventoryElement();
headerElement.appendChild(inventoryElement);

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
        save();
        const plotElement = document.createElement('button');
        updatePlotElement(garden[garden.length - 1], garden.length - 1, plotElement);
        // add to garden element as the second-to-last element (before the buy button)
        gardenElement.insertBefore(plotElement, buyPlotButton);
        updateInventoryElement();
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
            save();
            return null;
        case "READY":
            inventory.c += 2;
            inventory.s++;
            save();
            return null;
        case "SEED":
            inventory.s += 3;
            save();
            return null;
        case null:
            if (inventory.s > 0) {
                inventory.s--;
                save();
                return "SOWN";
            } else {
                alert("Not enough seeds to plant.");
                return null;
            }
    }
}