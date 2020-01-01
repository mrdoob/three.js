'use strict';

/* global importScripts, init, state, pickPosition */

importScripts('resources/threejs/r112/build/three.min.js');
importScripts('shared-picking.js');

function size(data) {
  state.width = data.width;
  state.height = data.height;
}

function mouse(data) {
  pickPosition.x = data.x;
  pickPosition.y = data.y;
}

const handlers = {
  init,
  mouse,
  size,
};

self.onmessage = function(e) {
  const fn = handlers[e.data.type];
  if (!fn) {
    throw new Error('no handler for type: ' + e.data.type);
  }
  fn(e.data);
};