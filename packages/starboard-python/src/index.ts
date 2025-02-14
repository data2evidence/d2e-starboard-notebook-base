import type {
  CellTypeDefinition,
  CellHandlerAttachParameters,
  CellElements,
  Cell,
  StarboardPlugin,
} from "../../starboard-notebook/src/types";
import type { Runtime, ControlButton } from "../../starboard-notebook/src/types";

import { getPyodideLoadingStatus, loadPyodide, setupPythonSupport, setGlobalPythonOutputElement } from "./global.js";
import { runStarboardPython } from "./run.js";
import { runSuggestionAI } from "./run-suggestion-ai.js";
import { setPluginOpts, StarboardPythonPluginOpts, updatePluginOptions } from "./opts";

export { getPyodideLoadingStatus, setupPythonSupport, loadPyodide, setGlobalPythonOutputElement };
export { runStarboardPython } from "./run.js";
export { runSuggestionAI} from "./run-suggestion-ai.js"

export function registerPython(runtime: Runtime) {
  setupPythonSupport();

  /* These globals are exposed by Starboard Notebook. We can re-use them so we don't have to bundle them again. */
  const lit = runtime.exports.libraries.lit;

  const StarboardTextEditor = runtime.exports.elements.StarboardTextEditor;
  const cellControlsTemplate = runtime.exports.templates.cellControls;

  const PYTHON_CELL_TYPE_DEFINITION: CellTypeDefinition = {
    name: "Python",
    cellType: ["python", "python3", "ipython3", "pypy", "py"],
    createHandler: (cell: Cell, runtime: Runtime) => new PythonCellHandler(cell, runtime),
  };

  class PythonCellHandler {
    private elements!: CellElements;
    private editor: any;

    private lastRunId = 0;
    private isCurrentlyRunning: boolean = false;
    private isCurrentlyRunningSuggestion: boolean = false;
    private isCurrentlyLoadingPyodide: boolean = false;

    cell: Cell;
    runtime: Runtime;

    constructor(cell: Cell, runtime: Runtime) {
      this.cell = cell;
      this.runtime = runtime;
    }

    private getControls(): any /* lit.TemplateResult */ | string {
      const icon = this.isCurrentlyRunning ? "bi bi-hourglass" : "bi bi-play-circle";
      const suggestIcon = this.isCurrentlyRunningSuggestion ? "bi bi-hourglass" :"bi bi-lightbulb";
      const tooltip = this.isCurrentlyRunning ? "Cell is running" : "Run Cell";
      const runButton: ControlButton = {
        icon,
        tooltip,
        callback: () => this.runtime.controls.runCell({ id: this.cell.id }),
      };

      const suggestButton: ControlButton = {
        icon: suggestIcon,
        tooltip: "Get suggestion",
        callback: () => this.runtime.controls.runCell({ id: this.cell.id, type: "suggest" }),
      };
      
      let buttons = [runButton];

      if (this.isCurrentlyLoadingPyodide) {
        buttons = [
          {
            icon: "bi bi-cloud-arrow-down",
            tooltip: "Downloading and initializing Pyodide",
            callback: () => {
              alert(
                "Loading Python runtime. It's 5 to 15 MB in size, so it may take a while. It will be cached for next time."
              );
            },
          },
          ...buttons,
        ];
      }

      const { suggestionUrl, bearerToken} = this.getProperties()
      if (suggestionUrl && bearerToken) {
        buttons = [suggestButton, ...buttons]
      }
      
      return cellControlsTemplate({ buttons });
    }

    private getProperties () {
      // Get suggestion API URL & bearer token
      const notebookElList = document.getElementsByTagName("starboard-notebook")
      const notebookEl = notebookElList[0]
      const suggestionUrl = notebookEl.getAttribute("suggestionUrl")
      const bearerToken = notebookEl.getAttribute("bearerToken")

      return { suggestionUrl, bearerToken}
    }

    attach(params: CellHandlerAttachParameters): void {
      this.elements = params.elements;

      const topElement = this.elements.topElement;
      lit.render(this.getControls(), this.elements.topControlsElement);

      this.editor = new StarboardTextEditor(this.cell, this.runtime, { language: "python" });
      topElement.appendChild(this.editor);
    }

    async run(type?: string) {
      const codeToRun = this.cell.textContent;            
      this.lastRunId++;
      const currentRunId = this.lastRunId;

      if (type === "suggest") {
        this.isCurrentlyRunningSuggestion = true
        lit.render(this.getControls(), this.elements.topControlsElement);

        const { suggestionUrl, bearerToken} = this.getProperties()

        const val = await runSuggestionAI(this.runtime, codeToRun, this.elements.bottomElement, this.elements.bottomControlsElement, this.editor, suggestionUrl, bearerToken);

        this.isCurrentlyRunningSuggestion = false
        lit.render(this.getControls(), this.elements.topControlsElement);
        return
      }

      this.isCurrentlyRunning = true;
      if (getPyodideLoadingStatus() !== "ready") {
        this.isCurrentlyLoadingPyodide = true;
      }
      lit.render(this.getControls(), this.elements.topControlsElement);

      try {
        const val = await runStarboardPython(this.runtime, codeToRun, this.elements.bottomElement);
        this.isCurrentlyLoadingPyodide = false;
        if (type == "install") {
          if (val) {
            console.error(`Error occured while installing PYQE!: ${val}`)
            alert('Error occured while installing PYQE!')
          } else {
            console.log('PYQE installed successfully!')
          }
        }
        if (this.lastRunId === currentRunId) {
          this.isCurrentlyRunning = false;
          lit.render(this.getControls(), this.elements.topControlsElement);
        }
        return val;
      } catch (e) {
        this.isCurrentlyLoadingPyodide = false;
        if (this.lastRunId === currentRunId) {
          this.isCurrentlyRunning = false;
          lit.render(this.getControls(), this.elements.topControlsElement);
        }
        throw e;
      }
    }

    focusEditor() {
      this.editor.focus();
    }

    async dispose() {
      this.editor.remove();
    }

    clear() {
      const html = lit.html;
      lit.render(html``, this.elements.bottomElement);
    }
  }

  runtime.definitions.cellTypes.register(PYTHON_CELL_TYPE_DEFINITION.cellType, PYTHON_CELL_TYPE_DEFINITION);
}

export type StarboardPluginExports = {
  getPyodideLoadingStatus: typeof getPyodideLoadingStatus;
  runStarboardPython: typeof runStarboardPython;
  setGlobalPythonOutputElement: typeof setGlobalPythonOutputElement;
  loadPyodide: typeof loadPyodide;
  updatePluginOptions: typeof updatePluginOptions;
};

export const plugin: StarboardPlugin<StarboardPythonPluginOpts, StarboardPluginExports> = {
  id: "starboard-python",
  metadata: {
    name: "Starboard Python",
  },
  exports: {
    getPyodideLoadingStatus: getPyodideLoadingStatus,
    runStarboardPython: runStarboardPython,
    setGlobalPythonOutputElement: setGlobalPythonOutputElement,
    loadPyodide: loadPyodide,
    updatePluginOptions: updatePluginOptions,
  },
  async register(runtime: Runtime, opts: StarboardPythonPluginOpts = {}) {
    setPluginOpts(opts);
    registerPython(runtime);
  },
};
