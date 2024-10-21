export const VanillaWorlds = [
    {
        id: 'Terra',
        name: 'Terra',
        img: '/images/worlds/vanilla/SandstoneDefault.png',
        seedPrefix: 'SNDST-A',
    },
    {
        id: 'Oceania',
        name: 'Oceania',
        img: '/images/worlds/vanilla/Oceania.png',
        seedPrefix: 'OCAN-A',
    },
    {
        id: 'Rime',
        name: 'Rime', 
        img: '/images/worlds/vanilla/SandstoneFrozen.png',
        seedPrefix: 'S-FRZ',
    },
    {
        id: 'Verdante',
        name: 'Verdante',
        img: '/images/worlds/vanilla/ForestLush.png',
        seedPrefix: 'LUSH-A',
    },
    {
        id: 'Arboria',
        name: 'Arboria',
        img: '/images/worlds/vanilla/ForestDefault.png',
        seedPrefix: 'FRST-A',
    },
    {
        id: 'Volcanea',
        name: 'Volcanea',
        img: '/images/worlds/vanilla/Volcanic.png',
        seedPrefix: 'VOLCA',
    },
    {
        id: 'Badlands',
        name: 'The Badlands',
        img: '/images/worlds/vanilla/Badlands.png',
        seedPrefix: 'BAD-A',
    }, 
    {
        id: 'Aridio',
        name: 'Aridio',
        img: '/images/worlds/vanilla/ForestHot.png',
        seedPrefix: 'HTFST-A',
    },
    {
        id: 'Oasisse',
        name: 'Oasisse',
        img: '/images/worlds/vanilla/Oasis.png',
        seedPrefix: 'OASIS-A'
    }
];

export const SpacedOutWorlds = [
    ...VanillaWorlds,
    {
        id: 'Squelchy',
        name: 'Squelchy',
        img: '/images/worlds/spacedout/Squelchy.webp',
    }, 
    {
        id: 'Folia',
        name: 'Folia',
    },
    {
        id: 'Rust',
        name: 'Quagmiris',
    },
    {
        id: 'Quagmiris',
        name: 'Metallic Swampy Moonlet',
    },
    {
        id: 'MetallicMoonlet',
        name: 'The Desolands Moonlet', 
    },
    {
        id: 'DesolandsMoonlet',
        name: 'Frozen Forest Moonlet'
    },
    {
        id: 'FrozenForestMoonlet',
        name: 'Flipped Moonlet'
    },
    {
        id: 'FlippedMoonlet',
        name: 'Radioactive Ocean Moonlet'
    }
];

export const FrostyPlanetWorlds = [

]

export const DLCs = [
    {
        id: 'Vanilla',
        name: 'Vanilla',
        img: '/images/oni/oni.png',
    },
    {
        id: 'SpacedOut',
        name: 'Spaced Out!',
        img: '/images/oni/spacedout.png',
    },
    {
        id: 'FrostyPlanet',
        name: 'Frosty Planet',
        img: '/images/oni/FrostyPlanetPack.webp',
    }
];

// export const WorldTraits = [
//     'BouldersMedium',
//     'DeepOil',
//     'MetalRich',
//     'BouldersMixed',
//     'MagmaVents',
//     'Volcanoes',
//     'MetalPoor',
//     'SlimeSplats',
//     'BouldersLarge',
//     'IrregularOil',
//     'Geodes',
//     'SlimeSplats',
//     'FrozenCore',
//     'BouldersLarge',
//     'SubsurfaceOcean',
//     'MisalignedStart',
//     'GeoActive',
//     'BouldersSmall',
//     'GlaciersLarge',
//     'GeoDormant',
// ]

