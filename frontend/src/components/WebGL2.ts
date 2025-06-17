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

// Confused? See https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html.

import {
    DataImageType,
    debugControlValuesAndColors,
    defaultControlValuesAndColors,
    getDataImageType,
    RenderLayer
} from "@/components/MapData";
import {createError} from "@/components/CreateCascadingError";
import {loadBitmapsAsync} from "@/components/LoadImage";

function getCanvasImageSourceDims(
    source: TexImageSource
): {
    width: number;
    height: number
} {

    if (
        (typeof HTMLImageElement !== "undefined" && source instanceof HTMLImageElement) ||
        (typeof HTMLCanvasElement !== "undefined" && source instanceof HTMLCanvasElement) ||
        (typeof HTMLVideoElement !== "undefined" && source instanceof HTMLVideoElement) ||
        (typeof ImageData !== "undefined" && source instanceof ImageData) ||
        (typeof OffscreenCanvas !== "undefined" && source instanceof OffscreenCanvas) ||
        (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap)
    ) {
        const width: number = source.width;
        const height: number = source.height;
        return { width, height };
    } else {
        throw new Error("Unsupported image type for width/height lookup");
    }
}

interface TextureLevel {
    getTextureLayer(layerIndex: number, mipmapIndex: number) : {
        sourceImage: TexImageSource,
        width: number,
        height: number
    };
    getNumTextureLayers() : number;
    getTextureWidth() : number;
    getTextureHeight() : number;
}
interface TextureLevelMipmapArray {
    getMipmapArray() : readonly TextureLevel[];
    getMipmapLevel(index: number) : TextureLevel;
    getNumProvidedMipmaps(): number;
    getNumTextureLayers() : number;
}

class TextureArrayCreationSettings {
    // TODO
    private usePixelArtSettings: boolean;
    constructor(usePixelArtSettings: boolean) {
        this.usePixelArtSettings = usePixelArtSettings;
    }
}
class TextureAtlas implements TextureLevel {
    private readonly imageAtlas: TexImageSource;
    private readonly getAtlasBoundsForLayer: (layerIndex: number, mipmapIndex: number) => {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    private readonly atlasDepth: number;
    private readonly width: number;
    private readonly height: number;

    constructor(
        imageAtlas: TexImageSource,
        getAtlasBoundsForLayer: (layerIndex: number, mipmapIndex: number) => {
            x: number;
            y: number;
            width: number;
            height: number;
        },
        atlasDepth: number,
    ) {
        if (atlasDepth <= 0) {
            throw new Error("Atlas depth must be a positive integer");
        }

        this.imageAtlas = imageAtlas;
        this.getAtlasBoundsForLayer = getAtlasBoundsForLayer;
        this.atlasDepth = atlasDepth;

        const firstInfo = this.getTextureLayer(0, 0);
        // TODO: move mipmap index logic elsewhere
        for (let i = 1; i < atlasDepth; i++) {
            const currInfo = this.getTextureLayer(i, 0);
            if (currInfo.height !== firstInfo.height) {
                throw new Error("All heights must match.");
            }
            if (currInfo.width !== firstInfo.width) {
                throw new Error("All widths must match.");
            }
        }
        this.width = firstInfo.width;
        this.height = firstInfo.height;
    }

    private static toCanvasImageSource(source: TexImageSource): CanvasImageSource {
        if (
            (typeof HTMLImageElement !== "undefined" && source instanceof HTMLImageElement) ||
            (typeof HTMLCanvasElement !== "undefined" && source instanceof HTMLCanvasElement) ||
            (typeof HTMLVideoElement !== "undefined" && source instanceof HTMLVideoElement) ||
            (typeof OffscreenCanvas !== "undefined" && source instanceof OffscreenCanvas) ||
            (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap)
        ) {
            return source; // Already valid
        }

        // Convert ImageData
        if (typeof ImageData !== "undefined" && source instanceof ImageData) {
            const canvas = document.createElement("canvas");
            canvas.width = source.width;
            canvas.height = source.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Failed to get 2D context while converting ImageData.");
            ctx.putImageData(source, 0, 0);
            return canvas;
        }

        // Convert VideoFrame (if supported)
        if (typeof VideoFrame !== "undefined" && source instanceof VideoFrame) {
            const canvas = document.createElement("canvas");
            canvas.width = source.displayWidth;
            canvas.height = source.displayHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Failed to get 2D context while converting VideoFrame.");
            // Draw the frame — drawImage supports VideoFrame as of modern browsers
            ctx.drawImage(source, 0, 0);
            return canvas;
        }

        throw new Error("Unsupported TexImageSource type for drawImage conversion.");
    }

    public getTextureLayer(
        layerIndex: number,
        mipmapIndex: number
    ) : {
        sourceImage: TexImageSource,
        width: number,
        height: number
    } {
        // Use the function to get bounds if an atlas is used
        const bounds = this.getAtlasBoundsForLayer(layerIndex, mipmapIndex);
        const sx = bounds.x;
        const sy = bounds.y;
        const sw = bounds.width;
        const sh = bounds.height;

        // Create a temporary canvas to extract the subregion
        const tempCanvas = new OffscreenCanvas(sw, sh);
        const ctx = tempCanvas.getContext("2d");
        if (ctx === null) {
            throw new Error("Failed to get 2D context from temporary canvas.");
        }

        const safeImageAtlas = TextureAtlas.toCanvasImageSource(this.imageAtlas);

        // Draw the subregion onto the temporary canvas
        ctx.drawImage(safeImageAtlas, sx, sy, sw, sh, 0, 0, sw, sh);

        // Update sourceImage to be the extracted subregion
        const sourceImage = tempCanvas;
        const width = sw;
        const height = sh;

        return { sourceImage, width, height };
    }
    getNumTextureLayers() : number {
        return this.atlasDepth;
    }
    getTextureWidth(): number {
        return this.width;
    }
    getTextureHeight(): number {
        return this.height;
    }
}
class TextureArray implements TextureLevel {
    private readonly imageArray: readonly TexImageSource[];
    private readonly width: number;
    private readonly height: number;
    constructor(imageArray: readonly TexImageSource[]) {
        if (imageArray.length <= 0) {
            throw new Error("ImageArray length must be a positive integer");
        }

        this.imageArray = imageArray;

        const firstInfo = this.getTextureLayer(0, 0);
        // TODO: repeated code from TextureAtlas
        for (let i = 1; i < imageArray.length; i++) {
            const currInfo = this.getTextureLayer(i, 0);
            if (currInfo.height !== firstInfo.height) {
                throw new Error("All heights must match.");
            }
            if (currInfo.width !== firstInfo.width) {
                throw new Error("All widths must match.");
            }
        }
        this.width = firstInfo.width;
        this.height = firstInfo.height;
    }

    getTextureLayer(
        layerIndex: number,
        mipmapIndex: number
    ) : {
        sourceImage: TexImageSource,
        width: number,
        height: number
    } {
        // TODO: mipmapIndex
        const sourceImage = this.imageArray[layerIndex];
        const dims = getCanvasImageSourceDims(sourceImage);
        const width = dims.width;
        const height = dims.height;
        return { sourceImage, width, height };
    }
    getNumTextureLayers() : number {
        return this.imageArray.length;
    }
    getTextureWidth(): number {
        return this.width;
    }
    getTextureHeight(): number {
        return this.height;
    }
}
class TextureAtlasMipmapArray implements TextureLevelMipmapArray {
    private readonly imageMipmaps: readonly TextureAtlas[];
    private readonly depth: number;
    constructor(imageMipmaps: readonly TextureAtlas[]) {
        if (imageMipmaps.length <= 0) {
            throw new Error("No image mipmaps found.");
        }

        const firstImageMipmap = imageMipmaps[0];
        this.depth = firstImageMipmap.getNumTextureLayers();
        for (let i = 1; i < imageMipmaps.length; i++) {
            const currImageMipmap = imageMipmaps[i];
            const currTextureLayers = currImageMipmap.getNumTextureLayers();
            if (currTextureLayers !== this.depth) {
                throw new Error("Image mipmaps were not of the same depth.");
            }
        }

        this.imageMipmaps = imageMipmaps;
    }
    getNumProvidedMipmaps() : number {
        return this.imageMipmaps.length;
    }
    getMipmapArray() : readonly TextureLevel[] {
        return this.imageMipmaps;
    }
    getNumTextureLayers(): number {
        return this.depth;
    }
    getMipmapLevel(index: number): TextureLevel {
        return this.imageMipmaps[index];
    }
}
class TextureArrayMipmapArray implements TextureLevelMipmapArray {
    private readonly imageMipmaps: readonly TextureArray[];
    private readonly depth: number;
    constructor(imageMipmaps: readonly TextureArray[]) {
        if (imageMipmaps.length <= 0) {
            throw new Error("No image mipmaps found.");
        }

        // TODO: repeated code from TextureAtlasMipmapArray
        const firstImageMipmap = imageMipmaps[0];
        this.depth = firstImageMipmap.getNumTextureLayers();
        for (let i = 1; i < imageMipmaps.length; i++) {
            const currImageMipmap = imageMipmaps[i];
            const currTextureLayers = currImageMipmap.getNumTextureLayers();
            if (currTextureLayers !== this.depth) {
                throw new Error("Image mipmaps were not of the same depth.");
            }
        }

        this.imageMipmaps = imageMipmaps;
    }
    getNumProvidedMipmaps() : number {
        return this.imageMipmaps.length;
    }
    getMipmapArray() : readonly TextureLevel[] {
        return this.imageMipmaps;
    }
    getNumTextureLayers(): number {
        return this.depth;
    }
    getMipmapLevel(index: number): TextureLevel {
        return this.imageMipmaps[index];
    }
}

type MapDataLayerKey = string & { __brand: "MapDataLayerKey" };

// TODO: should this struct-like class be an interface?
class MapDataLayer {
    public uploadUuid: string;
    public dataImageType: DataImageType;
    constructor(uploadUuid: string, dataImageType: DataImageType) {
        this.uploadUuid = uploadUuid;
        this.dataImageType = dataImageType;
    }
    toKey(): MapDataLayerKey {
        return `${this.uploadUuid}::${this.dataImageType}` as MapDataLayerKey;
    }
}

export default class WebGL2CanvasManager {
    private readonly DEBUG_DO_LRU_CACHE_LOG: boolean = false;
    
