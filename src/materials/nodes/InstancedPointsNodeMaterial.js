import NodeMaterial from './NodeMaterial.js';
import { attribute } from '../../nodes/core/AttributeNode.js';
import { cameraProjectionMatrix } from '../../nodes/accessors/Camera.js';
import { materialAlphaTest, materialColor, materialOpacity, materialPointWidth } from '../../nodes/accessors/MaterialNode.js'; // or should this be a property, instead?
import { modelViewMatrix } from '../../nodes/accessors/ModelNode.js';
import { positionGeometry, positionLocal, positionView } from '../../nodes/accessors/Position.js';
import { lengthSq, smoothstep } from '../../nodes/math/MathNode.js';
import { float, Fn, If, vec4 } from '../../nodes/tsl/TSLBase.js';
import { uv } from '../../nodes/accessors/UV.js';
import { viewport } from '../../nodes/display/ViewportNode.js';

import { PointsMaterial } from '../PointsMaterial.js';

const _defaultValues = /*@__PURE__*/ new PointsMaterial();

class InstancedPointsNodeMaterial extends NodeMaterial {

	static get type() {

		return 'InstancedPointsNodeMaterial';

	}

	constructor( params = {} ) {

		super();

		this.lights = false;

		this.sizeAttenuation = true;

		this.useSizeAttenuation = true;

		this.useAlphaToCoverage = true;

		this.useColor = params.vertexColors;

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

	setupShaders( { renderer } ) {

		const useAlphaToCoverage = this.alphaToCoverage;
		const useSizeAttenuation = this.sizeAttenuation;
		const useColor = this.useColor;

		this.vertexNode = Fn( () => {

			const instancePosition = attribute( 'instancePosition' ).xyz;

			positionLocal.assign( positionGeometry.add( instancePosition ) );

			const viewPosition = modelViewMatrix.mul( vec4( instancePosition, 1.0 ) );

			viewPosition.z.mulAssign( 2 );

			positionView.assign( viewPosition );

			const clipPos = cameraProjectionMatrix.mul( viewPosition );
			const offset = positionGeometry.xy;

			let size = this.pointWidthNode || materialPointWidth;

			if ( useSizeAttenuation ) {

				// Convert size (diameter) to radius and apply perspective scaling
			  	size = size.div( clipPos.w.div( viewport.w ) ).div( 2 );

			}

			const adjustedOffset = offset.mul( size )
				.div( viewport.zw )
				.mul( clipPos.w );

			return clipPos.add( vec4( adjustedOffset, 0, 0 ) );

		} )();

		this.fragmentNode = Fn( () => {

			// force assignment into correct place in flow
			const alpha = float( 1 ).toVar();

			If( materialAlphaTest.equal( 0.0 ), () => {

				const len2 = lengthSq( uv().mul( 2 ).sub( 1 ) );


				if ( useAlphaToCoverage && renderer.samples > 1 ) {

					const dlen = float( len2.fwidth() ).toVar();

					alpha.assign( smoothstep( dlen.oneMinus(), dlen.add( 1 ), len2 ).oneMinus() );

				} else {

					len2.greaterThan( 1.0 ).discard();

				}

			} );



			const output = vec4( 1 ).toVar();

			if ( this.pointColorNode ) {

				output.assign( this.pointColorNode );

			} else {

				if ( useColor ) {

					const instanceColor = attribute( 'instanceColor' );

					output.assign( instanceColor.mul( materialColor ) );

				} else {

					output.assign( materialColor );

				}

			}

			output.a.mulAssign( alpha );
			output.a.mulAssign( materialOpacity );


			If( materialAlphaTest.greaterThan( 0.0 ), () => {

				output.a.lessThanEqual( materialAlphaTest ).discard();

			} );



			return output;

		} )();

	}

	get alphaToCoverage() {

		return this.useAlphaToCoverage;

	}

	set alphaToCoverage( value ) {

		if ( this.useAlphaToCoverage !== value ) {

			this.useAlphaToCoverage = value;
			this.needsUpdate = true;

		}

	}

	get sizeAttenuation() {

		return this.useSizeAttenuation;

	}

	set sizeAttenuation( value ) {

		if ( this.useSizeAttenuation !== value ) {

			this.useSizeAttenuation = value;
			this.needsUpdate = true;

		}

	}

}

export default InstancedPointsNodeMaterial;