// TODO: Fix this with correct IDs from the ONI game for this to work. See worldgen lib json file for more info.
// Its probably possible to generate this from that json file (or semi-generate)
export const WorldTraits = [
    {
        id: 'traits/BouldersSmall',
        name: 'Small Boulders',
        connotation: 0,
        img: '/images/oni/worldTraits/vanilla/BouldersSmall.webp',
    },
    {
        id: 'traits/BouldersMedium',
        name: 'Medium Boulders',
        connotation: 0,
        img: '/images/oni/worldTraits/vanilla/BouldersMedium.webp',
    },
    {
        id: 'traits/BouldersLarge',
        name: 'Large Boulders',
        connotation: 0,
        img: '/images/oni/worldTraits/vanilla/BouldersLarge.webp',
    },
    {
        id: 'traits/DeepOil',
        name: 'Trapped Oil',
        connotation: 0,
        img: '/images/oni/worldTraits/vanilla/DeepOil.webp',
    },
    {
        id: 'traits/MetalRich',
        name: 'Metal Rich',
        connotation: 1,
        img: '/images/oni/worldTraits/vanilla/MetalRich.webp',
    },
    {
        id: 'traits/BouldersMixed',
        name: 'Mixed Boulders',
        connotation: 0,
        img: '/images/oni/worldTraits/vanilla/BouldersMixed.webp',
    },
    {
        id: 'traits/MagmaVents',
        name: 'Magma Channels',
        connotation: 0,
        img: '/images/oni/worldTraits/vanilla/MagmaVents.webp',
    },
    {
        id: 'traits/Volcanoes',
        name: 'Volcanoes',
        connotation: 0,
        img: '/images/oni/worldTraits/vanilla/Volcanoes.webp',
    },
    {
        id: 'traits/MetalPoor',
        name: 'Metal Poor',
        connotation: -1,
        img: '/images/oni/worldTraits/vanilla/MetalPoor.webp',
    },
    {
        id: 'traits/SlimeSplats',
        name: 'Slime Molds',
        connotation: -1,
        img: '/images/oni/worldTraits/vanilla/SlimeSplats.webp',
    },
    {
        id: 'traits/IrregularOil',
        name: 'Irregular Oil',
        connotation: -1,
        img: '/images/oni/worldTraits/vanilla/IrregularOil.webp',
    },
    {
        id: 'traits/BuriedOil',
        name: 'Buried Oil',
        connotation: -1,
        img: '/images/oni/worldTraits/vanilla/DeepOil.webp',
    },
    {
        id: 'traits/Geodes',
        name: 'Geodes',
        connotation: 1,
        img: '/images/oni/worldTraits/vanilla/Geodes.webp',
    },
    {
        id: 'traits/FrozenCore',
        name: 'Frozen Core',
        connotation: -1,
        img: '/images/oni/worldTraits/vanilla/FrozenCore.webp',
    },
    {
        id: 'traits/SubsurfaceOcean',
        name: 'Subsurface Ocean',
        connotation: 1,
        img: '/images/oni/worldTraits/vanilla/SubsurfaceOcean.webp',
    },
    {
        id: 'traits/MisalignedStart',
        name: 'Alternate Pod Location',
        connotation: -1,
        img: '/images/oni/worldTraits/vanilla/MisalignedStart.webp',
    },
    {
        id: 'traits/GeoActive',
        name: 'Geo Active',
        connotation: 1,
        img: '/images/oni/worldTraits/vanilla/GeoActive.webp',
        so: false,
    },
    {
        id: 'traits/GlaciersLarge',
        name: 'Large Glaciers',
        connotation: 1,
        img: '/images/oni/worldTraits/vanilla/GlaciersLarge.webp',
    },
    {
        id: 'traits/GeoDormant',
        name: 'Geo Dormant',
        connotation: -1,
        img: '/images/oni/worldTraits/vanilla/GeoDormant.webp',
        so: false,
    },
];

export const SOWorldTraits = [
    {
        id: 'expansion1::traits/CrashedSatellites',
        name: 'Crashed Satellites',
        connotation: 1,
        img: '/images/oni/worldTraits/so/CrashedSatellites.webp',
    },
    {
        id: 'expansion1::traits/DistressSignal',
        name: 'Distress Signal',
        connotation: 1,
        img: '/images/oni/worldTraits/so/DistressSignal.webp',
    },
    {
        id: 'expansion1::traits/LushCore',
        name: 'Lush Core',
        connotation: 1,
        img: '/images/oni/worldTraits/so/LushCore.webp',
    },
    {
        id: 'expansion1::traits/MetalCaves',
        name: 'Metal Caves',
        connotation: 1,
        img: '/images/oni/worldTraits/so/MetalCaves.webp',
    },
    {
        id: 'expansion1::traits/RadioactiveCrust',
        name: 'Radioactive Crust',
        connotation: -1,
        img: '/images/oni/worldTraits/so/RadioactiveCrust.webp',
    },
]

export const MutualExclusiveWorldTraits = [
    [ 'LargeBoulders', 'MediumBoulders' ],
    [ 'LargeBoulders', 'MixedBoulders' ],
    [ 'SmallBoulders', 'MediumBoulders' ],
    [ 'MixedBoulders', 'SmallBoulders' ],
    [ 'Geoactive', 'Geodormant' ],
    [ 'MetalRich', 'MetalPoor' ],
]