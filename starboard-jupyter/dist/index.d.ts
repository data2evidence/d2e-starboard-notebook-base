import { StarboardPlugin } from "../../packages/starboard-notebook/dist/src/types";
import { Runtime } from "../../packages/starboard-notebook/dist/src/types";
import "./styles";
import { JupyterPluginSettings } from "./types";
import { StarboardJupyterManager } from "./components/kernelManager";
import { createJupyterOutputArea } from "./output";
export { createJupyterOutputArea } from "./output";
declare global {
    interface Window {
        runtime: Runtime;
        $_: any;
    }
}
declare const pluginExports: {
    createJupyterOutputArea: typeof createJupyterOutputArea;
    getGlobalKernelManager: () => StarboardJupyterManager;
};
export declare const plugin: StarboardPlugin<JupyterPluginSettings, typeof pluginExports>;
export default plugin;