    private readonly OPTIONS_REDUCE_DEFAULT_TILE_SIZE = true; // Reduce tile size for lower data usage, but lower render quality when zoomed in

    private canvas: OffscreenCanvas;
    private readonly gl: WebGL2RenderingContext;
    private readonly program: WebGLProgram;
    private readonly vertexShader: WebGLShader;
    private readonly fragmentShader: WebGLShader;
    private readonly positionBuffer : WebGLBuffer;
    private readonly NATURAL_TILES_TEXTURE_SIZE : number;
    private readonly RESOLUTION_LOCATION_NAME : string;
    private readonly MAX_TEXTURE_SLOTS: number;
    private readonly textureLRU: Map<MapDataLayerKey,number>; // map data image layer ➜ slot index
    private readonly worldDataArray: WebGLTexture;
    private readonly worldDataArrayNumMipmaps: number; // TODO: is this necessary?
    private elementDataTextureArray: WebGLTexture | undefined;
    private spaceTextureArray: WebGLTexture | undefined;
    private naturalTilesTextureArray: WebGLTexture | undefined;
    private readonly WORLD_DATA_TEXTURE_WIDTH: number;
    private readonly WORLD_DATA_TEXTURE_HEIGHT: number;
    private readonly clearFrameBuffer: WebGLFramebuffer;
    private numProvidedNaturalTileMipmaps : number | null;
    private readonly isMapDataImageLayerReady: Map<MapDataLayerKey, boolean>;
    private readonly dataImageSlotMap: Map<MapDataLayerKey, number>;
    private isReadyToRender: boolean;
    private readonly EXPLICIT_UNINITIALIZED_COLOR: ReadonlyArray<number>;
    private readonly EXPLICIT_OUT_OF_BOUNDS_COLOR: ReadonlyArray<number>;
    private readonly WORLD_SLOTS_CAPACITY = 5;
    private readonly CONTROL_VALUES_AND_COLORS_CAPACITY = 25;
    constructor(defaultWidth: number = 300, defaultHeight: number = 300) {
        // Get a WebGL context
        this.canvas = new OffscreenCanvas(defaultWidth, defaultHeight);
        const ctx = this.canvas.getContext("webgl2");
        if (!ctx) {
            throw this.createError("WebGL2 is not supported.");
        }
        this.gl = ctx;
        const gl = this.gl;

        const vertexShaderSource = this.getVertexShaderGLSL();
        const fragmentShaderSource = this.getFragmentShaderGLSL();

        // Use our boilerplate utils to compile the shaders and link into a program
        const shaders = this.setupShaders(vertexShaderSource, fragmentShaderSource);
        this.program = shaders.program;
        this.vertexShader = shaders.vertexShader;
        this.fragmentShader = shaders.fragmentShader;

        // Tell it to use our program (pair of shaders)
        gl.useProgram(this.program);

        this.positionBuffer = this.setupPositionBuffer("a_position", 0, 0, 1, 1);

        this.NATURAL_TILES_TEXTURE_SIZE = this.OPTIONS_REDUCE_DEFAULT_TILE_SIZE ? 128 : 1024;
        this.RESOLUTION_LOCATION_NAME = "u_resolution";

        this.MAX_TEXTURE_SLOTS = 32;          // adjust ≤ GPU limit
        this.textureLRU = new Map();

        this.numProvidedNaturalTileMipmaps = null;

        this.isMapDataImageLayerReady = new Map();
        this.dataImageSlotMap = new Map();
        this.isReadyToRender = false;

        this.EXPLICIT_UNINITIALIZED_COLOR = [0.0, 1.0, 1.0, 0.5]; // translucent cyan
        this.EXPLICIT_OUT_OF_BOUNDS_COLOR = [1.0, 0.0, 1.0, 0.5]; // translucent magenta

        if (this.CONTROL_VALUES_AND_COLORS_CAPACITY * 4 > gl.MAX_FRAGMENT_UNIFORM_VECTORS) {
            throw this.createError(`Too many control values and colors. ${this.CONTROL_VALUES_AND_COLORS_CAPACITY * 4} > ${gl.MAX_FRAGMENT_UNIFORM_VECTORS} (WebGL2 limit)`);
        }

        // Initialize the world data texture array
        {
            const usePixelArtSettings = true;
            this.worldDataArray = this.createAndSetupTextureArray(true);
            this.WORLD_DATA_TEXTURE_WIDTH = 1200;
            const width = this.WORLD_DATA_TEXTURE_WIDTH;
            this.WORLD_DATA_TEXTURE_HEIGHT = 500;
            const height = this.WORLD_DATA_TEXTURE_HEIGHT;
            const depth = this.MAX_TEXTURE_SLOTS;

            const {numAllocatedMipmaps} = this.allocateTextureArrayStorage(this.worldDataArray, width, height, depth, usePixelArtSettings);
            this.worldDataArrayNumMipmaps = numAllocatedMipmaps;
            // this.bindTextureArrayToUnit(this.worldDataArray, "u_world_data_image_array", 4);

            const clearFrameBuffer = gl.createFramebuffer();
            if (clearFrameBuffer === null) {
                throw this.createError("Failed to create clearFrameBuffer.");
            }
            this.clearFrameBuffer = clearFrameBuffer;

            // set explicit uninitialized background 
            // TODO: merge with uploadTextureArray() logic in helper function
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.clearFrameBuffer);
            const bgColor = this.EXPLICIT_UNINITIALIZED_COLOR;
            gl.clearColor(bgColor[0], bgColor[1], bgColor[2], bgColor[3]);
            for (let i = 0; i < depth; i++) {
                gl.framebufferTextureLayer(
                    gl.FRAMEBUFFER,
                    gl.COLOR_ATTACHMENT0,
                    this.worldDataArray,
                    0,
                    i
                );
                gl.clear(gl.COLOR_BUFFER_BIT);
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
    }
    async setup(
        opts?: {
            dataImages?: Map<RenderLayer, readonly string[] | readonly HTMLImageElement[] | readonly HTMLCanvasElement[] | readonly OffscreenCanvas[] | readonly ImageBitmap[]>,
            elementDataImage?: string | HTMLImageElement | HTMLCanvasElement | OffscreenCanvas | ImageBitmap,
            bgImages?: readonly string[] | readonly HTMLImageElement[] | readonly HTMLCanvasElement[] | readonly OffscreenCanvas[] | readonly ImageBitmap[],
            tileImages?: readonly string[] | readonly HTMLImageElement[] | readonly HTMLCanvasElement[] | readonly OffscreenCanvas[] | readonly ImageBitmap[],
            uploadUuid?: string
        }
    ) : Promise<void> {
        // TODO: lazy texture loading with large images
        const gl = this.gl;

        const texCoordBuffer = this.setupTextureBuffers("a_texCoord");

        // provide texture coordinates for the rectangle.
        //this.setRectangle(positionBuffer, num_pixels_num_cells_left_edge_x, num_pixels_num_cells_bottom_edge_y, num_pixels_world_width, num_pixels_world_height);

        const setupTasks: Promise<void>[] = [];

        if (opts) {
            const dataImages = opts.dataImages;
            const elementDataImage = opts.elementDataImage;
            const bgImages = opts.bgImages;
            const tileImages = opts.tileImages;

            if (dataImages) {
                const uploadUuid = opts.uploadUuid;
                if (uploadUuid === undefined) throw this.createError("uploadUuid is required for data images.");

                // TODO: change this to take arbitrary (including noncontiguous) layer offsets
                const worldDataPromises = Array.from(dataImages.entries()).map(async ([renderLayer, imageArray]) => {
                    const normalized = await this.normalizeImageInputArray(imageArray);
                    const wrapper = new TextureArray(normalized);
                    const slotMap = this.acquireTextureSlots(uploadUuid, renderLayer);
                    for (const [slot, layer] of slotMap) {
                        this.uploadTextureArray(this.worldDataArray, wrapper, true, false, this.worldDataArrayNumMipmaps, slot, this.EXPLICIT_OUT_OF_BOUNDS_COLOR);
                        this.isMapDataImageLayerReady.set(new MapDataLayer(uploadUuid, layer).toKey(), true);
                    }
                });

                setupTasks.push(Promise.all(worldDataPromises).then(() => {}));
            }

            if (elementDataImage) {
                const task = (async () => {
                    const arr = await this.normalizeImageInputArray([elementDataImage]);
                    const atlas = arr[0];
                    const wrapper = new TextureAtlas(atlas, (i) => ({ x: i, y: 0, width: 1, height: 2 }), atlas.width);
                    this.elementDataTextureArray = this.setupTextureArray(wrapper, true, false, null);
                })();
                setupTasks.push(task);
            }

            if (bgImages) {
                const task = (async () => {
                    const normalized = await this.normalizeImageInputArray(bgImages);
                    const wrapper = new TextureArray(normalized);
                    this.spaceTextureArray = this.setupTextureArray(wrapper, true, false, null);
                })();
                setupTasks.push(task);
            }

            if (tileImages) {
                const task = (async () => {
                    const normalized = await this.normalizeImageInputArray(tileImages);
                    const mips: TextureAtlas[] = normalized.map((img, i) =>
                        new TextureAtlas(img, (layer, mip) => {
                            const size = this.NATURAL_TILES_TEXTURE_SIZE / (2 ** mip);
                            return { x: layer * size, y: 0, width: size, height: size };
                        }, normalized[0].width / this.NATURAL_TILES_TEXTURE_SIZE)
                    );
                    const wrapper = new TextureAtlasMipmapArray(mips);
                    this.numProvidedNaturalTileMipmaps = wrapper.getNumProvidedMipmaps();
                    // TODO: rename to natural tiles everywhere
                    this.naturalTilesTextureArray = this.setupTextureArray(wrapper, false, true, null);
                })();
                setupTasks.push(task);
            }

            await Promise.all(setupTasks);
        }

        if (!this.elementDataTextureArray || !this.spaceTextureArray || !this.naturalTilesTextureArray) {
            console.warn("Textures not yet fully loaded. Skipping binding. Please call setup(...) using elementDataImage, bgImages, and tileImages first.");
            return;
        }
        this.bindTextureArrayToUnit(this.elementDataTextureArray, "u_element_data_image_array", 1);
        this.bindTextureArrayToUnit(this.spaceTextureArray, "u_space_image_array", 2);
        this.bindTextureArrayToUnit(this.naturalTilesTextureArray, "u_natural_tile_image_array", 3);
        this.bindTextureArrayToUnit(this.worldDataArray, "u_world_data_image_array", 4);
        this.isReadyToRender = true;

        // TODO: readd if necessary
        // this.bindTextureToUnit(worldDataTextures[0], "u_world_data_image_elementIdx8", 0);
        //this.bindTextureToUnit(worldDataTextures[1], images[1], "u_world_data_image_temperature32", 1);
        //this.bindTextureToUnit(worldDataTextures[2], images[2], "u_world_data_image_mass32", 2);

        this.checkWebGLError();
    }
    render(
        uploadUuid: string,
        numCellsWorldWidth: number,
        numCellsWorldHeight: number,
        num_cells_width: number,
        num_cells_height: number,
        num_cells_left_edge_x: number,
        num_cells_bottom_edge_y: number,
        canvas_width: number,
        canvas_height: number,
        renderLayer: RenderLayer
    ): void {
        const gl = this.gl;

        if (!this.isReadyToRender) {
            throw this.createError("Base textures not yet fully loaded. Do not call render(...) at this time, wait for setup(...) to finish.");
        }
        if (this.queryIsMapDataImageLayerReady(uploadUuid, renderLayer) === false) {
            throw this.createError("Map data layer data image not yet fully loaded. Do not call render(...) at this time, wait for setup(...) to finish.");
        }

        this.resizeCanvas(canvas_width, canvas_height);
        this.resetCanvasState();

        // Set the currently rendering uploadUuid
        const slots = this.queryTextureSlots(uploadUuid, renderLayer);
        if (slots.length > this.WORLD_SLOTS_CAPACITY) {
            throw this.createError(`Too many texture slots for uploadUuid: ${uploadUuid}`);
        }
        // Pad the slots to the maximum capacity
        const paddedSlots = new Array(this.WORLD_SLOTS_CAPACITY).fill(-1); // TODO: show error texture in shader if uninitialized value called
        for (let i = 0; i < slots.length; i++) {
            paddedSlots[i] = slots[i];
        }
        const slotArray: ReadonlyArray<[number]> = paddedSlots.map((slot) => [slot]);
        if (this.DEBUG_DO_LRU_CACHE_LOG) console.log(`Rendering with slots: ${JSON.stringify(slotArray)} uploadUuid ${uploadUuid} layer ${renderLayer} list ${JSON.stringify(getDataImageType(renderLayer))}`);
        this.bind1UniformIntVectorToUnit(slotArray, "u_world_slots");

        // Set the currently rendering layer
        let layer: number;
        switch (renderLayer) {
            case RenderLayer.ELEMENT_BACKGROUND:
                layer = 0; // TODO: make this more robust to changes with syncing to GLSL shader
                break;
            case RenderLayer.ELEMENT_OVERLAY:
                layer = 1;
                break;
            case RenderLayer.TEMPERATURE_OVERLAY:
                layer = 2;
                break;
            case RenderLayer.MASS_OVERLAY:
                layer = 3;
                break;
            case RenderLayer.RADIATION_OVERLAY:
                layer = 4;
                break;
            case RenderLayer.DECOR_OVERLAY:
                layer = 5;
                break;
            default:
                throw this.createError(`Invalid render layer: ${renderLayer}`);
        }
        this.bind1UniformIntsToUnit(layer!, "u_render_layer");

        let controlValuesAndColors: readonly {controlValue: readonly [number], controlColor: readonly [number, number, number, number]}[];
        const currDefaultControlValuesAndColors = defaultControlValuesAndColors.get(renderLayer);
        if (currDefaultControlValuesAndColors === undefined) {
            controlValuesAndColors = debugControlValuesAndColors;
        } else {
            controlValuesAndColors = currDefaultControlValuesAndColors;
        }

        const {controlValues, controlColors} = WebGL2CanvasManager.splitControlValuesAndColors(controlValuesAndColors);
        this.bind1UniformFloatVectorToUnit(controlValues, "u_controlValues");
        this.bind4UniformFloatVectorToUnit(controlColors, "u_controlColors");
        this.bind1UniformIntsToUnit(controlValuesAndColors.length, "u_numControlValuesAndColors");

        // --- Phase 1: draw full-screen background ---
        // TODO: make space background follow the Leaflet map, not individual Leaflet tiles
        this.updatePositionBuffer(this.positionBuffer, 0, 0, canvas_width, canvas_height);
        this.bind2UniformFloatsToUnit(canvas_width, canvas_height, this.RESOLUTION_LOCATION_NAME);

        this.bind1UniformFloatsToUnit(0.0, "u_lod_level"); // lod not needed for background
        this.bind2UniformFloatsToUnit(1.0, 1.0, "u_natural_texture_tiles_per_cell"); // identity mapping
        this.setFramebuffer(null, canvas_width, canvas_height, this.RESOLUTION_LOCATION_NAME);
        this.bindUniformBoolToUnit(true, "u_rendering_background"); // for foreground/world pass
        this.drawScene();

        // --- Phase 2: draw world on top ---
        // TODO: make space background consistent in first and second pass, possibly with frame buffers

        // Set a rectangle the same size as the image.

        // NOTE: this commented-out code assumes that the world data images are the same size and are the same size as the world
        // const num_pixels_world_width = canvas_width / num_cells_width * numCellsWorldWidth;
        // const num_pixels_world_height = canvas_height / num_cells_height * numCellsWorldHeight;

        const num_pixels_world_width = canvas_width / num_cells_width * this.WORLD_DATA_TEXTURE_WIDTH;
        const num_pixels_world_height = canvas_height / num_cells_height * this.WORLD_DATA_TEXTURE_HEIGHT;

        const num_pixels_num_cells_left_edge_x = canvas_width / num_cells_width * num_cells_left_edge_x;
        const num_pixels_num_cells_bottom_edge_y = canvas_width / num_cells_width * num_cells_bottom_edge_y;

        this.updatePositionBuffer(
            this.positionBuffer,
            num_pixels_num_cells_left_edge_x,
            num_pixels_num_cells_bottom_edge_y,
            num_pixels_world_width,
            num_pixels_world_height
        );

        // Pass in the canvas resolution so we can convert from pixels to clip space in the shader
        this.bind2UniformFloatsToUnit(gl.canvas.width, gl.canvas.height, this.RESOLUTION_LOCATION_NAME);

        const NATURAL_TEXTURE_TILES_PER_CELL_X = 1 / 8;
        const NATURAL_TEXTURE_TILES_PER_CELL_Y = 1 / 8;
        if (this.numProvidedNaturalTileMipmaps === null) {
            throw this.createError("Natural tile mipmaps not provided.");
        }
        const lodLevel = this.computeLodLevel(num_cells_width, num_cells_height, NATURAL_TEXTURE_TILES_PER_CELL_X, NATURAL_TEXTURE_TILES_PER_CELL_Y);
        const clampedLodLevel = Math.max(Math.min(lodLevel, this.numProvidedNaturalTileMipmaps - 1), 0);
        this.bind1UniformFloatsToUnit(clampedLodLevel, "u_lod_level");
        this.bind2UniformFloatsToUnit(NATURAL_TEXTURE_TILES_PER_CELL_X, NATURAL_TEXTURE_TILES_PER_CELL_Y, "u_natural_texture_tiles_per_cell");
        this.bindUniformBoolToUnit(false, "u_rendering_background"); // for foreground/world pass

        // Calling gl.bindFramebuffer with null tells WebGL to render to the canvas instead of one of the framebuffers.
        this.setFramebuffer(null, gl.canvas.width, gl.canvas.height, this.RESOLUTION_LOCATION_NAME);

        this.drawScene();

        this.checkWebGLError(); // TODO: more error reporting
    }

    getVertexShaderGLSL() {
        // Create a vertex and fragment shader program, in GLSL
        const vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;
in vec2 a_texCoord;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

// Used to pass the texture coordinates to the fragment shader
out vec2 v_texCoord;

// all shaders have a main function
void main() {

    // convert the position from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;

    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // convert from 0->2 to -1->+1 (clipspace)
    vec2 clipSpace = zeroToTwo - vec2(1.0, 1.0);

    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = vec4(clipSpace, 0, 1);

    // pass the texCoord to the fragment shader
    // The GPU will interpolate this value between points.
    v_texCoord = a_texCoord;
}
`;
        return vertexShaderSource;
    }

    getFragmentShaderGLSL() {
        const fragmentShaderSource = `#version 300 es
 
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;
precision highp sampler2DArray;
uniform sampler2DArray u_world_data_image_array;
uniform sampler2DArray u_element_data_image_array;
uniform sampler2DArray u_natural_tile_image_array;
uniform sampler2DArray u_space_image_array;

uniform float u_lod_level;
uniform vec2 u_natural_texture_tiles_per_cell;
uniform bool u_rendering_background;
uniform int u_world_slots[5]; // which slots to sample
uniform int u_render_layer; // which layer to sample

uniform float u_controlValues[25];
uniform vec4 u_controlColors[25];
uniform int u_numControlValuesAndColors;

const vec4 EXPLICIT_UNINITIALIZED_COLOR = vec4(0.0, 1.0, 1.0, 0.5);
const vec4 EXPLICIT_OUT_OF_BOUNDS_COLOR = vec4(1.0, 0.0, 1.0, 0.5);

bool DEBUG_DO_RENDER_RAW_DATA_IMAGE = false; // Not const to prevent unused variable discarding

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// we need to declare an output for the fragment shader
out vec4 outColor;

struct vec2pixels {
    vec2 pixels;
};

struct floatOrVec4 {
    float value;
    vec4 color;
    bool value_is_valid;
};

struct intOrVec4 {
    int value;
    vec4 color;
    bool value_is_valid;
};

struct uintOrVec4 {
    uint value;
    vec4 color;
    bool value_is_valid;
};

vec4 texture_displacement_in_pixels(sampler2D tex, vec2 uv_texCoord, vec2pixels d_pixels_struct) {
    vec2 d_pixels = d_pixels_struct.pixels; // unpack the struct
    vec2 texCoordPerPixel = vec2(1) / vec2(textureSize(tex, 0));
    vec2 d_texCoord = texCoordPerPixel * d_pixels;
    vec2 uv_displaced_texCoord = uv_texCoord + d_texCoord;
    vec4 color = texture(tex, uv_displaced_texCoord);
    return color;
}

// Function to reconstruct 32-bit float from RGBA
floatOrVec4 decodeRGBAtoFloat(vec4 rgba, vec2 v_worldCellPositionFloat) {
    // Convert 8-bit components (0-255 range) to unsigned integer (0.0 - 1.0 scaled)
    uint r = uint(round(rgba.r * 255.0));
    uint g = uint(round(rgba.g * 255.0));
    uint b = uint(round(rgba.b * 255.0));
    uint a = uint(round(rgba.a * 255.0));

    // Reconstruct IEEE 754 binary representation
    // uint floatBits = (r << 24) | (g << 16) | (b << 8) | a; // big-endian
    uint floatBits = (a << 24) | (r << 16) | (g << 8) | b; // little-endian

    // Convert bit pattern to float
    return floatOrVec4(uintBitsToFloat(floatBits), vec4(0.0, 0.0, 0.0, 0.0), true); // return the value and a dummy color
}

// Interpolates between two colors based on a float value and control points
vec3 interpolateColor(float value, float v1, vec3 c1, float v2, vec3 c2) {
    float t = clamp((value - v1) / (v2 - v1), 0.0, 1.0);
    return mix(c1, c2, t); // Linear interpolation TODO readd
}
vec4 interpolateColor(float value, float v1, vec4 c1, float v2, vec4 c2) {
    float t = clamp((value - v1) / (v2 - v1), 0.0, 1.0);
    return mix(c1, c2, t); // Linear interpolation TODO readd
}

// Converts a float into an RGBA color using control points
vec4 mapFloatToRGBA(float value, int numPoints, float controlValues[25], vec4 controlColors[25]) {
    // Find the nearest two control points for interpolation
    for (int i = 0; i < numPoints - 1; i++) {
        if (value >= controlValues[i] && value <= controlValues[i + 1]) {
            vec4 color = interpolateColor(value, 
                             controlValues[i], controlColors[i], 
                             controlValues[i + 1], controlColors[i + 1]);
            return color;
        }
    }
    // Default: If outside range, clamp to nearest endpoint
    if (value < controlValues[0]) {
        return controlColors[0];
    } else {
        return controlColors[numPoints - 1];
    }
}

// TODO: see if this is built-in
vec2 pairwise_mult(vec2 vector_1, vec2 vector_2) {
    return vec2(vector_1.x * vector_2.x, vector_1.y * vector_2.y);
}

// Magenta/black checkerboard fallback for invalid data
vec4 get_error_texture_color(ivec2 cell_pos) {
    const int TILE_SIZE = 8;
    bool isEven = ((cell_pos.x / TILE_SIZE + cell_pos.y / TILE_SIZE) % 2) == 0;

    vec3 magenta = vec3(1.0, 0.0, 1.0);
    vec3 black = vec3(0.0, 0.0, 0.0);
    vec3 color = isEven ? magenta : black;

    return vec4(color, 1.0);
}

bool is_close_enough(vec4 color, vec4 target_color, float threshold) {
    vec4 color_diff = abs(color - target_color);
    return (color_diff.r < threshold && color_diff.g < threshold && color_diff.b < threshold && color_diff.a < threshold);
}

// Function to reconstruct 32-bit uint from RGBA
uintOrVec4 decodeRGBAtoUint32(vec4 rgba, vec2 v_worldCellPositionFloat) {
    uint r = uint(rgba.r * 255.0);
    uint g = uint(rgba.g * 255.0);
    uint b = uint(rgba.b * 255.0);
    uint a = uint(rgba.a * 255.0);
    uint constructed_uint = (a << 24) | (r << 16) | (g << 8) | b; // little-endian
    return uintOrVec4(constructed_uint, vec4(0.0, 0.0, 0.0, 0.0), true); // return the value and a dummy color
}

// TODO: use R8 textures instead of RGBA8 to save space
// Function to reconstruct 8-bit uint from RGBA
uintOrVec4 decodeRGBAtoUint8(vec4 rgba, vec2 v_worldCellPositionFloat) {
    // The color is a grayscale value, which we can just use the red channel for
    uint r = uint(rgba.r * 255.0);
    uint g = uint(rgba.g * 255.0);
    uint b = uint(rgba.b * 255.0);
    uint a = uint(rgba.a * 255.0);
    if (a != 255u || r != g || g != b) {
        // If the color is not grayscale, use the error texture
        ivec2 cell_pos = ivec2(floor(v_worldCellPositionFloat));
        return uintOrVec4(0u, get_error_texture_color(cell_pos), false);
    }
    return uintOrVec4(r, vec4(0.0, 0.0, 0.0, 0.0), true); // return the value and a dummy color
}

uintOrVec4 get_uint8_or_vec4(int possible_slots[5], int possible_slots_idx, vec2 v_worldCellPositionFloat, vec2 v_texCoord, sampler2DArray tex, bool is_explicitly_rendering_background, uint background_value, uint invalid_value) {
    int slot_idx = possible_slots[possible_slots_idx];
    int texDepth = textureSize(tex, 0).z; // Get world texture depth
    if (slot_idx < 0 || slot_idx >= texDepth) {
        // Invalid slot index, use the error texture
        ivec2 cell_pos = ivec2(floor(v_worldCellPositionFloat));
        return uintOrVec4(invalid_value, get_error_texture_color(cell_pos), false);
    }
    if (is_explicitly_rendering_background) {
        // If rendering the background, return the background value
        return uintOrVec4(background_value, vec4(0.0, 0.0, 0.0, 0.0), true);
    }
    vec4 colorData = texture(tex, vec3(v_texCoord, float(slot_idx)));
    if (DEBUG_DO_RENDER_RAW_DATA_IMAGE) {
        return uintOrVec4(invalid_value, colorData, false);
    }
    
    if (is_close_enough(colorData, EXPLICIT_UNINITIALIZED_COLOR, 0.01)) {
        // If the color is uninitialized, use the error texture
        ivec2 cell_pos = ivec2(floor(v_worldCellPositionFloat));
        return uintOrVec4(invalid_value, get_error_texture_color(cell_pos), false);
    } else if (is_close_enough(colorData, EXPLICIT_OUT_OF_BOUNDS_COLOR, 0.01)) {
        return uintOrVec4(background_value, vec4(0.0, 0.0, 0.0, 0.0), true); // return the value and a dummy color
    } else {
        return decodeRGBAtoUint8(colorData, v_worldCellPositionFloat);
    }
}

floatOrVec4 get_float_or_vec4(int possible_slots[5], int possible_slots_idx, vec2 v_worldCellPositionFloat, vec2 v_texCoord, sampler2DArray tex, bool is_explicitly_rendering_background, float background_value, float invalid_value) {
    int slot_idx = possible_slots[possible_slots_idx];
    int texDepth = textureSize(tex, 0).z; // Get world texture depth
    if (slot_idx < 0 || slot_idx >= texDepth) {
        // Invalid slot index, use the error texture
        ivec2 cell_pos = ivec2(floor(v_worldCellPositionFloat));
        return floatOrVec4(invalid_value, get_error_texture_color(cell_pos), false);
    }
    if (is_explicitly_rendering_background) {
        // If rendering the background, return the background value
        return floatOrVec4(background_value, vec4(0.0, 0.0, 0.0, 0.0), true);
    }
    vec4 colorData = texture(tex, vec3(v_texCoord, float(slot_idx)));
    if (DEBUG_DO_RENDER_RAW_DATA_IMAGE) {
        return floatOrVec4(invalid_value, colorData, false);
    }
    
    if (is_close_enough(colorData, EXPLICIT_UNINITIALIZED_COLOR, 0.01)) {
        // If the color is uninitialized, use the error texture
        ivec2 cell_pos = ivec2(floor(v_worldCellPositionFloat));
        return floatOrVec4(invalid_value, get_error_texture_color(cell_pos), false);
    } else if (is_close_enough(colorData, EXPLICIT_OUT_OF_BOUNDS_COLOR, 0.01)) {
        return floatOrVec4(background_value, vec4(0.0, 0.0, 0.0, 0.0), true); // return the value and a dummy color
    } else {
        return decodeRGBAtoFloat(colorData, v_worldCellPositionFloat);
    }
}

void main() {
    // TODO: half-pixel correction
    // vec4 downPixelColor = texture_displacement_in_pixels(_____, v_texCoord, vec2pixels(vec2(0, -1)));

    // Get the world texture size dynamically
    ivec2 paddedWorldSize = textureSize(u_world_data_image_array, 0).xy; // Get world texture resolution
    int worldDataDepth = textureSize(u_world_data_image_array, 0).z; // Get world texture depth
    // e.g. (1200, 500)
    // world size is different, e.g. (636, 404)
        
    // Compute cell-relative texture coordinates
    vec2 v_worldCellPositionFloat = v_texCoord * vec2(paddedWorldSize);   
    // e.g. if v_texCoord = (0.123, 0.456) and paddedWorldSize = (636, 404) then v_worldCellPositionFloat = (78.228, 184.224)
   
    switch (u_render_layer) {
        case 0: {
            // default: element tile with texture/overlay
            
            if (u_rendering_background) {
                vec4 space_background = texture(u_space_image_array, vec3(v_texCoord, 0));
                vec4 space_foreground = texture(u_space_image_array, vec3(v_texCoord, 1));
                outColor = space_background + space_foreground;
            } else {
                uintOrVec4 elementIdxColorData = get_uint8_or_vec4(u_world_slots, 0, v_worldCellPositionFloat, v_texCoord, u_world_data_image_array, u_rendering_background, 176u, 255u);
                if (elementIdxColorData.value_is_valid == false) {
                    // If the color is uninitialized, use the error texture
                    outColor = elementIdxColorData.color;
                    break;
                }
                uint element_idx = elementIdxColorData.value;
                
                uint element_data_image_array_width = uint(textureSize(u_element_data_image_array, 0).z); // Get element data image resolution width
                uint max_element_idx = element_data_image_array_width - 1u; // Get max defined element with element data image resolution width
                
                if (element_idx < 0u || element_idx > max_element_idx) {
                    // element index is out of bounds, so use the error texture
                    ivec2 cell_pos = ivec2(floor(v_worldCellPositionFloat));
                    outColor = get_error_texture_color(cell_pos);
                    break;
                }
                
                vec4 uiOverlayColor = texture(u_element_data_image_array, vec3(0, 0, element_idx));
            
                vec4 naturalTileColorData = texture(u_element_data_image_array, vec3(0, 1, element_idx));
                // This represents an index that is used to look up the texture in the natural tile texture atlas, unless it is invisible, which means it is not in the atlas
                uint naturalTileTextureIndex = uint(naturalTileColorData.r * 255.0); // NOTE: assumes grayscale
                bool isNaturalTileInvisible = naturalTileColorData.a < 0.001; // If the alpha channel is 0, the texture doesn't exist, so keep it invisible
                
                ivec2 tileTextureSize = textureSize(u_natural_tile_image_array, 0).xy; // Get tile texture resolution
                // e.g. (1024, 1024)
            
                // NOTE: fract is not needed if we use GL_REPEAT to repeat the textures and "loop around" the edges when the coordinate is outside of the [0, 1] range
                vec2 cellTexCoord = v_worldCellPositionFloat * u_natural_texture_tiles_per_cell;
            
                // e.g. if v_worldCellPositionFloat = (78.228, 184.224) then cellTexCoord = (0.228, 0.224)
                vec2 naturalTileTexCoord = cellTexCoord;
            
                // Sample the appropriate tile texture
                vec4 naturalTileTexture = isNaturalTileInvisible ? uiOverlayColor
                                                                : textureLod(u_natural_tile_image_array, vec3(naturalTileTexCoord, naturalTileTextureIndex), u_lod_level);
            
                // outColor = vec4((color.rgb + downPixelColor.rgb)/2.0, 1);
                // outColor = vec4(color.rgb, 1);
                vec4 foreground = naturalTileTexture;
                
                vec4 space_background = texture(u_space_image_array, vec3(v_texCoord, 0));
                vec4 space_foreground = texture(u_space_image_array, vec3(v_texCoord, 1));
                vec4 space_texture = space_background + space_foreground;
            
                outColor = mix(space_texture, foreground, foreground.a);
            }
            break;
        }
        case 1: {
            // element overlay
            
            uintOrVec4 elementIdxColorData = get_uint8_or_vec4(u_world_slots, 0, v_worldCellPositionFloat, v_texCoord, u_world_data_image_array, u_rendering_background, 176u, 255u);
            if (elementIdxColorData.value_is_valid == false) {
                // If the color is uninitialized, use the error texture
                outColor = elementIdxColorData.color;
                break;
            }
            uint element_idx = elementIdxColorData.value;
            
            uint element_data_image_array_width = uint(textureSize(u_element_data_image_array, 0).z); // Get element data image resolution width
            uint max_element_idx = element_data_image_array_width - 1u; // Get max defined element with element data image resolution width
                  
            if (element_idx < 0u || element_idx > max_element_idx) {
                // element index is out of bounds, so use the error texture
                ivec2 cell_pos = ivec2(floor(v_worldCellPositionFloat));
                outColor = get_error_texture_color(cell_pos);
            } else {
                vec4 uiOverlayColor = texture(u_element_data_image_array, vec3(0, 0, element_idx));
                outColor = uiOverlayColor;
            }
            break;
        }
        case 2: {
            // temperature
            floatOrVec4 temperatureData = get_float_or_vec4(u_world_slots, 0, v_worldCellPositionFloat, v_texCoord, u_world_data_image_array, u_rendering_background, 0.0, -1.0);
            
            if (temperatureData.value_is_valid == false) {
                // Use the error texture
                outColor = temperatureData.color;
                break;
            }
            
            float temperature = temperatureData.value;
            
            if (temperature < 0.0 || temperature > 10000.0) {
                // temperature is out of bounds, so use the error texture
                ivec2 cell_pos = ivec2(floor(v_worldCellPositionFloat));
                outColor = get_error_texture_color(cell_pos);
            } else {
                outColor = mapFloatToRGBA(temperature, u_numControlValuesAndColors, u_controlValues, u_controlColors);
            }
            
            break;
        }
        case 3: {
            // mass layer
            floatOrVec4 massData = get_float_or_vec4(u_world_slots, 0, v_worldCellPositionFloat, v_texCoord, u_world_data_image_array, u_rendering_background, 0.0, -1.0);
            
            if (massData.value_is_valid == false) {
                // Use the error texture
                outColor = massData.color;
                break;
            }
            
            float mass = massData.value;
            
            if (mass < 0.0) {
                // mass is out of bounds, so use the error texture
                ivec2 cell_pos = ivec2(floor(v_worldCellPositionFloat));
                outColor = get_error_texture_color(cell_pos);
            } else {
                outColor = mapFloatToRGBA(mass, u_numControlValuesAndColors, u_controlValues, u_controlColors);
            }
            
            break;
        }
        case 4: {
            // radiation layer
            floatOrVec4 radiationData = get_float_or_vec4(u_world_slots, 0, v_worldCellPositionFloat, v_texCoord, u_world_data_image_array, u_rendering_background, 0.0, -1.0);
            
            if (radiationData.value_is_valid == false) {
                // Use the error texture
                outColor = radiationData.color;
                break;
            }
            
            float radiation = radiationData.value;
            
            if (radiation < 0.0) {
                // radiation is out of bounds, so use the error texture
                ivec2 cell_pos = ivec2(floor(v_worldCellPositionFloat));
                outColor = get_error_texture_color(cell_pos);
            } else {
                outColor = mapFloatToRGBA(radiation, u_numControlValuesAndColors, u_controlValues, u_controlColors);
            }
            
            break;
        }
        case 5: {
            // decor layer
            floatOrVec4 decorData = get_float_or_vec4(u_world_slots, 0, v_worldCellPositionFloat, v_texCoord, u_world_data_image_array, u_rendering_background, 0.0, -1000.0);
            
            if (decorData.value_is_valid == false) {
                // Use the error texture
                outColor = decorData.color;
                break;
            }
            
            float decor = decorData.value;
            
            outColor = mapFloatToRGBA(decor, u_numControlValuesAndColors, u_controlValues, u_controlColors);
            
            break;
        }
        default: {
            ivec2 cell_pos = ivec2(floor(v_worldCellPositionFloat));
    
            outColor = get_error_texture_color(cell_pos);
            
            break;
        }
    }
    
}
`;
        return fragmentShaderSource;
    }

    private static splitControlValuesAndColors(
        data: ReadonlyArray<{
            controlValue: readonly [number],
            controlColor: readonly [number, number, number, number]
        }>
    ): {
        controlValues: ReadonlyArray<readonly [number]>,
        controlColors: ReadonlyArray<readonly [number, number, number, number]>
    } {
        const controlValues: (readonly [number])[] = [];
        const controlColors: (readonly [number, number, number, number])[] = [];

        for (const {controlValue, controlColor} of data) {
            controlValues.push(controlValue);
            controlColors.push(controlColor);
        }

        return {
            controlValues,
            controlColors
        };
    }

    private async normalizeImageInputArray(input: any): Promise<(HTMLImageElement | HTMLCanvasElement | OffscreenCanvas | ImageBitmap)[]> {
        if (!Array.isArray(input)) {
            throw this.createError("Expected an array for image input");
        }

        if (input.every(url => typeof url === "string")) {
            // Convert string URLs to HTMLImageElements using loadImagesAsync
            const {successes, failures} = await loadBitmapsAsync(input);
            if (failures.length > 0) {
                const errorDetails = failures
                    .map(f => `URL "${f.url}": ${f.error?.message || f.error || 'Unknown error'}`)
                    .join("; ");

                throw this.createError(`Failed to load images:\n${errorDetails}`);
            }
            return successes.map(success => success.bitmap);
        } else if (input.every(img => typeof HTMLImageElement !== "undefined" && img instanceof HTMLImageElement)) {
            return input;
        } else if (input.every(canvas => typeof HTMLCanvasElement !== "undefined" && canvas instanceof HTMLCanvasElement)) {
            return input;
        } else if (input.every(offscreen => typeof OffscreenCanvas !== "undefined" && offscreen instanceof OffscreenCanvas)) {
            return input;
        } else if (input.every(bitmap => typeof ImageBitmap !== "undefined" && bitmap instanceof ImageBitmap)) {
            return input;
        } else {
            throw this.createError("Invalid or mixed image array types");
        }
    }

    // Used by external code to check if the canvas is ready to render
    public getIsReadyToRender(uploadUuid: string, renderLayer: RenderLayer): boolean {
        return this.queryIsMapDataImageLayerReady(uploadUuid, renderLayer);
    }

    resetCanvasState() : void {
        const gl = this.gl;

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    drawScene() : void {
        const gl = this.gl;

        // draw
        const primitiveType = gl.TRIANGLES;
        const offset = 0;
        const count = 6;
        gl.drawArrays(primitiveType, offset, count);
    }

    private checkWebGLError(printOnSuccess: boolean = false): void {
        const gl = this.gl;
        const error = gl.getError();
        const errorMsgPrefix = "WebGL error: ";
        switch (error) {
            case gl.NO_ERROR:
                // No error, do nothing
                if (printOnSuccess) {
                    console.log("No WebGL error");
                }
                break;
            case gl.INVALID_ENUM:
                throw this.createError(`${errorMsgPrefix} INVALID_ENUM`);
            case gl.INVALID_VALUE:
                throw this.createError(`${errorMsgPrefix} INVALID_VALUE`);
            case gl.INVALID_OPERATION:
                throw this.createError(`${errorMsgPrefix} INVALID_OPERATION`);
            case gl.INVALID_FRAMEBUFFER_OPERATION:
                throw this.createError(`${errorMsgPrefix} INVALID_FRAMEBUFFER_OPERATION`);
            case gl.OUT_OF_MEMORY:
                throw this.createError(`${errorMsgPrefix} OUT_OF_MEMORY`);
            case gl.CONTEXT_LOST_WEBGL:
                throw this.createError(`${errorMsgPrefix} CONTEXT_LOST_WEBGL`);
            default:
                throw this.createError(`${errorMsgPrefix} Unknown error`);
        }
    }

    private createError(msg: string, doConsoleLog: Boolean = false, baseError?: unknown): Error {
        return createError("WebGL2CanvasManager", msg, doConsoleLog, baseError);
    }

    // NOTE: this assumes that the texture will be uploaded to WebGL2 before the next queryTextureSlots or queryIsMapDataImageLayerReady call
    // TODO: encapsulate textureLRU, dataImageSlotMap, MAX_TEXTURE_SLOTS, MapDataLayer, and associated functions in a separate class, and combine maps into one
    private acquireTextureSlots(uploadUuid: string, renderLayer: RenderLayer): Map<number, DataImageType> {
        const dataImageTypeList = getDataImageType(renderLayer);
        const ans = new Map<number, DataImageType>();
        for (const dataImageType of dataImageTypeList) {
            const currUploadUuidLayerKey = new MapDataLayer(uploadUuid, dataImageType).toKey();
            let acquiredIdx = -1;
            {
                if (this.textureLRU.has(currUploadUuidLayerKey)) {
                    // Check if the texture is already in the LRU cache
                    this.textureLRU.set(currUploadUuidLayerKey, performance.now());
                    const slot = this.dataImageSlotMap.get(currUploadUuidLayerKey);
                    if (slot === undefined || slot === null || slot === -1) {
                        throw this.createError(`Mismatch between dataImageSlotMap and textureLRU - failed to get slot for ${currUploadUuidLayerKey}`);
                    }
                    acquiredIdx = slot;
                    this.dataImageSlotMap.set(currUploadUuidLayerKey, acquiredIdx);
                    if (this.DEBUG_DO_LRU_CACHE_LOG) console.log(`Texture ${currUploadUuidLayerKey} already in LRU cache, acquired existing index ${acquiredIdx}`);
                } else if (this.textureLRU.size >= this.MAX_TEXTURE_SLOTS) {
                    // Check if we need to evict a texture

                    // evict eldest
                    const eldest = [...this.textureLRU.entries()]
                        .sort((a, b) => a[1] - b[1])[0][0];
                    const slot = this.dataImageSlotMap.get(eldest);
                    if (slot === undefined || slot === null || slot === -1) {
                        throw this.createError(`Mismatch between dataImageSlotMap and textureLRU - failed to get slot for ${currUploadUuidLayerKey}`);
                    }
                    this.textureLRU.delete(eldest);
                    this.dataImageSlotMap.set(eldest, -1); // free slot
                    this.isMapDataImageLayerReady.set(eldest, false); // free slot
                    // caller must re-upload into idx
                    acquiredIdx = slot;
                    this.textureLRU.set(currUploadUuidLayerKey, performance.now());
                    this.dataImageSlotMap.set(currUploadUuidLayerKey, acquiredIdx);
                    if (this.DEBUG_DO_LRU_CACHE_LOG) console.log(`Evicted texture ${eldest} from LRU cache, acquired new texture ${currUploadUuidLayerKey} at index ${acquiredIdx}`);
                } else {
                    // Check if we have a free slot

                    // free slot = size
                    acquiredIdx = this.textureLRU.size;
                    this.textureLRU.set(currUploadUuidLayerKey, performance.now());
                    this.dataImageSlotMap.set(currUploadUuidLayerKey, acquiredIdx);
                    if (this.DEBUG_DO_LRU_CACHE_LOG) console.log(`Acquired new texture ${currUploadUuidLayerKey} at index ${acquiredIdx}`);
                }
                if (this.DEBUG_DO_LRU_CACHE_LOG) console.log(`textureLRU and dataImageSlotMap status:`, this.textureLRU, this.dataImageSlotMap);
            }

            // update answer
            ans.set(acquiredIdx, dataImageType);
        }
        return ans;
    }

    private queryIsMapDataImageLayerReady(uploadUuid: string, renderLayer: RenderLayer): boolean {
        const dataImageTypeList = getDataImageType(renderLayer);
        for (const dataImageType of dataImageTypeList) {
            if (!this.isMapDataImageLayerReady.has(new MapDataLayer(uploadUuid, dataImageType).toKey()) || this.isMapDataImageLayerReady.get(new MapDataLayer(uploadUuid, dataImageType).toKey()) === false) {
                // NOTE: This should be the same as checking this.dataImageSlotMap.has([uploadUuid, dataImageType]) || this.dataImageSlotMap.get([uploadUuid, dataImageType]) !== -1
                return false;
            }
        }
        return true;
    }

    private queryTextureSlots(uploadUuid: string, renderLayer: RenderLayer): readonly number[] {
        const dataImageTypeList = getDataImageType(renderLayer);
        const ans: number[] = [];
        for (const dataImageType of dataImageTypeList) {
            const currUploadUuidLayerKey = new MapDataLayer(uploadUuid, dataImageType).toKey();
            const slot = this.dataImageSlotMap.get(currUploadUuidLayerKey);
            if (slot === undefined || slot === null || slot === -1) {
                throw this.createError(`Failed to get texture slot for ${currUploadUuidLayerKey}`);
            }
            ans.push(slot);
        }
        return ans;
    }

    setupShaders(vertexShaderSource: string,
                 fragmentShaderSource: string
    ) : {
        program: WebGLProgram,
        vertexShader: WebGLShader,
        fragmentShader: WebGLShader
    } {
        const gl = this.gl;

        // Compile shaders
        const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);

        if (vertexShader === undefined || vertexShader === null) {
            throw this.createError("Failed to compile vertex shader.");
        }

        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
        if (fragmentShader === undefined || fragmentShader === null) {
            throw this.createError("Failed to compile fragment shader.");
        }

        // Link program
        const program = this.createProgram(vertexShader, fragmentShader);

        if (program === undefined || program === null) {
            throw this.createError("WebGL2CanvasManager: Failed to link shaders.");
        }

        return { program, vertexShader, fragmentShader };
    }

    setupFramebufferTexture(width: number, height: number) {
        // TODO: rendering options
        const gl = this.gl;

        const framebuffer = gl.createFramebuffer();
        if (framebuffer === undefined || framebuffer === null) {
            throw this.createError("Failed to create background framebuffer.");
        }
        const texture = gl.createTexture();
        if (texture === undefined || texture === null) {
            throw this.createError("Failed to create background texture.");
        }

        // Bind and configure the background texture
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Attach the texture to the framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        // Cleanup
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);

        return { framebuffer, texture };

    }

    setupPositionBuffer(position_location: string,
                        x: number,
                        y: number,
                        width: number,
                        height: number) : WebGLBuffer {
        const gl = this.gl;

        // look up where the vertex data needs to go.
        const positionAttributeLocation = gl.getAttribLocation(this.program, position_location);


        // Create a buffer and put a single pixel space rectangle in
        // it (2 triangles)
        // Create a buffer and put three 2d clip space points in it
        const positionBuffer = gl.createBuffer();

        if (positionBuffer === null) {
            throw this.createError("Failed to create position buffer.");
        }

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        const x1 = x;
        const x2 = x + width;
        const y1 = y;
        const y2 = y + height;

        const positions = new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        // Create a vertex array object (attribute state)
        const vao = gl.createVertexArray();

        if (vao === null) {
            throw this.createError("Failed to create vertex array object.");
        }

        // and make it the one we're currently working with
        gl.bindVertexArray(vao);

        // Bind the attribute/buffer set we want.
        gl.bindVertexArray(vao);

        // Turn on the attribute
        gl.enableVertexAttribArray(positionAttributeLocation);

        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        const size = 2;          // 2 components per iteration
        const type = gl.FLOAT;   // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        return positionBuffer;
    }

    updatePositionBuffer(
        positionBuffer: WebGLBuffer,
        x: number,
        y: number,
        width: number,
        height: number
    ): void {
        const gl = this.gl;

        // Bind the existing position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Compute new rectangle coordinates
        const x1 = x;
        const x2 = x + width;
        const y1 = y;
        const y2 = y + height;

        // Update the buffer with new positions
        const positions = new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2
        ]);

        // Update buffer data with new positions
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);
    }


    setupTextureBuffers(texture_location: string) : WebGLBuffer {
        const gl = this.gl;

        // look up where the vertex data needs to go.
        const texCoordAttributeLocation = gl.getAttribLocation(this.program, texture_location);

        const texCoordBuffer = gl.createBuffer();

        if (texCoordBuffer === null) {
            throw this.createError("Failed to create texture coordinate buffer.");
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        const positions = new Float32Array([
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(texCoordAttributeLocation);
        const size = 2;          // 2 components per iteration
        const type = gl.FLOAT;   // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            texCoordAttributeLocation, size, type, normalize, stride, offset)

        return texCoordBuffer;
    }

    // TODO: class for number as pixels, cells, texture tiles, clip space, etc.
    setFramebuffer(fbo: WebGLFramebuffer | null,
                   width: number,
                   height: number,
                   resolutionLocationName: string) : void {
        const gl = this.gl;

        const resolutionLocation = this.getUniformLocation(resolutionLocationName);

        // make this the framebuffer we are rendering to.
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

        // Tell the shader the resolution of the framebuffer.
        gl.uniform2f(resolutionLocation, width, height);

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, width, height);
    }

    createAndSetupTexture() : WebGLTexture {
        const gl = this.gl;

        const texture = gl.createTexture();

        if (texture === null) {
            throw this.createError("Failed to create texture.");
        }

        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set up texture so we can render any size image and so we are
        // working with pixels.
        // so we don't need mips and so we're not filtering
        // and we don't repeat
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        return texture;
    }

    setupTextures(
        images: readonly (TexImageSource)[]
    ) : {
        textures: WebGLTexture[],
        framebuffers: WebGLFramebuffer[]
    } {
        const gl = this.gl;

        // create 2 textures
        const textures = [];
        const framebuffers = [];

        for (let ii = 0; ii < images.length; ++ii) {
            const texture = this.createAndSetupTexture();
            textures.push(texture);

            // Upload the image into the texture.
            const mipLevel = 0;               // the largest mip
            const internalFormat = gl.RGBA;   // format we want in the texture
            const srcFormat = gl.RGBA;        // format of data we are supplying
            const srcType = gl.UNSIGNED_BYTE  // type of data we are supplying
            gl.texImage2D(gl.TEXTURE_2D,
                mipLevel,
                internalFormat,
                srcFormat,
                srcType,
                images[ii]);

            // Create a framebuffer
            const fbo = gl.createFramebuffer();

            if (fbo === null) {
                throw this.createError("Failed to create framebuffer.");
            }

            framebuffers.push(fbo);
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

            // Attach a texture to it.
            const attachmentPoint = gl.COLOR_ATTACHMENT0;
            gl.framebufferTexture2D(
                gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, mipLevel);
        }
        return { textures, framebuffers };
    }

    bindTextureToUnit(texture: WebGLTexture,
                      glsl_location: string,
                      texture_unit_index: number) : void {
        const gl = this.gl;

        // Set the image location to use inside the shader's GLSL code
        const u_image_location = this.getUniformLocation(glsl_location);

        if (u_image_location === null) {
            const msg = `Failed to get image location: ${glsl_location} (location is invalid or unused)`;
            throw this.createError(msg);
        }

        // set which texture units to render with.
        // Tell the shader to get the texture from texture unit 0, unit 1
        this.bind1UniformIntsToUnit(texture_unit_index, glsl_location);

        gl.activeTexture(gl.TEXTURE0 + texture_unit_index);
        gl.bindTexture(gl.TEXTURE_2D, texture);
    }

    createAndSetupTextureArray(usePixelArtSettings: boolean) : WebGLTexture { // TODO: mipmaps
        const gl = this.gl;

        const texture = gl.createTexture();

        if (texture === null) {
            throw this.createError("Failed to create texture array.");
        }

        gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);

        if (usePixelArtSettings === true) {
            // Set up texture so we can render any size image and so we are
            // working with pixels (no mipmaps, no filtering, no repeating)
            gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        } else if (usePixelArtSettings === false) {
            // Set up texture with mipmaps, filtering, and repeating
            gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        } else {
            throw this.createError("usePixelArtSettings must be a boolean.");
        }
        return texture;
    }

    static isTexImageSource(obj: any): obj is TexImageSource {
        // TODO: helper JS file?
        return (
            obj instanceof HTMLImageElement ||
            obj instanceof HTMLCanvasElement ||
            obj instanceof ImageBitmap ||
            obj instanceof ImageData ||
            obj instanceof HTMLVideoElement ||
            (typeof OffscreenCanvas !== "undefined" &&
                obj instanceof OffscreenCanvas)
        );
    }

    allocateTextureArrayStorage(textureArray: WebGLTexture,
                                width: number,
                                height: number,
                                depth: number,
                                usePixelArtSettings: boolean
    ) : { numAllocatedMipmaps: number; } {
        const gl = this.gl;


        // Bind the texture array before allocating storage
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, textureArray);

        const max_texture_dimension = Math.max(width, height);
        const max_mipmap_levels = Math.floor(Math.log2(max_texture_dimension)) + 1;
        const numAllocatedMipmaps = usePixelArtSettings ? 1 : max_mipmap_levels;

        // Allocate immutable storage for a 3D texture (TEXTURE_2D_ARRAY)
        gl.texStorage3D(
            gl.TEXTURE_2D_ARRAY,    // Specifies the texture type
            numAllocatedMipmaps,    // Number of mipmap levels (1 = no mipmaps)
            gl.RGBA8,               // Internal storage format (8-bit RGBA per channel)
            width, height, depth    // Texture dimensions and depth (number of layers)
        );

        return {numAllocatedMipmaps};
    }

    /**
     * Upload an image array / atlas / mipmap-array into a WebGL 2
     * TEXTURE_2D_ARRAY.
     *
     * @param textureArray  the already-allocated GL texture array
     * @param imageArrayOrAtlasOrMipmap  any of TextureAtlas | TextureArray | TextureAtlasMipmapArray | TextureArrayMipmapArray
     * @param usePixelArtSettings  affects filtering / wrapping
     * @param flipTexturesY        gl.UNPACK_FLIP_Y_WEBGL
     * @param numAllocatedMipmaps  how many mip levels were allocated in texStorage3D
     * @param layerOffset          first layer (Z) to write into – *defaults to 0*
     * @param backgroundColor      optional background color to clear the framebuffer with, if image is not the same size as the texture
     */
    uploadTextureArray(
        textureArray: WebGLTexture,
        imageArrayOrAtlasOrMipmap: TextureAtlas | TextureArray | TextureAtlasMipmapArray | TextureArrayMipmapArray,
        usePixelArtSettings: boolean,
        flipTexturesY: boolean,
        numAllocatedMipmaps: number,
        layerOffset = 0,
        backgroundColor: ReadonlyArray<number> | null
    ) : void {
        const gl = this.gl;

        /* ---------- validation -------------------- */
        const numProvidedMipmaps =
            (imageArrayOrAtlasOrMipmap instanceof TextureAtlasMipmapArray || imageArrayOrAtlasOrMipmap instanceof TextureArrayMipmapArray) // TextureLevelMipmapArray
                ? imageArrayOrAtlasOrMipmap.getNumProvidedMipmaps()
                : 1;
        if ((imageArrayOrAtlasOrMipmap instanceof TextureAtlasMipmapArray || imageArrayOrAtlasOrMipmap instanceof TextureArrayMipmapArray) && numProvidedMipmaps !== numAllocatedMipmaps) {
            throw this.createError("The number of provided mipmaps must be equal to the maximum number of mipmap levels in manual mipmap uploads.");
        }

        const depth = imageArrayOrAtlasOrMipmap.getNumTextureLayers(); // Number of layers
        if (depth === 0) {
            throw this.createError("Cannot have empty texture source.");
        } else if (depth < 0) {
            throw this.createError("Cannot have negative texture sources.");
        }

        if (numProvidedMipmaps === 0) {
            throw this.createError("no mipmaps provided"); // TODO: this should be a class check
        } else if (numProvidedMipmaps < 0) {
            throw this.createError("negative mipmaps provided");
        }

        /* ---------- bind & pixel-store ---------- */

        // Bind the texture array before uploading
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, textureArray);

        if (flipTexturesY) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        } else if (!flipTexturesY) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        }

        /* ---------- background ---------- */

        const doDrawBackground = backgroundColor !== null;
        // TODO: check that the uploaded image is the same size as the texture array if not drawing a background
        if (doDrawBackground) {
            if (backgroundColor.length !== 4) {
                throw this.createError("backgroundColor must be an array of 4 numbers.");
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.clearFrameBuffer);
            const bgRed = backgroundColor[0];
            if (bgRed > 1.0 || bgRed < 0.0) {
                // TODO: these errors should be put in a separate RgbaClampedColor class
                throw this.createError("backgroundColor[0] must be between 0.0 and 1.0.");
            }
            const bgGreen = backgroundColor[1];
            if (bgGreen > 1.0 || bgGreen < 0.0) {
                throw this.createError("backgroundColor[1] must be between 0.0 and 1.0.");
            }
            const bgBlue = backgroundColor[2];
            if (bgBlue > 1.0 || bgBlue < 0.0) {
                throw this.createError("backgroundColor[2] must be between 0.0 and 1.0.");
            }
            const bgAlpha = backgroundColor[3];
            if (bgAlpha > 1.0 || bgAlpha < 0.0) {
                throw this.createError("backgroundColor[3] must be between 0.0 and 1.0.");
            }
            if (bgRed < 0.001 && bgGreen < 0.001 && bgBlue < 0.001) {
                console.warn("backgroundColor is black, which may cause issues with some textures.");
            }
            if (bgRed > 0.999 && bgGreen > 0.999 && bgBlue > 0.999) {
                console.warn("backgroundColor is white, which may cause issues with some textures.");
            }
            if (bgAlpha < 0.001) {
                console.warn("backgroundColor is transparent, which may cause issues with some textures.");
            }
            gl.clearColor(bgRed, bgGreen, bgBlue, bgAlpha);
        }

        /* ---------- main upload loop ---------- */

        for (let mipmapLevel = 0; mipmapLevel < numProvidedMipmaps; mipmapLevel++) {
            const sourceimageArrayOrAtlasOrMipmap =
                (imageArrayOrAtlasOrMipmap instanceof TextureAtlasMipmapArray || imageArrayOrAtlasOrMipmap instanceof TextureArrayMipmapArray) // TextureLevelMipmapArray
                    ? imageArrayOrAtlasOrMipmap.getMipmapLevel(mipmapLevel)
                    : imageArrayOrAtlasOrMipmap;
            // Upload each image as a separate layer in the texture array
            for (let i = 0; i < depth; i++) {
                const { sourceImage, width, height } =
                        sourceimageArrayOrAtlasOrMipmap.getTextureLayer(i, mipmapLevel);
                const layerIdx = layerOffset + i; // layerOffset is the first layer to write into
                if (doDrawBackground) {
                    gl.framebufferTextureLayer(
                        gl.FRAMEBUFFER,
                        gl.COLOR_ATTACHMENT0,
                        textureArray,
                        0,  // level
                        layerIdx   // layer
                    );
                    gl.clear(gl.COLOR_BUFFER_BIT);
                }
                gl.texSubImage3D(
                    gl.TEXTURE_2D_ARRAY,    // Target texture type
                    mipmapLevel,            // Mipmap level
                    0, 0, layerIdx,                // x, y, z offsets (0 = no offset, z = layer index)
                    width, height, 1,       // Width, height, depth (1 layer at a time)
                    gl.RGBA,                // Source format
                    gl.UNSIGNED_BYTE,       // Source type
                    sourceImage             // Image data
                );
            }
        }
        if (!usePixelArtSettings && !(imageArrayOrAtlasOrMipmap instanceof TextureAtlasMipmapArray || imageArrayOrAtlasOrMipmap instanceof TextureArrayMipmapArray)) { // TextureLevelMipmapArray
            gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
        }
        if (doDrawBackground) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
    }

    setupTextureArray(
        imageArrayOrAtlasOrMipmap: TextureAtlas | TextureArray | TextureAtlasMipmapArray | TextureArrayMipmapArray,
        usePixelArtSettings: boolean,
        flipTexturesY: boolean,
        backgroundColor: ReadonlyArray<number> | null
    ) : WebGLTexture {
        // Create and set up a texture array
        const textureArray = this.createAndSetupTextureArray(usePixelArtSettings);
        const largestImageArrayOrAtlas: TextureLevel =
            (imageArrayOrAtlasOrMipmap instanceof TextureAtlasMipmapArray || imageArrayOrAtlasOrMipmap instanceof TextureArrayMipmapArray) // TextureLevelMipmapArray
                ? imageArrayOrAtlasOrMipmap.getMipmapLevel(0)
                : imageArrayOrAtlasOrMipmap;

        const width = largestImageArrayOrAtlas.getTextureWidth();
        const height = largestImageArrayOrAtlas.getTextureHeight();
        const depth = largestImageArrayOrAtlas.getNumTextureLayers();

        const { numAllocatedMipmaps } = this.allocateTextureArrayStorage(textureArray, width, height, depth, usePixelArtSettings);
        this.uploadTextureArray(textureArray, imageArrayOrAtlasOrMipmap, usePixelArtSettings, flipTexturesY, numAllocatedMipmaps, 0, backgroundColor);
        return textureArray;
    }

    bindTextureArrayToUnit(textureArray: WebGLTexture,
                           glsl_location: string,
                           texture_unit_location_index: number) : void {
        const gl = this.gl;

        gl.useProgram(this.program);

        // TODO: type and bound checking`

        const u_image_location = this.getUniformLocation(glsl_location);

        // Bind the texture array to texture unit at texture_unit_location_index
        gl.activeTexture(gl.TEXTURE0 + texture_unit_location_index);
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, textureArray);

        // Bind texture array to texture unit at texture_unit_location_index
        this.bind1UniformIntsToUnit(texture_unit_location_index, glsl_location);
    }

