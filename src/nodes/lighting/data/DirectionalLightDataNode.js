import Node from '../../core/Node.js';
import { NodeUpdateType } from '../../core/constants.js';
import { vec3 } from '../../tsl/TSLBase.js';
import { uniform } from '../../core/UniformNode.js';
import { uniformArray } from '../../accessors/UniformArrayNode.js';
import { renderGroup } from '../../core/UniformGroupNode.js';
import { Loop } from '../../utils/LoopNode.js';
import { Color } from '../../../math/Color.js';
import { Vector3 } from '../../../math/Vector3.js';
import { warn } from '../../../utils.js';

const _lp = /*@__PURE__*/ new Vector3();
const _tp = /*@__PURE__*/ new Vector3();

/**
 * Batched data node for directional lights in dynamic lighting mode.
 * Uses uniform arrays + loop instead of per-light inline code.
 *
 * @augments Node
 */
class DirectionalLightDataNode extends Node {

	static get type() {

		return 'DirectionalLightDataNode';

	}

	constructor( maxCount = 8 ) {

		super();

		this.maxCount = maxCount;

		// Preallocate arrays
		this._colors = [];
		this._directions = [];

		for ( let i = 0; i < maxCount; i ++ ) {

			this._colors.push( new Color() );
			this._directions.push( new Vector3() );

		}

		this.colorsNode = uniformArray( this._colors, 'color' ).setGroup( renderGroup );
		this.directionsNode = uniformArray( this._directions, 'vec3' ).setGroup( renderGroup );
		this.countNode = uniform( 0, 'int' ).setGroup( renderGroup );

		this.updateType = NodeUpdateType.RENDER;

		this._lights = [];

	}

	setLights( lights ) {

		if ( lights.length > this.maxCount ) {

			warn( `DirectionalLightDataNode: ${ lights.length } lights exceed max of ${ this.maxCount }. Excess lights ignored.` );

		}

		this._lights = lights;

	}

	update( { camera } ) {

		const lights = this._lights;
		const count = Math.min( lights.length, this.maxCount );

		this.countNode.value = count;

		for ( let i = 0; i < count; i ++ ) {

			const light = lights[ i ];

			// color = light.color * light.intensity
			this._colors[ i ].copy( light.color ).multiplyScalar( light.intensity );

			// direction = viewMatrix.transformDirection( lightPos - targetPos )
			_lp.setFromMatrixPosition( light.matrixWorld );
			_tp.setFromMatrixPosition( light.target.matrixWorld );
			this._directions[ i ].subVectors( _lp, _tp ).transformDirection( camera.matrixWorldInverse );

		}

	}

	setup( builder ) {

		const { colorsNode, directionsNode, countNode } = this;
		const { lightingModel, reflectedLight } = builder.context;

		const dynDiffuse = vec3( 0 ).toVar( 'dynDirDiffuse' );
		const dynSpecular = vec3( 0 ).toVar( 'dynDirSpecular' );

		Loop( countNode, ( { i } ) => {

			const lightColor = colorsNode.element( i ).toVar();
			const lightDirection = directionsNode.element( i ).normalize().toVar();

			lightingModel.direct( {
				lightDirection,
				lightColor,
				lightNode: { light: {}, shadowNode: null },
				reflectedLight: { directDiffuse: dynDiffuse, directSpecular: dynSpecular }
			}, builder );

		} );

		reflectedLight.directDiffuse.addAssign( dynDiffuse );
		reflectedLight.directSpecular.addAssign( dynSpecular );

	}

}

export default DirectionalLightDataNode;
