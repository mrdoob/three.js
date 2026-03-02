import Node from '../../core/Node.js';
import { NodeUpdateType } from '../../core/constants.js';
import { vec3 } from '../../tsl/TSLBase.js';
import { uniform } from '../../core/UniformNode.js';
import { uniformArray } from '../../accessors/UniformArrayNode.js';
import { renderGroup } from '../../core/UniformGroupNode.js';
import { Loop } from '../../utils/LoopNode.js';
import { getDistanceAttenuation } from '../LightUtils.js';
import { smoothstep } from '../../math/MathNode.js';
import { positionView } from '../../accessors/Position.js';
import { Color } from '../../../math/Color.js';
import { Vector4 } from '../../../math/Vector4.js';
import { Vector3 } from '../../../math/Vector3.js';
import { warn } from '../../../utils.js';

const _lp = /*@__PURE__*/ new Vector3();
const _tp = /*@__PURE__*/ new Vector3();

/**
 * Batched data node for spot lights in dynamic lighting mode.
 * Uses uniform arrays + loop instead of per-light inline code.
 *
 * Only handles "simple" spot lights (no map, no colorNode).
 * Spot lights with map/colorNode fall back to per-light inline path.
 *
 * Data layout:
 * - colors[]: vec4 (rgb = color, w = unused)
 * - positionsAndCutoff[]: vec4 (xyz = view-space position, w = cutoffDistance)
 * - directionsAndDecay[]: vec4 (xyz = view-space direction, w = decayExponent)
 * - cones[]: vec4 (x = coneCos, y = penumbraCos, zw = unused)
 *
 * @augments Node
 */
class SpotLightDataNode extends Node {

	static get type() {

		return 'SpotLightDataNode';

	}

	constructor( maxCount = 16 ) {

		super();

		this.maxCount = maxCount;

		this._colors = [];
		this._positionsAndCutoff = [];
		this._directionsAndDecay = [];
		this._cones = [];

		for ( let i = 0; i < maxCount; i ++ ) {

			this._colors.push( new Color() );
			this._positionsAndCutoff.push( new Vector4() );
			this._directionsAndDecay.push( new Vector4() );
			this._cones.push( new Vector4() );

		}

		this.colorsNode = uniformArray( this._colors, 'color' ).setGroup( renderGroup );
		this.positionsAndCutoffNode = uniformArray( this._positionsAndCutoff, 'vec4' ).setGroup( renderGroup );
		this.directionsAndDecayNode = uniformArray( this._directionsAndDecay, 'vec4' ).setGroup( renderGroup );
		this.conesNode = uniformArray( this._cones, 'vec4' ).setGroup( renderGroup );
		this.countNode = uniform( 0, 'int' ).setGroup( renderGroup );

		this.updateType = NodeUpdateType.RENDER;

		this._lights = [];

	}

	setLights( lights ) {

		if ( lights.length > this.maxCount ) {

			warn( `SpotLightDataNode: ${ lights.length } lights exceed max of ${ this.maxCount }. Excess lights ignored.` );

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

			// Position in view space
			_lp.setFromMatrixPosition( light.matrixWorld );
			_lp.applyMatrix4( camera.matrixWorldInverse );

			const pos = this._positionsAndCutoff[ i ];
			pos.x = _lp.x;
			pos.y = _lp.y;
			pos.z = _lp.z;
			pos.w = light.distance;

			// Direction in view space (lightPos - targetPos, transformed by viewMatrix)
			_lp.setFromMatrixPosition( light.matrixWorld );
			_tp.setFromMatrixPosition( light.target.matrixWorld );
			_lp.sub( _tp ).transformDirection( camera.matrixWorldInverse );

			const dir = this._directionsAndDecay[ i ];
			dir.x = _lp.x;
			dir.y = _lp.y;
			dir.z = _lp.z;
			dir.w = light.decay;

			// Cone angles
			const cone = this._cones[ i ];
			cone.x = Math.cos( light.angle );
			cone.y = Math.cos( light.angle * ( 1 - light.penumbra ) );

		}

	}

	setup( builder ) {

		const { colorsNode, positionsAndCutoffNode, directionsAndDecayNode, conesNode, countNode } = this;
		const surfacePosition = builder.context.positionView || positionView;
		const { lightingModel, reflectedLight } = builder.context;

		const dynDiffuse = vec3( 0 ).toVar( 'dynSpotDiffuse' );
		const dynSpecular = vec3( 0 ).toVar( 'dynSpotSpecular' );

		Loop( countNode, ( { i } ) => {

			const posAndCutoff = positionsAndCutoffNode.element( i );
			const lightViewPos = posAndCutoff.xyz;
			const cutoffDistance = posAndCutoff.w;

			const dirAndDecay = directionsAndDecayNode.element( i );
			const spotDirection = dirAndDecay.xyz;
			const decayExponent = dirAndDecay.w;

			const cone = conesNode.element( i );
			const coneCos = cone.x;
			const penumbraCos = cone.y;

			const lightVector = lightViewPos.sub( surfacePosition ).toVar();
			const lightDirection = lightVector.normalize().toVar();
			const lightDistance = lightVector.length();

			// Spot attenuation
			const angleCos = lightDirection.dot( spotDirection );
			const spotAttenuation = smoothstep( coneCos, penumbraCos, angleCos );

			// Distance attenuation
			const distanceAttenuation = getDistanceAttenuation( {
				lightDistance,
				cutoffDistance,
				decayExponent
			} );

			const lightColor = colorsNode.element( i ).mul( spotAttenuation ).mul( distanceAttenuation ).toVar();

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

export default SpotLightDataNode;
