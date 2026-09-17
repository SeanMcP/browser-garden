import { levelIntToString } from './utils.js';

const GAME_SPEED = 5;

export class Plot {
    constructor() {
        this.type = null;
        this.growthLevel = 0;
        this.waterLevel = 0;
        this.fertilizerLevel = 0;
        this.plantedAt = null;
    }

    plant(plantType) {
        this.type = plantType;
        this.plantedAt = Date.now();
    }

    water() {
        this.waterLevel = 100;
    }

    fertilize() {
        this.fertilizerLevel = 100;
    }

    age() {
        if (this.waterLevel > 0 && this.fertilizerLevel > 0) {
            this.growthLevel += 1;
        }
        this.waterLevel = Math.max(0, this.waterLevel - GAME_SPEED);
        this.fertilizerLevel = Math.max(0, this.fertilizerLevel - GAME_SPEED);
    }

    addDataAttributes(element) {
        if (!element) {
            console.error("Element is required for addDataAttributes");
        }
        element.dataset.type = this.type;
        element.dataset.growthLevel = this.growthLevel;
        element.dataset.waterLevel = levelIntToString(this.waterLevel);
        element.dataset.fertilizerLevel = levelIntToString(this.fertilizerLevel);
    }
}
