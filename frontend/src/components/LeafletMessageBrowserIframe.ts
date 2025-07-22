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

import {Ref, ref} from "vue"

import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import {LeafletWebGL2Map} from "@/components/LeafletWebGL2Map";
import {createError} from "@/components/CreateCascadingError";
import {DomEvent} from "leaflet";
import stopPropagation = DomEvent.stopPropagation;

type LeafletBoxBounds = {
    left: number
    top: number
    right: number
    bottom: number
}

type VisibleScrollBounds = {
    left: number
    top: number
    right: number
    bottom: number
}

type MapSize = {
    mapWidth: number
    mapHeight: number
}

type UploadUuid = string

type Url = string

type ReceivedMapData = {
    left: number
    top: number
    right: number
    bottom: number
    seed: string
    index: number
    uploadUuid: UploadUuid
    dataImageBaseUrl: Url
}

class MapData {
    public mapSize: MapSize;
    public leafletBoxBounds: LeafletBoxBounds;
    public seed: string;
    public index: number;
    public uploadUuid: UploadUuid;
    public dataImageBaseUrl: Url;
    public isVisible: boolean;
    constructor(mapSize: MapSize, leafletBoxBounds: LeafletBoxBounds, seed: string, index: number, uploadUuid: UploadUuid, dataImageBaseUrl: Url, isVisible: boolean = true) {
        this.mapSize = mapSize;
        this.leafletBoxBounds = leafletBoxBounds;
        this.seed = seed;
        this.index = index;
        this.uploadUuid = uploadUuid;
        this.dataImageBaseUrl = dataImageBaseUrl;
        this.isVisible = isVisible;
    }
}

interface LeafletBoxesMessage {
    type: "leafletBoxes"
    boxesJson: string
}

/**
 * Syncs the Leaflet map position to the data from the iframe via postMessage.
 */
export class LeafletMessageBrowserIframe {
    private readonly DEBUG_DO_PRINT_FORWARDED_INTERACTION_EVENTS = false;
    private readonly DEBUG_DO_PRINT_RECEIVED_LEAFLET_BOXES = false;

    private readonly iframe: HTMLIFrameElement;
    private readonly leafletWebGl2Map: LeafletWebGL2Map;
    private readonly mapData: Map<UploadUuid, MapData>;
    private readonly mapClippingWrapper: HTMLDivElement;
    private animationFrameId: number;
    private readonly controller: AbortController;
    private visibleScrollBounds: VisibleScrollBounds[];
    private isVisible: boolean;

    constructor(iframe: HTMLIFrameElement, mapClippingWrapper: HTMLDivElement, leafletWebGl2Map: LeafletWebGL2Map) {
        this.iframe = iframe;
        this.mapData = new Map<UploadUuid, MapData>();
        this.mapClippingWrapper = mapClippingWrapper;
        this.leafletWebGl2Map = leafletWebGl2Map;
        this.controller = new AbortController();
        this.visibleScrollBounds = [];
        this.isVisible = false;

        this.animationFrameId = requestAnimationFrame(this.requestLeafletBoxes.bind(this));

        window.addEventListener("message", (event: MessageEvent<LeafletBoxesMessage>) => {
                if (event.data?.type === "leafletBoxes") {
                    this.parseLeafletBoxesData(event);
                }
            },
            { signal: this.controller.signal }
        )
        window.addEventListener("message", (event: MessageEvent<any>) => {
            if (typeof event.data?.type === "string" && event.data.type.startsWith("iframe:")) {
                this.handleIframeEvent(event.data);
            }
        }, { signal: this.controller.signal });

    }

    public remove() {
        cancelAnimationFrame(this.animationFrameId);
        this.controller.abort();

        for (const [uploadUuid, mapDatum] of this.mapData) {
            this.removeMapDom(mapDatum);
        }
        this.mapData.clear();
    }

