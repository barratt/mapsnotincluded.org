/*
 * Lookup tables for the world page: biome colours, sprite file names and
 * fallback English labels for zone, geyser, POI and asteroid ids.
 *
 * Biome colours, label texts and the id -> sprite mappings are ported from
 * the ONI Seed Browser (ui/model/ZoneTypeUi.kt, ui/DrawableUtil.kt and
 * composeResources/values/strings.xml):
 *
 *   ONI Seed Browser
 *   Copyright (C) 2026 Stefan Oltmann
 *   https://stefan-oltmann.de
 *   https://github.com/StefanOltmann/oni-seed-browser
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU Affero General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Affero General Public License for more details.
 *
 * World trait names, descriptions and colours come from Sgt_Imalas' ONI Trait
 * Finder (MIT, https://github.com/Sgt-Imalas/ONITraitFinder), see
 * src/data/oni-names.json. Sprites are Klei Entertainment's game art.
 */

import names from '@/data/oni-names.json'

const SPRITES = '/images/oni/seed-browser/'
const TRAIT_SPRITES = '/images/oni/worldTraits/'

// Strips "expansion1::worlds/" style prefixes and the "Complete" suffix that
// building prefabs carry in save files.
export function shortId(id) {
  return String(id ?? '').replace(/^.*[/:]/, '').replace(/Complete$/, '')
}

// ---------------------------------------------------------------- biomes --

const ZONES = {
  Sandstone: { color: '#F2BB47', icon: 'biome_sandstone', label: 'Sandstone' },
  Barren: { color: '#97752C', icon: 'biome_barren', label: 'Barren' },
  Space: { color: '#242424', icon: 'biome_space', label: 'Space' },
  FrozenWastes: { color: '#9DC9D6', icon: 'biome_frozen', label: 'Tundra' },
  BoggyMarsh: { color: '#7B974B', icon: 'biome_marsh', label: 'Marsh' },
  ToxicJungle: { color: '#CB95A3', icon: 'biome_jungle', label: 'Jungle' },
  Ocean: { color: '#4C4CFF', icon: 'biome_ocean', label: 'Ocean' },
  Rust: { color: '#FFA007', icon: 'biome_rust', label: 'Rust' },
  Forest: { color: '#8EC039', icon: 'biome_forest', label: 'Forest' },
  Radioactive: { color: '#4AE458', icon: 'biome_radioactive', label: 'Radioactive' },
  Swamp: { color: '#EB9B3F', icon: 'biome_swamp', label: 'Swampy' },
  Wasteland: { color: '#CC3636', icon: 'biome_wasteland', label: 'Wasteland' },
  Metallic: { color: '#FFA007', icon: 'biome_metallic', label: 'Metallic' },
  Moo: { color: '#8EC039', icon: 'biome_moo', label: 'Moo' },
  IceCaves: { color: '#ABCFEA', icon: 'biome_icecaves', label: 'Ice Cave' },
  CarrotQuarry: { color: '#CDA2C7', icon: 'biome_carrot_quarry', label: 'Cool Pool' },
  SugarWoods: { color: '#A2CDA4', icon: 'biome_sugarwoods', label: 'Nectar' },
  PrehistoricGarden: { color: '#006127', icon: 'biome_garden', label: 'Garden' },
  PrehistoricRaptor: { color: '#352F8C', icon: 'biome_raptor', label: 'Feather' },
  PrehistoricWetlands: { color: '#645906', icon: 'biome_wetlands', label: 'Wetlands' },
  OilField: { color: '#52321D', icon: 'biome_oil', label: 'Oily' },
  MagmaCore: { color: '#DE5A3B', icon: 'biome_magma', label: 'Magma' },
  KelpForest: { color: '#2E7D32', icon: 'biome_kelp_forest', label: 'Kelp Forest' },
  Reef: { color: '#FF7043', icon: 'biome_reef', label: 'Reef' },
  Abyss: { color: '#1A237E', icon: 'biome_abyss', label: 'Abyss' },
  Beach: { color: '#D2B48C', icon: 'biome_beach', label: 'Beach' },
}

