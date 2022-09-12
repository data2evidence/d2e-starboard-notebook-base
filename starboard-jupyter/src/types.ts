export interface JupyterPluginSettings {
  serverSettings?: {
    baseUrl: string;
    token: string;
  };
  /** HTML Element to mount the Jupyter Manager UI on */
  mount?: HTMLElement;
  /** Hides the <Starboard Jupyter Plugin> header of the widget */
  headerText: string;
}

export interface RuntimeConfig {
  /**
   * Cell IDs written to the metadata of the cell for new cells if this is true, which causes them to be persisted.
   */
  persistCellIds: boolean;
  defaultTextEditor: "monaco" | "codemirror" | "";
  useCrossOriginIsolationServiceWorker?: boolean;
}
