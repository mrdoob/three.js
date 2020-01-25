import { Vector3, ShaderChunk, DirectionalLight, Vector2, LineBasicMaterial, Object3D, Geometry, Line } from '../../../build/three.module.js';

class FrustumVertex {
	constructor(x, y, z) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
	}

	fromLerp(v1, v2, amount) {
		this.x = (1 - amount) * v1.x + amount * v2.x;
		this.y = (1 - amount) * v1.y + amount * v2.y;
		this.z = (1 - amount) * v1.z + amount * v2.z;

		return this;
	}
}

function toRad(degrees) {
	return degrees * Math.PI / 180;
}

class Frustum {
	constructor(data) {
		data = data || {};

		this.fov = data.fov || 70;
		this.near = data.near || 0.1;
		this.far = data.far || 1000;
		this.aspect = data.aspect || 1;

		this.vertices = {
			near: [],
			far: []
		};
	}

	getViewSpaceVertices() {
		this.nearPlaneY = this.near * Math.tan(toRad(this.fov / 2));
		this.nearPlaneX = this.aspect * this.nearPlaneY;

		this.farPlaneY = this.far * Math.tan(toRad(this.fov / 2));
		this.farPlaneX = this.aspect * this.farPlaneY;

		// 3 --- 0  vertices.near/far order
		// |     |
		// 2 --- 1

		this.vertices.near.push(
			new FrustumVertex(this.nearPlaneX, this.nearPlaneY, -this.near),
			new FrustumVertex(this.nearPlaneX, -this.nearPlaneY, -this.near),
			new FrustumVertex(-this.nearPlaneX, -this.nearPlaneY, -this.near),
			new FrustumVertex(-this.nearPlaneX, this.nearPlaneY, -this.near)
		);

		this.vertices.far.push(
			new FrustumVertex(this.farPlaneX, this.farPlaneY, -this.far),
			new FrustumVertex(this.farPlaneX, -this.farPlaneY, -this.far),
			new FrustumVertex(-this.farPlaneX, -this.farPlaneY, -this.far),
			new FrustumVertex(-this.farPlaneX, this.farPlaneY, -this.far)
		);

		return this.vertices;
	}

	split(breaks) {
		const result = [];

		for(let i = 0; i < breaks.length; i++) {
			const cascade = new Frustum();

			if(i === 0) {
				cascade.vertices.near = this.vertices.near;
			} else {
				for(let j = 0; j < 4; j++) {
					cascade.vertices.near.push(new FrustumVertex().fromLerp(this.vertices.near[j], this.vertices.far[j], breaks[i - 1]));
				}
			}

			if(i === breaks - 1) {
				cascade.vertices.far = this.vertices.far;
			} else {
				for(let j = 0; j < 4; j++) {
					cascade.vertices.far.push(new FrustumVertex().fromLerp(this.vertices.near[j], this.vertices.far[j], breaks[i]));
				}
			}

			result.push(cascade);
		}

		return result;
	}

	toSpace(cameraMatrix) {
		const result = new Frustum();
		const point = new Vector3();

		for(var i = 0; i < 4; i++) {
			point.set(this.vertices.near[i].x, this.vertices.near[i].y, this.vertices.near[i].z);
			point.applyMatrix4(cameraMatrix);
			result.vertices.near.push(new FrustumVertex(point.x, point.y, point.z));

			point.set(this.vertices.far[i].x, this.vertices.far[i].y, this.vertices.far[i].z);
			point.applyMatrix4(cameraMatrix);
			result.vertices.far.push(new FrustumVertex(point.x, point.y, point.z));
		}

		return result;
	}
}

class FrustumBoundingBox {
	constructor() {
		this.min = {
			x: 0,
			y: 0,
			z: 0
		};
		this.max = {
			x: 0,
			y: 0,
			z: 0
		};
	}

	fromFrustum(frustum) {
		const vertices = [];

		for(let i = 0; i < 4; i++) {
			vertices.push(frustum.vertices.near[i]);
			vertices.push(frustum.vertices.far[i]);
		}

		this.min = {
			x: vertices[0].x,
			y: vertices[0].y,
			z: vertices[0].z
		};
		this.max = {
			x: vertices[0].x,
			y: vertices[0].y,
			z: vertices[0].z
		};

		for(let i = 1; i < 8; i++) {
			this.min.x = Math.min(this.min.x, vertices[i].x);
			this.min.y = Math.min(this.min.y, vertices[i].y);
			this.min.z = Math.min(this.min.z, vertices[i].z);
			this.max.x = Math.max(this.max.x, vertices[i].x);
			this.max.y = Math.max(this.max.y, vertices[i].y);
			this.max.z = Math.max(this.max.z, vertices[i].z);
		}

		return this;
	}

	getSize() {
		this.size = {
			x: this.max.x - this.min.x,
			y: this.max.y - this.min.y,
			z: this.max.z - this.min.z
		};

		return this.size;
	}

	getCenter(margin) {
		this.center = {
			x: (this.max.x + this.min.x) / 2,
			y: (this.max.y + this.min.y) / 2,
			z: this.max.z + margin
		};

		return this.center;
	}
}

