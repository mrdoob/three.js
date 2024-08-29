import NodeMaterial, { registerNodeMaterial } from './NodeMaterial.js';
import { property } from '../../nodes/core/PropertyNode.js';
import { attribute } from '../../nodes/core/AttributeNode.js';
import { cameraProjectionMatrix } from '../../nodes/accessors/Camera.js';
import { materialColor, materialOpacity, materialPointWidth } from '../../nodes/accessors/MaterialNode.js'; // or should this be a property, instead?
import { modelViewMatrix } from '../../nodes/accessors/ModelNode.js';
import { positionGeometry } from '../../nodes/accessors/Position.js';
import { smoothstep } from '../../nodes/math/MathNode.js';
import { Fn, varying, vec2, vec4 } from '../../nodes/tsl/TSLBase.js';
import { uv } from '../../nodes/accessors/UV.js';
import { viewport } from '../../nodes/display/ViewportNode.js';

import { PointsMaterial } from '../PointsMaterial.js';

const _defaultValues = /*@__PURE__*/ new PointsMaterial();

class InstancedPointsNodeMaterial extends NodeMaterial {

	constructor( params = {} ) {

		super();

		this.lights = false;

		this.useAlphaToCoverage = true;

		this.useColor = params.vertexColors;

		this.pointWidth = 1;

		this.pointColorNode = null;

		this.pointWidthNode = null;

		this.setDefaultValues( _defaultValues );

		this.setupShaders();

		this.setValues( params );

	}

	setup( builder ) {

		this.setupShaders();

		super.setup( builder );

	}

	setupShaders() {

		const useAlphaToCoverage = this.alphaToCoverage;
		const useColor = this.useColor;

		this.vertexNode = Fn( () => {

			//vUv = uv;
			varying( vec2(), 'vUv' ).assign( uv() ); // @TODO: Analyze other way to do this

			const instancePosition = attribute( 'instancePosition' ).xyz;

			// camera space
			const mvPos = property( 'vec4', 'mvPos' );
			mvPos.assign( modelViewMatrix.mul( vec4( instancePosition, 1.0 ) ) );

			const aspect = viewport.z.div( viewport.w );

			// clip space
			const clipPos = cameraProjectionMatrix.mul( mvPos );

			// offset in ndc space
			const offset = property( 'vec2', 'offset' );
			offset.assign( positionGeometry.xy );

			offset.mulAssign( this.pointWidthNode ? this.pointWidthNode : materialPointWidth );

			offset.assign( offset.div( viewport.z ) );
			offset.y.assign( offset.y.mul( aspect ) );

			// back to clip space
			offset.assign( offset.mul( clipPos.w ) );

			//clipPos.xy += offset;
			clipPos.assign( clipPos.add( vec4( offset, 0, 0 ) ) );

			return clipPos;

			//vec4 mvPosition = mvPos; // this was used for somethihng...

		} )();

		this.fragmentNode = Fn( () => {

			const vUv = varying( vec2(), 'vUv' );

			// force assignment into correct place in flow
			const alpha = property( 'float', 'alpha' );
			alpha.assign( 1 );

			const a = vUv.x;
			const b = vUv.y;

			const len2 = a.mul( a ).add( b.mul( b ) );

			if ( useAlphaToCoverage ) {

				// force assignment out of following 'if' statement - to avoid uniform control flow errors
				const dlen = property( 'float', 'dlen' );
				dlen.assign( len2.fwidth() );

				alpha.assign( smoothstep( dlen.oneMinus(), dlen.add( 1 ), len2 ).oneMinus() );

			} else {

				len2.greaterThan( 1.0 ).discard();

			}

			let pointColorNode;

			if ( this.pointColorNode ) {

				pointColorNode = this.pointColorNode;

			} else {

				if ( useColor ) {

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

		return this.useAlphaToCoverage;

	}

	set alphaToCoverage( value ) {

		if ( this.useAlphaToCoverage !== value ) {

			this.useAlphaToCoverage = value;
			this.needsUpdate = true;

		}

	}

}

export default InstancedPointsNodeMaterial;

InstancedPointsNodeMaterial.type = /*@__PURE__*/ registerNodeMaterial( 'InstancedPoints', InstancedPointsNodeMaterial );
