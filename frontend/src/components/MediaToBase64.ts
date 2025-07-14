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

export const canvasToBase64 = async (canvas: OffscreenCanvas | HTMLCanvasElement, type: string = "image/png"): Promise<string> => {
    let blob: Blob;

    if ('convertToBlob' in canvas) {
        // OffscreenCanvas path
        blob = await (canvas as OffscreenCanvas).convertToBlob({ type });
    } else if ('toBlob' in canvas) {
        // HTMLCanvasElement path
        blob = await new Promise<Blob>((resolve, reject) => {
            (canvas as HTMLCanvasElement).toBlob((b) => {
                if (b) resolve(b);
                else reject(new Error("Failed to convert HTMLCanvasElement to Blob"));
            }, type);
        });
    } else {
        throw new Error("Unsupported canvas type: cannot convert to Blob");
    }

    return blobToBase64(blob);
};

export const imageToBase64 = async (img: HTMLImageElement, type: string = "image/png"): Promise<string> => {
    if (!img.complete || img.naturalWidth === 0) {
        throw new Error("Image is not fully loaded or has invalid dimensions.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("Failed to get 2D context from canvas.");
    }

    ctx.drawImage(img, 0, 0);

    return canvasToBase64(canvas, type);
};

/**
 * Convert an ImageBitmap to a Base-64 data-URL.
 *
 * @param bmp   ImageBitmap (or HTMLCanvasElement, OffscreenCanvas, etc.)
 * @param type  MIME type for the result – default "image/png"
 * @returns     Promise that resolves to `"data:image/…;base64,...."`
 */
export const bitmapToBase64 = async (
    bmp: ImageBitmap | CanvasImageSource,
    type: string = "image/png"
): Promise<string> => {

    // 1️⃣  Determine intrinsic size
    const width  = (bmp as any).width  ?? 0;
    const height = (bmp as any).height ?? 0;
    if (width === 0 || height === 0) {
        throw new Error("Bitmap has invalid dimensions or is not ready.");
    }

    // 2️⃣  Draw into a temporary canvas (OffscreenCanvas if available)
    const canvas: HTMLCanvasElement | OffscreenCanvas =
        typeof OffscreenCanvas !== "undefined"
            ? new OffscreenCanvas(width, height)
            : (() => {
                const c = document.createElement("canvas");
                c.width  = width;
                c.height = height;
                return c;
            })();

    const ctx = canvas.getContext("2d");
    if (!ctx || typeof ctx.drawImage !== "function") {
        throw new Error("Canvas 2D context not available.");
    }

    ctx.drawImage(bmp, 0, 0);

    // 3️⃣  Re-use existing helper
    // OffscreenCanvas.convertToBlob is async; fallback for HTMLCanvas
    return await canvasToBase64(canvas, type);
};


export const blobToBase64 = async (blob: Blob): Promise<string> => {
    const reader = new FileReader();

    const result = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error("Failed to read blob as base64 string."));
            }
        };
        reader.onerror = () => reject(new Error("Failed to read blob with FileReader."));
        reader.readAsDataURL(blob);
    });

    return result;
};

