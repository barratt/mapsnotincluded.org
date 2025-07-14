/*
  Oxygen Not Included Seed Browser Frontend
  Copyright (C) 2025 The Maps Not Included Authors
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.
  
  You should have received a copy of the GNU Affero General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
  
  See the AUTHORS file in the project root for a full list of contributors.
*/

export enum RenderLayer {
    ELEMENT_BACKGROUND,
    ELEMENT_OVERLAY,
    TEMPERATURE_OVERLAY,
    MASS_OVERLAY,
    RADIATION_OVERLAY,
    DECOR_OVERLAY,
    LIGHT_OVERLAY,
    VISIBILITY_OVERLAY,
    DISEASE_OVERLAY,
}
export enum DataImageType {
    ELEMENT_IDX,
    TEMPERATURE,
    MASS,
    RADIATION,
    DECOR,
    LIGHT_SOURCE,
    SUNLIGHT,
    VISIBILITY,
    DISEASE_IDX,
    DISEASE_COUNT,
}

// TODO: image versioning
const dataImageSourceUrls: Map<DataImageType, string> = new Map([
    [DataImageType.ELEMENT_IDX, "elementIdx8.png"],
    [DataImageType.TEMPERATURE, "temperature32.png"],
    [DataImageType.MASS, "mass32.png"],
    [DataImageType.RADIATION, "radiation32.png"],
    [DataImageType.DECOR, "decor32.png"],
]);
export const getDataImageSourceUrl = (dataImageType: DataImageType): string => {
    const url = dataImageSourceUrls.get(dataImageType);
    if (!url) {
        throw new Error(`No URL found for data image type ${DataImageType[dataImageType]}`);
    }
    return url;
}

// Type checks failing? Make sure that all colors have 4 components (RGBA), not 3 (RGB).
export const defaultControlValuesAndColors: Map<RenderLayer, readonly {controlValue: readonly [number], controlColor: readonly [number, number, number, number]}[]> = new Map([
    [RenderLayer.TEMPERATURE_OVERLAY, [{
            controlValue: [0.0], // Absolute zero
            controlColor: [128.0/255.0, 254.0/255.0, 240.0/255.0, 1.0]
        }, {
            controlValue: [-0.1 + 273.15], // Cold
            controlColor: [50.0/255.0, 170.0/255.0, 209.0/255.0, 1.0]
        }, {
            controlValue: [9.9 + 273.15], // Chilled
            controlColor: [41.0/255.0, 139.0/255.0, 209.0/255.0, 1.0]
        }, {
            controlValue: [19.9 + 273.15], // Temperate
            controlColor: [62.0/255.0, 208.0/255.0, 73.0/255.0, 1.0]
        }, {
            controlValue: [29.9 + 273.15], // Warm
            controlColor: [197.0/255.0, 209.0/255.0, 18.0/255.0, 1.0]
        }, {
            controlValue: [36.9 + 273.15], // Hot
            controlColor: [209.0/255.0, 145.0/255.0, 45.0/255.0, 1.0]
        }, {
            controlValue: [99.9 + 273.15], // Scorching
            controlColor: [206.0/255.0, 80.0/255.0, 78.0/255.0, 1.0]
        }, {
            controlValue: [1799.9 + 273.15], // Molten
            controlColor: [206.0/255.0, 19.0/255.0, 18.0/255.0, 1.0]
        }, {
            controlValue: [3421.85 + 273.15], // Abyssalite/tungsten melting
            controlColor: [255.0/255.0, 26.0/255.0, 115.0/255.0, 1.0]
        }, {
            controlValue: [9999.9], // Max temp
            controlColor: [255.0/255.0, 0.0/255.0, 255.0/255.0, 1.0]
        }]],
    [RenderLayer.MASS_OVERLAY, [{ // Other possible control points: 0 (vacuum), 1.8 (vent overpressure), 20 (high pressure vent overpressure)
            controlValue: [0.000001], // Near vacuum
            controlColor: [1.0, 1.0, 1.0, 1.0], // white (0)
        }, {
            controlValue: [0.05], // Barely breathable
            controlColor: [206.0/255.0, 58.0/255.0, 58.0/255.0, 1.0], // unbreathable red
        }, {
            controlValue: [0.525], // Breathable
            controlColor: [176.0/255.0, 75.0/255.0, 176.0/255.0, 1.0], // barely breathable rose
        }, {
            controlValue: [1.0], // Very breathable
            controlColor: [78.0/255.0, 79.0/255.0, 221.0/255.0, 1.0], // breathable blue
        }, {
            controlValue: [4.0], // Popped eardrums
            controlColor: [108.0/255.0, 204.0/255.0, 229.0/255.0, 1.0], // very breathable cyan
        }, {
            controlValue: [500.0], // Abyssalite mass
            controlColor: [0.8, 0.0, 0.8, 1.0], // abyssalite purple
        }, {
            controlValue: [1000.0], // Water mass
            controlColor: [0.0, 0.0, 1.0, 1.0], // water blue
        }, {
            controlValue: [1800.0], // Magma mass
            controlColor: [1.0, 1.0, 0.0, 1.0], // magma red
        }, {
            controlValue: [20_000.0], // Neutronium mass
            controlColor: [0.0, 0.0, 0.0, 1.0], // neutronium black
        }, {
            controlValue: [100_000.0], // Probably an infinite storage
            controlColor: [1.0, 0.0, 1.0, 1.0], // magenta
        }]],
    [RenderLayer.RADIATION_OVERLAY, [{
            controlValue: [0.0], // No radiation
            controlColor: [0.0, 0.0, 0.0, 1.0], // black
        }, {
            controlValue: [1_000.0], // Significant hazard
            controlColor: [0.0/255.0, 255.0/255.0, 0.0/255.0, 1.0], // Radioactive green (guess)
        }]],
    [RenderLayer.DECOR_OVERLAY, [{
            controlValue: [-100.0], // Ugly
            controlColor: [255.0/255.0, 0.0/255.0, 0.0/255.0, 1.0], // Negative red (guess)
        }, {
            controlValue: [0.0], // Neutral
            controlColor: [0.0, 0.0, 0.0, 1.0], // Black (guess)
        }, {
            controlValue: [100.0], // Beautiful
            controlColor: [0.0/255.0, 255.0/255.0, 0.0/255.0, 1.0], // Positive green (guess)
        }]]
])