// Names that show up in older data or in the game's subworld file names.
const ZONE_ALIASES = {
  Jungle: 'ToxicJungle',
  Marsh: 'BoggyMarsh',
  Frozen: 'FrozenWastes',
  Tundra: 'FrozenWastes',
  Oil: 'OilField',
  Oily: 'OilField',
  Magma: 'MagmaCore',
  Sugarwoods: 'SugarWoods',
  Nectar: 'SugarWoods',
  Aquatic: 'KelpForest',
  PrehistoricSwamp: 'PrehistoricWetlands',
  PrehistoricWasteland: 'PrehistoricRaptor',
  Garden: 'PrehistoricGarden',
  Raptor: 'PrehistoricRaptor',
  Wetlands: 'PrehistoricWetlands',
}

function hashHue(text) {
  let h = 0
  for (const c of String(text)) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h % 360
}

export function zoneInfo(zone) {
  const key = ZONES[zone] ? zone : ZONE_ALIASES[zone]
  const known = ZONES[key]
  if (known) return { id: key, color: known.color, icon: SPRITES + known.icon + '.webp', label: known.label }
  return { id: zone, color: `hsl(${hashHue(zone)} 40% 45%)`, icon: null, label: String(zone ?? '?') }
}

// --------------------------------------------------------------- geysers --

// Keyed by the game's geyser config id (GeyserGenericConfig), plus OilWell.
const GEYSERS = {
  steam: ['geyser_cool_steam_vent', 'Cool Steam Vent'],
  hot_steam: ['geyser_steam_vent', 'Steam Vent'],
  hot_water: ['geyser_water', 'Water Geyser'],
  slush_water: ['geyser_cool_slush_geyser', 'Cool Slush Geyser'],
  filthy_water: ['geyser_polluted_water_vent', 'Polluted Water Vent'],
  slush_salt_water: ['geyser_cool_salt_slush_geyser', 'Cool Salt Slush Geyser'],
  salt_water: ['geyser_salt_water', 'Salt Water Geyser'],
  small_volcano: ['geyser_minor_volcano', 'Minor Volcano'],
  big_volcano: ['geyser_volcano', 'Volcano'],
  liquid_co2: ['geyser_carbon_dioxide', 'Carbon Dioxide Geyser'],
  hot_co2: ['geyser_carbon_dioxide_vent', 'Carbon Dioxide Vent'],
  hot_hydrogen: ['geyser_hydrogen_vent', 'Hydrogen Vent'],
  hot_po2: ['geyser_hot_polluted_oxygen_vent', 'Hot Polluted Oxygen Vent'],
  slimy_po2: ['geyser_infectious_polluted_oxygen_vent', 'Infectious Polluted Oxygen Vent'],
  chlorine_gas: ['geyser_chlorine_gas_vent', 'Chlorine Gas Vent'],
  chlorine_gas_cool: ['geyser_chlorine_gas_vent', 'Cool Chlorine Gas Vent'],
  methane: ['geyser_natural_gas_geyser', 'Natural Gas Geyser'],
  molten_copper: ['geyser_copper_volcano', 'Copper Volcano'],
  molten_iron: ['geyser_iron_volcano', 'Iron Volcano'],
  molten_gold: ['geyser_gold_volcano', 'Gold Volcano'],
  molten_aluminum: ['geyser_aluminum_volcano', 'Aluminum Volcano'],
  molten_cobalt: ['geyser_cobalt_volcano', 'Cobalt Volcano'],
  molten_tungsten: ['geyser_tungsten_volcano', 'Tungsten Volcano'],
  molten_niobium: ['geyser_niobium_volcano', 'Niobium Volcano'],
  oil_drip: ['geyser_leaky_oil_fissure', 'Leaky Oil Fissure'],
  liquid_sulfur: ['geyser_liquid_sulfur_geyser', 'Liquid Sulfur Geyser'],
  dirty_brine: ['geyser_polluted_brine', 'Polluted Brine Vent'],
  oilwell: ['geyser_oil_reservoir', 'Oil Reservoir'],
  tidal_spring: ['geyser_tidal_spring', 'Tidal Spring'],
  thermal_gas_fissure: ['geyser_thermal_gas_fissure', 'Thermal Gas Fissure'],
}

