/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
export function isSharedArrayBufferAndAtomicsReady() {
    const hasSharedArrayBufferAndAtomics = "SharedArrayBuffer" in globalThis &&
        "Atomics" in globalThis &&
        globalThis["crossOriginIsolated"] !== false;
    return hasSharedArrayBufferAndAtomics;
}
export function serviceWorkerCanBeRegisteredAtCorrectScope() {
    var _a;
    const scriptSrc = ((_a = document.currentScript) === null || _a === void 0 ? void 0 : _a.src) || "";
    const prefixBase = scriptSrc.substring(0, scriptSrc.lastIndexOf("/") + 1);
    const scope = new URL(prefixBase);
    if (location.origin !== scope.origin) {
        return { ok: false, reason: "Origin of starboard script does not match origin of page" };
    }
    if (!location.pathname.startsWith(scope.pathname)) {
        return {
            ok: false,
            reason: `The service worker would be registered to scope ${scope.pathname}, which does not include the current location ${location.pathname}`,
        };
    }
    return {
        ok: true,
    };
}
function markdownItCrossOriginImages(md, _userOptions) {
    // Remember old renderer, if overridden, or proxy to default renderer
    const defaultRender = md.renderer.rules.image ||
        function (tokens, idx, options, env, self) {
            return self.renderToken(tokens, idx, options);
        };
    md.renderer.rules.image = function (tokens, idx, options, env, self) {
        // If you are sure other plugins can't add `crossorigin` - drop check below
        const aIndex = tokens[idx].attrIndex("crossorigin");
        if (aIndex < 0) {
            tokens[idx].attrPush(["crossorigin", "anonymous"]); // add new attribute
        }
        else {
            // Do nothing
            // or
            // tokens[idx].attrs[aIndex][1] = "anonymous";
        }
        return defaultRender(tokens, idx, options, env, self);
    };
}
export function hookMarkdownItCrossOriginImages(markdownItInstance, withShortcuts = false) {
    markdownItInstance.use(markdownItCrossOriginImages, { shortcuts: withShortcuts ? undefined : {} });
}
//# sourceMappingURL=crossOriginIsolated.js.map