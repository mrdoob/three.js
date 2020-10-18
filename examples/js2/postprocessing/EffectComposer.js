"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.Pass = THREE.EffectComposer = void 0;

var EffectComposer = function EffectComposer(renderer, renderTarget) {
  this.renderer = renderer;

  if (renderTarget === undefined) {
    var parameters = {
      minFilter: THREE.LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat
    };
    var size = renderer.getSize(new THREE.Vector2());
    this._pixelRatio = renderer.getPixelRatio();
    this._width = size.width;
    this._height = size.height;
    renderTarget = new THREE.WebGLRenderTarget(this._width * this._pixelRatio, this._height * this._pixelRatio, parameters);
    renderTarget.texture.name = 'EffectComposer.rt1';
  } else {
    this._pixelRatio = 1;
    this._width = renderTarget.width;
    this._height = renderTarget.height;
  }

  this.renderTarget1 = renderTarget;
  this.renderTarget2 = renderTarget.clone();
  this.renderTarget2.texture.name = 'EffectComposer.rt2';
  this.writeBuffer = this.renderTarget1;
  this.readBuffer = this.renderTarget2;
  this.renderToScreen = true;
  this.passes = [];

  if (CopyShader === undefined) {
    console.error('THREE.EffectComposer relies on CopyShader');
  }

  if (ShaderPass === undefined) {
    console.error('THREE.EffectComposer relies on ShaderPass');
  }

  this.copyPass = new ShaderPass(CopyShader);
  this.clock = new THREE.Clock();
};

THREE.EffectComposer = EffectComposer;
Object.assign(EffectComposer.prototype, {
  swapBuffers: function swapBuffers() {
    var tmp = this.readBuffer;
    this.readBuffer = this.writeBuffer;
    this.writeBuffer = tmp;
  },
  addPass: function addPass(pass) {
    this.passes.push(pass);
    pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
  },
  insertPass: function insertPass(pass, index) {
    this.passes.splice(index, 0, pass);
    pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
  },
  isLastEnabledPass: function isLastEnabledPass(passIndex) {
    for (var i = passIndex + 1; i < this.passes.length; i++) {
      if (this.passes[i].enabled) {
        return false;
      }
    }

    return true;
  },
  render: function render(deltaTime) {
    if (deltaTime === undefined) {
      deltaTime = this.clock.getDelta();
    }

    var currentRenderTarget = this.renderer.getRenderTarget();
    var maskActive = false;
    var pass,
        i,
        il = this.passes.length;

    for (i = 0; i < il; i++) {
      pass = this.passes[i];
      if (pass.enabled === false) continue;
      pass.renderToScreen = this.renderToScreen && this.isLastEnabledPass(i);
      pass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive);

      if (pass.needsSwap) {
        if (maskActive) {
          var context = this.renderer.getContext();
          var stencil = this.renderer.state.buffers.stencil;
          stencil.setFunc(context.NOTEQUAL, 1, 0xffffffff);
          this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime);
          stencil.setFunc(context.EQUAL, 1, 0xffffffff);
        }

        this.swapBuffers();
      }

      if (MaskPass !== undefined) {
        if (pass instanceof MaskPass) {
          maskActive = true;
        } else if (pass instanceof ClearMaskPass) {
          maskActive = false;
        }
      }
    }

    this.renderer.setRenderTarget(currentRenderTarget);
  },
  reset: function reset(renderTarget) {
    if (renderTarget === undefined) {
      var size = this.renderer.getSize(new Vector2());
      this._pixelRatio = this.renderer.getPixelRatio();
      this._width = size.width;
      this._height = size.height;
      renderTarget = this.renderTarget1.clone();
      renderTarget.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
    }

    this.renderTarget1.dispose();
    this.renderTarget2.dispose();
    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();
    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;
  },
  setSize: function setSize(width, height) {
    this._width = width;
    this._height = height;
    var effectiveWidth = this._width * this._pixelRatio;
    var effectiveHeight = this._height * this._pixelRatio;
    this.renderTarget1.setSize(effectiveWidth, effectiveHeight);
    this.renderTarget2.setSize(effectiveWidth, effectiveHeight);

    for (var i = 0; i < this.passes.length; i++) {
      this.passes[i].setSize(effectiveWidth, effectiveHeight);
    }
  },
  setPixelRatio: function setPixelRatio(pixelRatio) {
    this._pixelRatio = pixelRatio;
    this.setSize(this._width, this._height);
  }
});

var Pass = function Pass() {
  this.enabled = true;
  this.needsSwap = true;
  this.clear = false;
  this.renderToScreen = false;
};

THREE.Pass = Pass;
Object.assign(Pass.prototype, {
  setSize: function setSize() {},
  render: function render() {
    console.error('THREE.Pass: .render() must be implemented in derived pass.');
  }
});

Pass.FullScreenQuad = function () {
  var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  var geometry = new THREE.PlaneBufferGeometry(2, 2);

  var FullScreenQuad = function FullScreenQuad(material) {
    this._mesh = new THREE.Mesh(geometry, material);
  };

  Object.defineProperty(FullScreenQuad.prototype, 'material', {
    get: function get() {
      return this._mesh.material;
    },
    set: function set(value) {
      this._mesh.material = value;
    }
  });
  Object.assign(FullScreenQuad.prototype, {
    dispose: function dispose() {
      this._mesh.geometry.dispose();
    },
    render: function render(renderer) {
      renderer.render(this._mesh, camera);
    }
  });
  return FullScreenQuad;
}();