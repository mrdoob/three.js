/**
 * @author Garrett Johnson / http://gkjohnson.github.io/
 *
 *  Approach from http://john-chapman-graphics.blogspot.com/2013/01/per-object-motion-blur.html
 */
THREE.MotionBlurPass = function ( scene, camera, options = {} ) {

	THREE.Pass.call( this );

	options = Object.assign( {

		samples: 15,
		expandGeometry: 0,
		interpolateGeometry: 1,
		smearIntensity: 1,
		blurTransparent: false,
		renderCameraBlur: true,
		renderTargetScale: 1

	}, options );

	Object.defineProperty( this, 'enabled', {

		set: val => {

			if ( val === false ) {

				this._prevPosMap.clear();
				this._cameraMatricesNeedInitializing = true;

			}

			this._enabled = val;

		},

		get: () => this._enabled

	} );

	this.enabled = true;
	this.needsSwap = true;

	// settings
	this.samples = options.samples;
	this.expandGeometry = options.expandGeometry;
	this.interpolateGeometry = options.interpolateGeometry;
	this.smearIntensity = options.smearIntensity;
	this.blurTransparent = options.blurTransparent;
	this.renderCameraBlur = options.renderCameraBlur;
	this.renderTargetScale = options.renderTargetScale;

	this.scene = scene;
	this.camera = camera;

	this.debug = {

		display: THREE.MotionBlurPass.DEFAULT,
		dontUpdateState: false

	};

	// list of positions from previous frames
	this._prevPosMap = new Map();
	this._frustum = new THREE.Frustum();
	this._projScreenMatrix = new THREE.Matrix4();
	this._cameraMatricesNeedInitializing = true;
	this._prevClearColor = new THREE.Color();
	this._clearColor = new THREE.Color( 0, 0, 0 );

	// render targets
	this._velocityBuffer =
		new THREE.WebGLRenderTarget( 256, 256, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBFormat,
			type: THREE.HalfFloatType
		} );
	this._velocityBuffer.texture.name = "MotionBlurPass.Velocity";
	this._velocityBuffer.texture.generateMipmaps = false;

	this._prevCamProjection = new THREE.Matrix4();
	this._prevCamWorldInverse = new THREE.Matrix4();

	this._velocityMaterial = this.getVelocityMaterial();
	this._geomMaterial = this.getGeometryMaterial();
	this._compositeMaterial = this.getCompositeMaterial();

	this._compositeCamera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this._compositeScene = new THREE.Scene();

	this._quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), this._compositeMaterial );
	this._quad.frustumCulled = false;
	this._compositeScene.add( this._quad );

};

