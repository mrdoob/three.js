/**
 * @author bhouston / http://clara.io/
 */

THREE.MSAAPass = function ( scene, camera, params, clearColor, clearAlpha ) {

  this.scene = scene;
  this.camera = camera;

  this.currentSampleLevel = 4;

  this.params = params || { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat };
  this.params.minFilter = THREE.NearestFilter;
  this.params.maxFilter = THREE.NearestFilter;

  this.clearColor = clearColor;
  this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 1;

  this.oldClearColor = new THREE.Color();
  this.oldClearAlpha = 1;

  this.enabled = true;
  this.clear = false;
  this.needsSwap = true;

  var msaaShader = THREE.MSAA4Shader;
  this.uniforms = THREE.UniformsUtils.clone( msaaShader.uniforms );

  this.materialMSAA = new THREE.ShaderMaterial({
    shaderID: msaaShader.shaderID,
    uniforms: this.uniforms,
    vertexShader: msaaShader.vertexShader,
    fragmentShader: msaaShader.fragmentShader,
    transparent: true,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    blendEquation: THREE.AddEquation,
    depthTest: false,
    depthWrite: false
  });

  this.camera2 = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
  this.scene2  = new THREE.Scene();

  this.quad2 = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );
  this.scene2.add( this.quad2 );

  this.devicePixelRatio = 1;

};

THREE.MSAAPass.prototype = {

  dispose: function() {

    if( this.renderTargets ) {
      for( var i = 0; i < this.renderTargets.length; i ++ ) {
        this.renderTargets[i].dispose();
      }
      this.renderTargets = null;
    }

  },

  render: function ( renderer, writeBuffer, readBuffer, delta ) {

    if( ! this.renderTargets ) {
      this.renderTargets = [];
      for( var i = 0; i < 2; i ++ ) {
        this.renderTargets.push( new THREE.WebGLRenderTarget( readBuffer.width, readBuffer.height, this.params, "msaa.renderTarget" + i ) );
      }
    }

    var camera = ( this.camera || this.scene.camera );

    var currentSampleOffsets = THREE.MSAAPass.JitterVectors[ Math.max( 0, Math.min( this.currentSampleLevel, 5 ) ) ];

    if( ! currentSampleOffsets ) {

      renderer.render( this.scene, camera, this.renderTargets[0], true );

      this.uniforms[ "tBackground" ].value = readBuffer;
      this.uniforms[ "scale" ].value = 1.0;
      for( var k = 0; k < this.renderTargets.length; k ++ ) {
        this.uniforms[ "tSample" + k ].value = this.renderTargets[0];
      }
      this.quad2.material = this.materialMSAA;

      renderer.render( this.scene2, this.camera2, writeBuffer, true );

      return;
    }

    this.scene.overrideMaterial = null;

    this.oldClearColor.copy( renderer.getClearColor() );
    this.oldClearAlpha = renderer.getClearAlpha();

    renderer.setClearColor( new THREE.Color( 0, 0, 0 ), 0 );

    for( var j = 0; j < currentSampleOffsets.length; j += this.renderTargets.length ) {

      this.uniforms[ "tBackground" ].value = readBuffer;
      this.uniforms[ "scale" ].value = 1.0 / currentSampleOffsets.length;
      for( var k = 0; k < this.renderTargets.length; k ++ ) {
        this.uniforms[ "tSample" + k ].value = this.renderTargets[k];
      }
      this.quad2.material = this.materialMSAA;

      for( var k = 0; k < Math.min( currentSampleOffsets.length - j, this.renderTargets.length ); k ++ ) {
        var i = j + k;

        if( camera.setViewOffset ) {

          camera.setViewOffset( readBuffer.width, readBuffer.height, currentSampleOffsets[i].x, currentSampleOffsets[i].y, readBuffer.width, readBuffer.height );

        }

        renderer.render( this.scene, camera, this.renderTargets[k], true );

      }

      renderer.render( this.scene2, this.camera2, writeBuffer, j === 0 );

    }

    camera.fullWidth = undefined;
    camera.fullHeight = undefined;
    camera.x = undefined;
    camera.y = undefined;
    camera.width = undefined;
    camera.height = undefined;
    camera.updateProjectionMatrix();

    renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );

  }
};

THREE.MSAAPass.normalizedJitterVectors = function() {
  var xfrm = new THREE.Matrix4().makeScale( 1 / 16.0, 1/ 16.0, 0 );

  return function( jitterVectors ) {
    var vectors2 = [];
    for( var i = 0; i < jitterVectors.length; i ++ ) {
      vectors2.push( new THREE.Vector3( jitterVectors[i][0], jitterVectors[i][0] ).applyMatrix4( xfrm ) );
    }
    return vectors2;
  }
}(),

THREE.MSAAPass.JitterVectors = [
  THREE.MSAAPass.normalizedJitterVectors( [
    [  0,  0 ]
  ] ),
  THREE.MSAAPass.normalizedJitterVectors( [
    [  4,  4 ],
    [ -4, -4 ]
  ] ),
  THREE.MSAAPass.normalizedJitterVectors( [
    [ -2, -6 ],
    [  6, -2 ],
    [ -6,  2 ],
    [  2,  6 ]
  ] ),
  THREE.MSAAPass.normalizedJitterVectors( [
    [  1, -3 ],
    [ -1,  3 ],
    [  5,  1 ],
    [ -3, -5 ],
    [ -5,  5 ],
    [ -7, -1 ],
    [  3,  7 ],
    [  7, -7 ]
  ] ),
  THREE.MSAAPass.normalizedJitterVectors( [
    [  1,  1 ],
    [ -1, -3 ],
    [ -3,  2 ],
    [  4, -1 ],

    [ -5, -2 ],
    [  2,  5 ],
    [  5,  3 ],
    [  3, -5 ],

    [ -2,  6 ],
    [  0, -7 ],
    [ -4, -6 ],
    [ -6,  4 ],

    [ -8,  0 ],
    [  7, -4 ],
    [  6,  7 ],
    [ -7, -8 ]
  ] ),
  THREE.MSAAPass.normalizedJitterVectors( [
    [ -4, -7 ],
    [ -7, -5 ],
    [ -3, -5 ],
    [ -5, -4 ],

    [ -1, -4 ],
    [ -2, -2 ],
    [ -6, -1 ],
    [ -4,  0 ],

    [ -7,  1 ],
    [ -1,  2 ],
    [ -6,  3 ],
    [ -3,  3 ],

    [ -7,  6 ],
    [ -3,  6 ],
    [ -5,  7 ],
    [ -1,  7 ],

    [  5, -7 ],
    [  1, -6 ],
    [  6, -5 ],
    [  4, -4 ],

    [  2, -3 ],
    [  7, -2 ],
    [  1, -1 ],
    [  4, -1 ],

    [  2,  1 ],
    [  6,  2 ],
    [  0,  4 ],
    [  4,  4 ],

    [  2,  5 ],
    [  7,  5 ],
    [  5,  6 ],
    [  3,  7 ]
  ] )
];