export const debugControlValuesAndColors: readonly {controlValue: readonly [number], controlColor: readonly [number, number, number, number]}[] = [{
        controlValue: [-10_000.0],
        controlColor: [250.0/255.0, 0.0/255.0, 0.0/255.0, 1.0],
    }, {
        controlValue: [-1_000.0],
        controlColor: [200.0/255.0, 0.0/255.0, 0.0/255.0, 1.0],
    }, {
        controlValue: [-100.0],
        controlColor: [150.0/255.0, 0.0/255.0, 0.0/255.0, 1.0],
    }, {
        controlValue: [-10.0],
        controlColor: [100.0/255.0, 0.0/255.0, 0.0/255.0, 1.0],
    }, {
        controlValue: [-1.0],
        controlColor: [50.0/255.0, 0.0/255.0, 0.0/255.0, 1.0],
    }, {
        controlValue: [0.0],
        controlColor: [0.0/255.0, 0.0/255.0, 0.0/255.0, 1.0],
    }, {
        controlValue: [1.0],
        controlColor: [0.0/255.0, 50.0/255.0, 0.0/255.0, 1.0],
    }, {
        controlValue: [10.0],
        controlColor: [0.0/255.0, 100.0/255.0, 0.0/255.0, 1.0],
    }, {
        controlValue: [100.0],
        controlColor: [0.0/255.0, 150.0/255.0, 0.0/255.0, 1.0],
    }, {
        controlValue: [1_000.0],
        controlColor: [0.0/255.0, 200.0/255.0, 0.0/255.0, 1.0],
    }, {
        controlValue: [10_000.0],
        controlColor: [0.0/255.0, 250.0/255.0, 0.0/255.0, 1.0],
    },
];


const connectedLayers: [RenderLayer, DataImageType][] = [
    [RenderLayer.ELEMENT_BACKGROUND, DataImageType.ELEMENT_IDX],
    [RenderLayer.ELEMENT_OVERLAY, DataImageType.ELEMENT_IDX],
    [RenderLayer.TEMPERATURE_OVERLAY, DataImageType.TEMPERATURE],
    [RenderLayer.MASS_OVERLAY, DataImageType.MASS],
    [RenderLayer.RADIATION_OVERLAY, DataImageType.RADIATION],
    [RenderLayer.DECOR_OVERLAY, DataImageType.DECOR],
    [RenderLayer.LIGHT_OVERLAY, DataImageType.LIGHT_SOURCE],
    [RenderLayer.LIGHT_OVERLAY, DataImageType.SUNLIGHT],
    [RenderLayer.VISIBILITY_OVERLAY, DataImageType.VISIBILITY],
    [RenderLayer.DISEASE_OVERLAY, DataImageType.DISEASE_IDX],
    [RenderLayer.DISEASE_OVERLAY, DataImageType.DISEASE_COUNT],
];

const layerToDataImageType = new Map<RenderLayer, DataImageType[]>();
for (const [layer, dataImageType] of connectedLayers) {
    if (!layerToDataImageType.has(layer)) {
        layerToDataImageType.set(layer, []);
    }
    layerToDataImageType.get(layer)!.push(dataImageType);
}
const dataImageTypeToLayer = new Map<DataImageType, RenderLayer[]>();
for (const [layer, dataImageType] of connectedLayers) {
    if (!dataImageTypeToLayer.has(dataImageType)) {
        dataImageTypeToLayer.set(dataImageType, []);
    }
    dataImageTypeToLayer.get(dataImageType)!.push(layer);
}

export function getDataImageType(layer: RenderLayer): DataImageType[] {
    const dataImageTypes = layerToDataImageType.get(layer);
    if (!dataImageTypes) {
        throw new Error(`No data image type found for layer ${RenderLayer[layer]}`);
    }
    return dataImageTypes;
}
export function getRenderLayer(dataImageType: DataImageType): RenderLayer[] {
    const layers = dataImageTypeToLayer.get(dataImageType);
    if (!layers) {
        throw new Error(`No render layer found for data image type ${DataImageType[dataImageType]}`);
    }
    return layers;
}