    getUniformLocation(uniformName: string) : WebGLUniformLocation {
        const gl = this.gl;
        const location = gl.getUniformLocation(this.program, uniformName);
        if (location === null) {
            const msg = `Failed to get image location: ${uniformName} (location is invalid or unused)`;
            throw this.createError(msg);
        }
        return location;
    }

    // TODO: make a class (acting like a data type) for uniformLocation
    bind1UniformIntsToUnit(a: number, uniformLocation: string) : void {
        const gl = this.gl;

        const u_uniform_location = this.getUniformLocation(uniformLocation);
        gl.uniform1i(u_uniform_location, a);
    }

    bind2UniformIntsToUnit(a: number, b: number, uniformLocation: string) : void {
        const gl = this.gl;

        const u_uniform_location = this.getUniformLocation(uniformLocation);
        gl.uniform2i(u_uniform_location, a, b);
    }

    bind3UniformIntsToUnit(a: number, b: number, c: number, uniformLocation: string) : void {
        const gl = this.gl;

        const u_uniform_location = this.getUniformLocation(uniformLocation);
        gl.uniform3i(u_uniform_location, a, b, c);
    }

    bind4UniformIntsToUnit(a: number, b: number, c: number, d: number, uniformLocation: string) : void {
        const gl = this.gl;

        const u_uniform_location = this.getUniformLocation(uniformLocation);
        gl.uniform4i(u_uniform_location, a, b, c, d);
    }