    // Fake wheel event to the Leaflet map. Workaround for the iframe not receiving wheel events.
    // Undefined behavior when there are overlapping maps.
    // TODO: possibly move the map code to the iframe to avoid this issue
    // TODO: if not, fake pointer events to the iframe too
    private handleIframeEvent(data: {
        type: string;
        clientX: number;
        clientY: number;
        [key: string]: any;
    }) {
        const { type, clientX, clientY } = data;

        for (const [uploadUuid, mapData] of this.mapData.entries()) {
            const { left, top, right, bottom } = mapData.leafletBoxBounds;

            // TODO: this manual dispatch event calculating the Leaflet map position might not work on Retina displays, should be tested
            if (clientX >= left && clientX <= right && clientY >= top && clientY <= bottom) {
                const mapDivId = this.getLeafletMapId(uploadUuid);
                const mapDiv = document.getElementById(mapDivId);
                if (!mapDiv) {
                    console.warn(`Map DOM not found for uploadUuid ${uploadUuid}`);
                    return;
                }

                const nativeType = type.replace(/^iframe:/, "");

                let event: Event;

                if (nativeType === "wheel") {
                    event = new WheelEvent(nativeType, {
                        bubbles: true,
                        cancelable: true,
                        clientX: data.clientX,
                        clientY: data.clientY,
                        deltaX: data.deltaX ?? 0,
                        deltaY: data.deltaY ?? 0,
                        deltaZ: data.deltaZ ?? 0,
                        deltaMode: data.deltaMode ?? 0,
                        ctrlKey: data.ctrlKey ?? false,
                        metaKey: data.metaKey ?? false,
                        shiftKey: data.shiftKey ?? false,
                        altKey: data.altKey ?? false
                    });
                } else if (nativeType.startsWith("pointer")) {
                    event = new PointerEvent(nativeType, data);
                } else if (nativeType.startsWith("mouse") || nativeType === "contextmenu" || nativeType === "click" || nativeType === "dblclick") {
                    event = new MouseEvent(nativeType, data);
                } else if (nativeType.startsWith("key")) {
                    event = new KeyboardEvent(nativeType, data);
                } else if (nativeType.startsWith("drag")) {
                    event = new DragEvent(nativeType, data);
                } else {
                    console.warn("Unhandled event type:", nativeType);
                    return;
                }

                mapDiv.dispatchEvent(event);
                if (this.DEBUG_DO_PRINT_FORWARDED_INTERACTION_EVENTS) {
                    console.log(`Dispatched ${nativeType} to map ${uploadUuid}`);
                }

                // Fake a mouse event for pointer events
                // NOTE: hacky workaround for Leaflet not handling pointer events correctly
                if (nativeType === "pointerdown" || nativeType === "pointermove" || nativeType === "pointerup") {
                    // Get mouse event name from pointer event name
                    const mouseEventName = nativeType.replace("pointer", "mouse");
                    const syntheticMouseDown = new MouseEvent(mouseEventName, {
                        bubbles: true,
                        cancelable: true,
                        clientX: data.clientX,
                        clientY: data.clientY,
                        button: data.button,
                        buttons: data.buttons,
                        ctrlKey: data.ctrlKey,
                        metaKey: data.metaKey,
                        shiftKey: data.shiftKey,
                        altKey: data.altKey
                    });

                    mapDiv.dispatchEvent(syntheticMouseDown);
                    if (this.DEBUG_DO_PRINT_FORWARDED_INTERACTION_EVENTS) {
                        console.log(`Dispatched synthetic mouse event to map ${uploadUuid}`);
                    }
                }

                // Fake a mouse over event for pointer events
                // NOTE: hacky workaround for Leaflet.GestureHandling not handling pointer events correctly
                if (nativeType === "pointermove") {
                    const syntheticMouseOver = new MouseEvent("mouseover", {
                        bubbles: true,
                        cancelable: true,
                        clientX: data.clientX,
                        clientY: data.clientY,
                        button: data.button,
                        buttons: data.buttons,
                        ctrlKey: data.ctrlKey,
                        metaKey: data.metaKey,
                        shiftKey: data.shiftKey,
                        altKey: data.altKey
                    });

                    mapDiv.dispatchEvent(syntheticMouseOver);
                    if (this.DEBUG_DO_PRINT_FORWARDED_INTERACTION_EVENTS) {
                        console.log(`Dispatched synthetic mouse event to map ${uploadUuid}`);
                    }
                }
                return;
            }
        }
    }

