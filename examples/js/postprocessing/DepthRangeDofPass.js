THREE.DepthRangeDofPass = function (scene, camera, params) {
  THREE.Pass.call(this);
  //params setting
  var DEFAULTS_OPTIONS = {
    resolution:{
      width:1920,
      height:1080
    },
    blurRatio: 0.7,
    nearFocusDist: 100,
    farFocusDist: 200
  }

  var resolution = params.resolution || DEFAULTS_OPTIONS.resolution;
  var blurRatio = params.blurRatio || DEFAULTS_OPTIONS.blurRatio;
  var nearFocusDist = params.nearFocusDist || DEFAULTS_OPTIONS.nearFocusDist;
  var farFocusDist = params.farFocusDist || DEFAULTS_OPTIONS.farFocusDist;

  //declear for update z 
  this.nearFocusDist = nearFocusDist;
  this.farFocusDist = farFocusDist;
  this.camWorldDir = new THREE.Vector3();
  this.cameraPositionCopy = new THREE.Vector3();
  this.cameraPositionCopy2 = new THREE.Vector3();
  this.viewDir;
  this.viewDirCopy = new THREE.Vector3();
  this.viewDirCopy2 = new THREE.Vector3();
  this.nearFocus;
  this.farFocus;
  this.nearZ;
  this.farZ;

  //params for fbo
  var fboParams = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat
  };

  var fboParamsForDepth = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType
  };

  //system camera and scene
  this.scene = scene;
  this.camera = camera;

  //pps camera and scene
  this.scene2 = new THREE.Scene();
  this.camera2 = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  //render targets
  this.normalTarget = new THREE.WebGLRenderTarget(resolution.width, resolution.height, fboParams);

  this.xblurTarget = new THREE.WebGLRenderTarget(resolution.width, resolution.height, fboParams);
  this.yblurTarget = new THREE.WebGLRenderTarget(resolution.width, resolution.height, fboParams);

  this.depthTarget = new THREE.WebGLRenderTarget(resolution.width, resolution.height, fboParamsForDepth);
  this.depthTarget.texture.generateMipmaps = false;
  this.depthTarget.stencilBuffer = false;

  //blur materials
  //horizontal
  this.hBlurMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.HorizontalBlurShader.uniforms,
    vertexShader: THREE.HorizontalBlurShader.vertexShader,
    fragmentShader: THREE.HorizontalBlurShader.fragmentShader
  });
  // this.hBlurMaterial.uniforms.tDiffuse.value = this.normalTarget.texture;
  this.hBlurMaterial.uniforms.tDiffuse.value = null;
  this.hBlurMaterial.uniforms.h.value = 1.0 / (resolution.width * blurRatio);
  //vertical
  this.vBlurMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.VerticalBlurShader.uniforms,
    vertexShader: THREE.VerticalBlurShader.vertexShader,
    fragmentShader: THREE.VerticalBlurShader.fragmentShader
  });
  this.vBlurMaterial.uniforms.tDiffuse.value = this.xblurTarget.texture;
  this.vBlurMaterial.uniforms.v.value = 1.0 / (resolution.height * blurRatio);

  //depth material
  this.depthMaterial = new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: THREE.DepthDetectShader.vertexShader,
    fragmentShader: THREE.DepthDetectShader.fragmentShader
  });

  //dof materials
  this.dofMaterial = new THREE.ShaderMaterial({
    uniforms: {
      nearZ: { value: null},
      farZ: { value: null},
      focusRange: { value: 0 },
      blurTex: { value: this.yblurTarget.texture },
      normalTex: { value: null },
      depthTex: { value: this.depthTarget.texture }
    },
    vertexShader: THREE.DepthRangeDofShader.vertexShader,
    fragmentShader: THREE.DepthRangeDofShader.fragmentShader
  });

  //pps screen quad
  this.quad2 = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2, 64, 64), null);
  this.quad2.frustumCulled = false;
  this.scene2.add(this.quad2);
}

THREE.DepthRangeDofPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {
  constructor: THREE.DepthRangeDofPass,

  render: function (renderer, writeBuffer, readBuffer, delta, maskActive) {
    //render depth target to detect the pixels for blur
    this.scene.overrideMaterial = this.depthMaterial;
    renderer.render(this.scene, this.camera, this.depthTarget);
    this.scene.overrideMaterial = null;

    //out put blur pps screen quad into fbo
    this.quad2.material = this.hBlurMaterial;
    renderer.render(this.scene2, this.camera2, this.xblurTarget);
    //out put blur pps screen quad into fbo
    this.quad2.material = this.vBlurMaterial;
    renderer.render(this.scene2, this.camera2, this.yblurTarget);

    // //update focus
    this.updateFocusZ();
    //render pps screen
    this.hBlurMaterial.uniforms.tDiffuse.value = readBuffer.texture;
    this.dofMaterial.uniforms.normalTex.value = readBuffer.texture;

    this.quad2.material = this.dofMaterial;
    if (this.renderToScreen) {
      renderer.render(this.scene2, this.camera2);
    } else {
      renderer.render(this.scene2, this.camera2, writeBuffer, this.clear);
    }
  }
});

THREE.DepthRangeDofPass.prototype.updateFocusZ = function() {
  // var camWorldDir = new THREE.Vector3();
  // this.camera.getWorldDirection(camWorldDir);
  // var viewDir = camWorldDir.normalize();
  
  // var nearFocus = this.camera.position.clone().add(viewDir.clone().multiplyScalar(this.nearFocusDist));
  // var farFocus = this.camera.position.clone().add(viewDir.clone().multiplyScalar(this.farFocusDist));

  // var nearZ = (nearFocus.project(this.camera).z + 1.0) * 0.5;
  // var farZ = (farFocus.project(this.camera).z + 1.0) * 0.5;

  //fix memeory waste, use copy instead of clone and new vector3
  this.camera.getWorldDirection(this.camWorldDir);
  this.viewDir = this.camWorldDir.normalize();

  this.cameraPositionCopy.copy(this.camera.position);
  this.viewDirCopy.copy(this.viewDir);
  this.cameraPositionCopy2.copy(this.camera.position);
  this.viewDirCopy2.copy(this.viewDir);
  
  this.nearFocus = this.cameraPositionCopy.add(this.viewDirCopy.multiplyScalar(this.nearFocusDist));
  this.farFocus = this.cameraPositionCopy2.add(this.viewDirCopy2.multiplyScalar(this.farFocusDist));

  this.nearZ = (this.nearFocus.project(this.camera).z + 1.0) * 0.5;
  this.farZ = (this.farFocus.project(this.camera).z + 1.0) * 0.5;

  this.dofMaterial.uniforms.nearZ.value = this.nearZ;
  this.dofMaterial.uniforms.farZ.value = this.farZ;
}