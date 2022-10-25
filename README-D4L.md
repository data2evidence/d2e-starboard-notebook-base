# 🌑 Starboard Notebook Plugin for ALP Portal using Iframe 

### **Build Guide (Important)**
Run `yarn`, `yarn run bootstrap` and `yarn run build` in the root of the project.
- Do not perform `yarn` or `yarn build` in the individual starboard packages. 
The dist file located in `packages/starboard-notebook` is then added to `resources` folder in portal to be stored in CDN. 


### **Changes in Starboard Files**
1. **Token and Jupyter Cells Management in 'NOTEBOOK_SET_INIT_DATA**

Starboard Cells to initiate the JWT Token and Jupyter Kernel are added to the end of the notebookContent. 
The code added in `NOTEBOOK_SET_INIT_DATA` method located in `core.ts` runs the cells and deletes them. 

2. **Get Runtime Method** 

StarboardNotebookElement's `runtime` property is private. A public getter method: `getRuntime()` has been created. 
