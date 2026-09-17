/** @ts-check */
import { Plot } from './classes.js';
import { getActiveTool } from './utils.js';

const gameElement = document.getElementById('game');

// Create UI
const gardenElement = document.createElement('div');
gardenElement.id = 'garden';
gameElement.appendChild(gardenElement);
const toolbarElement = document.createElement('div');
toolbarElement.id = 'toolbar';
gameElement.appendChild(toolbarElement);

["plant", "water", "fertilize", "harvest"].forEach((action, i) => {
    const input = document.createElement('input');
    input.type = "radio";
    input.name = "tool";
    input.value = action;
    if (i === 0) {
        input.checked = true;
    }
    const label = document.createElement('label');
    label.textContent = action;
    label.appendChild(input);
    toolbarElement.appendChild(label);
});

// State
const garden = new Map();
garden.set("1,1", new Plot());
let paused = false;

// Events
gardenElement.addEventListener('click', (event) => {

    if (event.target.classList.contains('plot')) {
        debugger;
        const action = getActiveTool();
        const key = event.target.dataset.key;
        const plot = garden.get(key);
        if (!plot) {
            return;
        }
        switch (action) {
            case "plant": {
                plot.plant("carrot");
                break;
            }
            case "water": {
                plot.water();
                break;
            }
            case "fertilize": {
                plot.fertilize();
                break;
            }
            default:
                break;
        }
    }
});

// Render
function renderGarden() {
    gardenElement.innerHTML = '';
    for (const [key, plot] of garden.entries()) {
        plot.age();
        console.log(plot);
        const plotElement = document.createElement('button');
        plotElement.className = 'plot';
        plotElement.textContent = `${key}: ${plot.type} (Growth: ${plot.growthLevel})`;
        plotElement.dataset.key = key;
        plot.addDataAttributes(plotElement);
        gardenElement.appendChild(plotElement);
    }
}

function loop() {
    if (paused) {
        return;
    }
    renderGarden();
}

renderGarden();
setInterval(loop, 1000);
