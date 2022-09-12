# 🌑 Starboard Notebook Plugin for ALP Portal 

### **Build Guide (Important)**
Run `yarn`, `yarn run bootstrap` and `yarn run build` in the root of the project.
- Do not perform `yarn` or `yarn build` in the individual starboard packages. 


### **Changes in Starboard Files**
1. **Removing @customElement Declaration in all LitElement**

Unlike LitElement, React Components cannot identify defined custom elements and will create and error if same components are declared. Example code changes: 
```
customElements.get("starboard-cell") || customElements.define("starboard-cell", CellElement)

```
2. **CSS Changes**

In order to match the styling in the ALP portal. 
Changes can be found in `main.scss`

3. **main.ts**

Creates link to `starboard-main` div element in the ALP portal