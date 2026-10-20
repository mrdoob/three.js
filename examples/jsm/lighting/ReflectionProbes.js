import { CubeCamera, CubeRenderTarget, HalfFloatType, Node, NodeUpdateType, PMREMGenerator, Vector3 } from 'three/webgpu';
import { cubeTexture, Fn, max, min, normalWorld, positionWorld, uniform, vec3 } from 'three/tsl';

const _center = /*@__PURE__*/ new Vector3();

/**
 * A set of box projected reflection probes, the specular counterpart of light maps and light probes.
 * Each probe captures a cube map of the scene at its position and prefilters it with
 * {@link PMREMGenerator}. Materials reflect the probe nearest to their object, corrected for the
 * parallax of a box around the probe, so reflections line up with the walls of a room.
 *
 * {@link ReflectionProbes#envNode} only adds specular radiance. The diffuse light comes from the light
 * maps, or from light probes for the meshes left out of the light map, so an environment map would
 * count it twice.
 *
 * Capture the probes from the finished light-mapped scene, render targets are linear, so the
 * reflections have the same scale as the lit surfaces. Hide the meshes left out of the light map,
 * e.g. animated skinned meshes, while capturing.
 *
 * ```js
 * const reflections = new ReflectionProbes( [ { position: new Vector3( 0, 1, 0 ), box: new Box3( min, max ) } ] );
 * reflections.capture( renderer, scene );
 *
 * material.envNode = reflections.envNode;
 * ```
 *
 * This class can only be used with {@link WebGPURenderer}.
 *
 * @three_import import { ReflectionProbes } from 'three/addons/lighting/ReflectionProbes.js';
 */
class ReflectionProbes {

	/**
	 * Constructs a new set of reflection probes.
	 *
	 * @param {Array<{position: Vector3, box: Box3}>} probes - The capture positions and the boxes the reflections are projected onto, e.g. the bounds of the room around each probe.
	 * @param {Object} [options] - The options.
	 * @param {number} [options.size=256] - The size of the captured cube map faces, smaller ones are upsampled by {@link PMREMGenerator}.
	 * @param {number} [options.near=0.05] - The near plane of the cube camera.
	 * @param {number} [options.far=100] - The far plane of the cube camera.
	 */
	constructor( probes, { size = 256, near = 0.05, far = 100 } = {} ) {

		/**
		 * The probes with their capture position, projection box and prefiltered cube map.
		 *
		 * @type {Array<{position: Vector3, box: Box3, renderTarget: ?CubeRenderTarget}>}
		 */
		this.probes = probes.map( ( { position, box } ) => ( { position: position.clone(), box: box.clone(), renderTarget: null } ) );

		/**
		 * Scales the reflections, e.g. 0 hides them while capturing other probes.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.intensity = 1;

		/**
		 * The environment node for the standard and physical materials that reflect the probes, it adds
		 * no diffuse light.
		 *
		 * @type {Node<vec3>}
		 */
		this.envNode = new ReflectionProbesNode( this );

		this._renderTarget = new CubeRenderTarget( size, { type: HalfFloatType, generateMipmaps: false } );
		this._camera = new CubeCamera( near, far, this._renderTarget );
		this._generator = null;

	}

	/**
	 * Captures and prefilters the probes. The scene is rendered six times per probe with its current
	 * light maps, lights and background. Use `start` and `count` to spread the captures over frames.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {Scene} scene - The scene to capture.
	 * @param {Object} [options] - The options.
	 * @param {number} [options.start=0] - The index of the first probe to capture.
	 * @param {number} [options.count] - The number of probes to capture. Defaults to the remaining probes.
	 */
	capture( renderer, scene, { start = 0, count = this.probes.length - start } = {} ) {

		if ( this._generator === null ) this._generator = new PMREMGenerator( renderer );

		const autoClear = renderer.autoClear;
		const inspectorEnabled = renderer.inspector.enabled;
		const intensity = this.intensity;
		const shadows = [];

		try {

			// probes do not reflect each other, and shadow maps are rendered once instead of per cube face

			renderer.autoClear = true;
			renderer.inspector.enabled = false;
			this.intensity = 0;

			scene.traverseVisible( ( object ) => {

				if ( object.isLight === true && object.castShadow === true && object.shadow ) {

					shadows.push( [ object.shadow, object.shadow.autoUpdate ] );
					object.shadow.autoUpdate = false;
					object.shadow.needsUpdate = true;

				}

			} );

			for ( const probe of this.probes.slice( start, start + count ) ) {

				this._camera.position.copy( probe.position );
				this._camera.update( renderer, scene );

				probe.renderTarget = this._generator.fromCubemap( this._renderTarget.texture, probe.renderTarget );

			}

		} finally {

			for ( const [ shadow, autoUpdate ] of shadows ) shadow.autoUpdate = autoUpdate;

			renderer.autoClear = autoClear;
			renderer.inspector.enabled = inspectorEnabled;
			this.intensity = intensity;

		}

	}

