"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function painterSortStable(a, b) {
  if (a.groupOrder !== b.groupOrder) {
    return a.groupOrder - b.groupOrder;
  } else if (a.renderOrder !== b.renderOrder) {
    return a.renderOrder - b.renderOrder;
  } else if (a.material.id !== b.material.id) {
    return a.material.id - b.material.id;
  } else if (a.z !== b.z) {
    return a.z - b.z;
  } else {
    return a.id - b.id;
  }
}

function reversePainterSortStable(a, b) {
  if (a.groupOrder !== b.groupOrder) {
    return a.groupOrder - b.groupOrder;
  } else if (a.renderOrder !== b.renderOrder) {
    return a.renderOrder - b.renderOrder;
  } else if (a.z !== b.z) {
    return b.z - a.z;
  } else {
    return a.id - b.id;
  }
}

var WebGPURenderList = /*#__PURE__*/function () {
  function WebGPURenderList() {
    _classCallCheck(this, WebGPURenderList);

    this.renderItems = [];
    this.renderItemsIndex = 0;
    this.opaque = [];
    this.transparent = [];
  }

  _createClass(WebGPURenderList, [{
    key: "init",
    value: function init() {
      this.renderItemsIndex = 0;
      this.opaque.length = 0;
      this.transparent.length = 0;
    }
  }, {
    key: "getNextRenderItem",
    value: function getNextRenderItem(object, geometry, material, groupOrder, z, group) {
      var renderItem = this.renderItems[this.renderItemsIndex];

      if (renderItem === undefined) {
        renderItem = {
          id: object.id,
          object: object,
          geometry: geometry,
          material: material,
          groupOrder: groupOrder,
          renderOrder: object.renderOrder,
          z: z,
          group: group
        };
        this.renderItems[this.renderItemsIndex] = renderItem;
      } else {
        renderItem.id = object.id;
        renderItem.object = object;
        renderItem.geometry = geometry;
        renderItem.material = material;
        renderItem.groupOrder = groupOrder;
        renderItem.renderOrder = object.renderOrder;
        renderItem.z = z;
        renderItem.group = group;
      }

      this.renderItemsIndex++;
      return renderItem;
    }
  }, {
    key: "push",
    value: function push(object, geometry, material, groupOrder, z, group) {
      var renderItem = this.getNextRenderItem(object, geometry, material, groupOrder, z, group);
      (material.transparent === true ? this.transparent : this.opaque).push(renderItem);
    }
  }, {
    key: "unshift",
    value: function unshift(object, geometry, material, groupOrder, z, group) {
      var renderItem = this.getNextRenderItem(object, geometry, material, groupOrder, z, group);
      (material.transparent === true ? this.transparent : this.opaque).unshift(renderItem);
    }
  }, {
    key: "sort",
    value: function sort(customOpaqueSort, customTransparentSort) {
      if (this.opaque.length > 1) this.opaque.sort(customOpaqueSort || painterSortStable);
      if (this.transparent.length > 1) this.transparent.sort(customTransparentSort || reversePainterSortStable);
    }
  }, {
    key: "finish",
    value: function finish() {
      for (var i = this.renderItemsIndex, il = this.renderItems.length; i < il; i++) {
        var renderItem = this.renderItems[i];
        if (renderItem.id === null) break;
        renderItem.id = null;
        renderItem.object = null;
        renderItem.geometry = null;
        renderItem.material = null;
        renderItem.program = null;
        renderItem.group = null;
      }
    }
  }]);

  return WebGPURenderList;
}();

var WebGPURenderLists = /*#__PURE__*/function () {
  function WebGPURenderLists() {
    _classCallCheck(this, WebGPURenderLists);

    this.lists = new WeakMap();
  }

  _createClass(WebGPURenderLists, [{
    key: "get",
    value: function get(scene, camera) {
      var lists = this.lists;
      var cameras = lists.get(scene);
      var list;

      if (cameras === undefined) {
        list = new WebGPURenderList();
        lists.set(scene, new WeakMap());
        lists.get(scene).set(camera, list);
      } else {
        list = cameras.get(camera);

        if (list === undefined) {
          list = new WebGPURenderList();
          cameras.set(camera, list);
        }
      }

      return list;
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this.lists = new WeakMap();
    }
  }]);

  return WebGPURenderLists;
}();

var _default = WebGPURenderLists;
exports["default"] = _default;