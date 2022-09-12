import { OutputArea, OutputAreaModel } from "@jupyterlab/outputarea";

import { RenderMimeRegistry, standardRendererFactories } from "@jupyterlab/rendermime";
import { Runtime } from "starboard-notebook/dist/src/types";
import { RuntimeConfig } from "./types";

export function createJupyterOutputArea() {
  const model = new OutputAreaModel();
  const rendermime = new RenderMimeRegistry({ initialFactories: standardRendererFactories });
  const outputArea = new OutputArea({ model, rendermime });
  return outputArea;
}



export declare class StarboardNotebookElement{
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
  // render(): import("lit-html").TemplateResult<1>;
}