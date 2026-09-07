// Estate exposed extraction schema, adapted from immocore's StrukturEstateSchema
// (app/Domains/Estate/AI/StrukturEstateSchema.php). Adapted for OpenAI strict
// mode: additionalProperties:false everywhere and every property listed in
// `required` (optional text → ["string","null"]).

export const USAGES = [
  "office", "living", "production", "storage", "retail", "gastronomy",
  "research", "health", "open-space", "outdoor-space", "hotel", "education",
  "entertainment", "sports", "infrastructure", "data-center", "coworking",
] as const;

export const FEATURES = [
  "1a-location", "1b-location", "access-control", "acoustic-ceiling",
  "address", "air-conditioning", "apartment-building", "balcony", "bees",
  "bike-slots", "bikesharing", "block-heating", "cable-ducts", "cantina",
  "carpet-flooring", "carsharing", "cctv", "central-fire-alarm-system",
  "central-fire-alarm-system-fire-department", "central-heating",
  "ceramic-facade", "cleaning-service", "close-to-public-transport",
  "commercial-building", "completely-renovated", "concrete-core-cooling",
  "concrete-flooring", "convection-cooling", "cooled-halls", "cooling",
  "cooling-ceiling", "corner-location", "custom", "delivery-for-24h",
  "department-store", "display-window", "distance-airport", "distance-highway",
  "distance-main-station", "distance-port", "district-heating",
  "district-location", "double-floor", "dressing-room", "ecoenergy",
  "electric-heating", "electric-vehicle-charging-station", "electronic-lock",
  "elevators", "epoxy-flooring", "facade-signage", "fiberglass-connection",
  "floor-heating", "floored-windows", "floors", "front-loaded-layout",
  "gas-heating", "gastronomy-on-site", "geo-thermal", "green-courtyard",
  "green-lease-contracts", "greened-facade", "greened-roof",
  "ground-level-access", "guarded", "handicap-accessible",
  "handicap-fully-accessible", "hardwood-flooring", "heat-pump",
  "heated-halls", "heating-cooling-ceiling", "heavy-duty-crane",
  "heavy-duty-elevator", "high-ceilings", "high-foot-traffic",
  "high-voltage-outlet", "hydraulic-lift", "hydro-energy", "hypermarket",
  "individually-expandable", "infrared-heating", "janitor", "kindergarden",
  "kitchen", "l-shaped-layout", "lkw-slots", "laboratory-s1", "laboratory-s2",
  "laminate-flooring", "led-lighting", "lifting-platform",
  "lighting-with-motion-detection", "long-narrow-layout", "luxury-location",
  "marketing-website", "max-floor-load", "maximum-surface-desealing",
  "meeting-rooms", "mixed-use-building", "modernized", "monument-protection",
  "natural-stone-facade", "near-water", "nearby-sports", "needs-renovation",
  "nesting-box", "new-construction", "number-of-rooms", "number-of-workplaces",
  "oil-heating", "open-rooms", "outdoor-sunshade", "outdoor-sunshade-electric",
  "parking-garage", "pellet-heating", "pkw-slots", "places-for-socializing",
  "plot-area", "public-parking", "pylon-signage", "ramp-access",
  "receptionist", "recycling", "rentable-area", "representative-foyer",
  "retail-park", "revitalized", "rolling-gates", "roof-terrace", "server-room",
  "shopping-center", "shower", "signage-area", "smart-metering",
  "smoke-alarm-system", "smoke-outlet", "social-tenant", "solar-energy",
  "solar-heating", "sprinkler-system", "square-layout", "storage-rack",
  "storefront", "storey-heating", "tee-kitchen", "terrace", "think-tanks",
  "tile-flooring", "urban-gardening", "variable-room-division", "ventilation",
  "vinyl-flooring", "washing-clothes", "water-retention", "wild-flower-grasses",
  "wind-energy", "wired-with-cat7", "wood-hybrid-construction",
  "year-of-construction", "year-of-renovation",
] as const;

const addressSchema = {
  type: "object",
  required: ["street", "number", "postal_code", "city", "country"],
  properties: {
    street: { type: ["string", "null"] },
    number: { type: ["string", "null"] },
    postal_code: { type: ["string", "null"] },
    city: { type: "string" },
    country: { type: "string" },
  },
  additionalProperties: false,
} as const;

// `withImages` controls whether the image/floorplan arrays are required. When
// running text-only (no image parts provided to the model), requiring them
// forces hallucinated virtual paths — so we emit omit them entirely.
const unitSchema = (withImages: boolean) => ({
  type: "object",
  required: [
    "label", "usages", "area", "floor", "rent_per_m2",
    "extra_costs_per_m2", "features", ...(withImages ? ["images", "floorplans"] : []),
  ],
  properties: {
    label: { type: "string" },
    usages: { type: "array", items: { type: "string", enum: [...USAGES] } },
    area: { type: "number" },
    floor: { type: "number", minimum: -5 },
    rent_per_m2: { type: ["number", "null"], minimum: 0 },
    extra_costs_per_m2: { type: ["number", "null"], minimum: 0 },
    features: { type: "array", items: { type: "string", enum: [...FEATURES] } },
    ...(withImages
      ? { images: { type: "array", items: { type: "string" } }, floorplans: { type: "array", items: { type: "string" } } }
      : {}),
  },
  additionalProperties: false,
}) as const;

const buildingSchema = (withImages: boolean) => ({
  type: "object",
  required: ["label", "features", "units", ...(withImages ? ["images"] : [])],
  properties: {
    label: { type: "string" },
    features: { type: "array", items: { type: "string", enum: [...FEATURES] } },
    ...(withImages ? { images: { type: "array", items: { type: "string" } } } : {}),
    units: { type: "array", items: unitSchema(withImages) },
  },
  additionalProperties: false,
}) as const;

const estate = (withImages: boolean) => ({
  type: "object",
  required: ["real_estate_property"],
  properties: {
    real_estate_property: {
      type: "object",
      required: ["name", "description_text", "address", "features", "buildings"],
      properties: {
        name: { type: "string" },
        description_text: { type: "string" },
        location_text: { type: ["string", "null"] },
        address: addressSchema,
        features: { type: "array", items: { type: "string", enum: [...FEATURES] } },
        buildings: { type: "array", items: buildingSchema(withImages) },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
}) as const;

/** Full schema (images/floorplans required) — for image-enabled runs. */
export const estateSchema = estate(true);

/** Text-only schema (no image/floorplan arrays) — for `parsePdf` without images. */
export const estateTextSchema = estate(false);

export type Unit = {
  label: string;
  usages: string[];
  area: number;
  floor: number;
  rent_per_m2: number | null;
  extra_costs_per_m2: number | null;
  features: string[];
  images: string[];
  floorplans: string[];
};

export type ExposeGold = {
  name: string;
  description_text: string;
  location_text?: string | null;
  address: { street: string | null; number: string | null; postal_code: string | null; city: string; country: string };
  features: string[];
  buildings: { label: string; features: string[]; units: Unit[] }[];
};

/** Build a strict-mode-valid partial gold for a case. */
export const wrapGold = (gold: ExposeGold) => ({ real_estate_property: gold });

/** Sets that should be scored order-insensitively. */
export const exposeSets = [
  "real_estate_property.features",
  "real_estate_property.buildings[].features",
  "real_estate_property.buildings[].units[].features",
  "real_estate_property.buildings[].units[].usages",
] as const;
