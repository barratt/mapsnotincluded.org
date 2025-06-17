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

import * as L from "leaflet";

type LayerConfig = Record<string, {
    layer: L.Layer;
    icon: string;
    label: string;
    soundOnSelectUrl?: string;
    soundOnDeselectUrl?: string;
}>;

export interface LayerToggleOptions extends L.ControlOptions {
    layers: LayerConfig;
}

// TODO: maybe switch this to a Vue component?
export const LeafletLayerToggleControl = L.Control.extend({

    options: {
        position: 'topright',
        layers: {}
    } as LayerToggleOptions,

    initialize(this: L.Control & LayerToggleOptions, options: Partial<LayerToggleOptions> = {}) {
        L.Util.setOptions(this, options);
    },

    onAdd(this: L.Control & LayerToggleOptions, map: L.Map) {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        container.style.background = 'white';
        container.style.padding = '6px 8px';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '6px';

        if (this.options.className) {
            container.classList.add(this.options.className);
        }

        L.DomEvent.disableClickPropagation(container);

        let currentLayer: L.Layer | null = null;

        Object.entries(this.options.layers).forEach(([name, { layer, icon, label, soundOnSelectUrl, soundOnDeselectUrl }]) => {
            const button = document.createElement("button");
            button.type = "button";
            button.innerHTML = `${icon} ${label}`;
            button.style.padding = "6px 12px";
            button.style.font = "14px sans-serif";
            button.style.cursor = "pointer";
            button.style.border = "1px solid #ccc";
            button.style.borderRadius = "4px";
            button.style.background = "#f4f4f4";

            const selectSound = soundOnSelectUrl
                ? new Audio(soundOnSelectUrl)
                : null;

            const deselectSound = soundOnDeselectUrl
                ? new Audio(soundOnDeselectUrl)
                : null;

            const playSound = (sound: HTMLAudioElement | null) => {
                if (!sound) return;
                sound.pause();
                sound.currentTime = 0;
                sound.play().catch((err) => {
                    // Some browsers block autoplay if there's no user interaction
                    console.warn("Unable to play sound:", err);
                });
            };

            const toggleActiveStyle = (active: boolean) => {
                button.style.background = active ? "#0078ff" : "#f4f4f4";
                button.style.color = active ? "#fff" : "#000";
            };

            toggleActiveStyle(false);

            button.addEventListener("click", () => {
                const isAlreadyActive = currentLayer === layer;
                if (isAlreadyActive) {
                    map.removeLayer(layer);
                    currentLayer = null;
                    toggleActiveStyle(false);
                    playSound(deselectSound);
                } else {
                    if (currentLayer) {
                        map.removeLayer(currentLayer);
                        [...container.querySelectorAll("button")].forEach(b => {
                            (b as HTMLButtonElement).style.background = "#f4f4f4";
                            (b as HTMLButtonElement).style.color = "#000";
                        });
                    }
                    map.addLayer(layer);
                    currentLayer = layer;
                    toggleActiveStyle(true);
                    playSound(selectSound);
                }
            });

            container.appendChild(button);
        });

        return container;
    }
});