var Shader = {
	lights_fragment_begin: `
GeometricContext geometry;
geometry.position = - vViewPosition;
geometry.normal = normal;
geometry.viewDir = normalize( vViewPosition );
#ifdef CLEARCOAT
	geometry.clearcoatNormal = clearcoatNormal;
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#pragma unroll_loop
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointDirectLightIrradiance( pointLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		directLight.color *= all( bvec3( pointLight.shadow, directLight.visible, receiveShadow ) ) ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	#pragma unroll_loop
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotDirectLightIrradiance( spotLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		directLight.color *= all( bvec3( spotLight.shadow, directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
#endif
#if ( NUM_DIR_LIGHTS > 0) && defined( RE_Direct ) && defined( USE_CSM ) && defined( CSM_CASCADES )
	DirectionalLight directionalLight;
	float linearDepth = (vViewPosition.z) / (shadowFar - cameraNear);

	#pragma unroll_loop
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		if(linearDepth >= CSM_cascades[UNROLLED_LOOP_INDEX].x && linearDepth < CSM_cascades[UNROLLED_LOOP_INDEX].y) directLight.color *= all( bvec3( directionalLight.shadow, directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		if(linearDepth >= CSM_cascades[UNROLLED_LOOP_INDEX].x && (linearDepth < CSM_cascades[UNROLLED_LOOP_INDEX].y || UNROLLED_LOOP_INDEX == CSM_CASCADES - 1)) RE_Direct( directLight, geometry, material, reflectedLight );
	}
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct ) && !defined( USE_CSM ) && !defined( CSM_CASCADES )
	DirectionalLight directionalLight;
	#pragma unroll_loop
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directLight.color *= all( bvec2( directionalLight.shadow, directLight.visible ) ) ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );
	}
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	irradiance += getLightProbeIrradiance( lightProbe, geometry );
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );
		}
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif
`,
	lights_pars_begin: `
#if defined( USE_CSM ) && defined( CSM_CASCADES )
uniform vec2 CSM_cascades[CSM_CASCADES];
uniform float cameraNear;
uniform float shadowFar;
#endif
	` + ShaderChunk.lights_pars_begin
};

class CSM {
	constructor(data) {
		data = data || {};

		this.camera = data.camera;
		this.parent = data.parent;
		this.fov = data.fov || this.camera.fov;
		this.near = this.camera.near;
		this.far = data.far || this.camera.far;
		this.aspect = data.aspect || this.camera.aspect;
		this.cascades = data.cascades || 3;
		this.mode = data.mode || 'practical';
		this.shadowMapSize = data.shadowMapSize || 2048;
		this.shadowBias = data.shadowBias || 0.000001;
		this.lightDirection = data.lightDirection || new Vector3(1, -1, 1).normalize();
		this.lightIntensity = data.lightIntensity || 1;
		this.lightNear = data.lightNear || 1;
		this.lightFar = data.lightFar || 2000;
		this.lightMargin = data.lightMargin || 200;
		this.customSplitsCallback = data.customSplitsCallback;

		this.lights = [];
		this.materials = [];
		this.createLights();

		this.getBreaks();
		this.initCascades();

		this.injectInclude();
	}

	createLights() {
		for(let i = 0; i < this.cascades; i++) {
			const light = new DirectionalLight(0xffffff, this.lightIntensity);
			light.castShadow = true;
			light.shadow.mapSize.width = this.shadowMapSize;
			light.shadow.mapSize.height = this.shadowMapSize;

			light.shadow.camera.near = this.lightNear;
			light.shadow.camera.far = this.lightFar;
			light.shadow.bias = this.shadowBias;

			this.parent.add(light);
			this.parent.add(light.target);
			this.lights.push(light);
		}
	}

	initCascades() {
		this.mainFrustum = new Frustum({
			fov: this.fov,
			near: this.near,
			far: this.far,
			aspect: this.aspect
		});

		this.mainFrustum.getViewSpaceVertices();

		this.frustums = this.mainFrustum.split(this.breaks);
	}

	getBreaks() {
		this.breaks = [];

		switch (this.mode) {
			case 'uniform':
				this.breaks = uniformSplit(this.cascades, this.near, this.far);
				break;
			case 'logarithmic':
				this.breaks = logarithmicSplit(this.cascades, this.near, this.far);
				break;
			case 'practical':
				this.breaks = practicalSplit(this.cascades, this.near, this.far, 0.5);
				break;
			case 'custom':
				if(this.customSplitsCallback === undefined) console.error('CSM: Custom split scheme callback not defined.');
				this.breaks = this.customSplitsCallback(this.cascades, this.near, this.far);
				break;
		}

		function uniformSplit(amount, near, far) {
			const r = [];

			for(let i = 1; i < amount; i++) {
				r.push((near + (far - near) * i / amount) / far);
			}

			r.push(1);
			return r;
		}

		function logarithmicSplit(amount, near, far) {
			const r = [];

			for(let i = 1; i < amount; i++) {
				r.push((near * (far / near) ** (i / amount)) / far);
			}

			r.push(1);
			return r;
		}

		function practicalSplit(amount, near, far, lambda) {
			const log = logarithmicSplit(amount, near, far);
			const uni = uniformSplit(amount, near, far);
			const r = [];

			for(let i = 1; i < amount; i++) {
				r.push(lambda * log[i - 1] + (1 - lambda) * uni[i - 1]);
			}

			r.push(1);
			return r;
		}
	}

