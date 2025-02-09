import { CellTypeDefinition, MapRegistry } from "../types";
export declare function getCellTypeDefinitionForCellType(cellType: string): CellTypeDefinition;
export declare function getAvailableCellTypes(): CellTypeDefinition[];
export declare function getDefaultCellType(): string;
export declare const registry: MapRegistry<string, CellTypeDefinition>;
