import Node from '../../core/Node.js';
import { NodeUpdateType } from '../../core/constants.js';
import { uniform } from '../../core/UniformNode.js';
import { uniformArray } from '../../accessors/UniformArrayNode.js';
import { renderGroup } from '../../core/UniformGroupNode.js';
import { Loop } from '../../utils/LoopNode.js';
import { mix } from '../../math/MathNode.js';
import { normalWorld } from '../../accessors/Normal.js';
import { Color } from '../../../math/Color.js';
import { Vector3 } from '../../../math/Vector3.js';
import { warn } from '../../../utils.js';

/**
 * Batched data node for hemisphere lights in dynamic lighting mode.
 * Uses uniform arrays + loop instead of per-light inline code.
 *
 * Data layout:
 * - skyColors[]: vec3 (sky color * intensity)
 * - groundColors[]: vec3 (ground color * intensity)
 * - directions[]: vec3 (normalized light position = direction)
 *
 * @augments Node
 */
class HemisphereLightDataNode extends Node {

	static get type() {

		return 'HemisphereLightDataNode';

	}

	constructor( maxCount = 4 ) {

		super();

		this.maxCount = maxCount;

		this._skyColors = [];
		this._groundColors = [];
		this._directions = [];

		for ( let i = 0; i < maxCount; i ++ ) {

			this._skyColors.push( new Color() );
			this._groundColors.push( new Color() );
			this._directions.push( new Vector3() );

		}

		this.skyColorsNode = uniformArray( this._skyColors, 'color' ).setGroup( renderGroup );
		this.groundColorsNode = uniformArray( this._groundColors, 'color' ).setGroup( renderGroup );
		this.directionsNode = uniformArray( this._directions, 'vec3' ).setGroup( renderGroup );
		this.countNode = uniform( 0, 'int' ).setGroup( renderGroup );

		this.updateType = NodeUpdateType.RENDER;

		this._lights = [];

	}

	setLights( lights ) {

		if ( lights.length > this.maxCount ) {

			warn( `HemisphereLightDataNode: ${ lights.length } lights exceed max of ${ this.maxCount }. Excess lights ignored.` );

		}

		this._lights = lights;

	}

	update( /* frame */ ) {

		const lights = this._lights;
		const count = Math.min( lights.length, this.maxCount );

		this.countNode.value = count;

		for ( let i = 0; i < count; i ++ ) {

			const light = lights[ i ];

			this._skyColors[ i ].copy( light.color ).multiplyScalar( light.intensity );
			this._groundColors[ i ].copy( light.groundColor ).multiplyScalar( light.intensity );

			// Direction = normalized light position (hemisphere lights use position as direction)
			this._directions[ i ].setFromMatrixPosition( light.matrixWorld ).normalize();

		}

	}

	setup( builder ) {

		const { skyColorsNode, groundColorsNode, directionsNode, countNode } = this;

		Loop( countNode, ( { i } ) => {

			const skyColor = skyColorsNode.element( i );
			const groundColor = groundColorsNode.element( i );
			const lightDirection = directionsNode.element( i );

			const dotNL = normalWorld.dot( lightDirection );
			const hemiDiffuseWeight = dotNL.mul( 0.5 ).add( 0.5 );

			const irradiance = mix( groundColor, skyColor, hemiDiffuseWeight );

			builder.context.irradiance.addAssign( irradiance );

		} );

	}

}

export default HemisphereLightDataNode;
