export function getUserSystemInfo(scene) {
    const os = scene.sys.game.device.os;
    const pixelRatio = scene.sys.game.device.os.pixelRatio;
    //const brower = scene.sys.game.device.browser;

    const deviceDetails = [];

    deviceDetails.push(os);
    deviceDetails.push(pixelRatio);
    //deviceDetails.push(browser);

    return deviceDetails;
}