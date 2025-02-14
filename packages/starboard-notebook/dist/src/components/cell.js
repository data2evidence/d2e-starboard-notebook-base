/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { getAvailableCellTypes, getCellTypeDefinitionForCellType } from "../cellTypes/registry";
import { getPropertiesIcons, getPropertiesPopoverIcons } from "./controls";
import "./insertionLine";
import Dropdown from "bootstrap/js/dist/dropdown";
import { syncPropertyElementClassNames } from "../cellProperties/dom";
import { cellHasProperty } from "../cellProperties/util";
let CellElement = class CellElement extends LitElement {
    constructor(cell, runtime) {
        super();
        this.isCurrentlyRunning = false;
        this.isBeingMoved = false;
        this.cell = cell;
        this.id = this.cell.id;
        this.runtime = runtime;
        this.setAttribute("tabindex", "0");
        this.classList.add("starboard-fade-in");
    }
    createRenderRoot() {
        return this;
    }
    connectedCallback() {
        super.connectedCallback();
        if (this.isBeingMoved)
            return;
        this.cellTypeDefinition = getCellTypeDefinitionForCellType(this.cell.cellType);
        this.cellHandler = this.cellTypeDefinition.createHandler(this.cell, this.runtime);
        this.classList.add("cell-grid", "cell-container", `celltype-${this.cell.cellType}`);
        // Hacky.. only on first creation of the cell we want to fade in, otherwise it would also fade
        // when being moved.
        setTimeout(() => this.classList.remove("starboard-fade-in"), 500);
    }
    firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties);
        this.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                if (event.ctrlKey) {
                    this.runtime.controls.runCell({ id: this.id });
                }
                else if (event.shiftKey) {
                    this.runtime.controls.runCell({ id: this.id }) &&
                        this.runtime.controls.focusCell({ id: this.id, focusTarget: "next" });
                }
                else if (event.altKey) {
                    this.runtime.controls.runCell({ id: this.id }) &&
                        this.runtime.controls.insertCell({ adjacentCellId: this.id, position: "after" });
                    this.runtime.controls.focusCell({ id: this.id, focusTarget: "next" });
                }
            }
        });
        [].slice.call(document.querySelectorAll(".dropdown-toggle")).map((e) => new Dropdown(e));
        this.cellHandler.attach({
            elements: {
                cell: this,
                topElement: this.topElement,
                topControlsElement: this.topControlsElement,
                bottomElement: this.bottomElement,
                bottomControlsElement: this.bottomControlsElement,
            },
        });
    }
    async run(type) {
        this.isCurrentlyRunning = true;
        this.requestUpdate();
        if (type) {
            await this.cellHandler.run(type);
        }
        else {
            await this.cellHandler.run();
        }
        this.isCurrentlyRunning = false;
        this.requestUpdate();
    }
    focusEditor(opts) {
        this.focus();
        this.cellHandler.focusEditor(opts);
    }
    clear() {
        var _a;
        // ?. for backwards compatibility - prior to 0.9.3 cell handlers were not required to have a clear method.
        (_a = this.cellHandler) === null || _a === void 0 ? void 0 : _a.clear();
    }
    changeCellType(newCellType) {
        // If these are multiple cell types, take the first one
        const newCellTypeIdentifier = typeof newCellType === "string" ? newCellType : newCellType[0];
        return this.runtime.controls.changeCellType({
            id: this.cell.id,
            newCellType: newCellTypeIdentifier,
        });
    }
    /**
     * Toggles the property between `true` and not present.
     * If force is passed it is deleted in case you pass `false`, and set to `true` in case of `true`.
     */
    toggleProperty(name, force) {
        if (this.cell.metadata.properties[name] || force === false) {
            this.runtime.controls.setCellProperty({ id: this.cell.id, property: name, value: undefined }) &&
                this.requestUpdate();
        }
        else {
            this.runtime.controls.setCellProperty({ id: this.cell.id, property: name, value: true }) && this.requestUpdate();
        }
    }
    onTopGutterButtonClick() {
        if (cellHasProperty(this.cell, "top_hidden")) {
            this.toggleProperty("top_hidden", false);
        }
        else if (cellHasProperty(this.cell, "bottom_hidden")) {
            this.toggleProperty("bottom_hidden", false);
        }
        else {
            this.toggleProperty("collapsed");
        }
    }
    render() {
        const id = this.cell.id;
        syncPropertyElementClassNames(this, this.cell.metadata.properties);
        return html `
      <starboard-insertion-line class="insertion-line-top"></starboard-insertion-line>

      <!-- Gutter (left side outside the document) -->
      <div class="cell-gutter cell-gutter-left-above">
        <button
          @click=${() => this.onTopGutterButtonClick()}
          class="btn cell-gutter-button"
          title=${this.cell.metadata.properties.collapsed ? "Toggle cell visibility" : "Toggle cell visibility"}
        ></button>
      </div>
      <div class="cell-gutter cell-gutter-left-top">
        <button
          @click=${() => this.toggleProperty("top_hidden")}
          class="btn cell-gutter-button"
          title="Hide cell input"
        ></button>
      </div>
      <div class="cell-gutter cell-gutter-left-bottom">
        <button
          @click=${() => this.toggleProperty("bottom_hidden")}
          class="btn cell-gutter-button"
          title="Hide cell output"
        ></button>
      </div>

      <!-- Top left corner, used to display a run button if cell is collapsed -->
      <div class="cell-controls cell-controls-left-above d-flex justify-content-center">
        ${this.isCurrentlyRunning
            ? html ` <button
              @mousedown=${() => this.runtime.controls.runCell({ id })}
              class="btn cell-controls-button display-when-collapsed py-1"
              title="Cell is running"
            >
              <span class="bi bi-hourglass"></span>
            </button>`
            : html ` <button
              @mousedown=${() => this.runtime.controls.runCell({ id })}
              class="btn cell-controls-button display-when-collapsed py-1"
              title="Run cell"
            >
              <span class="bi bi-play-circle"></span>
            </button>`}
      </div>

      <!-- Top bar of the cell -->
      <div class="cell-controls cell-controls-above">
        <!-- Properties section -->
        ${getPropertiesIcons(this.cell, (propertyName) => this.toggleProperty(propertyName))}
        <div style="margin-right: auto"></div>

        <div class="collapsed-cell-line" title="Click to reveal collapsed cell temporarily"></div>

        <button
          @click=${() => this.runtime.controls.moveCell({ id, amount: -1 })}
          class="btn cell-controls-button auto-hide"
          title="Move cell up"
        >
          <span class="bi bi-chevron-up"></span>
        </button>

        <button
          @click=${() => this.runtime.controls.moveCell({ id, amount: 1 })}
          class="btn cell-controls-button auto-hide"
          title="Move cell down"
        >
          <span class="bi bi-chevron-down"></span>
        </button>

        <div class="dropdown">
          <button
            data-bs-toggle="dropdown"
            title="Change Cell Type"
            class="btn cell-controls-button cell-controls-button-language auto-hide"
            @click=${ /*(evt: Event) => this.togglePopover(evt.target as HTMLElement, this.typePickerElement)*/() => 0}
          >
            ${this.cellTypeDefinition.name}
          </button>
          <div class="dropdown-menu" style="min-width: 244px">
            <starboard-ensure-parent-fits></starboard-ensure-parent-fits>
            <li><h6 class="dropdown-header">Change Cell Type</h6></li>
            ${getAvailableCellTypes().map((ct) => {
            const ctString = typeof ct.cellType === "string" ? ct.cellType : ct.cellType[0];
            return html `
                <li>
                  <button
                    title=${ctString}
                    class="dropdown-item${ctString === this.cell.cellType ? " active" : ""}"
                    @click=${() => this.changeCellType(ct.cellType)}
                  >
                    ${ct.name}<span style="opacity: 0.6; float: right; font-size: 11px; font-family: var(--font-mono)"
                      >${ctString}</span
                    >
                  </button>
                </li>
              `;
        })}
          </div>
        </div>

        <!-- Properties change button -->
        <div class="dropdown">
          <button data-bs-toggle="dropdown" class="btn cell-controls-button auto-hide" title="Change Cell Properties">
            <span class="bi bi-three-dots-vertical"></span>
          </button>

          <div class="dropdown-menu" style="min-width: 244px">
            <starboard-ensure-parent-fits></starboard-ensure-parent-fits>
            <li>
              <button
                @click="${() => this.runtime.controls.removeCell({ id })}"
                class="dropdown-item text-danger py-0"
                title="Remove Cell"
              >
                <span class="bi bi-trash-fill me-2"></span> Remove Cell
              </button>
            </li>
            <hr class="my-2" />
            <!-- <li><h6 class="dropdown-header">Toggle Cell properties</h6></li> -->
            ${getPropertiesPopoverIcons(this.cell, (propertyName) => this.toggleProperty(propertyName))}
          </div>
        </div>
      </div>

      <div class="cell-controls cell-controls-left cell-controls-left-top"></div>
      <div class="cell-top"></div>
      <div class="cell-controls cell-controls-left cell-controls-left-bottom"></div>
      <div class="cell-bottom"></div>

      <starboard-insertion-line class="insertion-line-bottom"></starboard-insertion-line>
    `;
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.isBeingMoved)
            return;
        this.cellHandler.dispose();
    }
};
__decorate([
    query(".cell-top")
], CellElement.prototype, "topElement", void 0);
__decorate([
    query(".cell-controls-left-top")
], CellElement.prototype, "topControlsElement", void 0);
__decorate([
    query(".cell-bottom")
], CellElement.prototype, "bottomElement", void 0);
__decorate([
    query(".cell-controls-left-bottom")
], CellElement.prototype, "bottomControlsElement", void 0);
__decorate([
    property({ type: Object })
], CellElement.prototype, "cell", void 0);
__decorate([
    property({ attribute: false })
], CellElement.prototype, "runtime", void 0);
CellElement = __decorate([
    customElement("starboard-cell")
], CellElement);
export { CellElement };
//# sourceMappingURL=cell.js.map