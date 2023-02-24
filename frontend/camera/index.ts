import QrScanner from "qr-scanner";

export async function createQRCodeScanner(onSuccess: CallableFunction) {
    const videoEl = document.getElementById("reader") as HTMLVideoElement;
    const qrScanner = new QrScanner(videoEl, (async (res: QrScanner.ScanResult) => await onSuccess(res)), {
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true
    });
    return qrScanner;
}

export async function startScanning(qrScanner: QrScanner) {
    await qrScanner.start();
}

export async function stopScanning(qrScanner: QrScanner) {
    await qrScanner.stop();
}
