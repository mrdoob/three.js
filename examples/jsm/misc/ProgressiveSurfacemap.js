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
var ProgressiveSurfacemap = function (scene, renderer) {

	this.surfacemapContainers = [];
	this.blurringPlane = null;
	this.compiled = false;
	this.excludedObjects = [];

	/**
	 * Replaces this objects' material with a surface map to be rendered to later.
	 * @param {Object3D} object The object to create a surfacemap for.
	 * @param {number} res The square resolution of this object's surfacemap.
	 */
	this.add = function(object, res = 512) {
		// Create the Progressive Surfacemap Texture
		let progressiveSurfacemap1 = new THREE.WebGLRenderTarget(res, res, { type: THREE.FloatType });
		let progressiveSurfacemap2 = new THREE.WebGLRenderTarget(res, res, { type: THREE.FloatType });

		if(this.blurringPlane == null) { this._initializeBlurPlane(res, progressiveSurfacemap1); }

		// Inject some spicy new logic into whatever material this object has
		let oldMaterial = object.material.clone();
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

		// MeshBasicMaterial just renders the accumulated texture, no surfaceing
		let basicMaterial    = new THREE.MeshBasicMaterial( 
			{dithering: true, map: progressiveSurfacemap2.texture}); 
		object.material      = basicMaterial;
		object.castShadow    = true;
		object.receiveShadow = true;

		this.surfacemapContainers.push({
			basicMat: basicMaterial,
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
	this.update = function(camera, blendWindow = 100, blurEdges = true) {
		let originalBackground = scene.background;
		scene.background = null;

		// Don't try anything if the material is not compiled yet
		if (!this.blurringPlane.material.uniforms) { return; }

		// Hide all relevent objects
		scene.traverse( function ( child ) {
			if(child.isMesh){
				child.wasVisible = child.visible; 
				child.visible = false;
			}
		});
		this.excludedObjects.forEach(child => {
			child.wasVisible = child.visible; 
			child.visible = false;
		});

        // Unhide the Blurring Plane (to be placed behind the other objects)
		if (blurEdges) { this.blurringPlane.visible = true; }

		// Iterate render each object's surface map individually
		for (let l = 0; l < this.surfacemapContainers.length; l++){
			// Set each object's material to the UV Unwrapped Surface Mapping Version
			this.surfacemapContainers[l].object.visible                  = true;
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
			renderer.render( scene, camera );
			renderer.setRenderTarget(null);

			// Restore the object's Real-time Material
			this.surfacemapContainers[l].object.material = this.surfacemapContainers[l].basicMat;
			this.surfacemapContainers[l].object.visible = false;
		}

		scene.traverse(function (child) { if (child.isMesh) { child.visible = child.wasVisible; } });
		this.excludedObjects.forEach(child =>               { child.visible = child.wasvisible; });

		// Restore Normal Scene Rendering
		scene.background = originalBackground;
		this.blurringPlane.visible = false;
	}
	
	/**
	 * Excludes an object from the progressive surface mapping routine.
	 * @param {Object3D} toExclude The object to exclude.
	 */
	this.exclude = function (toExclude) {
		this.excludedObjects.push(toExclude);
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
		this.blurringPlane.visible = false;
		this.blurringPlane.name = "Blurring Plane"
		this.blurringPlane.frustumCulled = false;
		scene.add(this.blurringPlane);
	}
}

export { ProgressiveSurfacemap };