// Used when an id is unknown: match on the display name instead.
const GEYSER_NAME_HINTS = [
  [/cool steam/i, 'steam'],
  [/steam/i, 'hot_steam'],
  [/salt slush/i, 'slush_salt_water'],
  [/slush/i, 'slush_water'],
  [/salt water/i, 'salt_water'],
  [/polluted water/i, 'filthy_water'],
  [/brine/i, 'dirty_brine'],
  [/water/i, 'hot_water'],
  [/minor volcano/i, 'small_volcano'],
  [/copper/i, 'molten_copper'],
  [/iron/i, 'molten_iron'],
  [/gold/i, 'molten_gold'],
  [/alumin/i, 'molten_aluminum'],
  [/cobalt/i, 'molten_cobalt'],
  [/tungsten/i, 'molten_tungsten'],
  [/niobium/i, 'molten_niobium'],
  [/volcano/i, 'big_volcano'],
  [/carbon dioxide geyser/i, 'liquid_co2'],
  [/carbon dioxide/i, 'hot_co2'],
  [/hydrogen/i, 'hot_hydrogen'],
  [/infectious|slimy/i, 'slimy_po2'],
  [/polluted oxygen/i, 'hot_po2'],
  [/cool chlorine/i, 'chlorine_gas_cool'],
  [/chlorine/i, 'chlorine_gas'],
  [/natural gas|methane/i, 'methane'],
  [/leaky oil|oil fissure/i, 'oil_drip'],
  [/oil (reservoir|well)/i, 'oilwell'],
  [/sulfur/i, 'liquid_sulfur'],
  [/tidal/i, 'tidal_spring'],
  [/thermal gas/i, 'thermal_gas_fissure'],
]

export function geyserInfo(type, name) {
  const raw = String(type ?? '')
  let key = GEYSERS[raw] ? raw : GEYSERS[raw.toLowerCase()] ? raw.toLowerCase() : null
  if (!key) key = GEYSER_NAME_HINTS.find(([re]) => re.test(name ?? '') || re.test(raw.replace(/_/g, ' ')))?.[1]
  const entry = GEYSERS[key]
  return {
    id: key ?? raw,
    icon: entry ? SPRITES + entry[0] + '.webp' : null,
    label: name || entry?.[1] || raw,
  }
}

// ------------------------------------------------------ points of interest --

const POIS = {
  Headquarters: ['building_printing_pod', 'Printing Pod'],
  WarpConduitSender: ['building_supply_teleporter_input', 'Supply Teleporter Input'],
  WarpConduitReceiver: ['building_supply_teleporter_output', 'Supply Teleporter Output'],
  WarpPortal: ['building_teleporter_transmitter', 'Teleporter Transmitter'],
  WarpReceiver: ['building_teleporter_receiver', 'Teleporter Receiver'],
  GeneShuffler: ['building_neural_vacillator', 'Neural Vacillator'],
  MassiveHeatSink: ['building_anti_entropy_thermo_nullifier', 'Anti Entropy Thermo-Nullifier'],
  SapTree: ['building_sap_tree', 'Experiment 52B'],
  GravitasPedestal: ['poi_artifact_filled', 'Artifact'],
  PropSurfaceSatellite1: ['poi_crashed_satellite', 'Crashed Satellite'],
  PropSurfaceSatellite2: ['poi_wrecked_satellite', 'Wrecked Satellite'],
  PropSurfaceSatellite3: ['poi_crushed_satellite', 'Crushed Satellite'],
  TemporalTearOpener: ['building_temporal_tear_opener', 'Temporal Tear Opener'],
  CryoTank: ['building_cryotank', 'Cryotank 3000'],
  PropFacilityStatue: ['poi_prop_facility_statue', 'Monument'],
  GeothermalVentEntity: ['poi_geothermal_vent_entity', 'Geothermal Vent'],
  GeothermalControllerEntity: ['poi_geothermal_controller_entity', 'Geothermal Controller'],
  POICeresTechUnlock: ['poi_ceres_tech_unlock', 'Tech Unlock'],
  VendingMachine: ['building_vending_machine', 'Vending Machine'],
}

export function poiInfo(type, name) {
  const key = shortId(type)
  const entry = POIS[key]
  return { id: key, icon: entry ? SPRITES + entry[0] + '.webp' : null, label: name || entry?.[1] || key }
}

// -------------------------------------------------------------- asteroids --

