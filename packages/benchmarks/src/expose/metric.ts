import type { FieldMetricSpec } from "../types";

/**
 * Scoring rules for the estate exposes. usages + features are order-insensitive
 * sets; numeric fields use tolerance; prose fields use content-word coverage.
 */
export const exposeMetric: FieldMetricSpec = {
  default: "normalized",
  fields: {
    area: "tolerance",
    rent_per_m2: "tolerance",
    extra_costs_per_m2: "tolerance",
    floor: "exact",
    label: "prose",
    name: "prose",
    description_text: "prose",
    location_text: "prose",
  },
  sets: ["usages", "features"],
  arrays: [
    // Align units by (floor, area) — label is free text and shouldn't drive
    // alignment (e.g. "Fläche A" vs "Teilfläche 1" refer to the same unit).
    // Buildings align positionally (document order) — gold uses short labels
    // ("Halle 1") while the model appends descriptors ("Halle 1 mit Bürogebäude"),
    // so label-keyed building alignment misaligns entire buildings.
    { path: "real_estate_property.buildings[].units", key: ["floor", "area"] },
  ],
};
