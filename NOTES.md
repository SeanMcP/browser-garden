Stages

1. Sown
2. Sprout
3. Growth
4. Ready
5. Seed

- Planted at 000000
- Now 300050
- Tick = 60000
- Ticks = Math.floor((Now - Planted) / Tick)
- Stage = Ticks / Stages.length

- A plot doesn't progress until it has been seeded once.
- A harvested plant yields one item and one seed
- Harvesting seeds yields five seeds

```ts
type Plot = {
  stage: null | "SOWN" | "SPROUT" | "GROWTH" | "READY" | "SEED";
  updatedAt: number;
  type: "CARROT"; // Maybe more in the future
};
```

Should watering make it grow faster or produce more? The latter is easier, but
the former is more accurate. Maybe we have no watering.

Purchasing additional plots costs carrots.

Plots are an array. The UI enables you to unlock one more plot, which is added
to the end of the array.
