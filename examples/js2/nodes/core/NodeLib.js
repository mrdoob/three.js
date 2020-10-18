"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.NodeLib = void 0;
var NodeLib = {
  nodes: {},
  keywords: {},
  add: function add(node) {
    this.nodes[node.name] = node;
  },
  addKeyword: function addKeyword(name, callback, cache) {
    cache = cache !== undefined ? cache : true;
    this.keywords[name] = {
      callback: callback,
      cache: cache
    };
  },
  remove: function remove(node) {
    delete this.nodes[node.name];
  },
  removeKeyword: function removeKeyword(name) {
    delete this.keywords[name];
  },
  get: function get(name) {
    return this.nodes[name];
  },
  getKeyword: function getKeyword(name, builder) {
    return this.keywords[name].callback.call(this, builder);
  },
  getKeywordData: function getKeywordData(name) {
    return this.keywords[name];
  },
  contains: function contains(name) {
    return this.nodes[name] !== undefined;
  },
  containsKeyword: function containsKeyword(name) {
    return this.keywords[name] !== undefined;
  }
};
THREE.NodeLib = NodeLib;