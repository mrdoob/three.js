import * as THREE from '../../../build/three.module.js';
import { potpack } from '../libs/potpack.module.js';

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
var ProgressiveSurfacemap = function (renderer, res = 1024) {

	this.surfacemapContainers = [];
	this.compiled             = false;
	this.scene                = new THREE.Scene();
	this.scene.background     = null;
	this.tinyTarget           = new THREE.WebGLRenderTarget(1, 1);
	this.buffer1Active        = false;
	this.firstUpdate          = true;

	// Create the Progressive Surfacemap Texture
	let format = /(iPad|iPhone|iPod)/g.test(navigator.userAgent) ? THREE.HalfFloatType : THREE.FloatType;
	this.progressiveSurfacemap1 = new THREE.WebGLRenderTarget(res, res, { type: format });
	this.progressiveSurfacemap2 = new THREE.WebGLRenderTarget(res, res, { type: format });

	// Inject some spicy new logic into a standard phong material
	this.uvMat = new THREE.MeshPhongMaterial();
	this.uvMat.uniforms = {};
	this.uvMat.onBeforeCompile = (shader) => {
		// Set Vertex Positions to the Unwrapped UV Positions
		shader.vertexShader =
			'#define USE_UV\n#define USE_LIGHTMAP\n' +
			shader.vertexShader.slice(0, -1) +
			'	gl_Position = vec4((uv2 - 0.5) * 2.0, 1.0, 1.0); }';

		// Set Pixels to average in the Previous frame's Shadows
		let bodyStart	= shader.fragmentShader.indexOf('void main() {');
		shader.fragmentShader =
			'#define USE_UV\nvarying vec2 vUv2;\n'+
			shader.fragmentShader.slice(0, bodyStart) +
			'	uniform sampler2D previousShadowMap;\n	uniform float averagingWindow;\n' +
			shader.fragmentShader.slice(   bodyStart-1, -1) +
				`\nvec3 texelOld = texture(previousShadowMap, vUv2).rgb;
				gl_FragColor.rgb = mix(texelOld, gl_FragColor.rgb, 1.0/averagingWindow);
			}`;
		
		// Set the Previous Frame's Texture Buffer and Averaging Window
		shader.uniforms.previousShadowMap = { value: this.progressiveSurfacemap1.texture };
		shader.uniforms.averagingWindow   = { value: 100 };

		this.uvMat.uniforms = shader.uniforms;
		
		// Set the new Shader to this
		this.uvMat.userData.shader = shader;

		this.compiled = true;
	};

	/**
	 * Replaces this objects' material with a surface map to be rendered to later.
	 * @param {Object3D} object The object to create a surfacemap for.
	 * @param {number} res The square resolution of this object's surfacemap.
	 */
	this.addObjectsToLightMap = function (objects) {
		// Prepare list of UV bounding boxes for packing later...
		this.uv_boxes = []; let padding = 3/res;

		for (let ob = 0; ob < objects.length; ob++){
			let object = objects[ob];
			if (object.isLight) { this.scene.attach(object); continue; }
			if (!object.geometry.hasAttribute("uv")) { console.warn("All lightmap objects need UVs!"); continue; }
	
			if (this.blurringPlane == null) { this._initializeBlurPlane(res, this.progressiveSurfacemap1); }
	
			// Apply the lightmap to the object
			object.material.lightMap  = this.progressiveSurfacemap2.texture;
			object.material.dithering = true;
			object.castShadow         = true;
			object.receiveShadow      = true;
			object.renderOrder        = 1000 + ob;
	
			// Prepare UV boxes for potpack 
			// TODO: Size these by object surface area
			this.uv_boxes.push({ w: 1 + (padding * 2),
								 h: 1 + (padding * 2), index: ob });
	
			this.surfacemapContainers.push({
				basicMat: object.material,
				object  : object
			});
	
			this.compiled = false;
		}

		// Pack the objects' lightmap UVs into the same space
		const dimensions = potpack(this.uv_boxes);
		this.uv_boxes.forEach((box) => {
			let uv2 = objects[box.index].geometry.getAttribute("uv").clone();
			for (let i = 0; i < uv2.array.length; i += uv2.itemSize) {
				uv2.array[i    ] = (uv2.array[i    ] + box.x + padding) / dimensions.w;
				uv2.array[i + 1] = (uv2.array[i + 1] + box.y + padding) / dimensions.h;
			}
			objects[box.index].geometry.setAttribute("uv2", uv2);
			objects[box.index].geometry.getAttribute("uv2").needsUpdate = true;
		});
	}

	/**
	 * This function renders each mesh one at a time into their respective surface maps
	 * @param {Camera} camera Standard Rendering Camera
	 * @param {number} blendWindow When >1, samples will accumulate over time.
	 * @param {boolean} blurEdges  Whether to fix UV Edges via blurring
	 */
	this.update = function (camera, blendWindow = 100, blurEdges = true) {
		if (this.blurringPlane == null) { return; }

		// Store the original Render Target
		let oldTarget = renderer.getRenderTarget();

		// Whether or not to blur the edges of the lightmap...
		this.blurringPlane.visible = blurEdges;

		// Steal the Object3D from the real world to our special dimension
		for (let l = 0; l < this.surfacemapContainers.length; l++) {
			this.surfacemapContainers[l].object.oldScene =
				this.surfacemapContainers[l].object.parent;
			this.scene.attach(this.surfacemapContainers[l].object);
		}

		// Render once normally to initialize everything
		if (this.firstUpdate) {
			renderer.setRenderTarget(this.tinyTarget); // Tiny for Speed
			renderer.render(this.scene, camera);
			this.firstUpdate = false;
		}

		// Set each object's material to the UV Unwrapped Surface Mapping Version
		for (let l = 0; l < this.surfacemapContainers.length; l++){
			this.uvMat.uniforms.averagingWindow = { value: blendWindow };
			this.surfacemapContainers[l].object.material = this.uvMat;
			this.surfacemapContainers[l].object.oldFrustumCulled =
				this.surfacemapContainers[l].object.frustumCulled;
			this.surfacemapContainers[l].object.frustumCulled = false;
		}

		// Ping-pong two surface buffers for reading/writing
		let activeMap   = this.buffer1Active ? this.progressiveSurfacemap1 : this.progressiveSurfacemap2;
		let inactiveMap = this.buffer1Active ? this.progressiveSurfacemap2 : this.progressiveSurfacemap1;

		// Render the object's surface maps
		renderer.setRenderTarget(activeMap);
		this.                 uvMat.uniforms.previousShadowMap = { value: inactiveMap.texture };
		this.blurringPlane.material.uniforms.previousShadowMap = { value: inactiveMap.texture };
		this.buffer1Active = !this.buffer1Active;
		renderer.render( this.scene, camera );

		// Restore the object's Real-time Material and add it back to the original world
		for (let l = 0; l < this.surfacemapContainers.length; l++){
			this.surfacemapContainers[l].object.frustumCulled =
				this.surfacemapContainers[l].object.oldFrustumCulled;
			this.surfacemapContainers[l].object.material = this.surfacemapContainers[l].basicMat;
			this.surfacemapContainers[l].object.oldScene.attach(this.surfacemapContainers[l].object);
		}

		// Restore the original Render Target
		renderer.setRenderTarget(oldTarget);
	}

	/** DEBUG 
	 * Draw the lightmap in the main scene.  Call this after adding the objects to it.
	 * @param {boolean} visible Whether the debug plane should be visible
	 * @param {Vector3} position Where the debug plane should be drawn
	*/
	this.warned = false;
	this.showDebugLightmap = function (visible, position = undefined) {
		if (this.surfacemapContainers.length == 0 && !this.warned) {
			console.warn("Call this after adding the objects!"); this.warned = true; return; }
		if (this.labelMesh == null) {
			this.labelMaterial = new THREE.MeshBasicMaterial(
				{ map: this.progressiveSurfacemap1.texture, side: THREE.DoubleSide });
			this.labelPlane = new THREE.PlaneGeometry(100, 100);
			this.labelMesh = new THREE.Mesh(this.labelPlane, this.labelMaterial);
			this.labelMesh.position.y = 250;
			this.surfacemapContainers[0].object.parent.add(this.labelMesh);
		}
		if (position != undefined) { this.labelMesh.position.copy(position); }
		this.labelMesh.visible = visible;
	}
	
	/**
	 * INTERNAL Creates the Blurring Plane 
	 * @param {number} res The square resolution of this object's surfacemap.
	 */
	this._initializeBlurPlane = function(res, shadowMap = null) {
		let blurMaterial = new THREE.MeshBasicMaterial();
		blurMaterial.uniforms = { previousShadowMap : { value: null    },
								  pixelOffset       : { value: 1.0/res },
								  polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: 3.0};
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
									texture(previousShadowMap, vUv + vec2( pixelOffset,  0.0        )).rgb + 
									texture(previousShadowMap, vUv + vec2( 0.0        ,  pixelOffset)).rgb +
									texture(previousShadowMap, vUv + vec2( 0.0        , -pixelOffset)).rgb +
									texture(previousShadowMap, vUv + vec2(-pixelOffset,  0.0        )).rgb +
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
		this.blurringPlane.renderOrder = 0;
		this.blurringPlane.material.depthWrite = false;
		this.scene.add(this.blurringPlane);
	}
}

export { ProgressiveSurfacemap };