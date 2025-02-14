//@ts-ignore
import {
  CellTypeDefinition,
  CellHandlerAttachParameters,
  CellElements,
  Cell,
  StarboardPlugin,
} from "starboard-notebook/dist/src/types";
import { Runtime, ControlButton } from "starboard-notebook/dist/src/types";

import "./styles";
import { JupyterPluginSettings } from "./types";
import { StarboardJupyterManager } from "./components/kernelManager";
import { OutputArea } from "@jupyterlab/outputarea";
import { createJupyterOutputArea } from "./output";
import { TemplateResult } from "lit-element/lit-element";
import { StarboardNotebookElement } from "starboard-notebook/dist/src/components/notebook";
export { createJupyterOutputArea } from "./output";


declare global {
  interface Window {
    runtime: Runtime;
    $_: any;
  }
}

// Singleton global kernel manager.
let globalKernelManager: StarboardJupyterManager;

const sleep = (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

function registerJupyter(runtime: Runtime, jupyterOpts: JupyterPluginSettings = { headerText: "Jupyter Plugin" }) {
  /* These globals are exposed by Starboard Notebook. We can re-use them so we don't have to bundle them again. */
  const lit = runtime.exports.libraries.lit;

  const StarboardTextEditor = runtime.exports.elements.StarboardTextEditor;
  const cellControlsTemplate = runtime.exports.templates.cellControls;
  const icons = runtime.exports.templates.icons;

  globalKernelManager = new StarboardJupyterManager(jupyterOpts);

  const JUPYTER_CELL_TYPE_DEFINITION: CellTypeDefinition = {
    name: "Jupyter",
    cellType: ["jupyter"],
    createHandler: (cell: Cell, runtime: Runtime) => new JupyterCellHandler(cell, runtime),
  };

  class JupyterCellHandler {
    private elements!: CellElements;
    private editor: any;
    private outputArea: OutputArea;

    private lastRunId = 0;
    private isCurrentlyRunning: boolean = false;

    cell: Cell;
    runtime: Runtime;

    constructor(cell: Cell, runtime: Runtime) {
      this.cell = cell;
      this.runtime = runtime;

      this.outputArea = createJupyterOutputArea();
    }

    private getControls(): TemplateResult | string {
      const icon = this.isCurrentlyRunning ? icons.ClockIcon : icons.PlayCircleIcon;
      const tooltip = this.isCurrentlyRunning ? "Cell is running" : "Run Cell";
      const runButton: ControlButton = {
        icon,
        tooltip,
        callback: () => this.runtime.controls.emit({ id: this.cell.id, type: "RUN_CELL" }),
      };
      let buttons = [runButton];

      return cellControlsTemplate({ buttons });
    }

    attach(params: CellHandlerAttachParameters): void {
      this.elements = params.elements;

      const topElement = this.elements.topElement;
      lit.render(this.getControls(), this.elements.topControlsElement);

      this.editor = new StarboardTextEditor(this.cell, this.runtime, {
        language: "python",
      });
      topElement.appendChild(this.editor);

      this.elements.bottomElement.appendChild(this.outputArea.node);
    }

    async run() {
      const codeToRun = this.cell.textContent;

      this.lastRunId++;
      const currentRunId = this.lastRunId;
      this.isCurrentlyRunning = true;
      lit.render(this.getControls(), this.elements.topControlsElement);

      await globalKernelManager.runCode({ code: codeToRun }, this.outputArea);
      await this.outputArea.future.done;

      if (this.lastRunId === currentRunId) {
        this.isCurrentlyRunning = false;
        lit.render(this.getControls(), this.elements.topControlsElement);
      }

      const val = this.outputArea.model.toJSON();
      window.$_ = val;
      return val;
    }

    focusEditor() {
      this.editor.focus();
    }

    async dispose() {
      this.editor.remove();
    }

    clear() {
      this.outputArea.model.clear();
    }
  }

  runtime.definitions.cellTypes.register(JUPYTER_CELL_TYPE_DEFINITION.cellType, JUPYTER_CELL_TYPE_DEFINITION);

  const existingKernelUI = document.querySelector("starboard-jupyter-manager");
  if (existingKernelUI) {
    (existingKernelUI as StarboardJupyterManager).remove();
  }

  if (jupyterOpts.mount) {
    jupyterOpts.mount.appendChild(globalKernelManager);
  } else {
    const nb = document.querySelector("starboard-notebook");
    if (nb) nb.prepend(globalKernelManager);
  }
}

const pluginExports = {
  createJupyterOutputArea: createJupyterOutputArea,
  getGlobalKernelManager: () => {
    return globalKernelManager;
  },
};

export const plugin: StarboardPlugin<JupyterPluginSettings, typeof pluginExports> = {
  id: "starboard-jupyter",
  metadata: {
    name: "Jupyter for Starboard",
  },
  exports: pluginExports,

  async register(h,opts?: JupyterPluginSettings) {
    if (opts === undefined) {
      opts = { headerText: "Jupyter Plugin" };
    }
    let sbEl: StarboardNotebookElement | null = null;
      let retry = 0;
      while (!sbEl && retry < 10) {
        await sleep(300);
        sbEl = document.querySelector("starboard-notebook") as unknown as StarboardNotebookElement;

        // Loading and Running the Token
        if (sbEl) {
              let runtime: Runtime = sbEl.getRuntime();
              registerJupyter(runtime, opts);
        }
      }
}};

export default plugin;
