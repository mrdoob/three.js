import {
  ShaderMaterial,
  UniformsUtils
} from "../../../build/three.module.js";
import { Pass } from "../postprocessing/Pass.js";
import { SSRShader } from "../shaders/SSRShader.js";

var SSRPass = function(center, angle, scale) {

  Pass.call(this);

  if (SSRShader === undefined)
    console.error("SSRPass relies on SSRShader");

  var shader = SSRShader;

  this.uniforms = UniformsUtils.clone(shader.uniforms);

  if (center !== undefined) this.uniforms["center"].value.copy(center);
  if (angle !== undefined) this.uniforms["angle"].value = angle;
  if (scale !== undefined) this.uniforms["scale"].value = scale;

  this.material = new ShaderMaterial({

    uniforms: this.uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader

  });

  this.fsQuad = new Pass.FullScreenQuad(this.material);

};

SSRPass.prototype = Object.assign(Object.create(Pass.prototype), {

  constructor: SSRPass,

  render: function(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

    this.uniforms["tDiffuse"].value = readBuffer.texture;
    this.uniforms["tSize"].value.set(readBuffer.width, readBuffer.height);

    if (this.renderToScreen) {

      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);

    } else {

      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      this.fsQuad.render(renderer);

    }

  }

});

export { SSRPass };