    bind1UniformIntVectorToUnit(v: ReadonlyArray<readonly [number]>, uniformLocation: string) : void {
        const gl = this.gl;

        const u_uniform_location = this.getUniformLocation(uniformLocation);
        const flatArray = new Int32Array(v.flat());
        gl.uniform1iv(u_uniform_location, flatArray);
    }

    bind2UniformIntVectorToUnit(v: ReadonlyArray<readonly [number, number]>, uniformLocation: string) : void {
        const gl = this.gl;

        const u_uniform_location = this.getUniformLocation(uniformLocation);
        const flatArray = new Int32Array(v.flat());
        gl.uniform2iv(u_uniform_location, flatArray);
    }

    bind3UniformIntVectorToUnit(v: ReadonlyArray<readonly [number, number, number]>, uniformLocation: string) : void {
        const gl = this.gl;

        const u_uniform_location = this.getUniformLocation(uniformLocation);
        const flatArray = new Int32Array(v.flat());
        gl.uniform3iv(u_uniform_location, flatArray);
    }

    bind4UniformIntVectorToUnit(v: ReadonlyArray<readonly [number, number, number, number]>, uniformLocation: string) : void {
        const gl = this.gl;

        const u_uniform_location = this.getUniformLocation(uniformLocation);
        const flatArray = new Int32Array(v.flat());
        gl.uniform4iv(u_uniform_location, flatArray);
    }

