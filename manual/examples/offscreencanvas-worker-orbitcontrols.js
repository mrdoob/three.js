import {init} from './shared-orbitcontrols.js';
import {EventDispatcher} from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';

function noop() {
}

class ElementProxyReceiver extends EventDispatcher {
  constructor() {
    super();
    // because OrbitControls try to set style.touchAction;
    this.style = {};
  }
  get clientWidth() {
    return this.width;
  }
  get clientHeight() {
    return this.height;
  }
  // OrbitControls call these as of r132. Maybe we should implement them
  setPointerCapture() { }
  releasePointerCapture() { }
  getBoundingClientRect() {
    return {
      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height,
      right: this.left + this.width,
      bottom: this.top + this.height,
    };
  }
  handleEvent(data) {
    if (data.type === 'size') {
      this.left = data.left;
      this.top = data.top;
      this.width = data.width;
      this.height = data.height;
      return;
    }
    data.preventDefault = noop;
    data.stopPropagation = noop;
    this.dispatchEvent(data);
  }
  focus() {
    // no-op
  }
}

class ProxyManager {
  constructor() {
    this.targets = {};
    this.handleEvent = this.handleEvent.bind(this);
  }
  makeProxy(data) {
    const {id} = data;
    const proxy = new ElementProxyReceiver();
    this.targets[id] = proxy;
  }
  getProxy(id) {
    return this.targets[id];
  }
  handleEvent(data) {
    this.targets[data.id].handleEvent(data.data);
  }
}

const proxyManager = new ProxyManager();

function start(data) {
  const proxy = proxyManager.getProxy(data.canvasId);
  proxy.ownerDocument = proxy; // HACK!
  self.document = {};  // HACK!
  init({
    canvas: data.canvas,
    inputElement: proxy,
  });
}

function makeProxy(data) {
  proxyManager.makeProxy(data);
}

const handlers = {
  start,
  makeProxy,
  event: proxyManager.handleEvent,
};

self.onmessage = function(e) {
  const fn = handlers[e.data.type];
  if (typeof fn !== 'function') {
    throw new Error('no handler for type: ' + e.data.type);
  }
  fn(e.data);
};