    private parseLeafletBoxesData(event: MessageEvent<LeafletBoxesMessage>) {
        try {
            const boxes = JSON.parse(event.data.boxesJson);

            if (this.DEBUG_DO_PRINT_RECEIVED_LEAFLET_BOXES) {
                console.log("Received leaflet boxes data:", boxes);
            }

            // TODO: remove this debug code
            const debugPredefinedSeeds = [
                "V-SFRZ-C-1999261489-0-0-0",
                "V-LUSH-C-200910982-0-0-BN2",
                "CER-C-693625094-0-0-0",
                "SWMP-C-1827596172-0-0-0",
                "M-BAD-C-687529253-0-0-0",
                "V-OASIS-C-1888383654-0-0-F33",
                "invalid-seed-test",
                null,
                "M-BAD-C-687529253-0-0-0 - duplicate and whitespace test",
                "M-BAD-C-687529253-0-0-0-missing-elementIdx8",
                "M-BAD-C-687529253-0-0-0-missing-mass32",
                "M-BAD-C-687529253-0-0-0-missing-temperature32"
            ]
            const mapContainers: ReceivedMapData[] = boxes["map-containers"].map((box: ReceivedMapData) => ({
                ...box,
                seed: `${debugPredefinedSeeds[box.index - 1]}-debug-seed` ?? null,
                uploadUuid: `${debugPredefinedSeeds[box.index - 1]}-debug-uuid` ?? null,
                dataImageBaseUrl: `/atlas_files/world_data/${debugPredefinedSeeds[box.index - 1]}` ?? null
            }));
            // TODO: readd this code once debug seeds are no longer needed (when uploading has been implemented)
            // const mapContainers: ReceivedMapData[] = boxes["map-containers"];

            const receivedMapData = new Map<UploadUuid, MapData>();

            for (const item of mapContainers) {
                const { left, top, right, bottom, seed, index, uploadUuid, dataImageBaseUrl } = item;

                const mapSize: MapSize = {
                    mapWidth: right - left,
                    mapHeight: bottom - top,
                };

                const leafletBoxBounds: LeafletBoxBounds = {
                    left,
                    top,
                    right,
                    bottom,
                };

                const mapData = new MapData(mapSize, leafletBoxBounds, seed, index, uploadUuid, dataImageBaseUrl);
                receivedMapData.set(uploadUuid, mapData);
            }

            const visibleScrollBounds: VisibleScrollBounds[] = boxes["visible-scroll-bounds"];
            this.visibleScrollBounds = visibleScrollBounds;
            const isVisible: boolean = boxes["visible"];
            this.isVisible = isVisible;

            if (!visibleScrollBounds || visibleScrollBounds.length === 0) {
                return;
            }

            const mapClippingWrapper = this.mapClippingWrapper;
            mapClippingWrapper.style.visibility = isVisible ? "visible" : "hidden";
            this.changeMapDom(mapClippingWrapper, receivedMapData, this.mapData); // TODO: class to sync maps, with an action on add, change, and remove?

            const { left: visLeft, top: visTop, right: visRight, bottom: visBottom } = visibleScrollBounds[0]; // for now, assume there is only one visible scroll bounds
            for (const [uploadUuid, receivedMapDatum] of receivedMapData) {
                const {seed, index, uploadUuid, dataImageBaseUrl} = receivedMapDatum;
                const { left, top, right, bottom } = receivedMapDatum.leafletBoxBounds;

                const coordKey = uploadUuid; // TODO: remove testing code
                const mapContainerId = this.getMapContainerId(uploadUuid);
                const mapDiv = document.getElementById(mapContainerId);
                if (!mapDiv) {
                    throw this.createError(`Missing map elements for ${mapContainerId}`);
                }

                const mapWidth = right - left;
                const mapHeight = bottom - top;
                const offsetLeft = left - visLeft;
                const offsetTop = top - visTop;
                const visWidth = visRight - visLeft;
                const visHeight = visBottom - visTop;

                // Position and size the wrapper (clipping area)
                mapClippingWrapper.style.left = `${visLeft}px`;
                mapClippingWrapper.style.top = `${visTop}px`;
                mapClippingWrapper.style.width = `${visWidth}px`;
                mapClippingWrapper.style.height = `${visHeight}px`;

                // Position and size the inner map
                mapDiv.style.left = `${offsetLeft}px`;
                mapDiv.style.top = `${offsetTop}px`;
                mapDiv.style.width = `${mapWidth}px`;
                mapDiv.style.height = `${mapHeight}px`;

                // Check if map size changed
                const mapData = this.mapData;
                const prev = mapData.get(coordKey);
                if (prev === undefined) {
                    mapData.set(coordKey, receivedMapDatum);
                }
                const hasSizeChanged = !prev || prev.mapSize.mapWidth !== mapWidth || prev.mapSize.mapHeight !== mapHeight;

                const curr = mapData.get(coordKey);
                if (curr === undefined) {
                    throw this.createError(`Missing map data for ${coordKey}`);
                }
                curr.leafletBoxBounds = receivedMapDatum.leafletBoxBounds;
                if (hasSizeChanged) {
                    curr.mapSize = {mapWidth, mapHeight};
                    this.leafletWebGl2Map.resizeMap(curr.uploadUuid);
                }
            }
        } catch (err) {
            throw this.createError("Failed to parse or apply leafletBoxes data", false, err);
        }
    }

