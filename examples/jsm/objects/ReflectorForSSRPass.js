import {
	Color,
	LinearFilter,
	MathUtils,
	Matrix4,
	Mesh,
	PerspectiveCamera,
	Plane,
	RGBFormat,
	ShaderMaterial,
	UniformsUtils,
	Vector3,
	Vector4,
	WebGLRenderTarget,
	DepthTexture,
	UnsignedShortType,
	NearestFilter
} from '../../../build/three.module.js';

var Reflector = function ( geometry, options ) {

	Mesh.call( this, geometry );

	this.type = 'Reflector';

	var scope = this;

	options = options || {};

	var color = ( options.color !== undefined ) ? new Color( options.color ) : new Color( 0x7F7F7F );
	var textureWidth = options.textureWidth || 512;
	var textureHeight = options.textureHeight || 512;
	var clipBias = options.clipBias || 0;
	var shader = options.shader || Reflector.ReflectorShader;
	var useDepthTexture = options.useDepthTexture
	var yAxis = new Vector3(0, 1, 0);
	var vecTemp0 = new Vector3();
	var vecTemp1 = new Vector3();

	//

	scope.needsUpdate = false;
	scope.maxDistance = Reflector.ReflectorShader.uniforms.maxDistance.value
	scope.opacity = Reflector.ReflectorShader.uniforms.opacity.value

  scope._isDistanceAttenuation = Reflector.ReflectorShader.defines.isDistanceAttenuation
  Object.defineProperty(scope, 'isDistanceAttenuation', {
    get() {
      return scope._isDistanceAttenuation
    },
    set(val) {
      if (scope._isDistanceAttenuation === val) return
      scope._isDistanceAttenuation = val
      scope.material.defines.isDistanceAttenuation = val
      scope.material.needsUpdate = true
    }
	})

  scope._isFresnel = Reflector.ReflectorShader.defines.isFresnel
  Object.defineProperty(scope, 'isFresnel', {
    get() {
      return scope._isFresnel
    },
    set(val) {
      if (scope._isFresnel === val) return
      scope._isFresnel = val
      scope.material.defines.isFresnel = val
      scope.material.needsUpdate = true
    }
	})

	var reflectorPlane = new Plane();
	var normal = new Vector3();
	var reflectorWorldPosition = new Vector3();
	var cameraWorldPosition = new Vector3();
	var rotationMatrix = new Matrix4();
	var lookAtPosition = new Vector3( 0, 0, - 1 );
	var clipPlane = new Vector4();

	var view = new Vector3();
	var target = new Vector3();
	var q = new Vector4();

	var textureMatrix = new Matrix4();
	var virtualCamera = new PerspectiveCamera();

	if( useDepthTexture ){
		var depthTexture = new DepthTexture();
		depthTexture.type = UnsignedShortType;
		depthTexture.minFilter = NearestFilter;
		depthTexture.maxFilter = NearestFilter;
	}

	var parameters = {
		minFilter: LinearFilter,
		magFilter: LinearFilter,
		format: RGBFormat,
    depthTexture: useDepthTexture ? depthTexture : null,
	};

	var renderTarget = new WebGLRenderTarget( textureWidth, textureHeight, parameters );

	if ( ! MathUtils.isPowerOfTwo( textureWidth ) || ! MathUtils.isPowerOfTwo( textureHeight ) ) {

		renderTarget.texture.generateMipmaps = false;

	}

	var material = new ShaderMaterial( {
		transparent: useDepthTexture,
    defines: Object.assign({
      useDepthTexture: useDepthTexture
    }, Reflector.ReflectorShader.defines),
		uniforms: UniformsUtils.clone( shader.uniforms ),
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader
	} );

	material.uniforms[ 'tDiffuse' ].value = renderTarget.texture;
	material.uniforms[ 'color' ].value = color;
	material.uniforms[ 'textureMatrix' ].value = textureMatrix;
	if (useDepthTexture) {
		material.uniforms[ 'tDepth' ].value = renderTarget.depthTexture;
	}

	this.material = material;

	this.doRender = function ( renderer, scene, camera ) {

		material.uniforms['maxDistance'].value = scope.maxDistance * (camera.position.length() / camera.position.y);
		///todo: Temporary hack,
		// need precise calculation like this https://github.com/mrdoob/three.js/pull/20156/commits/8181946068e386d14a283cbd4f8877bc7ae066d3 ,
		// after fully understand http://www.terathon.com/lengyel/Lengyel-Oblique.pdf .

		material.uniforms['opacity'].value = scope.opacity;

		vecTemp0.copy(camera.position).normalize();
		vecTemp1.copy(vecTemp0).reflect(yAxis);
		material.uniforms['fresnel'].value = (vecTemp0.dot( vecTemp1 ) + 1.) / 2.; ///todo: Also need to use glsl viewPosition and viewNormal per pixel.
		// console.log(material.uniforms['fresnel'].value)

		reflectorWorldPosition.setFromMatrixPosition( scope.matrixWorld );
		cameraWorldPosition.setFromMatrixPosition( camera.matrixWorld );

		rotationMatrix.extractRotation( scope.matrixWorld );

		normal.set( 0, 0, 1 );
		normal.applyMatrix4( rotationMatrix );

		view.subVectors( reflectorWorldPosition, cameraWorldPosition );

		// Avoid rendering when reflector is facing away

		if ( view.dot( normal ) > 0 ) return;

		view.reflect( normal ).negate();
		view.add( reflectorWorldPosition );

		rotationMatrix.extractRotation( camera.matrixWorld );

		lookAtPosition.set( 0, 0, - 1 );
		lookAtPosition.applyMatrix4( rotationMatrix );
		lookAtPosition.add( cameraWorldPosition );

		target.subVectors( reflectorWorldPosition, lookAtPosition );
		target.reflect( normal ).negate();
		target.add( reflectorWorldPosition );

		virtualCamera.position.copy( view );
		virtualCamera.up.set( 0, 1, 0 );
		virtualCamera.up.applyMatrix4( rotationMatrix );
		virtualCamera.up.reflect( normal );
		virtualCamera.lookAt( target );

		virtualCamera.far = camera.far; // Used in WebGLBackground

		virtualCamera.updateMatrixWorld();
		virtualCamera.projectionMatrix.copy( camera.projectionMatrix );

		// Update the texture matrix
		textureMatrix.set(
			0.5, 0.0, 0.0, 0.5,
			0.0, 0.5, 0.0, 0.5,
			0.0, 0.0, 0.5, 0.5,
			0.0, 0.0, 0.0, 1.0
		);
		textureMatrix.multiply( virtualCamera.projectionMatrix );
		textureMatrix.multiply( virtualCamera.matrixWorldInverse );
		textureMatrix.multiply( scope.matrixWorld );

		// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
		// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
		reflectorPlane.setFromNormalAndCoplanarPoint( normal, reflectorWorldPosition );
		reflectorPlane.applyMatrix4( virtualCamera.matrixWorldInverse );

		clipPlane.set( reflectorPlane.normal.x, reflectorPlane.normal.y, reflectorPlane.normal.z, reflectorPlane.constant );

		var projectionMatrix = virtualCamera.projectionMatrix;

		q.x = ( Math.sign( clipPlane.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
		q.y = ( Math.sign( clipPlane.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
		q.z = - 1.0;
		q.w = ( 1.0 + projectionMatrix.elements[ 10 ] ) / projectionMatrix.elements[ 14 ];

		// Calculate the scaled plane vector
		clipPlane.multiplyScalar( 2.0 / clipPlane.dot( q ) );

		// Replacing the third row of the projection matrix
		projectionMatrix.elements[ 2 ] = clipPlane.x;
		projectionMatrix.elements[ 6 ] = clipPlane.y;
		projectionMatrix.elements[ 10 ] = clipPlane.z + 1.0 - clipBias;
		projectionMatrix.elements[ 14 ] = clipPlane.w;

		// Render

		renderTarget.texture.encoding = renderer.outputEncoding;

		// scope.visible = false;

		var currentRenderTarget = renderer.getRenderTarget();

		var currentXrEnabled = renderer.xr.enabled;
		var currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

		renderer.xr.enabled = false; // Avoid camera modification
		renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows

		renderer.setRenderTarget( renderTarget );

		renderer.state.buffers.depth.setMask( true ); // make sure the depth buffer is writable so it can be properly cleared, see #18897

		if ( renderer.autoClear === false ) renderer.clear();
		renderer.render( scene, virtualCamera );

		renderer.xr.enabled = currentXrEnabled;
		renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

		renderer.setRenderTarget( currentRenderTarget );

		// Restore viewport

		var viewport = camera.viewport;

		if ( viewport !== undefined ) {

			renderer.state.viewport( viewport );

		}

		// scope.visible = true;

	};

	this.getRenderTarget = function () {

		return renderTarget;

	};

};

Reflector.prototype = Object.create( Mesh.prototype );
Reflector.prototype.constructor = Reflector;

Reflector.ReflectorShader = { ///todo: Will conflict with Reflector.js?

  defines: {
    isDistanceAttenuation: true,
    isFresnel: true,
  },

	uniforms: {

		color: { value: null },
		tDiffuse: { value: null },
		tDepth: { value: null },
		textureMatrix: { value: null },
    maxDistance: { value: 180 },
    opacity: { value: .5 },
    fresnel: { value: null },

	},

	vertexShader: [
		'uniform mat4 textureMatrix;',
		'varying vec4 vUv;',

		'void main() {',

		'	vUv = textureMatrix * vec4( position, 1.0 );',

		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

		'}'
	].join( '\n' ),

	fragmentShader: `
		uniform vec3 color;
		uniform sampler2D tDiffuse;
		uniform sampler2D tDepth;
		uniform float maxDistance;
		uniform float opacity;
		uniform float fresnel;
		varying vec4 vUv;
		float blendOverlay( float base, float blend ) {
			return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );
		}
		vec3 blendOverlay( vec3 base, vec3 blend ) {
			return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );
		}
		void main() {
			vec4 base = texture2DProj( tDiffuse, vUv );
			#ifdef useDepthTexture
				float op=opacity;
				float depth = texture2DProj( tDepth, vUv ).r;
				if(depth>maxDistance) discard;
				#ifdef isDistanceAttenuation
					float ratio=1.-(depth/maxDistance);
					float attenuation=ratio*ratio;
					op=opacity*attenuation;
				#endif
				#ifdef isFresnel
					op*=fresnel;
				#endif
				gl_FragColor = vec4( blendOverlay( base.rgb, color ), op );
			#else
				gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );
			#endif
		}
	`,
};

export { Reflector };