THREE.MotionBlurPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.MotionBlurPass,

	dispose: function () {

		this._velocityBuffer.dispose();
		this._prevPosMap.clear();

	},

	setSize: function ( width, height ) {

		this._velocityBuffer.setSize( width * this.renderTargetScale, height * this.renderTargetScale );

	},

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		// Set the clear state
		this._prevClearColor.copy( renderer.getClearColor() );
		var prevClearAlpha = renderer.getClearAlpha();
		var prevAutoClear = renderer.autoClear;
		renderer.autoClear = false;
		renderer.setClearColor( this._clearColor, 0 );

		// Traversal function for iterating down and rendering the scene
		var self = this;
		var newMap = new Map();
		function recurse( obj ) {

			if ( obj.visible === false ) return;

			if ( obj.type === 'Mesh' || obj.type === 'SkinnedMesh' ) {

				self._drawMesh( renderer, obj );

				// Recreate the map of drawn geometry so we can
				// drop references to removed meshes
				if ( self._prevPosMap.has( obj ) ) {

					newMap.set( obj, self._prevPosMap.get( obj ) );

				}

			}

			for ( var i = 0, l = obj.children.length; i < l; i ++ ) {

				recurse( obj.children[ i ] );

			}

		}

		// TODO: This is getting called just to set 'currentRenderState' in the renderer
		renderer.compile( this.scene, this.camera );

		// If we're rendering the blurred view, then we need to render
		// to the velocity buffer, otherwise we can render a debug view
		if ( this.debug.display === THREE.MotionBlurPass.DEFAULT ) {

			renderer.setRenderTarget( this._velocityBuffer );

		} else {

			renderer.setRenderTarget( this.renderToScreen ? null : writeBuffer );

		}

		// reinitialize the camera matrices to the current pos becaues if
		// the pass has been disabeled then the matrices will be out of date
		if ( this._cameraMatricesNeedInitializing ) {

			this._prevCamWorldInverse.copy( this.camera.matrixWorldInverse );
			this._prevCamProjection.copy( this.camera.projectionMatrix );
			this._cameraMatricesNeedInitializing = false;

		}

		this._projScreenMatrix.multiplyMatrices( this.camera.projectionMatrix, this.camera.matrixWorldInverse );
		this._frustum.setFromMatrix( this._projScreenMatrix );
		renderer.clear();
		recurse( this.scene );

		// replace the old map with a new one storing only
		// the most recently traversed meshes
		this._prevPosMap.clear();
		this._prevPosMap = newMap;

		this._prevCamWorldInverse.copy( this.camera.matrixWorldInverse );
		this._prevCamProjection.copy( this.camera.projectionMatrix );

		// compose the final blurred frame
		if ( this.debug.display === THREE.MotionBlurPass.DEFAULT ) {

			var cmat = this._compositeMaterial;
			cmat.uniforms.sourceBuffer.value = readBuffer.texture;
			cmat.uniforms.velocityBuffer.value = this._velocityBuffer.texture;

			if ( cmat.defines.SAMPLES !== this.samples ) {

				cmat.defines.SAMPLES = Math.max( 0, Math.floor( this.samples ) );
				cmat.needsUpdate = true;

			}

			renderer.render( this._compositeScene, this._compositeCamera, this.renderToScreen ? null : writeBuffer, true );

		}

		// Restore renderer settings
		renderer.setClearColor( this._prevClearColor, prevClearAlpha );
		renderer.autoClear = prevAutoClear;

	},

	_getMaterialState( obj ) {

		var data = this._prevPosMap.get( obj );
		if ( data === undefined ) {

			data = {

				matrixWorld: obj.matrixWorld.clone(),
				geometryMaterial: this._geomMaterial.clone(),
				velocityMaterial: this._velocityMaterial.clone(),
				boneMatrices: null,
				boneTexture: null,

			};
			this._prevPosMap.set( obj, data );

		}

		var isSkinned = obj.type === 'SkinnedMesh' && obj.skeleton && obj.skeleton.bones && obj.skeleton.boneMatrices;

		data.geometryMaterial.skinning = isSkinned;
		data.velocityMaterial.skinning = isSkinned;

		// copy the skeleton state into the prevBoneTexture uniform
		var skeleton = obj.skeleton;
		if ( isSkinned && ( data.boneMatrices === null || data.boneMatrices.length !== skeleton.boneMatrices.length ) ) {

			var boneMatrices = new Float32Array( skeleton.boneMatrices.length );
			boneMatrices.set( skeleton.boneMatrices );
			data.boneMatrices = boneMatrices;

			var size = Math.sqrt( skeleton.boneMatrices.length / 4 );
			var boneTexture = new THREE.DataTexture( boneMatrices, size, size, THREE.RGBAFormat, THREE.FloatType );
			boneTexture.needsUpdate = true;

			data.geometryMaterial.uniforms.prevBoneTexture.value = boneTexture;
			data.velocityMaterial.uniforms.prevBoneTexture.value = boneTexture;
			data.boneTexture = boneTexture;

		}

		return data;

	},

	_saveMaterialState( obj ) {

		var data = this._prevPosMap.get( obj );

		if ( data.boneMatrices !== null ) {

			data.boneMatrices.set( obj.skeleton.boneMatrices );
			data.boneTexture.needsUpdate = true;

		}

		data.matrixWorld.copy( obj.matrixWorld );

	},

	_drawMesh( renderer, obj ) {

		var blurTransparent = this.blurTransparent;
		var renderCameraBlur = this.renderCameraBlur;
		var expandGeometry = this.expandGeometry;
		var interpolateGeometry = this.interpolateGeometry;
		var smearIntensity = this.smearIntensity;
		var overrides = obj.motionBlur;
		if ( overrides ) {

			if ( 'blurTransparent' in overrides ) blurTransparent = overrides.blurTransparent;
			if ( 'renderCameraBlur' in overrides ) renderCameraBlur = overrides.renderCameraBlur;
			if ( 'expandGeometry' in overrides ) expandGeometry = overrides.expandGeometry;
			if ( 'interpolateGeometry' in overrides ) interpolateGeometry = overrides.interpolateGeometry;
			if ( 'smearIntensity' in overrides ) smearIntensity = overrides.smearIntensity;

		}

		var skip = blurTransparent === false && ( obj.material.transparent || obj.material.alpha < 1 );
		skip = skip || obj.frustumCulled && ! this._frustum.intersectsObject( obj );
		if ( skip ) {

			if ( this._prevPosMap.has( obj ) && this.debug.dontUpdateState === false ) {

				this._saveMaterialState( obj );

			}
			return;

		}

		var data = this._getMaterialState( obj );
		var mat = this.debug.display === THREE.MotionBlurPass.GEOMETRY ? data.geometryMaterial : data.velocityMaterial;
		mat.uniforms.expandGeometry.value = expandGeometry;
		mat.uniforms.interpolateGeometry.value = Math.min( 1, Math.max( 0, interpolateGeometry ) );
		mat.uniforms.smearIntensity.value = smearIntensity;

		var projMat = renderCameraBlur ? this._prevCamProjection : this.camera.projectionMatrix;
		var invMat = renderCameraBlur ? this._prevCamWorldInverse : this.camera.matrixWorldInverse;
		mat.uniforms.prevProjectionMatrix.value.copy( projMat );
		mat.uniforms.prevModelViewMatrix.value.multiplyMatrices( invMat, data.matrixWorld );

		renderer.renderBufferDirect( this.camera, null, obj.geometry, mat, obj, null );

		if ( this.debug.dontUpdateState === false ) {

			this._saveMaterialState( obj );

		}

	},

	// Shaders
	getPrevSkinningParsVertex: function () {

		// Modified THREE.ShaderChunk.skinning_pars_vertex to handle
		// a second set of bone information from the previou frame
		return `
		#ifdef USE_SKINNING
			#ifdef BONE_TEXTURE
				uniform sampler2D prevBoneTexture;
				mat4 getPrevBoneMatrix( const in float i ) {
					float j = i * 4.0;
					float x = mod( j, float( boneTextureSize ) );
					float y = floor( j / float( boneTextureSize ) );
					float dx = 1.0 / float( boneTextureSize );
					float dy = 1.0 / float( boneTextureSize );
					y = dy * ( y + 0.5 );
					vec4 v1 = texture2D( prevBoneTexture, vec2( dx * ( x + 0.5 ), y ) );
					vec4 v2 = texture2D( prevBoneTexture, vec2( dx * ( x + 1.5 ), y ) );
					vec4 v3 = texture2D( prevBoneTexture, vec2( dx * ( x + 2.5 ), y ) );
					vec4 v4 = texture2D( prevBoneTexture, vec2( dx * ( x + 3.5 ), y ) );
					mat4 bone = mat4( v1, v2, v3, v4 );
					return bone;
				}
			#else
				uniform mat4 prevBoneMatrices[ MAX_BONES ];
				mat4 getPrevBoneMatrix( const in float i ) {
					mat4 bone = prevBoneMatrices[ int(i) ];
					return bone;
				}
			#endif
		#endif
		`;

	},

	getVertexTransform: function () {

		// Returns the body of the vertex shader for the velocity buffer and
		// outputs the position of the current and last frame positions
		return `
		vec3 transformed;

		// Get the normal
		${ THREE.ShaderChunk.skinbase_vertex }
		${ THREE.ShaderChunk.beginnormal_vertex }
		${ THREE.ShaderChunk.skinnormal_vertex }
		${ THREE.ShaderChunk.defaultnormal_vertex }

		// Get the current vertex position
		transformed = vec3( position );
		${ THREE.ShaderChunk.skinning_vertex }
		newPosition = modelViewMatrix * vec4(transformed, 1.0);

		// Get the previous vertex position
		transformed = vec3( position );
		${ THREE.ShaderChunk.skinbase_vertex.replace( /mat4 /g, '' ).replace( /getBoneMatrix/g, 'getPrevBoneMatrix' ) }
		${ THREE.ShaderChunk.skinning_vertex.replace( /vec4 /g, '' ) }
		prevPosition = prevModelViewMatrix * vec4(transformed, 1.0);

		// The delta between frames
		vec3 delta = newPosition.xyz - prevPosition.xyz;
		vec3 direction = normalize(delta);

		// Stretch along the velocity axes
		// TODO: Can we combine the stretch and expand
		float stretchDot = dot(direction, transformedNormal);
		vec4 expandDir = vec4(direction, 0.0) * stretchDot * expandGeometry * length(delta);
		vec4 newPosition2 =  projectionMatrix * (newPosition + expandDir);
		vec4 prevPosition2 = prevProjectionMatrix * (prevPosition + expandDir);

		newPosition =  projectionMatrix * newPosition;
		prevPosition = prevProjectionMatrix * prevPosition;

		gl_Position = mix(newPosition2, prevPosition2, interpolateGeometry * (1.0 - step(0.0, stretchDot) ) );

		`;

	},

	getVelocityMaterial: function () {

		return new THREE.ShaderMaterial( {

			uniforms: {
				prevProjectionMatrix: { value: new THREE.Matrix4() },
				prevModelViewMatrix: { value: new THREE.Matrix4() },
				prevBoneTexture: { value: null },
				expandGeometry: { value: 0 },
				interpolateGeometry: { value: 1 },
				smearIntensity: { value: 1 }
			},

			vertexShader:
				`
				${ THREE.ShaderChunk.skinning_pars_vertex }
				${ this.getPrevSkinningParsVertex() }

				uniform mat4 prevProjectionMatrix;
				uniform mat4 prevModelViewMatrix;
				uniform float expandGeometry;
				uniform float interpolateGeometry;
				varying vec4 prevPosition;
				varying vec4 newPosition;

				void main() {

					${ this.getVertexTransform() }

				}`,

			fragmentShader:
				`
				uniform float smearIntensity;
				varying vec4 prevPosition;
				varying vec4 newPosition;

				void main() {
					vec3 vel;
					vel = (newPosition.xyz / newPosition.w) - (prevPosition.xyz / prevPosition.w);

					gl_FragColor = vec4(vel * smearIntensity, 1.0);
				}`
		} );

	},

	getGeometryMaterial: function () {

		return new THREE.ShaderMaterial( {

			uniforms: {
				prevProjectionMatrix: { value: new THREE.Matrix4() },
				prevModelViewMatrix: { value: new THREE.Matrix4() },
				prevBoneTexture: { value: null },
				expandGeometry: { value: 0 },
				interpolateGeometry: { value: 1 },
				smearIntensity: { value: 1 }
			},

			vertexShader:
				`
				${ THREE.ShaderChunk.skinning_pars_vertex }
				${ this.getPrevSkinningParsVertex() }

				uniform mat4 prevProjectionMatrix;
				uniform mat4 prevModelViewMatrix;
				uniform float expandGeometry;
				uniform float interpolateGeometry;
				varying vec4 prevPosition;
				varying vec4 newPosition;
				varying vec3 color;

				void main() {

					${ this.getVertexTransform() }

					color = (modelViewMatrix * vec4(normal.xyz, 0)).xyz;
					color = normalize(color);

				}`,

			fragmentShader:
				`
				varying vec3 color;

				void main() {
					gl_FragColor = vec4(color, 1);
				}`
		} );

	},

	getCompositeMaterial: function () {

		return new THREE.ShaderMaterial( {

			defines: {
				SAMPLES: 30
			},

			uniforms: {
				sourceBuffer: { value: null },
				velocityBuffer: { value: null }
			},

			vertexShader:
				`
				varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}
				`,

			fragmentShader:
				`
				varying vec2 vUv;
				uniform sampler2D sourceBuffer;
				uniform sampler2D velocityBuffer;
				void main() {

					vec2 vel = texture2D(velocityBuffer, vUv).xy;
					vec4 result = texture2D(sourceBuffer, vUv);

					for(int i = 1; i <= SAMPLES; i ++) {

						vec2 offset = vel * (float(i - 1) / float(SAMPLES) - 0.5);
						result += texture2D(sourceBuffer, vUv + offset);

					}

					result /= float(SAMPLES + 1);

					gl_FragColor = result;

				}
				`

		} );

	}

} );

THREE.MotionBlurPass.DEFAULT = 0;
THREE.MotionBlurPass.VELOCITY = 1;
THREE.MotionBlurPass.GEOMETRY = 2;