    bind1UniformFloatsToUnit(a: number, uniformLocation: string) : void {
        const gl = this.gl;

        const u_uniform_location = this.getUniformLocation(uniformLocation);
        gl.uniform1f(u_uniform_location, a);
    }

    bind2UniformFloatsToUnit(a: number, b: number, uniformLocation: string) : void {
        const gl = this.gl;

        const u_uniform_location = this.getUniformLocation(uniformLocation);
        gl.uniform2f(u_uniform_location, a, b);
    }

    bind1UniformFloatVectorToUnit(v: ReadonlyArray<readonly [number]>, uniformLocation: string) : void {
        const gl = this.gl;

        const u_uniform_location = this.getUniformLocation(uniformLocation);
        const flatArray = new Float32Array(v.flat());
        gl.uniform1fv(u_uniform_location, flatArray);
    }

    bind2UniformFloatVectorToUnit(v: ReadonlyArray<readonly [number, number]>, uniformLocation: string) : void {
        const gl = this.gl;

        const u_uniform_location = this.getUniformLocation(uniformLocation);
        const flatArray = new Float32Array(v.flat());
        gl.uniform2fv(u_uniform_location, flatArray);
    }

    bind3UniformFloatVectorToUnit(v: ReadonlyArray<readonly [number, number, number]>, uniformLocation: string) : void {
        const gl = this.gl;

        const u_uniform_location = this.getUniformLocation(uniformLocation);
        const flatArray = new Float32Array(v.flat());
        gl.uniform3fv(u_uniform_location, flatArray);
    }

