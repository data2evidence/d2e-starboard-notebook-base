# 🌑 Starboard Notebook Plugin for Data2Evidence using Iframe 

## Introduction
starboard-notebook-base contains modified [starboard-notebook](https://github.com/gzuidhof/starboard-notebook) and [starboard-jupyter](https://github.com/gzuidhof/starboard-jupyter) repositories to suit the requirements for the Data2Evidence platform

## **Build Guide (Important)**
1. Node 16 is required for this build
2. Run `yarn & yarn build` in `packages/starboard-python` first, and the `starboard-jupyter`
3. Finally, run `yarn & yarn build` in `starboard-notebook`

## Deployment
1. Commit the built files into the repository
2. Update the commit hash for `ui/yarn.lock` in `https://github.com/OHDSI/d2e`

## Modifications

### **Changes in starboard-notebook**
1. **Token and Jupyter Plugin Management in NOTEBOOK_SET_INIT_DATA**

In `core.ts`, `NOTEBOOK_SET_INIT_DATA` event is triggered when `StarboardEmbed` component is loaded in portal.
This event
- loads the starboard content passed from portal
- run a starboard cell to install pyqe, and removes the cell
- sets attributes passed from the portal (serverUrl, token, datasetId)
- loads the Jupyter plugin and connects to enterprise gateway

2. **Get Runtime Method** 

StarboardNotebookElement's `runtime` property is private. A public getter method: `getRuntime()` has been created. `getRuntime()` is used to register `starboard-jupyter` into the notebook. 

### **Changes in starboard-jupyter**
1. **kernel manager**

The kernel manager class in `kernelManager.ts` is responsible for connecting to the jupyter enterprise gateway and managing the kernel connection
- upon kernel connection, `updateInternalEnvs` method is run to set additional environment variables the jupyter kernel