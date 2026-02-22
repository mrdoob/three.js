import Node from '../../core/Node.js';
import { NodeUpdateType } from '../../core/constants.js';
import { vec3 } from '../../tsl/TSLBase.js';
import { uniform } from '../../core/UniformNode.js';
import { uniformArray } from '../../accessors/UniformArrayNode.js';
import { renderGroup } from '../../core/UniformGroupNode.js';
import { Loop } from '../../utils/LoopNode.js';
import { getDistanceAttenuation } from '../LightUtils.js';
import { positionView } from '../../accessors/Position.js';
import { Color } from '../../../math/Color.js';
import { Vector4 } from '../../../math/Vector4.js';
import { Vector3 } from '../../../math/Vector3.js';
import { warn } from '../../../utils.js';

const _pos = /*@__PURE__*/ new Vector3();

/**
 * Batched data node for point lights in dynamic lighting mode.
 * Uses uniform arrays + loop instead of per-light inline code.
 *
 * Data layout:
 * - colors[]: vec4 (rgb = color, w = unused)
 * - positionsAndCutoff[]: vec4 (xyz = view-space position, w = cutoffDistance)
 * - decays[]: vec4 (x = decayExponent, yzw = unused)
 *
 * @augments Node
 */
class PointLightDataNode extends Node {

	static get type() {

		return 'PointLightDataNode';

	}

	constructor( maxCount = 16 ) {

		super();

		this.maxCount = maxCount;

		this._colors = [];
		this._positionsAndCutoff = [];
		this._decays = [];

		for ( let i = 0; i < maxCount; i ++ ) {

			this._colors.push( new Color() );
			this._positionsAndCutoff.push( new Vector4() );
			this._decays.push( new Vector4() );

		}

		this.colorsNode = uniformArray( this._colors, 'color' ).setGroup( renderGroup );
		this.positionsAndCutoffNode = uniformArray( this._positionsAndCutoff, 'vec4' ).setGroup( renderGroup );
		this.decaysNode = uniformArray( this._decays, 'vec4' ).setGroup( renderGroup );
		this.countNode = uniform( 0, 'int' ).setGroup( renderGroup );

		this.updateType = NodeUpdateType.RENDER;

		this._lights = [];

	}

	setLights( lights ) {

		if ( lights.length > this.maxCount ) {

			warn( `PointLightDataNode: ${ lights.length } lights exceed max of ${ this.maxCount }. Excess lights ignored.` );

		}

		this._lights = lights;

	}

	update( { camera } ) {

		const lights = this._lights;
		const count = Math.min( lights.length, this.maxCount );

		this.countNode.value = count;

		for ( let i = 0; i < count; i ++ ) {

			const light = lights[ i ];

			this._colors[ i ].copy( light.color ).multiplyScalar( light.intensity );

			// Position in view space, cutoff in w
			_pos.setFromMatrixPosition( light.matrixWorld );
			_pos.applyMatrix4( camera.matrixWorldInverse );

			const pos = this._positionsAndCutoff[ i ];
			pos.x = _pos.x;
			pos.y = _pos.y;
			pos.z = _pos.z;
			pos.w = light.distance;

			this._decays[ i ].x = light.decay;

		}

	}

	setup( builder ) {

		const { colorsNode, positionsAndCutoffNode, decaysNode, countNode } = this;
		const surfacePosition = builder.context.positionView || positionView;
		const { lightingModel, reflectedLight } = builder.context;

		// Local accumulators initialized BEFORE the loop to avoid
		// reflectedLight VarNode re-initialization inside the loop body
		const dynDiffuse = vec3( 0 ).toVar( 'dynPointDiffuse' );
		const dynSpecular = vec3( 0 ).toVar( 'dynPointSpecular' );

		Loop( countNode, ( { i } ) => {

			const posAndCutoff = positionsAndCutoffNode.element( i );
			const lightViewPos = posAndCutoff.xyz;
			const cutoffDistance = posAndCutoff.w;
			const decayExponent = decaysNode.element( i ).x;

			const lightVector = lightViewPos.sub( surfacePosition ).toVar();
			const lightDirection = lightVector.normalize().toVar();
			const lightDistance = lightVector.length();

			const attenuation = getDistanceAttenuation( {
				lightDistance,
				cutoffDistance,
				decayExponent
			} );

			const lightColor = colorsNode.element( i ).mul( attenuation ).toVar();

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

export default PointLightDataNode;
