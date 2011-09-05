try {
    importScripts('../../build/custom/ThreeWorker.js');
    self.postMessage('success');
} catch (e) {
    self.postMessage('error');
}

self.close();