    bind4UniformFloatVectorToUnit(v: ReadonlyArray<readonly [number, number, number, number]>, uniformLocation: string) : void {
        const gl = this.gl;

        const u_uniform_location = this.getUniformLocation(uniformLocation);
        const flatArray = new Float32Array(v.flat());
        gl.uniform4fv(u_uniform_location, flatArray);
    }

    bindUniformBoolToUnit(value: boolean, uniformLocation: string): void {
        this.bind1UniformIntsToUnit(value ? 1 : 0, uniformLocation);
    }

    computeLodLevel(renderedCellsX: number,
                    renderedCellsY: number,
                    textureTilesPerCellX: number,
                    textureTilesPerCellY: number) : number {
        // How many texture tiles will be rendered
        const renderedTextureTilesX = renderedCellsX * textureTilesPerCellX;
        const renderedTextureTilesY = renderedCellsY * textureTilesPerCellY;

        // Compute LOD using log2
        const lodLevel = Math.log2(Math.max(renderedTextureTilesX, renderedTextureTilesY));
        return lodLevel;
    }

    createShader(type: number, source: string) : WebGLShader {
        const gl = this.gl;

        const shader = gl.createShader(type);
        if (shader === null || shader === undefined) {
            throw this.createError("Failed to create shader.");
        }
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }

        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);

