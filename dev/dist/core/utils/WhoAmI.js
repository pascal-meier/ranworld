export function whoAmI(scene) {
    const os = scene.sys.game.device.os;
    const browser = scene.sys.game.device.browser;
    const flags = {
        android: os.android,
        chromeOS: os.chromeOS,
        cordova: os.cordova,
        crosswalk: os.crosswalk,
        desktop: os.desktop,
        ejecta: os.ejecta,
        electron: os.electron,
        iOS: os.iOS,
        iPad: os.iPad,
        iPhone: os.iPhone,
        kindle: os.kindle,
        linux: os.linux,
        macOS: os.macOS,
        node: os.node,
        nodeWebkit: os.nodeWebkit,
        webApp: os.webApp,
        windows: os.windows,
        windowsPhone: os.windowsPhone,
        chrome: browser.chrome,
        edge: browser.edge,
        firefox: browser.firefox,
        internetExplorer: browser.ie,
        safariMobile: browser.mobileSafari,
        silk: browser.silk,
        trident: browser.trident,
    };
    // Gibt alle "true"-Keys zurück
    return Object.keys(flags).filter((key) => flags[key]);
}
