import { Kernel, KernelManager, KernelMessage } from "@jupyterlab/services";
import { JupyterPluginSettings } from "../types";

import * as P from "@jupyterlab/services/lib/serverconnection";
import { IKernelConnection } from "@jupyterlab/services/lib/kernel/kernel";
import { OutputArea } from "@jupyterlab/outputarea";
import { html, LitElement } from "lit";



export class StarboardJupyterManager extends LitElement {
  private settings: JupyterPluginSettings;
  private manager: KernelManager;

  private isReady = false;
  private runningKernels: Kernel.IModel[] = [];

  private currentKernel?: IKernelConnection;
  private connectionError: Error | undefined;

  constructor(jupyterSettings: JupyterPluginSettings) {
    super();
    this.settings = jupyterSettings;
    this.manager = new KernelManager({
      standby: "when-hidden",
      serverSettings: P.ServerConnection.makeSettings(jupyterSettings.serverSettings),
    });

    this.manager.connectionFailure.connect((km, err) => {
      console.warn("Jupyter Connection Failure", err);
      this.connectionError = err;
      this.performUpdate();
    }, this);

    this.manager.ready.then(
      async () => {
        this.isReady = true;
        const sbCells = document.querySelectorAll("starboard-cell")
        const jupyterEnvCell = sbCells[sbCells.length - 1] as any
        await jupyterEnvCell?.runtime.controls.runCell({ id: jupyterEnvCell.id });
        await jupyterEnvCell?.runtime.controls.removeCell({ id: jupyterEnvCell.id });
        this.performUpdate();
      },
      (err) => {
        console.warn("Jupyter manager failed to ready", err);
        this.isReady = false;
        this.connectionError = err;
        this.performUpdate();
      }
    );

    this.manager.runningChanged.connect((km, running) => {
      this.runningKernels = running;
      this.connectionError = undefined;
      this.performUpdate();
    }, this);
  }

  private setupKernelConnection() {
    this.currentKernel!.statusChanged.connect((kc, status) => {
      if (status === "dead" && this.currentKernel) {
        this.currentKernel.dispose();
        this.currentKernel = undefined;
      }
      this.performUpdate();
    });
    this.currentKernel!.connectionStatusChanged.connect((kc, status) => {
      this.performUpdate();
    });
    this.manager.refreshRunning().catch((e) => console.error("Failed to refresh running kernels:", e));
  }

  createRenderRoot() {
    return this;
  }

  async startKernel(name?: string, shutdownCurrentKernel?: boolean) {
    if (shutdownCurrentKernel && this.currentKernel && !this.currentKernel.isDisposed) {
      console.error("Already connected to a kernel, shutting down existing kernel");
      await this.currentKernel.shutdown();
      this.currentKernel.dispose();
    }
    this.currentKernel = await this.manager.startNew({ name: name });
    this.setupKernelConnection();
    this.performUpdate();
  }

  async connectToKernel(id: string) {
    if (this.currentKernel && !this.currentKernel.isDisposed) {
      this.currentKernel.dispose();
      this.currentKernel = undefined;
    }

    this.currentKernel = this.manager.connectTo({ model: { name: "", id } });
    this.setupKernelConnection();
    this.performUpdate();
  }

  async shutdownKernel(id: string) {
    this.manager.shutdown(id);
  }

  async interruptKernel() {
    if (this.currentKernel) {
      this.currentKernel.interrupt();
    }
  }

  async disconnectFromKernel() {
    if (this.currentKernel) {
      this.currentKernel.dispose();
      this.currentKernel = undefined;
      this.performUpdate();
    }
  }

  /**
   * Takes an object with a `code` field.
   * There are more parameters which you probably won't need.
   */
  async runCode(content: KernelMessage.IExecuteRequestMsg["content"], output: OutputArea) {
    if (!this.currentKernel) {
      await this.startKernel();
    }

    output.future = this.currentKernel!.requestExecute(content);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    (async () => {
      if (this.currentKernel) {
        await this.manager.shutdown(this.currentKernel.id);
      }
      this.manager.dispose();
    })();
  }

  render() {
    return
  }
  
}
customElements.get("starboard-jupyter-manager") || customElements.define("starboard-jupyter-manager", StarboardJupyterManager)

