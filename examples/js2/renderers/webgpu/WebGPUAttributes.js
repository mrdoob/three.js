"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var WebGPUAttributes = /*#__PURE__*/function () {
  function WebGPUAttributes(device) {
    _classCallCheck(this, WebGPUAttributes);

    this.buffers = new WeakMap();
    this.device = device;
  }

  _createClass(WebGPUAttributes, [{
    key: "get",
    value: function get(attribute) {
      return this.buffers.get(attribute);
    }
  }, {
    key: "remove",
    value: function remove(attribute) {
      var data = this.buffers.get(attribute);

      if (data) {
        data.buffer.destroy();
        this.buffers["delete"](attribute);
      }
    }
  }, {
    key: "update",
    value: function update(attribute) {
      var isIndex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var usage = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var data = this.buffers.get(attribute);

      if (data === undefined) {
        if (usage === null) {
          usage = isIndex === true ? GPUBufferUsage.INDEX : GPUBufferUsage.VERTEX;
        }

        data = this._createBuffer(attribute, usage);
        this.buffers.set(attribute, data);
      } else if (usage && usage !== data.usage) {
        data.buffer.destroy();
        data = this._createBuffer(attribute, usage);
        this.buffers.set(attribute, data);
      } else if (data.version < attribute.version) {
        this._writeBuffer(data.buffer, attribute);

        data.version = attribute.version;
      }
    }
  }, {
    key: "_createBuffer",
    value: function _createBuffer(attribute, usage) {
      var array = attribute.array;
      var size = array.byteLength + (4 - array.byteLength % 4) % 4;
      var buffer = this.device.createBuffer({
        size: size,
        usage: usage | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true
      });
      new array.constructor(buffer.getMappedRange()).set(array);
      buffer.unmap();
      attribute.onUploadCallback();
      return {
        version: attribute.version,
        buffer: buffer,
        usage: usage
      };
    }
  }, {
    key: "_writeBuffer",
    value: function _writeBuffer(buffer, attribute) {
      var array = attribute.array;
      var updateRange = attribute.updateRange;

      if (updateRange.count === -1) {
        this.device.defaultQueue.writeBuffer(buffer, 0, array, 0);
      } else {
        this.device.defaultQueue.writeBuffer(buffer, 0, array, updateRange.offset * array.BYTES_PER_ELEMENT, updateRange.count * array.BYTES_PER_ELEMENT);
        updateRange.count = -1;
      }
    }
  }]);

  return WebGPUAttributes;
}();

var _default = WebGPUAttributes;
exports["default"] = _default;