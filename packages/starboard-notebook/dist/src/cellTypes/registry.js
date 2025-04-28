/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { DEFAULT_CELL_TYPE_DEFINITION, DefaultCellHandler } from "./default";
import { MARKDOWN_CELL_TYPE_DEFINITION } from "./markdown";
import { MapRegistry } from "../types";
import { ES_MODULE_CELL_TYPE_DEFINITION } from "./esm/esm";
import { LATEX_CELL_TYPE_DEFINITION } from "./latex";
const PLAINTEXT_CELL_TYPE_DEFINITION = {
    name: "Plaintext",
    cellType: ["plaintext", "raw"],
    createHandler: (c, r) => new DefaultCellHandler(c, r),
};
const builtinCellTypes = [
    MARKDOWN_CELL_TYPE_DEFINITION,
    ES_MODULE_CELL_TYPE_DEFINITION,
    LATEX_CELL_TYPE_DEFINITION,
    PLAINTEXT_CELL_TYPE_DEFINITION,
];
export function getCellTypeDefinitionForCellType(cellType) {
    if (registry.has(cellType)) {
        return registry.get(cellType);
    }
    else {
        return {
            ...DEFAULT_CELL_TYPE_DEFINITION,
            cellType: cellType,
            name: `Unknown type "${cellType}"`,
        };
    }
}
export function getAvailableCellTypes() {
    const cellTypes = [...new Set(registry.values())];
    // Hide "ES Module" cell type from user
    return cellTypes.filter(cell => cell.name !== "ES Module");
}
// Set Python as default language
export function getDefaultCellType() {
    const cells = [...new Set(registry.values())];
    const pythonCell = cells.find(cell => cell.name === "Python");
    if (pythonCell !== undefined) {
        return pythonCell === null || pythonCell === void 0 ? void 0 : pythonCell.cellType[0];
    }
    else {
        return "markdown";
    }
}
// Singleton global value
export const registry = new MapRegistry();
builtinCellTypes.forEach((e) => {
    registry.set(e.cellType, e);
});
//# sourceMappingURL=registry.js.map