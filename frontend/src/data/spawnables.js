// Critters, plants and loose seeds that the game spawns into a new world
// (asteroid.ambient on the world page, from the settled map). Prefab id ->
// English name as the game shows it. Unknown ids fall back to the id split
// into words, and are sorted by their suffix (…Seed is a seed, …Egg an egg).

const CRITTERS = {
  Hatch: 'Hatch',
  HatchHard: 'Stone Hatch',
  HatchVeggie: 'Sage Hatch',
  HatchMetal: 'Smooth Hatch',
  Puft: 'Puft',
  PuftAlpha: 'Puft Prince',
  PuftOxylite: 'Dense Puft',
  PuftBleachstone: 'Squeaky Puft',
  Drecko: 'Drecko',
  DreckoPlastic: 'Glossy Drecko',
  Glom: 'Morb',
  LightBug: 'Shine Bug',
  LightBugOrange: 'Sun Bug',
  LightBugPurple: 'Royal Bug',
  LightBugPink: 'Coral Bug',
  LightBugBlue: 'Azure Bug',
  LightBugBlack: 'Abyss Bug',
  LightBugCrystal: 'Radiant Bug',
  LightBugRadioactive: 'Ionizing Bug',
  Mole: 'Shove Vole',
  MoleDelicacy: 'Delecta Vole',
  OilFloater: 'Slickster',
  OilFloaterHighTemp: 'Molten Slickster',
  OilFloaterDecor: 'Longhair Slickster',
  Pacu: 'Pacu',
  PacuTropical: 'Tropical Pacu',
  PacuCleaner: 'Gulp Fish',
  Crab: 'Pokeshell',
  CrabWood: 'Oakshell',
  CrabFreshWater: 'Sanishell',
  Squirrel: 'Pip',
  SquirrelHug: 'Cuddle Pip',
  Moo: 'Gassy Moo',
  Bee: 'Beeta',
  Staterpillar: 'Plug Slug',
  StaterpillarGas: 'Smog Slug',
  StaterpillarLiquid: 'Sponge Slug',
  DivergentBeetle: 'Sweetle',
  DivergentWorm: 'Grubgrub',
  WoodDeer: 'Flox',
  Seal: 'Spigot Seal',
  IceBelly: 'Bammoth',
  GoldBelly: 'Regal Bammoth',
  Raptor: 'Rhex',
  Chameleon: 'Dartle',
  Stego: 'Lumb',
  Mosquito: 'Gnit',
  PrehistoricPacu: 'Jawbo',
  Butterfly: 'Mimika',
}

const PLANTS = {
  BasicSingleHarvestPlant: 'Mealwood',
  BasicFabricPlant: 'Thimble Reed',
  PrickleFlower: 'Bristle Blossom',
  MushroomPlant: 'Dusk Cap',
  SwampLily: 'Balm Lily',
  LeafyPlant: 'Mirth Leaf',
  SaltPlant: 'Dasha Saltvine',
  SpiceVine: 'Pincha Pepperplant',
  BeanPlant: 'Nosh Sprout',
  ColdWheat: 'Sleet Wheat',
  SeaLettuce: 'Waterweed',
  CactusPlant: 'Jumping Joya',
  BulbPlant: 'Buddy Bud',
  Oxyfern: 'Oxyfern',
  EvilFlower: 'Sporechid',
  ForestTree: 'Arbor Tree',
  GasGrass: 'Gas Grass',
  PrickleGrass: 'Bluff Briar',
  ColdBreather: 'Wheezewort',
  FilterPlant: 'Hydrocactus',
  WormPlant: 'Spindly Grubfruit Plant',
  WineCups: 'Mellow Mallow',
  ToePlant: 'Tranquil Toes',
  Cylindrica: 'Bliss Burst',
  CritterTrapPlant: 'Saturn Critter Trap',
  SapTree: 'Experiment 52B',
  BasicForagePlantPlanted: 'Buried Muckroot',
  ForestForagePlantPlanted: 'Hexalent',
  SwampForagePlantPlanted: 'Swamp Chard',
  IceCavesForagePlantPlanted: 'Sherberry Plant',
  CarrotPlant: 'Plume Squash Plant',
  BlueGrass: 'Alveo Vera',
  HardSkinBerryPlant: 'Pikeapple Bush',
  SpaceTree: 'Bonbon Tree',
  DewDripperPlant: 'Dew Dripper',
  KelpPlant: 'Seakomb',
  GardenFoodPlant: 'Sweatcorn Stalk',
  GardenDecorPlant: 'Ring Rosebush',
  Dinofern: 'Megafrond',
  VineMother: 'Ovagro Node',
}

const SEEDS = {
  BasicSingleHarvestPlantSeed: 'Mealwood Seed',
  BasicFabricMaterialPlantSeed: 'Thimble Reed Seed',
  PrickleFlowerSeed: 'Blossom Seed',
  MushroomSeed: 'Fungal Spore',
  SwampLilySeed: 'Balm Lily Seed',
  LeafyPlantSeed: 'Mirth Leaf Seed',
  SaltPlantSeed: 'Dasha Saltvine Seed',
  SpiceVineSeed: 'Pincha Pepper Seed',
  BeanPlantSeed: 'Nosh Bean',
  ColdWheatSeed: 'Sleet Wheat Grain',
  SeaLettuceSeed: 'Waterweed Seed',
  CactusPlantSeed: 'Joya Seed',
  BulbPlantSeed: 'Buddy Bud Seed',
  OxyfernSeed: 'Oxyfern Seed',
  EvilFlowerSeed: 'Sporechid Seed',
  ForestTreeSeed: 'Arbor Acorn',
  GasGrassSeed: 'Gas Grass Seed',
  PrickleGrassSeed: 'Briar Seed',
  ColdBreatherSeed: 'Wort Seed',
  FilterPlantSeed: 'Hydrocactus Seed',
  WormPlantSeed: 'Grubfruit Seed',
  WineCupsSeed: 'Mallow Seed',
  ToePlantSeed: 'Tranquil Toe Seed',
  CylindricaSeed: 'Bliss Burst Seed',
  CritterTrapPlantSeed: 'Saturn Critter Trap Seed',
  BasicForagePlant: 'Muckroot',
  ForestForagePlant: 'Hexalent Fruit',
  SwampForagePlant: 'Swamp Chard Heart',
}

// Map colours: critters stand out, plants are green, seeds and eggs are faint.
export const SPAWN_KINDS = {
  critter: { color: '#ff7a45', order: 0 },
  plant: { color: '#5fd068', order: 1 },
  seed: { color: '#c8a45a', order: 2 },
  other: { color: '#b0b8c4', order: 3 },
}

const words = (id) => String(id).replace(/([a-z])([A-Z])/g, '$1 $2')

export function spawnableInfo(id) {
  let kind = 'other'
  let name = null
  if (CRITTERS[id]) [kind, name] = ['critter', CRITTERS[id]]
  else if (PLANTS[id]) [kind, name] = ['plant', PLANTS[id]]
  else if (SEEDS[id]) [kind, name] = ['seed', SEEDS[id]]
  else if (/(Seed|Egg|Spore)$/.test(id)) kind = 'seed'
  else if (/(Plant|Planted|Tree|Flower|Fern|Vine|Grass)$/.test(id)) kind = 'plant'
  return { id, kind, name: name ?? words(id), color: SPAWN_KINDS[kind].color }
}
