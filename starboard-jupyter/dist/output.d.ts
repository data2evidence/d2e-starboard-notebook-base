import { OutputArea } from "@jupyterlab/outputarea";
import { Runtime } from "../../packages/starboard-notebook/dist/src/types";
import { RuntimeConfig } from "./types";
export declare function createJupyterOutputArea(): OutputArea;
export declare class StarboardNotebookElement {
    private runtime;
    config?: RuntimeConfig;
    private cellsParentElement;
    private sourceModalElement;
    private sourceModal;
    createRenderRoot(): this;
    initialRunStarted: boolean;
    connectedCallback(): void;
    loadPlugins(): Promise<void>;
    notebookInitialize(): Promise<void>;
    firstUpdated(changedProperties: any): void;
    moveCellDomElement(fromIndex: number, toIndex: number): void;
    performUpdate(): void;
    showSourceModal(): void;
    getRuntime(): Runtime;
    notebookInitialRun(): Promise<void>;
}
