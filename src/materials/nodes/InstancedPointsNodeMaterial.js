import NodeMaterial from './NodeMaterial.js';
import { attribute } from '../../nodes/core/AttributeNode.js';
import { cameraProjectionMatrix } from '../../nodes/accessors/Camera.js';
import { materialColor, materialOpacity, materialPointWidth } from '../../nodes/accessors/MaterialNode.js'; // or should this be a property, instead?
import { modelViewMatrix } from '../../nodes/accessors/ModelNode.js';
import { positionGeometry } from '../../nodes/accessors/Position.js';
import { smoothstep, lengthSq } from '../../nodes/math/MathNode.js';
import { Fn, vec4, float } from '../../nodes/tsl/TSLBase.js';
import { uv } from '../../nodes/accessors/UV.js';
import { viewport } from '../../nodes/display/ScreenNode.js';

import { PointsMaterial } from '../PointsMaterial.js';

const _defaultValues = /*@__PURE__*/ new PointsMaterial();

class InstancedPointsNodeMaterial extends NodeMaterial {

	static get type() {

		return 'InstancedPointsNodeMaterial';

	}

	constructor( params = {} ) {

		super();

		this.lights = false;

		this._useSizeAttenuation = true;
		this._useAlphaToCoverage = true;

		this._useColor = params.vertexColors;

		this.pointWidth = 1;

		this.pointColorNode = null;

		this.pointWidthNode = null;

		this.setDefaultValues( _defaultValues );

		this.setValues( params );

	}

	setup( builder ) {

		this.setupShaders( builder );

		super.setup( builder );

	}

	setupShaders( { renderer, camera } ) {

		const alphaToCoverage = this.alphaToCoverage;
		const sizeAttenuation = this.sizeAttenuation;

		const color = this._useColor;

		this.vertexNode = Fn( () => {

			const instancePosition = attribute( 'instancePosition' ).xyz;

			// camera space
			const mvPosition = vec4( modelViewMatrix.mul( vec4( instancePosition, 1.0 ) ) );

			const aspect = viewport.z.div( viewport.w );

			// clip space
			const clipPos = cameraProjectionMatrix.mul( mvPosition );

			// offset in ndc space
			const offset = positionGeometry.xy.toVar();

			offset.mulAssign( this.pointWidthNode ? this.pointWidthNode : materialPointWidth );


			const pixelRatio = renderer.getPixelRatio();
			const scale = float( 1.0 ).toVar();

			if ( sizeAttenuation && camera.isPerspectiveCamera ) {

				const fovAdjustment = cameraProjectionMatrix[ 1 ][ 1 ];
				scale.assign( viewport.w.mul( 0.5 ).mul( pixelRatio ).div( mvPosition.z.negate() ).div( fovAdjustment.mul( pixelRatio ) ) );

			} else {

				scale.assign( pixelRatio );

			}

			offset.mulAssign( scale );

			offset.assign( offset.div( viewport.z ) );
			offset.y.assign( offset.y.mul( aspect ) );

			// back to clip space
			offset.assign( offset.mul( clipPos.w ) );

			//clipPos.xy += offset;
			clipPos.addAssign( vec4( offset, 0, 0 ) );

			return clipPos;

		} )();

		this.fragmentNode = Fn( () => {

			const alpha = float( 1 ).toVar();

			const len2 = lengthSq( uv().mul( 2 ).sub( 1 ) );

			if ( alphaToCoverage && renderer.samples > 1 ) {

				const dlen = float( len2.fwidth() ).toVar();

				alpha.assign( smoothstep( dlen.oneMinus(), dlen.add( 1 ), len2 ).oneMinus() );

			} else {

				len2.greaterThan( 1.0 ).discard();

			}

			let pointColorNode;

			if ( this.pointColorNode ) {

				pointColorNode = this.pointColorNode;

			} else {

				if ( color ) {

					const instanceColor = attribute( 'instanceColor' );

					pointColorNode = instanceColor.mul( materialColor );

				} else {

					pointColorNode = materialColor;

				}

			}

			alpha.mulAssign( materialOpacity );

			return vec4( pointColorNode, alpha );

		} )();

	}

	get alphaToCoverage() {

		return this._useAlphaToCoverage;

	}

	set alphaToCoverage( value ) {

		if ( this._useAlphaToCoverage !== value ) {

			this._useAlphaToCoverage = value;
			this.needsUpdate = true;

		}

	}

	get sizeAttenuation() {

		return this._useSizeAttenuation;

	}

	set sizeAttenuation( value ) {

		if ( this._useSizeAttenuation !== value ) {

			this._useSizeAttenuation = value;
			this.needsUpdate = true;

		}

	}

}

export default InstancedPointsNodeMaterial;
