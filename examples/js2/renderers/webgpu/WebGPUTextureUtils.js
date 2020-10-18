"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var WebGPUTextureUtils = /*#__PURE__*/function () {
  function WebGPUTextureUtils(device, glslang) {
    _classCallCheck(this, WebGPUTextureUtils);

    this.device = device;
    var mipmapVertexSource = "#version 450\t\t\tconst vec2 pos[4] = vec2[4](vec2(-1.0f, 1.0f), vec2(1.0f, 1.0f), vec2(-1.0f, -1.0f), vec2(1.0f, -1.0f));\t\t\tconst vec2 tex[4] = vec2[4](vec2(0.0f, 0.0f), vec2(1.0f, 0.0f), vec2(0.0f, 1.0f), vec2(1.0f, 1.0f));\t\t\tlayout(location = 0) out vec2 vTex;\t\t\tvoid main() {\t\t\t\tvTex = tex[gl_VertexIndex];\t\t\t\tgl_Position = vec4(pos[gl_VertexIndex], 0.0, 1.0);\t\t\t}\t\t";
    var mipmapFragmentSource = "#version 450\t\t\tlayout(set = 0, binding = 0) uniform sampler imgSampler;\t\t\tlayout(set = 0, binding = 1) uniform texture2D img;\t\t\tlayout(location = 0) in vec2 vTex;\t\t\tlayout(location = 0) out vec4 outColor;\t\t\tvoid main() {\t\t\t\toutColor = texture(sampler2D(img, imgSampler), vTex);\t\t\t}";
    this.sampler = device.createSampler({
      minFilter: THREE.GPUFilterMode.Linear
    });
    this.pipelines = {};
    this.mipmapVertexShaderModule = device.createShaderModule({
      code: glslang.compileGLSL(mipmapVertexSource, 'vertex')
    });
    this.mipmapFragmentShaderModule = device.createShaderModule({
      code: glslang.compileGLSL(mipmapFragmentSource, 'fragment')
    });
  }

  _createClass(WebGPUTextureUtils, [{
    key: "getMipmapPipeline",
    value: function getMipmapPipeline(format) {
      var pipeline = this.pipelines[format];

      if (pipeline === undefined) {
        pipeline = this.device.createRenderPipeline({
          vertexStage: {
            module: this.mipmapVertexShaderModule,
            entryPoint: 'main'
          },
          fragmentStage: {
            module: this.mipmapFragmentShaderModule,
            entryPoint: 'main'
          },
          primitiveTopology: THREE.GPUPrimitiveTopology.TriangleStrip,
          vertexState: {
            indexFormat: THREE.GPUIndexFormat.Uint32
          },
          colorStates: [{
            format: format
          }]
        });
        this.pipelines[format] = pipeline;
      }

      return pipeline;
    }
  }, {
    key: "generateMipmaps",
    value: function generateMipmaps(textureGPU, textureGPUDescriptor) {
      var pipeline = this.getMipmapPipeline(textureGPUDescriptor.format);
      var commandEncoder = this.device.createCommandEncoder({});
      var bindGroupLayout = pipeline.getBindGroupLayout(0);
      var srcView = textureGPU.createView({
        baseMipLevel: 0,
        mipLevelCount: 1
      });

      for (var i = 1; i < textureGPUDescriptor.mipLevelCount; i++) {
        var dstView = textureGPU.createView({
          baseMipLevel: i,
          mipLevelCount: 1
        });
        var passEncoder = commandEncoder.beginRenderPass({
          colorAttachments: [{
            attachment: dstView,
            loadValue: [0, 0, 0, 0]
          }]
        });
        var bindGroup = this.device.createBindGroup({
          layout: bindGroupLayout,
          entries: [{
            binding: 0,
            resource: this.sampler
          }, {
            binding: 1,
            resource: srcView
          }]
        });
        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.draw(4, 1, 0, 0);
        passEncoder.endPass();
        srcView = dstView;
      }

      this.device.defaultQueue.submit([commandEncoder.finish()]);
    }
  }]);

  return WebGPUTextureUtils;
}();

var _default = WebGPUTextureUtils;
exports["default"] = _default;