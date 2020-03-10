'use strict';

/* global importScripts, init, state */

importScripts('resources/threejs/r114/build/three.min.js');
importScripts('shared-cubes.js');

function size(data) {
  state.width = data.width;
  state.height = data.height;
}

const handlers = {
  init,
  size,
};

self.onmessage = function(e) {
  const fn = handlers[e.data.type];
  if (!fn) {
    throw new Error('no handler for type: ' + e.data.type);
  }
  fn(e.data);
};