import type { ExposeGold } from "./schema";

const de = "Deutschland";

// ---------------------------------------------------------------------------
// 1. Sandstraße 8/12, Lübeck — RETAIL (CBRE)
// ---------------------------------------------------------------------------
export const sandstrasse: ExposeGold = {
  name: "Sandstraße 8/12",
  description_text:
    "Vermietung von Retailflächen in der Lübecker Innenstadt, im Alleinauftrag von CBRE. Gesamtfläche ca. 392,37 m² Verkaufsfläche plus ca. 194,83 m² Nebenfläche. Front ca. 12,00 m. Aktueller Mieter: Ex Deichmann. Nachbarmieter: New Yorker, Ernsting's Family, MyToys, Rossmann u.v.m. Bezugstermin kurzfristig, Miete 15.000,00 EUR pro Monat zzgl. gesetzlicher MwSt. und Nebenkosten.",
  location_text:
    "Das Objekt befindet sich mitten in der beliebten Lübecker Innenstadt und ist an den Nahverkehr hervorragend angebunden.",
  address: { street: "Sandstraße", number: "8/12", postal_code: "23552", city: "Lübeck", country: de },
  features: ["close-to-public-transport"],
  buildings: [
    {
      label: "Sandstraße 8/12",
      features: ["storefront"],
      units: [
        { label: "Erdgeschoss Verkaufsfläche", usages: ["retail"], area: 243.28, floor: 0, rent_per_m2: null, extra_costs_per_m2: null, features: [], images: [], floorplans: [] },
        { label: "1. Obergeschoss", usages: ["retail"], area: 149.09, floor: 1, rent_per_m2: null, extra_costs_per_m2: null, features: [], images: [], floorplans: [] },
        { label: "1. Untergeschoss Nebenfläche", usages: ["storage"], area: 194.83, floor: -1, rent_per_m2: null, extra_costs_per_m2: null, features: [], images: [], floorplans: [] },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// 2. Augustaanlage 62-64, Mannheim — PRIME PULSE OFFICES (SCHOLL)
// ---------------------------------------------------------------------------
export const primePulse: ExposeGold = {
  name: "PRIME PULSE OFFICES.",
  description_text:
    "Büroflächen in Mannheim, Erstbezug nach Sanierung. Flexible Raumaufteilung nach Mieterwunsch, öffenbare Fenster, elektrische Raffstores, Küchen mit Loungebereich, Decken-/Wandumluftkühlgeräte, Glastrennwände, Arbeitsplatzstehleuchten, EDV-Verkabelung KAT7. Objektmerkmale: repräsentatives Foyer, barrierefreier Zugang über Rollstuhllift, Personenfahrstuhl, eigene PKW-Stellplätze, Bike-Sharing, Glasfaseranschluss, lediglich 7% Allgemeinflächenanteil.",
  location_text:
    "Makrolage Mannheim. Mikrolage und Verkehrsanbindung: S-Bahn Mannheim Hauptbahnhof 2,1 km (S1-S3, S6, S9), Bus Mannheim Kunstverein 350 m (63, 63E, 64), Tram/Straßenbahn Mannheim Planetarium 290 m (6, 6A, 9, E). Autobahn AK Mannheim - A6 6 km, Frankfurt Flughafen 77 km.",
  address: { street: "Augustaanlage", number: "62-64", postal_code: "68165", city: "Mannheim", country: de },
  features: ["close-to-public-transport", "pkw-slots", "bikesharing", "distance-main-station", "distance-highway", "distance-airport", "commercial-building"],
  buildings: [
    {
      label: "Augustaanlage 62-64",
      features: ["elevators", "representative-foyer", "handicap-fully-accessible", "wired-with-cat7", "air-conditioning", "variable-room-division", "kitchen", "led-lighting", "fiberglass-connection", "district-heating", "completely-renovated", "outdoor-sunshade-electric"],
      units: [
        { label: "3. Obergeschoss", usages: ["office"], area: 649, floor: 3, rent_per_m2: 16.0, extra_costs_per_m2: 3.5, features: ["open-rooms"], images: [], floorplans: [] },
        { label: "1. Obergeschoss", usages: ["office"], area: 334, floor: 1, rent_per_m2: 15.0, extra_costs_per_m2: 3.5, features: ["open-rooms"], images: [], floorplans: [] },
        { label: "Souterrain", usages: ["office", "research"], area: 639, floor: -1, rent_per_m2: 12.0, extra_costs_per_m2: 3.5, features: [], images: [], floorplans: [] },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// 3. Flottenstraße 54-55, Berlin-Reinickendorf — INDUSTRIAL (BEOS)
// ---------------------------------------------------------------------------
export const flottenstrasse: ExposeGold = {
  name: "Flottenstraße Berlin",
  description_text:
    "Produktions- und Lagerstandort in einem Gewerbe- und Industriegebiet in Berlin-Reinickendorf. Drei Hallen mit Büroanteil, rd. 15.000 m² Mietfläche, zu 100% vermietet. Mieter: Freudenberg NOK Mechatronics und iSi Automotive (Automobilbranche). Die Hallen wurden in den 60er und 80er Jahren erbaut, umfangreiche Umbauarbeiten Anfang der 90er Jahre sowie 2001/2002. Grundstücksfläche ca. 39.149 m², Mieteinnahmen 725.494 Euro p.a. Vermietete Fläche 14.845 m² (nur Gebäude), Büroflächen 3.111 m², Lager-/Produktionsflächen 11.743 m², ca. 100 Stellplätze. Deckenhöhe: Büro 2,60-3,50 m, Produktion/Lager 3,80-8,40 m.",
  location_text:
    "Das Objekt liegt nur wenige Minuten von der Stadtautobahn A111 entfernt, Flughafen Tegel ca. 5 km. In der Nähe befinden sich die S-Bahn-Stationen Wilhelmsruh und Alt-Reinickendorf; der Hauptbahnhof ist über die S-Bahn-Linien S1 und S2 in etwa 20 Minuten erreichbar, die U-Bahn-Linie U8 ergänzt die Anbindung. Das Gebiet ist gewerblich-industriell genutzt mit einem Branchenmix aus Produktion, Großhandel, Logistik und Dienstleistung. Durchschnittsmiete Produktion/Lager 3,90 €/m², Büro 3,86 €/m².",
  address: { street: "Flottenstraße", number: "54-55", postal_code: null, city: "Berlin", country: de },
  features: ["pkw-slots", "distance-airport", "distance-main-station", "distance-highway", "close-to-public-transport", "plot-area", "rentable-area", "commercial-building"],
  buildings: [
    {
      label: "Halle 1",
      features: ["air-conditioning", "rolling-gates"],
      units: [
        { label: "Produktion und Lagerhalle 1", usages: ["production", "storage"], area: 5017, floor: 0, rent_per_m2: null, extra_costs_per_m2: null, features: ["high-ceilings"], images: [], floorplans: [] },
        { label: "Bürogebäude Halle 1", usages: ["office"], area: 1908, floor: 0, rent_per_m2: null, extra_costs_per_m2: null, features: [], images: [], floorplans: [] },
      ],
    },
    {
      label: "Halle 2",
      features: ["air-conditioning", "rolling-gates"],
      units: [
        { label: "Produktion und Lagerhalle 2", usages: ["production", "storage"], area: 5447, floor: 0, rent_per_m2: null, extra_costs_per_m2: null, features: ["high-ceilings"], images: [], floorplans: [] },
        { label: "Bürogebäude Halle 2", usages: ["office"], area: 874, floor: 0, rent_per_m2: null, extra_costs_per_m2: null, features: [], images: [], floorplans: [] },
      ],
    },
    {
      label: "Halle 3",
      features: ["air-conditioning", "rolling-gates"],
      units: [
        { label: "Produktion und Lagerhalle 3", usages: ["production", "storage"], area: 1279, floor: 0, rent_per_m2: null, extra_costs_per_m2: null, features: ["high-ceilings"], images: [], floorplans: [] },
        { label: "Bürogebäude Halle 3", usages: ["office"], area: 329, floor: 0, rent_per_m2: null, extra_costs_per_m2: null, features: [], images: [], floorplans: [] },
      ],
    },
    {
      label: "Überdachte Freifläche",
      features: [],
      units: [
        { label: "Außenlager", usages: ["storage"], area: 2430, floor: 0, rent_per_m2: null, extra_costs_per_m2: null, features: [], images: [], floorplans: [] },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// 4. DOCK 100, Am Borsigturm 100, Berlin — LOGISTIKPARK (BEOS)
// ---------------------------------------------------------------------------
export const dock100: ExposeGold = {
  name: "DOCK 100",
  description_text:
    "Gewerbe- und Logistikpark direkt am Borsighafen inmitten des 15 Hektar großen historischen Borsig-Areals. Nutzung: Büro, Lager, Produktion, Logistik. Baujahr 1915, 1934, 1990, 2016. Gesamtmietfläche ca. 92.500 m², Mieteinheiten nach Mieterwunsch, Geschosse Ebene 0 bis Ebene 9 (UG bis 8.OG), 35 Mieter, Grundstücksfläche ca. 81.000 m². Gebäude: Factory Dock, Office Dock und historische Veithalle. Lager-, Produktions- und Büroflächen gebündelt an einem Standort, kombinierbar.",
  location_text:
    "Makro-Lage: Gesundbrunnen ca. 20 Min / 10 km, Berlin Hauptbahnhof ca. 20 Min / 11 km, Flughafen BER ca. 35 Min / 40 km, A111 ca. 4 Min / 1,6 km. Mikro-Lage: Technologiezentrum am Borsigturm, Einkaufscenter Hallen am Borsigturm, Vivantes Humboldt-Klinikum, U- und S-Bahnstationen sowie Bushaltestellen in unmittelbarer Nähe. Blick auf den Borsighafen und Tegeler See.",
  address: { street: "Am Borsigturm", number: "100", postal_code: "13507", city: "Berlin", country: de },
  features: ["guarded", "near-water", "close-to-public-transport", "distance-highway", "distance-airport", "distance-main-station", "plot-area", "rentable-area", "commercial-building", "mixed-use-building", "year-of-construction"],
  buildings: [
    {
      label: "Factory Dock",
      features: ["sprinkler-system", "central-fire-alarm-system-fire-department", "heavy-duty-elevator", "elevators", "central-heating", "ground-level-access", "ramp-access", "max-floor-load", "high-ceilings", "variable-room-division"],
      units: [
        { label: "Factory Dock Ebene 5 - Fläche A", usages: ["production", "storage", "office"], area: 2408, floor: 5, rent_per_m2: null, extra_costs_per_m2: null, features: [], images: [], floorplans: [] },
        { label: "Factory Dock Ebene 5 - Fläche B", usages: ["production", "storage", "office"], area: 2500, floor: 5, rent_per_m2: null, extra_costs_per_m2: null, features: [], images: [], floorplans: [] },
      ],
    },
    {
      label: "Office Dock",
      features: ["sprinkler-system", "central-fire-alarm-system-fire-department", "central-heating", "cantina", "elevators"],
      units: [
        { label: "Office Dock Ebene 0 (Souterrain)", usages: ["office", "education", "storage"], area: 377, floor: 0, rent_per_m2: null, extra_costs_per_m2: null, features: [], images: [], floorplans: [] },
        { label: "Office Dock Ebene 1 (Erdgeschoss)", usages: ["office"], area: 610, floor: 1, rent_per_m2: null, extra_costs_per_m2: null, features: [], images: [], floorplans: [] },
        { label: "Office Dock Ebene 6 (5.OG)", usages: ["office"], area: 469, floor: 6, rent_per_m2: null, extra_costs_per_m2: null, features: [], images: [], floorplans: [] },
        { label: "Office Dock Ebene 8 (7.OG)", usages: ["office"], area: 266, floor: 8, rent_per_m2: null, extra_costs_per_m2: null, features: [], images: [], floorplans: [] },
      ],
    },
    {
      label: "Veithalle",
      features: ["sprinkler-system", "central-fire-alarm-system-fire-department", "high-ceilings", "ground-level-access", "rolling-gates", "cooled-halls", "storage-rack"],
      units: [
        { label: "Veithalle Lagerfläche", usages: ["storage"], area: 4360, floor: 0, rent_per_m2: null, extra_costs_per_m2: null, features: [], images: [], floorplans: [] },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// 5. Holzhauser Quartier, Holzhauser Straße 139/153/155, Berlin (BEOS)
// ---------------------------------------------------------------------------
export const holzhauser: ExposeGold = {
  name: "Holzhauser Quartier",
  description_text:
    "Gewerbeimmobilie im Gewerbegebiet Borsigwalde. Nutzung: Lager/Logistik, Produktion, Büro, Werkstatt, Schulung, Verkauf. Baujahr 1922-2016. Gesamtmietfläche ca. 26.000 m², flexibel nutzbare Flächen, nach Mieterwunsch ausbau- und teilbar, Geschosse EG bis 3.OG. Stellplätze direkt auf dem Gelände. Heizung: Gas-Heizung (Geb. 139 und 153/155). Besonderheiten: attraktive Gewerbelage an der Hauptstraße unweit der Autobahnauffahrt A111, Gebäude 139 mit repräsentativem verglastem Eingangsbereich, Gebäude 153 und 155 als Gewerbeareal mit Branchenmix.",
  location_text:
    "Historisch gewachsene Liegenschaft, ursprünglich für einen Eigennutzer der Textilindustrie gebaut, Entwicklung zu vielschichtig genutztem Gewerbehof. Direkte Lage an der Hauptstraße mit sehr guter Sichtbarkeit und guter Verkehrsanbindung. Nähe zur Autobahn A111, der U6 und U8 sowie der S-Bahnstation Tegel. Namhafte Mieter: Haushahn, Deutsche Post, Stahlgruber, Sto, Wego, TransPak. Direkt gegenüber liegt der Gewerbepark Holzhauser Markt mit über 60 Unternehmen.",
  address: { street: "Holzhauser Straße", number: "139, 153, 155", postal_code: "13509", city: "Berlin", country: de },
  features: ["close-to-public-transport", "gas-heating", "pkw-slots", "distance-highway", "distance-airport", "distance-main-station", "commercial-building", "mixed-use-building", "rentable-area", "year-of-construction", "individually-expandable"],
  buildings: [
    {
      label: "Gebäude 139",
      features: ["representative-foyer", "gas-heating", "variable-room-division", "high-ceilings"],
      units: [
        { label: "Geb. 139 Erdgeschoss Lager/Produktion", usages: ["production", "storage"], area: 355, floor: 0, rent_per_m2: 9.0, extra_costs_per_m2: null, features: ["high-ceilings", "ground-level-access", "rolling-gates"], images: [], floorplans: [] },
        { label: "Geb. 139 Erdgeschoss Lager/Produktion und Büro", usages: ["production", "storage", "office"], area: 683, floor: 0, rent_per_m2: 9.0, extra_costs_per_m2: null, features: ["high-ceilings", "ground-level-access", "rolling-gates"], images: [], floorplans: [] },
        { label: "Geb. 139 1. Obergeschoss Büro", usages: ["office"], area: 204, floor: 1, rent_per_m2: 9.5, extra_costs_per_m2: null, features: [], images: [], floorplans: [] },
      ],
    },
    {
      label: "Gebäude 153",
      features: ["gas-heating", "high-ceilings", "modernized"],
      units: [
        { label: "Geb. 153 1. Obergeschoss Büro", usages: ["office"], area: 471, floor: 1, rent_per_m2: 13.5, extra_costs_per_m2: null, features: ["high-ceilings"], images: [], floorplans: [] },
      ],
    },
    {
      label: "Gebäude 153 TE",
      features: ["ground-level-access", "rolling-gates", "high-ceilings"],
      units: [
        { label: "Geb. 153 TE Lager und Büro", usages: ["storage", "office"], area: 592, floor: 0, rent_per_m2: 8.5, extra_costs_per_m2: null, features: ["high-ceilings", "ground-level-access", "rolling-gates"], images: [], floorplans: [] },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// 6. Elsenstraße 87, Berlin — HISTORIC BÜROS (BEOS)
// ---------------------------------------------------------------------------
export const elsenstrasse: ExposeGold = {
  name: "Elsenstraße 87",
  description_text:
    "Gewerbeobjekt, historisches Backsteingebäude von 1895, ursprünglich eine Piano-Fabrik. Modernisierung 2021/2022. Bürokomplex, der Geschichte und Zukunft verbindet. Nutzung: Büro, Lager. Gesamtmietfläche ca. 4.905 m², davon Büro ca. 4.677 m² (teilbar ab 227 m²), Lager ca. 228 m² (teilbar ab 8 m²). Geschosse: Keller, Erdgeschoss, 4 Obergeschosse. Gebäudeausstattung: Fernwärmeversorgung, Kühlung in allen Büros, repräsentative Lobby mit Empfangslounge, 4 Treppenhäuser, 2 Personen-/Lastenaufzüge, Hohlraumboden, barrierearm, überdachte Fahrradstellplätze, außenliegender Sonnenschutz auf der Südseite, lichte Raumhöhe 3,55-3,75 m mit historischen Kappendecken.",
  location_text:
    "Direkt am Siemenscampus, in der Nähe des Görlitzer und Treptower Parks sowie der A100.",
  address: { street: "Elsenstraße", number: "87", postal_code: "12435", city: "Berlin", country: de },
  features: ["close-to-public-transport", "bike-slots", "distance-highway", "commercial-building", "year-of-construction", "modernized", "year-of-renovation"],
  buildings: [
    {
      label: "Elsenstraße 87",
      features: ["elevators", "representative-foyer", "district-heating", "air-conditioning", "high-ceilings", "meeting-rooms", "tee-kitchen", "shower", "server-room", "handicap-accessible", "bike-slots", "outdoor-sunshade", "cable-ducts", "ventilation", "floor-heating"],
      units: [
        { label: "EG Büroeinheit 1", usages: ["office"], area: 282, floor: 0, rent_per_m2: 24.0, extra_costs_per_m2: 3.6, features: ["high-ceilings", "air-conditioning"], images: [], floorplans: [] },
        { label: "EG Büroeinheit 2", usages: ["office"], area: 227, floor: 0, rent_per_m2: 24.0, extra_costs_per_m2: 3.6, features: ["high-ceilings", "air-conditioning"], images: [], floorplans: [] },
        { label: "1. Obergeschoss", usages: ["office"], area: 1042, floor: 1, rent_per_m2: 24.0, extra_costs_per_m2: 3.6, features: ["high-ceilings", "air-conditioning", "open-rooms", "tee-kitchen", "server-room"], images: [], floorplans: [] },
        { label: "2. Obergeschoss", usages: ["office"], area: 1042, floor: 2, rent_per_m2: 24.0, extra_costs_per_m2: 3.6, features: ["high-ceilings", "air-conditioning", "open-rooms", "tee-kitchen", "server-room"], images: [], floorplans: [] },
        { label: "3. Obergeschoss", usages: ["office"], area: 1042, floor: 3, rent_per_m2: 24.0, extra_costs_per_m2: 3.6, features: ["high-ceilings", "air-conditioning", "open-rooms", "tee-kitchen", "server-room"], images: [], floorplans: [] },
        { label: "4. Obergeschoss", usages: ["office"], area: 1042, floor: 4, rent_per_m2: 24.0, extra_costs_per_m2: 3.6, features: ["high-ceilings", "air-conditioning", "open-rooms", "tee-kitchen", "server-room"], images: [], floorplans: [] },
        { label: "Untergeschoss Lager", usages: ["storage"], area: 228, floor: -1, rent_per_m2: 8.0, extra_costs_per_m2: 3.6, features: [], images: [], floorplans: [] },
      ],
    },
  ],
};
