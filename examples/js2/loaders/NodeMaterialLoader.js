"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.NodeMaterialLoaderUtils = THREE.NodeMaterialLoader = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var NodeMaterialLoader = function NodeMaterialLoader(manager, library) {
  this.manager = manager !== undefined ? manager : THREE.DefaultLoadingManager;
  this.nodes = {};
  this.materials = {};
  this.passes = {};
  this.names = {};
  this.library = library || {};
};

THREE.NodeMaterialLoader = NodeMaterialLoader;
var NodeMaterialLoaderUtils = {
  replaceUUIDObject: function replaceUUIDObject(object, uuid, value, recursive) {
    recursive = recursive !== undefined ? recursive : true;
    if (_typeof(uuid) === "object") uuid = uuid.uuid;

    if (_typeof(object) === "object") {
      var keys = Object.keys(object);

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];

        if (recursive) {
          object[key] = this.replaceUUIDObject(object[key], uuid, value);
        }

        if (key === uuid) {
          object[uuid] = object[key];
          delete object[key];
        }
      }
    }

    return object === uuid ? value : object;
  },
  replaceUUID: function replaceUUID(json, uuid, value) {
    this.replaceUUIDObject(json, uuid, value, false);
    this.replaceUUIDObject(json.nodes, uuid, value);
    this.replaceUUIDObject(json.materials, uuid, value);
    this.replaceUUIDObject(json.passes, uuid, value);
    this.replaceUUIDObject(json.library, uuid, value, false);
    return json;
  }
};
THREE.NodeMaterialLoaderUtils = NodeMaterialLoaderUtils;
Object.assign(NodeMaterialLoader.prototype, {
  load: function load(url, onLoad, onProgress, onError) {
    var scope = this;
    var loader = new THREE.FileLoader(scope.manager);
    loader.setPath(scope.path);
    loader.load(url, function (text) {
      onLoad(scope.parse(JSON.parse(text)));
    }, onProgress, onError);
    return this;
  },
  setPath: function setPath(value) {
    this.path = value;
    return this;
  },
  getObjectByName: function getObjectByName(uuid) {
    return this.names[uuid];
  },
  getObjectById: function getObjectById(uuid) {
    return this.library[uuid] || this.nodes[uuid] || this.materials[uuid] || this.passes[uuid] || this.names[uuid];
  },
  getNode: function getNode(uuid) {
    var object = this.getObjectById(uuid);

    if (!object) {
      console.warn("Node \"" + uuid + "\" not found.");
    }

    return object;
  },
  resolve: function resolve(json) {
    switch (_typeof(json)) {
      case "boolean":
      case "number":
        return json;

      case "string":
        if (/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/i.test(json) || this.library[json]) {
          return this.getNode(json);
        }

        return json;

      default:
        if (Array.isArray(json)) {
          for (var i = 0; i < json.length; i++) {
            json[i] = this.resolve(json[i]);
          }
        } else {
          for (var prop in json) {
            if (prop === "uuid") continue;
            json[prop] = this.resolve(json[prop]);
          }
        }

    }

    return json;
  },
  declare: function declare(json) {
    var uuid, node, object;

    for (uuid in json.nodes) {
      node = json.nodes[uuid];
      object = new Nodes[node.nodeType + "Node"]();

      if (node.name) {
        object.name = node.name;
        this.names[object.name] = object;
      }

      this.nodes[uuid] = object;
    }

    for (uuid in json.materials) {
      node = json.materials[uuid];
      object = new Nodes[node.type]();

      if (node.name) {
        object.name = node.name;
        this.names[object.name] = object;
      }

      this.materials[uuid] = object;
    }

    for (uuid in json.passes) {
      node = json.passes[uuid];
      object = new Nodes[node.type]();

      if (node.name) {
        object.name = node.name;
        this.names[object.name] = object;
      }

      this.passes[uuid] = object;
    }

    if (json.material) this.material = this.materials[json.material];
    if (json.pass) this.pass = this.passes[json.pass];
    return json;
  },
  parse: function parse(json) {
    var uuid;
    json = this.resolve(this.declare(json));

    for (uuid in json.nodes) {
      this.nodes[uuid].copy(json.nodes[uuid]);
    }

    for (uuid in json.materials) {
      this.materials[uuid].copy(json.materials[uuid]);
    }

    for (uuid in json.passes) {
      this.passes[uuid].copy(json.passes[uuid]);
    }

    return this.material || this.pass || this;
  }
});