        throw this.createError("Failed to create shader.");
    }

    createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
        const gl = this.gl;

        const program = gl.createProgram();
        if (program === null || program === undefined) {
            throw this.createError("Failed to create program.");
        }
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }

        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);

        throw this.createError("Failed to create program.");
    }

    setRectangle(
        positionBuffer: WebGLBuffer,
        x: number,
        y: number,
        width: number,
        height: number
    ) : void {
        const gl = this.gl;

        const x1 = x;
        const x2 = x + width;
        const y1 = y;
        const y2 = y + height;

        // Bind the position buffer so gl.bufferData that will be called
        // in setRectangle puts data in the position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        const positions = new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2
        ])

        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    }

    drawRectangles() {
        // TODO
    }

    clearCanvas() {
        // TODO
    }

    async copyImageBlob(options?: ImageEncodeOptions) : Promise<Blob> {
        try {
            return this.canvas.convertToBlob(options);
        } catch (err) {
            console.error(`Failed to get image blob`, err);
            throw err;
        }
    }
    async copyImageArrayBuffer(options?: ImageEncodeOptions) : Promise<ArrayBuffer> {
        try {
            const blob = await this.copyImageBlob(options);
            return blob.arrayBuffer();
        } catch (err) {
            console.error(`Failed to get image blob array buffer`, err);
            throw err;
        }
    }
    transferImageBitmap() : ImageBitmap {
        try {
            return this.canvas.transferToImageBitmap();
        } catch (err) {
            console.error(`Failed to get image bitmap`, err);
            throw err;
        }
    }

    resizeCanvas(width: number, height: number) : void {
        this.canvas.width = width;
        this.canvas.height = height;
    }
}