	/**
	 * Returns the probe that a mesh reflects: the nearest one whose box contains the center of the
	 * mesh's bounds, or else the nearest one. The instances of instanced meshes share the probe of
	 * their bounds.
	 *
	 * @private
	 * @param {Mesh} object - The mesh.
	 * @return {?Object} The probe.
	 */
	_getProbe( object ) {

		if ( object.isInstancedMesh === true ) {

			if ( object.boundingSphere === null ) object.computeBoundingSphere();

			_center.copy( object.boundingSphere.center ).applyMatrix4( object.matrixWorld );

		} else {

			const geometry = object.geometry;

			if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

			_center.copy( geometry.boundingSphere.center ).applyMatrix4( object.matrixWorld );

		}

		let nearest = null, nearestDistance = Infinity;

		for ( const probe of this.probes ) {

			const distance = probe.position.distanceToSquared( _center ) + ( probe.box.containsPoint( _center ) ? 0 : 1e12 );

			if ( distance < nearestDistance ) {

				nearest = probe;
				nearestDistance = distance;

			}

		}

		return nearest;

	}

	/**
	 * Frees the GPU resources.
	 */
	dispose() {

		for ( const probe of this.probes ) {

			if ( probe.renderTarget !== null ) probe.renderTarget.dispose();
			probe.renderTarget = null;

		}

		this._renderTarget.dispose();
		this.envNode.dispose();

		if ( this._generator !== null ) this._generator.dispose();

	}

}

/**
 * Intersects a ray from inside a box with the box and returns the hit point relative to the probe
 * position, the direction to look the hit point up in the probe's cube map.
 *
 * @private
 * @function
 * @param {Node<vec3>} direction - The world-space ray direction.
 * @param {Node<vec3>} position - The world-space ray origin, moved into the box.
 * @param {Node<vec3>} boxMin - The minimum of the box.
 * @param {Node<vec3>} boxMax - The maximum of the box.
 * @param {Node<vec3>} probePosition - The capture position of the probe.
 * @return {Node<vec3>} The direction from the probe to the hit point.
 */
const boxProjection = /*@__PURE__*/ Fn( ( [ direction, position, boxMin, boxMax, probePosition ] ) => {

	const origin = position.clamp( boxMin.add( 1e-3 ), boxMax.sub( 1e-3 ) ).toVar();
	const exit = max( boxMax.sub( origin ).div( direction ), boxMin.sub( origin ).div( direction ) ).toVar();
	const distance = min( exit.x, min( exit.y, exit.z ) );

	return origin.add( direction.mul( distance ) ).sub( probePosition );

} );

/**
 * The environment node of {@link ReflectionProbes}. The probe is chosen per object, so materials
 * shared by many objects reflect the nearest probe of each one.
 *
 * @private
 * @augments Node
 */
class ReflectionProbesNode extends Node {

	static get type() {

		return 'ReflectionProbesNode';

	}

	/**
	 * Constructs a new reflection probes node.
	 *
	 * @param {ReflectionProbes} reflectionProbes - The reflection probes.
	 */
	constructor( reflectionProbes ) {

		super( 'vec3' );

		this.reflectionProbes = reflectionProbes;

		// an empty cube map until the probes are captured

		this._placeholder = new CubeRenderTarget( 1, { type: HalfFloatType } );

		this._texture = cubeTexture( this._placeholder.texture );
		this._position = uniform( new Vector3() );
		this._boxMin = uniform( new Vector3() );
		this._boxMax = uniform( new Vector3() );
		this._maxLevel = uniform( 0 );
		this._intensity = uniform( 0 );

		this.updateType = NodeUpdateType.OBJECT;

	}

	update( { object } ) {

		const probe = this.reflectionProbes._getProbe( object );

		if ( probe === null || probe.renderTarget === null ) {

			this._intensity.value = 0;
			return;

		}

		const texture = probe.renderTarget.texture;

		this._texture.value = texture;
		this._position.value.copy( probe.position );
		this._boxMin.value.copy( probe.box.min );
		this._boxMax.value.copy( probe.box.max );
		this._maxLevel.value = texture.mipmaps.length - 1;
		this._intensity.value = this.reflectionProbes.intensity;

	}

	dispose() {

		super.dispose();

		this._placeholder.dispose();

	}

	setup( builder ) {

		// the contexts of EnvironmentNode provide the lookup direction and the roughness. It also looks
		// the environment up along the normal for the diffuse irradiance, light maps and light probes
		// provide that

		const { getUV, getTextureLevel } = builder.context;
		const direction = getUV( this, builder );

		if ( direction === normalWorld ) return vec3( 0 );

		// the mip level of the roughness, like PMREMNode

		const r = getTextureLevel( this ).clamp();
		const level = this._maxLevel.mul( r ).mul( r.oneMinus().add( 1 ) );

		const lookup = boxProjection( direction, positionWorld, this._boxMin, this._boxMax, this._position );

		return this._texture.sample( lookup ).level( level ).rgb.mul( this._intensity );

	}

}

export { ReflectionProbes };
