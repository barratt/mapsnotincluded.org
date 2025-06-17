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

import WebGL2CanvasManager from "@/components/WebGL2";
import {createError} from "@/components/CreateCascadingError";

interface Action {
    type: string;
    args?: any[];
}

interface Result {
    success: boolean;
    value?: any;
    error?: any;
}

const transferableMap = new Map<string, (result: any) => Transferable[]>([
    ["transferImageBitmap", (bitmap) => [bitmap]],
    ["copyImageArrayBuffer", (buffer) => [buffer]],
]);

class WebGL2WorkerAdapter {
    private instance: WebGL2CanvasManager | null = null;
    private actionMap: Map<string, (...args: any[]) => any> = new Map();

    constructor() {
        this.actionMap.set("setup", (...args) => this.instance!.setup(...args));
        this.actionMap.set("render", (...args) => this.instance!.render(...args));
        this.actionMap.set("getIsReadyToRender", (...args) => this.instance!.getIsReadyToRender(...args));
        this.actionMap.set("clearCanvas", () => this.instance!.clearCanvas());
        this.actionMap.set("copyImageArrayBuffer", (...args) => this.instance!.copyImageArrayBuffer(...args));
        this.actionMap.set("transferImageBitmap", () => this.instance!.transferImageBitmap());
    }

    public async handleMessage(event: MessageEvent) {
        const { type, payload, requestId } = event.data;

        if (type === "init") {
            this.instance = new WebGL2CanvasManager(...payload.args);
            self.postMessage({ type: "initComplete", requestId });
            return;
        }

        if (type === "runSequence") {
            const results: Result[] = [];

            for (const action of payload.actions as Action[]) {
                try {
                    const fn = this.actionMap.get(action.type);
                    if (!fn) throw this.createError(`Unknown action type: ${action.type}`, true);

                    const value = await fn(...(action.args || []));
                    results.push({ success: true, value });
                } catch (err: any) {
                    results.push({ success: false, error: err });
                }
            }

            const transfers = results.flatMap((res, i) => {
                const action = payload.actions[i];
                const transferFn = transferableMap.get(action.type);
                return transferFn ? transferFn(res.value) : [];
            });

            self.postMessage({ type: "runSequenceComplete", requestId, results }, transfers);
        }
    }

    private createError(msg: string, doConsoleLog: boolean = true, baseError?: unknown): Error {
        return createError("WebGL2WorkerAdapter", msg, doConsoleLog, baseError);
    }
}

const adapter = new WebGL2WorkerAdapter();
self.onmessage = adapter.handleMessage.bind(adapter);
export default {};