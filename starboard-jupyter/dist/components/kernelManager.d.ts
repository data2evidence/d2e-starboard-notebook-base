import { KernelMessage } from "@jupyterlab/services";
import { JupyterPluginSettings } from "../types";
import { OutputArea } from "@jupyterlab/outputarea";
import { LitElement } from "lit";
export declare class StarboardJupyterManager extends LitElement {
    private settings;
    private manager;
    private isReady;
    private isStarting;
    private isShuttingDown;
    private runningKernels;
    private kernelInfo?;
    private connectionError;
    private currentKernel?;
    constructor(jupyterSettings: JupyterPluginSettings);
    private setupKernelConnection;
    createRenderRoot(): this;
    startKernel(name?: string, shutdownCurrentKernel?: boolean): Promise<void>;
    connectToKernel(id: string): Promise<void>;
    shutdownKernel(id: string): Promise<void>;
    interruptKernel(): Promise<void>;
    disconnectFromKernel(): Promise<void>;
    /**
     * Takes an object with a `code` field.
     * There are more parameters which you probably won't need.
     */
    runCode(content: KernelMessage.IExecuteRequestMsg["content"], output: OutputArea): Promise<void>;
    updateInternalEnvs(): Promise<void>;
    disconnectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
}
