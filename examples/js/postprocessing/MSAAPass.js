/**
 * @author bhouston / http://clara.io/ *
 */

THREE.MSAAPass = function ( scene, camera, params ) {

  this.scene = scene;
  this.camera = camera;

  this.sampleLevel = 4; // specified as n, where the number of samples is 2^n, so sampleLevel = 4, is 2^4 samples, 16.

  this.params = params || { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat };
  this.params.minFilter = THREE.NearestFilter;
  this.params.maxFilter = THREE.NearestFilter;
  console.log( 'this.params', this.params );
  this.enabled = true;

  this.needsSwap = true;

  if ( THREE.CompositeShader === undefined ) {
		console.error( "THREE.MSAAPass relies on THREE.CompositeShader" );
	}

  var compositeShader = THREE.CompositeShader;
  this.uniforms = THREE.UniformsUtils.clone( compositeShader.uniforms );

  this.materialComposite = new THREE.ShaderMaterial(  {

		uniforms: this.uniforms,
		vertexShader: compositeShader.vertexShader,
		fragmentShader: compositeShader.fragmentShader,
    transparent: true,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendEquation: THREE.AddEquation,
    depthTest: false,
    depthWrite: false

	} );

  this.camera2 = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
  this.scene2  = new THREE.Scene();
  this.quad2 = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), this.materialComposite );
  this.scene2.add( this.quad2 );

};

THREE.MSAAPass.prototype = {

  dispose: function() {

    if( this.sampleRenderTarget ) {

      this.sampleRenderTarget.dispose();
      this.sampleRenderTarget = null;

    }

  },


	setSize: function ( width, height ) {

		this.sampleRenderTarget.setSize( width, height );

	},

  render: function ( renderer, writeBuffer, readBuffer, delta ) {

    if( ! this.sampleRenderTarget ) {

      this.sampleRenderTarget = new THREE.WebGLRenderTarget( readBuffer.width, readBuffer.height, this.params, "msaa.renderTarget0" );

    }

    var camera = ( this.camera || this.scene.camera );

    var jitterOffsets = THREE.MSAAPass.JitterVectors[ Math.max( 0, Math.min( this.sampleLevel, 5 ) ) ];

    var autoClear = renderer.autoClear;
    renderer.autoClear = false;

    this.uniforms[ "tForeground" ].value = this.sampleRenderTarget;

    // render the scene multiple times, each slightly jitter offset from the last and accumulate the results.
    for( var i = 0; i < jitterOffsets.length; i ++ ) {

      // only jitters perspective cameras.  TODO: add support for jittering orthogonal cameras
      if( camera.setViewOffset ) camera.setViewOffset( readBuffer.width, readBuffer.height, jitterOffsets[i].x, jitterOffsets[i].y, readBuffer.width, readBuffer.height );

      if( i == 0 ) {

        renderer.render( this.scene, camera, writeBuffer, true );

      }
      else {
        renderer.render( this.scene, camera, this.sampleRenderTarget, true );

        // this accumulation strategy is used to prevent decimation at low bit depths with lots of samples.
        this.uniforms[ "scale" ].value = 1.0 / ( i + 1 );

      // clear on the first render, accumulate the others
        renderer.render( this.scene2, this.camera2, writeBuffer, false );
      }

    }

    // reset jitter to nothing.  TODO: add support for orthogonal cameras
    if( camera.setViewOffset ) camera.setViewOffset( undefined, undefined, undefined, undefined, undefined, undefined );
    renderer.autoClear = true;

  }

};

THREE.MSAAPass.normalizedJitterOffsets = function( jitterVectors ) {

  var scaledJitterOffsets = [];

  for( var i = 0; i < jitterVectors.length; i ++ ) {

    scaledJitterOffsets.push( new THREE.Vector2( jitterVectors[i][0], jitterVectors[i][1] ).multiplyScalar( 1.0 / 16.0 ) );

  }

  return scaledJitterOffsets;

},

// These jitter vectors are specified in integers because it is easier.
// I am assuming a [-8,8) integer grid, but it needs to be mapped onto [-0.5,0.5)
// before being used, thus these integers need to be scaled by 1/16.
//
// Sample patterns reference: https://msdn.microsoft.com/en-us/library/windows/desktop/ff476218%28v=vs.85%29.aspx?f=255&MSPPError=-2147217396
THREE.MSAAPass.JitterVectors = [
  THREE.MSAAPass.normalizedJitterOffsets( [
    [  0,  0 ]
  ] ),
  THREE.MSAAPass.normalizedJitterOffsets( [
    [  4,  4 ],
    [ -4, -4 ]
  ] ),
  THREE.MSAAPass.normalizedJitterOffsets( [
    [ -2, -6 ],
    [  6, -2 ],
    [ -6,  2 ],
    [  2,  6 ]
  ] ),
  THREE.MSAAPass.normalizedJitterOffsets( [
    [  1, -3 ],
    [ -1,  3 ],
    [  5,  1 ],
    [ -3, -5 ],
    [ -5,  5 ],
    [ -7, -1 ],
    [  3,  7 ],
    [  7, -7 ]
  ] ),
  THREE.MSAAPass.normalizedJitterOffsets( [
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
  THREE.MSAAPass.normalizedJitterOffsets( [
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
