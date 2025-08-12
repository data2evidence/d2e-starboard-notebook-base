import { Runtime } from "src/types";
import type { plugin as StarboardPythonPlugin } from "starboard-python";

const MRI_ROOT_URL = "analytics-svc";

export const setupPyqe = async (runtime: Runtime, serverUrl: string, token: string) => {

    if (!serverUrl || !token) {
        return;
    }

    const PYQE_INSTALL_CODE = `import os
import micropip
await micropip.install('ssl')
await micropip.install('pyjwt==2.9.0')
await micropip.install('${serverUrl}starboard-notebook-base/pyodidepyqe-0.0.2-py3-none-any.whl', keep_going=True)
os.environ['PYQE_URL'] = '${MRI_ROOT_URL}/'
os.environ['TOKEN'] = '${token}'
os.environ['PYQE_TLS_CLIENT_CA_CERT_PATH'] = ''`

    const pythonRuntime = runtime.plugins.get("starboard-python") as typeof StarboardPythonPlugin;

    try {
        const val = await pythonRuntime.exports.runStarboardPython(runtime as any, PYQE_INSTALL_CODE);

        if (val) {
            console.error(`PYQE installation failed!: ${val}`);
            alert('PYQE installation failed!');
        } else {
            console.log('PYQE installed successfully!');
        }
    } catch (e) {
        console.error(`Error occured while installing PYQE!: ${e}`)
    }
    return;
}

export const initPlugin = async (runtime: Runtime, serverUrl: string, token: string) => {
    try {
        if (runtime.plugins.has("starboard-python")) {
            console.log("Starboard Python plugin is registered, setting up PYQE...");
            await setupPyqe(runtime, serverUrl, token);
        } else {
            console.warn("Starboard Python plugin is not registered, skipping PYQE setup.");
        }
    return;
    } catch (error) {
        console.error("Error initializing Starboard Notebook plugin:", error);
    }

}