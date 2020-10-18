"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var WebGPUComputePipelines = /*#__PURE__*/function () {
  function WebGPUComputePipelines(device, glslang) {
    _classCallCheck(this, WebGPUComputePipelines);

    this.device = device;
    this.glslang = glslang;
    this.pipelines = new WeakMap();
    this.shaderModules = {
      compute: new WeakMap()
    };
  }

  _createClass(WebGPUComputePipelines, [{
    key: "get",
    value: function get(param) {
      var pipeline = this.pipelines.get(param);

      if (pipeline === undefined) {
        var device = this.device;
        var shader = {
          computeShader: param.shader
        };
        var glslang = this.glslang;
        var moduleCompute = this.shaderModules.compute.get(shader);

        if (moduleCompute === undefined) {
          var byteCodeCompute = glslang.compileGLSL(shader.computeShader, 'compute');
          moduleCompute = device.createShaderModule({
            code: byteCodeCompute
          });
          this.shaderModules.compute.set(shader, moduleCompute);
        }

        var computeStage = {
          module: moduleCompute,
          entryPoint: 'main'
        };
        pipeline = device.createComputePipeline({
          computeStage: computeStage
        });
        this.pipelines.set(param, pipeline);
      }

      return pipeline;
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this.pipelines = new WeakMap();
      this.shaderModules = {
        compute: new WeakMap()
      };
    }
  }]);

  return WebGPUComputePipelines;
}();

var _default = WebGPUComputePipelines;
exports["default"] = _default;