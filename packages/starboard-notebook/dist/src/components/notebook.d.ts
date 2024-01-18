import { LitElement } from "lit";
import "./helpers/minimumBodySize";
import { Runtime, RuntimeConfig } from "../types";
declare global {
    interface Window {
        starboardEditUrl?: string;
    }
}
export declare class StarboardNotebookElement extends LitElement {
    private runtime;
    private suggestionUrl;
    private bearerToken;
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
    render(): import("lit-html").TemplateResult<1>;
}