    private getMapContainerId(uuid: string) {
        return `map-container-${uuid}`;
    }

    private getLeafletMapId(uuid: string) {
        return `map-${uuid}`;
    }

    private addMapDom(mapClippingWrapper: HTMLDivElement, mapDatum: MapData) {
        const mapContainer = document.createElement("div");
        mapContainer.id = this.getMapContainerId(mapDatum.uploadUuid);
        mapContainer.className = "map-container";
        mapClippingWrapper.appendChild(mapContainer);
        const mapWrapper = document.createElement("div");
        mapWrapper.className = "map-wrapper";
        mapContainer.appendChild(mapWrapper);
        const mapHeader = document.createElement("div");
        mapHeader.className = "map-header";
        mapHeader.innerText = `Map of ${mapDatum.seed}`;
        mapWrapper.appendChild(mapHeader);
        const leafletMap = document.createElement("div");
        const leafletMapId = this.getLeafletMapId(mapDatum.uploadUuid);
        leafletMap.id = leafletMapId;
        leafletMap.className = "leaflet-map";
        mapWrapper.appendChild(leafletMap);
        const mapFooter = document.createElement("div");
        mapFooter.className = "map-footer";// Clear existing content if any (optional, depending on your needs)

        mapFooter.innerHTML = ''; 

        // Create the main warning text node
        const warningText = document.createTextNode('⚠️ Experimental Feature ⚠️');
        mapFooter.appendChild(warningText);

        // Create the line break
        mapFooter.appendChild(document.createElement('br'));

        // Create the <small> element
        const smallElement = document.createElement('small');

        // Create the first text node for "Have feedback? Let us know at "
        smallElement.appendChild(document.createTextNode('Have feedback? Let us know at '));

        // Create the GitHub link
        const githubLink = document.createElement('a');
        githubLink.href = 'https://github.com/barratt/mapsnotincluded.org/issues/new';
        githubLink.textContent = 'our GitHub';
        githubLink.style.pointerEvents = 'auto'; // Ensure the link is clickable
        smallElement.appendChild(githubLink);

        // Create the text node for " or "
        smallElement.appendChild(document.createTextNode(' or '));

        // Create the Discord link
        const discordLink = document.createElement('a');
        discordLink.href = 'https://discord.gg/3vhCpp6PNq';
        discordLink.textContent = 'our Discord';
        discordLink.style.pointerEvents = 'auto'; // Ensure the link is clickable
        smallElement.appendChild(discordLink);

        // Append exclamation mark
        smallElement.appendChild(document.createTextNode('!'));

        // Append the <small> element to the mapFooter
        mapFooter.appendChild(smallElement);

        mapWrapper.appendChild(mapFooter);

        this.leafletWebGl2Map.initializeMap(leafletMapId, mapDatum.seed, mapDatum.uploadUuid, mapDatum.dataImageBaseUrl); // TODO

        // LeafletWebGL2Map.value.createInstance(seed, `map-${seed}`); // new API TODO: check if this is needed
    }