const ASTEROID_SPRITES = {
  TerraMoonlet: 'cluster_spacedout_terrania',
  IdealLandingSite: 'asteroid_irradiated_forest',
  WarpOilySwamp: 'asteroid_oily_swamp',
  TundraMoonlet: 'asteroid_tundra',
  MarshyMoonlet: 'asteroid_marshy',
  MooMoonlet: 'asteroid_moo',
  WaterMoonlet: 'asteroid_water',
  NiobiumMoonlet: 'asteroid_superconductive',
  RegolithMoonlet: 'asteroid_regolith',
  MiniRegolithMoonlet: 'asteroid_regolith',
  MiniBadlandsStart: 'cluster_spacedout_the_desolands_moonlet',
  MiniBadlandsWarp: 'cluster_spacedout_the_desolands_moonlet',
  MiniBadlands: 'cluster_spacedout_the_desolands_moonlet',
  MiniRadioactiveOceanWarp: 'cluster_spacedout_radioactive_ocean_moonlet',
  MiniRadioactiveOcean: 'cluster_spacedout_radioactive_ocean_moonlet',
  MiniRadioactiveOceanStart: 'cluster_spacedout_radioactive_ocean_moonlet',
  MiniMetallicSwampy: 'cluster_spacedout_metallic_swampy_moonlet',
  MiniMetallicSwampyStart: 'cluster_spacedout_metallic_swampy_moonlet',
  MiniMetallicSwampyWarp: 'cluster_spacedout_metallic_swampy_moonlet',
  MiniForestFrozen: 'cluster_spacedout_frozen_forest_moonlet',
  MiniForestFrozenStart: 'cluster_spacedout_frozen_forest_moonlet',
  MiniForestFrozenWarp: 'cluster_spacedout_frozen_forest_moonlet',
  MiniFlipped: 'cluster_spacedout_flipped_moonlet',
  MiniFlippedStart: 'cluster_spacedout_flipped_moonlet',
  MiniFlippedWarp: 'cluster_spacedout_flipped_moonlet',
  SandstoneDefault: 'cluster_base_terra',
  Badlands: 'cluster_base_the_badlands',
  SwampMoonlet: 'cluster_spacedout_quagmiris',
  MetalHeavyLandingSite: 'asteroid_irradiated_marsh',
  OilRichWarpTarget: 'asteroid_rusty_oil',
  VanillaForestDefault: 'cluster_spacedout_verdante',
  MediumSandyRadioactiveVanillaWarpPlanet: 'asteroid_radioactive_terra',
  VanillaSandstoneDefault: 'cluster_spacedout_terra',
  MediumRadioactiveVanillaWarpPlanet: 'asteroid_radioactive_swamp',
  VanillaSwampDefault: 'cluster_spacedout_squelchy',
  MediumForestyRadioactiveVanillaWarpPlanet: 'asteroid_radioactive_forest',
  VanillaOceania: 'cluster_spacedout_oceania',
  MediumForestyWasteland: 'asteroid_glowood_wasteland',
  VanillaAridio: 'cluster_spacedout_aridio',
  MediumSandySwamp: 'asteroid_radioactive_terrabog',
  VanillaVolcanic: 'cluster_spacedout_volcanea',
  VanillaArboria: 'cluster_spacedout_arboria',
  VanillaSandstoneFrozen: 'cluster_spacedout_rime',
  MediumSwampy: 'asteroid_stinko_swamp',
  ForestMoonlet: 'cluster_spacedout_folia',
  SwampyLandingSite: 'asteroid_irradiated_swampy',
  VanillaBadlands: 'cluster_spacedout_the_badlands',
  ForestLush: 'cluster_base_verdante',
  Oceania: 'cluster_base_oceania',
  ForestDefault: 'cluster_base_arboria',
  ForestHot: 'cluster_base_aridio',
  SandstoneFrozen: 'cluster_base_rime',
  Oasis: 'cluster_base_oasisse',
  VanillaOasis: 'cluster_spacedout_oasisse',
  Volcanic: 'cluster_base_volcanea',
  CeresSpacedOutAsteroid: 'cluster_spacedout_ceres_minor',
  CeresClassicAsteroid: 'cluster_spacedout_ceres',
  CeresBaseGameAsteroid: 'cluster_base_ceres',
  MixingCeresAsteroid: 'asteroid_mixing_ceres',
  CeresClassicShatteredAsteroid: 'asteroid_blasted_ceres_spaced_out',
  CeresBaseGameShatteredAsteroid: 'asteroid_blasted_ceres',
  MiniShatteredStartAsteroid: 'asteroid_mini_shattered_start',
  MiniShatteredWarpAsteroid: 'asteroid_mini_shattered_warp',
  MiniShatteredGeoAsteroid: 'asteroid_mini_shattered_geo',
  WarpOilySandySwamp: 'asteroid_warp_oily_sandy_swamp',
  PrehistoricBaseGameAsteroid: 'cluster_base_relica',
  PrehistoricShatteredBaseGameAsteroid: 'cluster_base_relica_lab',
  PrehistoricClassicAsteroid: 'cluster_spacedout_relica',
  PrehistoricShatteredClassicAsteroid: 'cluster_spacedout_relica_lab',
  PrehistoricSpacedOutAsteroid: 'cluster_spacedout_relica_minor',
  MixingPrehistoricAsteroid: 'asteroid_mixing_relica',
  AquaticBaseGameAsteroid: 'cluster_base_marinea',
  AquaticClassicAsteroid: 'cluster_spacedout_marinea',
  AquaticSpacedOutAsteroid: 'cluster_spacedout_marinea_minor',
  MixingAquaticAsteroid: 'asteroid_marinea_mixing',
}

