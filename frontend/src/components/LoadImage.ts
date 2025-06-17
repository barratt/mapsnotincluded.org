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

// Helper to load a single image and return a Promise
const loadImagePromise = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = (err) => {
            const msg = `❌ Failed to load image: ${url}`;
            console.error(msg, err);
            reject(new Error(msg, {cause: err}));
        };
        image.src = url;
    });
};

// Legacy-style callback interface
const loadImagesSync = (
    urls: string[],
    onAllSuccess: (images: HTMLImageElement[], ...args: any[]) => void,
    onError?: (url: string, err: any) => void,
    ...extraParams: any[]
): void => {
    const images: HTMLImageElement[] = [];
    let imagesToLoad = urls.length;

    if (imagesToLoad === 0) {
        onAllSuccess(images, ...extraParams);
        return;
    }

    urls.forEach((url, i) => {
        loadImagePromise(url)
            .then((img) => {
                images[i] = img;
                imagesToLoad--;
                if (imagesToLoad === 0) {
                    onAllSuccess(images, ...extraParams);
                }
            })
            .catch(({ url, err }) => {
                if (onError) onError(url, err);
            });
    });
};

// TODO: Add error handling for failed image loads, and multi loadAndPad calls
// Modern async version
const loadImagesAsync = async (urls: string[]): Promise<{
    successes: { url: string, image: HTMLImageElement }[],
    failures: { url: string, error: any }[]
}> => {
    const results = await Promise.allSettled(
        urls.map(url =>
            loadImagePromise(url)
                .then(image => ({ url, image }))
                .catch(error => {
                    throw new Error(url, { cause: error });
                })
        )
    );

    const successes: { url: string, image: HTMLImageElement }[] = [];
    const failures: { url: string, error: any }[] = [];

    for (const result of results) {
        if (result.status === "fulfilled") {
            successes.push(result.value);
        } else {
            failures.push(result.reason);
        }
    }

    return { successes, failures };
};

export const loadBitmapsAsync = async (
    urls: string[],
    options?: ImageBitmapOptions
): Promise<{
    successes: { url: string, bitmap: ImageBitmap }[],
    failures: { url: string, error: any }[]
}> => {
    const results = await Promise.allSettled(
        urls.map(async url => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
                const blob = await response.blob();
                const bitmap = await createImageBitmap(blob, options);
                return { url, bitmap };
            } catch (error) {
                throw new Error(`Failed to load bitmap for ${url}`, { cause: error });
            }
        })
    );

    const successes: { url: string, bitmap: ImageBitmap }[] = [];
    const failures: { url: string, error: any }[] = [];

    for (const result of results) {
        if (result.status === "fulfilled") {
            successes.push(result.value);
        } else {
            failures.push({ url: "", error: result.reason });
        }
    }

    return { successes, failures };
};

export async function loadAndPad(
    url: string,
    w: number,
    h: number
): Promise<ImageBitmap> {
    try {
        const img = await loadImagePromise(url);
        const cvs = new OffscreenCanvas(w, h);
        const ctx = cvs.getContext("2d");

        if (!ctx) {
            throw new Error("Failed to get 2D context");
        }

        // Clears to transparent black
        ctx.clearRect(0, 0, w, h);

        // Center the image
        const x = Math.floor((w - img.width) / 2);
        const y = Math.floor((h - img.height) / 2);
        ctx.drawImage(img, x, y);

        return cvs.transferToImageBitmap();
    } catch (err: unknown) {
        const msg = `❌ Failed to load and pad image: ${url}`
        // console.error(msg, err);
        throw new Error( msg, { cause: err });
    }
}

export { loadImagePromise as loadImage, loadImagesSync, loadImagesAsync };
