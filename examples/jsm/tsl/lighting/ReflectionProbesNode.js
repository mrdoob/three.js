import { Node, Vector3 } from 'three/webgpu';
import { cubeTexture, float, Fn, If, int, materialEnvRotation, nodeObject, positionWorld, reflectVector, uniform, vec3 } from 'three/tsl';

const _scale = /*@__PURE__*/ new Vector3();

/**
 * Environment radiance from a baked {@link ReflectionProbes} set, with per-pixel
 * volume weights and box projection. Assign it to `scene.environmentNode` so
 * every physical material samples it with its own roughness and normal.
 *
 * @augments Node
 * @three_import import { reflectionProbes } from 'three/addons/tsl/lighting/ReflectionProbesNode.js';
 */
class ReflectionProbesNode extends Node {

	static get type() {

		return 'ReflectionProbesNode';

	}

	/**
	 * Constructs a new reflection probes node.
	 *
	 * @param {ReflectionProbes} probes - The baked probe set.
	 */
	constructor( probes ) {

		super( 'vec3' );

		if ( probes.texture === null ) throw new Error( 'ReflectionProbesNode: Bake the probes before creating the node.' );

		/**
		 * The probe set.
		 *
		 * @type {ReflectionProbes}
		 */
		this.probes = probes;

		this.updateBeforeType = 'render';

		this._array = cubeTexture( probes.texture );
		this._array.mergeable = false;
		this._maxLod = uniform( 0 );
		this._local = uniform( 1 );
		this._slots = [];

	}

	customCacheKey() {

		return this.probes.bakedProbes.length;

	}

	updateBefore() {

		const probes = this.probes;

		if ( probes.bakedProbes.length !== this._slots.length ) {

			// the probe count is compiled into the shader
			this.needsUpdate = true;
			return;

		}

		this._array.value = probes.texture;
		this._maxLod.value = probes.texture.mipmaps.length - 1;
		// captures see only the environment, so baking doesn't feed back into itself
		this._local.value = probes.capturing ? 0 : 1;

		for ( let i = 0; i < this._slots.length; i ++ ) {

			const slot = this._slots[ i ];
			const probe = probes.bakedProbes[ i ];

			probe.getWorldPosition( slot.position.value );
			probe.getWorldScale( _scale );

			slot.extent.value.copy( probe.size ).multiply( _scale ).multiplyScalar( 0.5 );
			slot.fade.value = probe.blendDistance;
			slot.project.value = probes.boxProjection && probe.projectionSize !== null ? 1 : 0;

			if ( probe.projectionSize !== null ) slot.projectionExtent.value.copy( probe.projectionSize ).multiply( _scale ).multiplyScalar( 0.5 );

		}

	}

	setup( builder ) {

		this._slots = this.probes.bakedProbes.map( () => ( {
			position: uniform( new Vector3() ),
			extent: uniform( new Vector3() ),
			fade: uniform( 0.5 ),
			projectionExtent: uniform( new Vector3() ),
			project: uniform( 0 )
		} ) );

		this.updateBefore();

		const { context } = builder;
		const direction = context.getUV ? context.getUV( this, builder ) : reflectVector;
		const roughness = float( context.getTextureLevel ? context.getTextureLevel( this ) : 0 ).clamp();

		return Fn( () => {

			const lod = this._maxLod.mul( roughness ).mul( float( 2 ).sub( roughness ) );
			const radiance = vec3( 0 ).toVar();
			const remaining = float( this._local ).toVar();

			for ( let i = 0; i < this._slots.length; i ++ ) {

				const slot = this._slots[ i ];
				const local = positionWorld.sub( slot.position );
				const d = slot.extent.sub( local.abs() );
				// negative outside the box, so the clamped fade is zero there
				const distance = d.x.min( d.y ).min( d.z );
				const weight = distance.div( slot.fade.max( 1e-6 ) ).clamp().mul( remaining ).toVar();

				If( weight.greaterThan( 0 ), () => {

					const projectionMin = slot.position.sub( slot.projectionExtent );
					const projectionMax = slot.position.add( slot.projectionExtent );
					const safeDirection = direction.greaterThanEqual( 0 ).select( direction.max( 1e-6 ), direction.min( - 1e-6 ) );
					const distances = direction.greaterThanEqual( 0 ).select( projectionMax, projectionMin ).sub( positionWorld ).div( safeDirection );
					const hit = distances.x.min( distances.y ).min( distances.z );
					const projected = local.add( direction.mul( hit ) );
					const insideProxy = local.abs().lessThanEqual( slot.projectionExtent ).all();
					const corrected = slot.project.greaterThan( 0 ).and( insideProxy ).select( projected, direction );
					radiance.addAssign( this._array.sample( corrected ).depth( int( i ) ).level( lod ).rgb.mul( weight ) );

				} );

				remaining.subAssign( weight );

			}

			const environmentWeight = remaining.add( this._local.oneMinus() );
			radiance.addAssign( this._array.sample( materialEnvRotation.mul( direction ) ).depth( int( this._slots.length ) ).level( lod ).rgb.mul( environmentWeight ) );

			return radiance;

		} )();

	}

}

/**
 * TSL function for creating a reflection probes node.
 *
 * @tsl
 * @function
 * @param {ReflectionProbes} probes - The baked probe set.
 * @returns {ReflectionProbesNode}
 */
export const reflectionProbes = ( probes ) => nodeObject( new ReflectionProbesNode( probes ) );

export { ReflectionProbesNode };