export function asteroidInfo(id, name) {
  const key = shortId(id)
  const sprite = ASTEROID_SPRITES[key]
  return { id: key, icon: sprite ? SPRITES + sprite + '.webp' : null, label: name || names.asteroids[key] || key }
}

// ------------------------------------------------------------ world traits --

const SPACED_OUT_TRAITS = new Set(['CrashedSatellites', 'DistressSignal', 'LushCore', 'MetalCaves', 'RadioactiveCrust'])

export function traitInfo(trait) {
  const id = shortId(typeof trait === 'string' ? trait : trait?.id)
  const known = names.traits[id]
  const folder = SPACED_OUT_TRAITS.has(id) ? 'so/' : 'vanilla/'
  return {
    id,
    label: (typeof trait === 'object' && trait?.name) || known?.name || (typeof trait === 'string' ? trait : id),
    description: known?.description ?? '',
    color: known?.color ?? '#9aa0a6',
    icon: known ? TRAIT_SPRITES + folder + id + '.webp' : null,
  }
}

export const TRAIT_IDS = Object.keys(names.traits)

// --------------------------------------------------------- starmap entries --

const SPACE_POI_SPRITES = {
  ArtifactSpacePOI_RussellsTeapot: 'spacepoi_russells_teapot',
  HarvestableSpacePOI_CarbonAsteroidField: 'spacepoi_carbon_asteroid_field',
  HarvestableSpacePOI_ChlorineCloud: 'spacepoi_chlorine_cloud',
  HarvestableSpacePOI_DLC2CeresField: 'spacepoi_ceres_debris_field',
  HarvestableSpacePOI_DLC2CeresOreField: 'spacepoi_ceres_starting_field',
  HarvestableSpacePOI_ForestyOreField: 'spacepoi_foresty_ore_field',
  HarvestableSpacePOI_FrozenOreField: 'spacepoi_frozen_ore_field',
  HarvestableSpacePOI_GasGiantCloud: 'spacepoi_gas_giant_cloud',
  HarvestableSpacePOI_GildedAsteroidField: 'spacepoi_gilded_asteroid_field',
  HarvestableSpacePOI_GlimmeringAsteroidField: 'spacepoi_glimmering_asteroid_field',
  HarvestableSpacePOI_HeliumCloud: 'spacepoi_helium_cloud',
  HarvestableSpacePOI_IceAsteroidField: 'spacepoi_ice_asteroid_field',
  HarvestableSpacePOI_InterstellarIceField: 'spacepoi_interstellar_ice_field',
  HarvestableSpacePOI_InterstellarOcean: 'spacepoi_interstellar_ocean',
  HarvestableSpacePOI_MetallicAsteroidField: 'spacepoi_metallic_asteroid_field',
  HarvestableSpacePOI_OilyAsteroidField: 'spacepoi_oily_asteroid_field',
  HarvestableSpacePOI_OrganicMassField: 'spacepoi_organic_mass_field',
  HarvestableSpacePOI_OxidizedAsteroidField: 'spacepoi_oxidized_asteroid_field',
  HarvestableSpacePOI_OxygenRichAsteroidField: 'spacepoi_oxygen_rich_asteroid_field',
  HarvestableSpacePOI_RadioactiveAsteroidField: 'spacepoi_radioactive_asteroid_field',
  HarvestableSpacePOI_RadioactiveGasCloud: 'spacepoi_radioactive_gas_cloud',
  HarvestableSpacePOI_RockyAsteroidField: 'spacepoi_rocky_asteroid_field',
  HarvestableSpacePOI_SaltyAsteroidField: 'spacepoi_salty_asteroid_field',
  HarvestableSpacePOI_SandyOreField: 'spacepoi_sandy_ore_field',
  HarvestableSpacePOI_SatelliteField: 'spacepoi_satellite_field',
  HarvestableSpacePOI_SwampyOreField: 'spacepoi_swampy_ore_field',
  HarvestableSpacePOI_DLC5AquaticOreField: 'spacepoi_aquatic_ore_field',
  HarvestableSpacePOI_DLC5AquaticMixingField: 'spacepoi_aquatic_mixing_field',
  TemporalTear: 'spacepoi_temporal_tear',
}

