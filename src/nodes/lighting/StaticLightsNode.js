import LightingNode from './LightingNode.js';
import PhysicalLightingModel from '../functions/PhysicalLightingModel.js';
import StorageBufferAttribute from '../../renderers/common/StorageBufferAttribute.js';
import { directPointLight } from './PointLightNode.js';
import { storage } from '../accessors/StorageBufferNode.js';
import { positionView, positionWorld } from '../accessors/Position.js';
import { cameraViewMatrix } from '../accessors/Camera.js';
import { Fn, If, float, int, ivec3, vec3, vec4 } from '../tsl/TSLBase.js';
import { dot, smoothstep } from '../math/MathNode.js';
import { Loop } from '../utils/LoopNode.js';

/**
 * Evaluates a world-space grid of static point and spot lights.
 *
 * @private
 * @augments LightingNode
 */
class StaticLightsNode extends LightingNode {

	static get type() {

		return 'StaticLightsNode';

	}

	/**
	 * Constructs a static lights node.
	 *
	 * @param {Object} grid - The packed light grid.
	 */
	constructor( grid ) {

		super();

		this.grid = grid;
		this.shadowNode = null;

		const cellAttribute = new StorageBufferAttribute( grid.cells, 2 );
		const indexAttribute = new StorageBufferAttribute( grid.indices, 1 );
		const lightAttribute = new StorageBufferAttribute( grid.data, 4 );

		// Stable names allow materials using the same grid to share shader programs.
		this.cellsNode = storage( cellAttribute, 'uvec2', cellAttribute.count ).toReadOnly().setName( 'staticLightCells' );
		this.indicesNode = storage( indexAttribute, 'uint', indexAttribute.count ).toReadOnly().setName( 'staticLightIndices' );
		this.lightsNode = storage( lightAttribute, 'vec4', lightAttribute.count ).toReadOnly().setName( 'staticLights' );

	}

	/**
	 * Whether this lighting context can use the static light grid.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {boolean} Whether static light batching is supported.
	 */
	static supports( builder ) {

		const { context, material } = builder;
		const model = context.lightingModel;

		return builder.isAvailable( 'storageBuffer' ) === true &&
			( material.isMeshStandardMaterial === true || material.isMeshStandardNodeMaterial === true ) &&
			context.positionView == null && context.positionWorld == null && context.getShadow == null &&
			model !== undefined && model !== null && model.constructor === PhysicalLightingModel &&
			model.clearcoat === false && model.sheen === false && model.iridescence === false &&
			model.anisotropy === false && model.transmission === false && model.dispersion === false &&
			model.retroreflection === false && model.diffuseRoughness === false;

	}

	/**
	 * Adds light contributions from the fragment's grid cell.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	setup( builder ) {

		const { grid, cellsNode, indicesNode, lightsNode } = this;
		const origin = vec3( ...grid.origin );
		const dims = ivec3( ...grid.dims );
		const { reflectedLight } = builder.context;

		// The accumulators must be declared outside the conditional loop.
		reflectedLight.directDiffuse.toStack();
		reflectedLight.directSpecular.toStack();

		Fn( () => {

			const cell = ivec3( positionWorld.sub( origin ).div( grid.cellSize ).floor() ).toConst();
			const inside = cell.greaterThanEqual( ivec3( 0 ) ).all().and( cell.lessThan( dims ).all() );

			If( inside, () => {

				const cellIndex = cell.z.mul( dims.y ).add( cell.y ).mul( dims.x ).add( cell.x );
				const range = cellsNode.element( cellIndex ).toConst();
				const offset = int( range.x ).toConst();

				Loop( int( range.y ), ( { i } ) => {

					const index = int( indicesNode.element( offset.add( i ) ) ).mul( 4 ).toConst();
					const positionRange = lightsNode.element( index ).toConst();
					const lightVector = cameraViewMatrix.mul( vec4( positionRange.xyz, 1 ) ).xyz.sub( positionView ).toConst();

					If( dot( lightVector, lightVector ).lessThanEqual( positionRange.w.mul( positionRange.w ) ), () => {

						const colorDecay = lightsNode.element( index.add( 1 ) ).toConst();
						const parameters = lightsNode.element( index.add( 3 ) ).toConst();
						const spotAttenuation = float( 1 ).toVar();

						If( parameters.y.equal( 1 ), () => {

							const directionCone = lightsNode.element( index.add( 2 ) ).toConst();
							const directionView = cameraViewMatrix.transformDirection( directionCone.xyz );
							const angleCos = lightVector.normalize().dot( directionView );

							spotAttenuation.assign( smoothstep( directionCone.w, parameters.x, angleCos ) );

						} );

						builder.lightsNode.setupDirectLight( builder, this, directPointLight( {
							color: colorDecay.rgb.mul( spotAttenuation ),
							lightVector,
							cutoffDistance: positionRange.w,
							decayExponent: colorDecay.w
						} ) );

					} );

				} );

			} );

		}, 'void' )();

	}

	/**
	 * Releases the light grid's GPU buffers.
	 */
	dispose() {

		this.cellsNode.value.dispose();
		this.indicesNode.value.dispose();
		this.lightsNode.value.dispose();

		super.dispose();

	}

}

export default StaticLightsNode;