    private removeMapDom(mapDatum: MapData) {
        const mapContainerId = this.getMapContainerId(mapDatum.uploadUuid);
        const mapContainer = document.getElementById(mapContainerId);
        if (!mapContainer) {
            console.error(`Map container with id ${mapContainerId} not found`);
            throw new Error(`Map container with id ${mapContainerId} not found`);
        }
        mapContainer.remove(); // TODO: check that this is enough to remove everything
        this.leafletWebGl2Map.removeMap(mapDatum.uploadUuid);
        // LeafletWebGL2Map.value.destroyInstance(seed); // TODO: check if this is needed
    }

    private showMapDom(mapDatum: MapData) {
        const mapContainerId = this.getMapContainerId(mapDatum.uploadUuid);
        const mapContainer = document.getElementById(mapContainerId);
        if (!mapContainer) {
            console.error(`Map container with id ${mapContainerId} not found`);
            throw new Error(`Map container with id ${mapContainerId} not found`);
        }
        mapDatum.isVisible = true;
        mapContainer.style.visibility = "visible";
    }

    private hideMapDom(mapDatum: MapData) {
        const mapContainerId = this.getMapContainerId(mapDatum.uploadUuid);
        const mapContainer = document.getElementById(mapContainerId);
        if (!mapContainer) {
            console.error(`Map container with id ${mapContainerId} not found`);
            throw new Error(`Map container with id ${mapContainerId} not found`);
        }
        mapDatum.isVisible = false;
        mapContainer.style.visibility = "hidden";
    }

    private changeMapDom(mapClippingWrapper: HTMLDivElement, newMapData: Map<string, MapData>, oldMapData: Map<string, MapData>) {
        // add new maps
        for (const [uploadUuid, mapDatum] of newMapData) {
            if (!oldMapData.has(uploadUuid)) {
                this.addMapDom(mapClippingWrapper, mapDatum);
            } else if (oldMapData.get(uploadUuid)?.isVisible === false) {
                this.showMapDom(mapDatum);
            }
        }
        // remove old maps
        for (const [uploadUuid, mapDatum] of oldMapData) {
            if (!newMapData.has(uploadUuid)) {
                // Don't delete old maps, just hide them so that they can be reused
                // this.removeMapDom(mapDatum);
                // this.mapData.delete(uploadUuid);
                this.hideMapDom(mapDatum);
            }
        }
    }

    private areSetsEqual = (setA: Set<string>, setB: Set<string>) => {
        if (setA.size !== setB.size) return false;
        for (const item of setA) {
            if (!setB.has(item)) return false;
        }
        return true;
    }

    private requestLeafletBoxes() {
        const iframe = this.iframe;
        if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage("getLeafletBoxes", "*");
        }
        this.animationFrameId = requestAnimationFrame(this.requestLeafletBoxes.bind(this));
    }

    private createError(msg: string, doConsoleLog: boolean = true, baseError?: unknown): Error {
        return createError("LeafletMessageBrowserIframe", msg, doConsoleLog, baseError);
    }
}