export function starmapEntryInfo(id, name) {
  const key = shortId(id)
  const artifact = /^ArtifactSpacePOI_GravitasSpaceStation(\d)$/.exec(key)
  const sprite = artifact ? `spacepoi_artifact_${artifact[1]}` : SPACE_POI_SPRITES[key] ?? ASTEROID_SPRITES[key]
  const label =
    name ||
    names.asteroids[key] ||
    key
      .replace(/^(Harvestable|Artifact)SpacePOI_/, '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
  return { id: key, icon: sprite ? SPRITES + sprite + '.webp' : null, label, asteroid: Boolean(ASTEROID_SPRITES[key]) }
}

export const SPACE_BACKGROUND = SPRITES + 'background_space.webp'

// ------------------------------------------------------------------ maths --

export const SECONDS_PER_CYCLE = 600

// Mean and standard deviation of average output (g/s) per geyser type, from
// the ONI Seed Browser's GeyserType (measured over 410k worlds).
const GEYSER_MEAN_STD = {
  steam: [1500, 230],
  hot_hydrogen: [105, 15],
  methane: [105, 15],
  chlorine_gas: [105, 15],
  chlorine_gas_cool: [105, 15],
  hot_steam: [750, 100],
  hot_co2: [105, 15],
  hot_po2: [105, 15],
  slimy_po2: [105, 15],
  hot_water: [3000, 400],
  slush_water: [1500, 200],
  filthy_water: [3000, 400],
  slush_salt_water: [1500, 200],
  salt_water: [3000, 400],
  liquid_co2: [150, 20],
  oil_drip: [125, 35],
  liquid_sulfur: [1500, 250],
  molten_iron: [300, 40],
  molten_copper: [300, 40],
  molten_gold: [300, 40],
  molten_aluminum: [300, 40],
  molten_cobalt: [300, 40],
  molten_tungsten: [300, 40],
  molten_niobium: [1200, 165],
  big_volcano: [1100, 150],
  small_volcano: [550, 75],
}

// Mean average output for a geyser type, or null when it has no range.
export function geyserMean(type) {
  return GEYSER_MEAN_STD[geyserInfo(type).id]?.[0] ?? null
}

// The seed browser's rating: position between mean - 1 sd and mean + 1 sd,
// so 0.5 is the mean (shown green) and the ends are one sd either side.
// Null for fixed-output types (oil reservoirs, tidal springs).
export function geyserRating(geyser) {
  const { avgOutput, type } = geyser
  const stats = GEYSER_MEAN_STD[geyserInfo(type).id]
  if (avgOutput == null || !stats) return null
  const [mean, sd] = stats
  return Math.min(1, Math.max(0.01, (avgOutput - (mean - sd)) / (2 * sd)))
}

// Same thresholds as the seed browser: at least average is good, the lowest
// third is bad.
export function ratingClass(rating) {
  if (rating == null) return 'none'
  if (rating >= 0.5) return 'good'
  if (rating >= 0.33) return 'medium'
  return 'bad'
}

export function polygonArea(points) {
  let area = 0
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    area += (points[j][0] + points[i][0]) * (points[j][1] - points[i][1])
  }
  return Math.abs(area / 2)
}