	update(cameraMatrix) {
		for(let i = 0; i < this.frustums.length; i++) {
			const worldSpaceFrustum = this.frustums[i].toSpace(cameraMatrix);
			const light = this.lights[i];
			const lightSpaceFrustum = worldSpaceFrustum.toSpace(light.shadow.camera.matrixWorldInverse);

			light.shadow.camera.updateMatrixWorld(true);

			const bbox = new FrustumBoundingBox().fromFrustum(lightSpaceFrustum);
			bbox.getSize();
			bbox.getCenter(this.lightMargin);

			const squaredBBWidth = Math.max(bbox.size.x, bbox.size.y);

			let center = new Vector3(bbox.center.x, bbox.center.y, bbox.center.z);
			center.applyMatrix4(light.shadow.camera.matrixWorld);

			light.shadow.camera.left = -squaredBBWidth / 2;
			light.shadow.camera.right = squaredBBWidth / 2;
			light.shadow.camera.top = squaredBBWidth / 2;
			light.shadow.camera.bottom = -squaredBBWidth / 2;

			light.position.copy(center);
			light.target.position.copy(center);

			light.target.position.x += this.lightDirection.x;
			light.target.position.y += this.lightDirection.y;
			light.target.position.z += this.lightDirection.z;

			light.shadow.camera.updateProjectionMatrix();
			light.shadow.camera.updateMatrixWorld();
		}
	}

	injectInclude() {
		ShaderChunk.lights_fragment_begin = Shader.lights_fragment_begin;
		ShaderChunk.lights_pars_begin = Shader.lights_pars_begin;
	}

	setupMaterial(material) {
		material.defines = material.defines || {};
		material.defines.USE_CSM = 1;
		material.defines.CSM_CASCADES = this.cascades;

		const breaksVec2 = [];

		for(let i = 0; i < this.cascades; i++) {
			let amount = this.breaks[i];
			let prev = this.breaks[i - 1] || 0;
			breaksVec2.push(new Vector2(prev, amount));
		}

		const self = this;

		material.onBeforeCompile = function (shader) {
			shader.uniforms.CSM_cascades = {value: breaksVec2};
			shader.uniforms.cameraNear = {value: self.camera.near};
			shader.uniforms.shadowFar = {value: self.far};

			self.materials.push(shader);
		};
	}

	updateUniforms() {
		for(let i = 0; i < this.materials.length; i++) {
			this.materials[i].uniforms.CSM_cascades.value = this.getExtendedBreaks();
			this.materials[i].uniforms.cameraNear.value = this.camera.near;
			this.materials[i].uniforms.shadowFar.value = this.far;
		}
	}

	getExtendedBreaks() {
		let breaksVec2 = [];

		for(let i = 0; i < this.cascades; i++) {
			let amount = this.breaks[i];
			let prev = this.breaks[i - 1] || 0;
			breaksVec2.push(new Vector2(prev, amount));
		}

		return breaksVec2;
	}

	setAspect(aspect) {
		this.aspect = aspect;
		this.initCascades();
	}

	updateFrustums() {
		this.getBreaks();
		this.initCascades();
		this.updateUniforms();
	}

	helper(cameraMatrix) {
		let frustum;
		let geometry;
		const material = new LineBasicMaterial({color: 0xffffff});
		const object = new Object3D();

		for(let i = 0; i < this.frustums.length; i++) {
			frustum = this.frustums[i].toSpace(cameraMatrix);

			geometry = new Geometry();

			for(let i = 0; i < 5; i++) {
				const point = frustum.vertices.near[i === 4 ? 0 : i];
				geometry.vertices.push(new Vector3(point.x, point.y, point.z));
			}

			object.add(new Line(geometry, material));

			geometry = new Geometry();

			for(let i = 0; i < 5; i++) {
				const point = frustum.vertices.far[i === 4 ? 0 : i];
				geometry.vertices.push(new Vector3(point.x, point.y, point.z));
			}

			object.add(new Line(geometry, material));

			for(let i = 0; i < 4; i++) {
				geometry = new Geometry();

				const near = frustum.vertices.near[i];
				const far = frustum.vertices.far[i];

				geometry.vertices.push(new Vector3(near.x, near.y, near.z));
				geometry.vertices.push(new Vector3(far.x, far.y, far.z));

				object.add(new Line(geometry, material));
			}
		}

		return object;
	}

	remove() {
		for(let i = 0; i < this.lights.length; i++) {
			this.parent.remove(this.lights[i]);
		}
	}
}

export default CSM;
