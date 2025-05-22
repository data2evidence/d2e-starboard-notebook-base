import axios from "axios";
import type { ControlButton, Runtime } from "../../starboard-notebook/src/types";
import { flatPromise } from "./flatPromise";

export async function runSuggestionAI(
  runtime: Runtime,
  codeToRun: string,
  renderOutputIntoElement: HTMLElement,
  renderControlsIntoEmelent: HTMLElement,
  editor: any,
  serverUrl: string | null,
  token: string | null,
  datasetId: string | null,
): Promise<any> {
  const done = flatPromise();

  const cellControlsTemplate = runtime.exports.templates.cellControls;
  const outputElement = new runtime.exports.elements.ConsoleOutputElement();
  outputElement.hook(runtime.consoleCatcher);

  const htmlOutput = document.createElement("div");
  const lit = runtime.exports.libraries.lit;
  const html = lit.html;

  lit.render(html`${outputElement}${htmlOutput}`, renderOutputIntoElement);

  if (!codeToRun) {
    return alert("No code given.")
  }
  if (!token) {
    return alert("No token!")
  }
  if (!serverUrl) {
    return alert("No suggestion URL!");
  }
  if (!datasetId) {
    return alert("No datasetId!");
  }

  const suggestionUrl =  `${serverUrl}code-suggestion?datasetId=${datasetId}`
  
  // console controls
    const acceptButton: ControlButton = {
        icon: "bi bi-check-circle",
        tooltip: "Accept",
        callback: () => {
            editor.replaceText(val)
            removeElements()
            return
        },
    };
    const rejectButton: ControlButton = {
        icon: "bi bi-x-circle",
        tooltip: "Reject",
        callback: () => removeElements(),
    };
    let buttons = [acceptButton, rejectButton];

    const removeElements = () => {
        outputElement.remove()
        lit.render(null, renderControlsIntoEmelent)
    }
  let val = '';
  let error: any = undefined;
  
  try {
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const result = await axios.post(suggestionUrl, { code: codeToRun }, options);
    val = result.data;
    outputElement.addEntry({ method: "result", data: [val] });
    lit.render(cellControlsTemplate({ buttons }), renderControlsIntoEmelent);
  } catch (error: any) {
    outputElement.addEntry({
      method: "error",
      data: [`${error.name} ${error.message}`],
    });
  }

  // Not entirely sure this has to be awaited, is any output delayed by a tick from pyodide?
  await outputElement.unhookAfterOneTick(runtime.consoleCatcher);
  done.resolve();
  if (error !== undefined) {
    throw error;
  }

  return val;
}
