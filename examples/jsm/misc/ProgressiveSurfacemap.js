import * as THREE from '../../../build/three.module.js';

/**
 * Progressive Surface Map Accumulator, by [zalo](https://github.com/zalo/)
 *
 * To use, simply construct a `ProgressiveSurfacemap` object,
 *  `psmap.add(object)` a set of objects to the class, 
 * and call `psmap.update(camera)` every frame.
 * 
 * This should begin accumulating surface maps to your object, 
 * so you can start jittering lighting and other features to
 * achieve the texture-space effect you're looking for.
 *
 * @param {Scene} scene The scene the objects are contextualized in
 * @param {WebGLRenderer} renderer A WebGL Rendering Context
 */
var ProgressiveSurfacemap = function (renderer) {

	this.surfacemapContainers = [];
	this.blurringPlane = null;
	this.compiled = false;
	this.scene = new THREE.Scene();
	this.scene.background = null;
	let tinyTarget = new THREE.WebGLRenderTarget(1, 1);

	/**
	 * Replaces this objects' material with a surface map to be rendered to later.
	 * @param {Object3D} object The object to create a surfacemap for.
	 * @param {number} res The square resolution of this object's surfacemap.
	 */
    this.add = function (object, res = 512) {
		if (object.isLight) { this.scene.attach(object); return; }

		// Create the Progressive Surfacemap Texture
		let format = /(iPad|iPhone|iPod)/g.test(navigator.userAgent) ? THREE.HalfFloatType : THREE.FloatType;
		let progressiveSurfacemap1 = new THREE.WebGLRenderTarget(res, res, { type: format });
		let progressiveSurfacemap2 = new THREE.WebGLRenderTarget(res, res, { type: format });

		if(this.blurringPlane == null) { this._initializeBlurPlane(res, progressiveSurfacemap1); }

		// Inject some spicy new logic into a standard phong material
		let oldMaterial = new THREE.MeshPhongMaterial();
		oldMaterial.uniforms = {};
		oldMaterial.onBeforeCompile = (shader) => {
			// Set Vertex Positions to the Unwrapped UV Positions
			shader.vertexShader =
				'#define USE_UV\n' +
				shader.vertexShader.slice(0, -1) +
				'	gl_Position = vec4((uv - 0.5) * 2.0, 1.0, 1.0); }';
			
			// Set Pixels to average in the Previous frame's Shadows
			let bodyStart	= shader.fragmentShader.indexOf('void main() {');
			shader.fragmentShader =
				'#define USE_UV\n'+
				shader.fragmentShader.slice(0, bodyStart) +
				'	uniform sampler2D previousShadowMap;\n	uniform float averagingWindow;\n' +
				shader.fragmentShader.slice(   bodyStart-1, -1) +
					`\nvec3 texelOld = texture(previousShadowMap, vUv).rgb;
					gl_FragColor.rgb = mix(texelOld, gl_FragColor.rgb, 1.0/averagingWindow);
				}`;
			
			// Set the Previous Frame's Texture Buffer and Averaging Window
			shader.uniforms.previousShadowMap = { value: progressiveSurfacemap1.texture };
			shader.uniforms.averagingWindow   = { value: 100 };

			oldMaterial.uniforms = shader.uniforms;
			
			// Set the new Shader to this
			oldMaterial.userData.shader = shader;

			this.compiled = true;
		};

		// Apply the lightmap to the object
		object.material.lightMap  = progressiveSurfacemap2.texture;
		object.material.dithering = true;
		object.castShadow         = true;
		object.receiveShadow      = true;

		// For now, clone the existing UVs over to the Lightmap UV Channel
		if (object.geometry.hasAttribute("uv")) {
			let uv1 = object.geometry.getAttribute("uv");
			object.geometry.setAttribute("uv2", uv1.clone());
		}

		this.surfacemapContainers.push({
			basicMat: object.material,
			uvMat   : oldMaterial,
			object  : object,
			surfacemap1: progressiveSurfacemap1,
			surfacemap2: progressiveSurfacemap2,
			buffer1Active: false
		});

		this.compiled = false;
	}

	/**
	 * This function renders each mesh one at a time into their respective surface maps
	 * @param {Camera} camera Standard Rendering Camera
	 * @param {number} blendWindow When >1, samples will accumulate over time.
	 * @param {boolean} blurEdges  Whether to fix UV Edges via blurring
	 */
	this.update = function (camera, blendWindow = 100, blurEdges = true) {
		// Whether or not to blur the edges of the lightmap...
		this.blurringPlane.visible = blurEdges;

		// Phase 1: Bake Shadows
		for (let l = 0; l < this.surfacemapContainers.length; l++) {
			// Steal the Object3D from the real world to our special dimension
			this.surfacemapContainers[l].object.oldScene = this.surfacemapContainers[l].object.parent;
			this.scene.attach(this.surfacemapContainers[l].object);
		}

		// Render once to bake the shadows
		let oldTarget = renderer.getRenderTarget();
		renderer.setRenderTarget(tinyTarget); // Tiny Target Hopefully keeps this from being expensive...
		renderer.render(this.scene, camera);

		// Add them back to the outer scene to hide them from this one...
		for (let l = 0; l < this.surfacemapContainers.length; l++) {
			this.surfacemapContainers[l].object.oldScene.attach(this.surfacemapContainers[l].object);
		}

		// Phase 2: Iterate and render each object's surface maps individually
		for (let l = 0; l < this.surfacemapContainers.length; l++){
			// Steal the Object3D from the real world to our special dimension
			let oldScene = this.surfacemapContainers[l].object.parent;
			this.scene.attach(this.surfacemapContainers[l].object);

			// Set each object's material to the UV Unwrapped Surface Mapping Version
			this.surfacemapContainers[l].uvMat .uniforms.averagingWindow = { value: blendWindow };
			this.surfacemapContainers[l].object.material                 = this.surfacemapContainers[l].uvMat;

			// Ping-pong two surface buffers for reading/writing
			let activeMap = this.surfacemapContainers[l].buffer1Active ?
				this.surfacemapContainers[l].surfacemap1 :
				this.surfacemapContainers[l].surfacemap2;
			let inactiveMap = this.surfacemapContainers[l].buffer1Active ?
				this.surfacemapContainers[l].surfacemap2 :
				this.surfacemapContainers[l].surfacemap1;
			
			// Render the object's surface maps
			renderer.setRenderTarget(activeMap);
			this.surfacemapContainers[l].uvMat.uniforms.previousShadowMap = { value: inactiveMap.texture };
			this.blurringPlane.material       .uniforms.previousShadowMap = { value: inactiveMap.texture };
			this.surfacemapContainers[l].buffer1Active = !this.surfacemapContainers[l].buffer1Active;
			renderer.render( this.scene, camera );

			// Restore the object's Real-time Material and add it back to the original world
			this.surfacemapContainers[l].object.material = this.surfacemapContainers[l].basicMat;
			oldScene.attach(this.surfacemapContainers[l].object);
		}
		renderer.setRenderTarget(oldTarget);
	}
	
	/**
	 * INTERNAL Creates the Blurring Plane 
	 * @param {number} res The square resolution of this object's surfacemap.
	 */
	this._initializeBlurPlane = function(res, shadowMap = null) {
		let blurMaterial = new THREE.MeshBasicMaterial();
		blurMaterial.uniforms = { previousShadowMap : { value: null    },
								  pixelOffset       : { value: 1.0/res },
								  polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 3.0};
		blurMaterial.onBeforeCompile = (shader) => {
			// Set Vertex Positions to the Unwrapped UV Positions
			shader.vertexShader =
				'#define USE_UV\n' +
				shader.vertexShader.slice(0, -1) +
				'	gl_Position = vec4((uv - 0.5) * 2.0, 1.0, 1.0); }';
			
			// Set Pixels to 9-tap box blur the current frame's Shadows
			let bodyStart	= shader.fragmentShader.indexOf('void main() {');
			shader.fragmentShader =
				'#define USE_UV\n'+
				shader.fragmentShader.slice(0, bodyStart) +
				'	uniform sampler2D previousShadowMap;\n	uniform float pixelOffset;\n' +
				shader.fragmentShader.slice(   bodyStart-1, -1) +
					`	gl_FragColor.rgb = (
									texture(previousShadowMap, vUv + vec2( pixelOffset,  0.0		)).rgb + 
									texture(previousShadowMap, vUv + vec2( 0.0		,  pixelOffset)).rgb +
									texture(previousShadowMap, vUv + vec2( 0.0		, -pixelOffset)).rgb +
									texture(previousShadowMap, vUv + vec2(-pixelOffset,  0.0		)).rgb +
									texture(previousShadowMap, vUv + vec2( pixelOffset,  pixelOffset)).rgb + 
									texture(previousShadowMap, vUv + vec2(-pixelOffset,  pixelOffset)).rgb +
									texture(previousShadowMap, vUv + vec2( pixelOffset, -pixelOffset)).rgb +
									texture(previousShadowMap, vUv + vec2(-pixelOffset, -pixelOffset)).rgb)/8.0;
				}`;
			
			// Set the Frame's Texture Buffer
			shader.uniforms.previousShadowMap = { value: shadowMap.texture };
			shader.uniforms.pixelOffset       = { value: 0.5/res           };
			blurMaterial.uniforms             = shader.uniforms;
			
			// Set the new Shader to this
			blurMaterial.userData.shader = shader;

			this.compiled = true;
		};

		this.blurringPlane = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), blurMaterial);
		this.blurringPlane.name = "Blurring Plane"
		this.blurringPlane.frustumCulled = false;
		this.scene.add(this.blurringPlane);
	}
}

export { ProgressiveSurfacemap };