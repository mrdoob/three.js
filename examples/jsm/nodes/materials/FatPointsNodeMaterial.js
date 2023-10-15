import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import { varying } from '../core/VaryingNode.js';
import { property } from '../core/PropertyNode.js';
import { attribute } from '../core/AttributeNode.js';
import { cameraProjectionMatrix } from '../accessors/CameraNode.js';
import { materialColor, materialPointWidth } from '../accessors/MaterialNode.js'; // or should this be a property, instead?
import { modelViewMatrix } from '../accessors/ModelNode.js';
import { positionGeometry } from '../accessors/PositionNode.js';
import { smoothstep } from '../math/MathNode.js';
import { tslFn, vec2, vec4 } from '../shadernode/ShaderNode.js';
import { uv } from '../accessors/UVNode.js';
import { viewport } from '../display/ViewportNode.js';
import { color } from 'three/nodes';

import { PointsMaterial } from 'three';

const defaultValues = new PointsMaterial();

class FatPointsNodeMaterial extends NodeMaterial {

	constructor( params = {} ) {

		super();

		this.normals = false;

		this.lights = false;

		this.useAlphaToCoverage = true;

		this.useColor = params.vertexColors;

		this.pointWidth = 1;

		this.pointColorNode = null;

		this.setDefaultValues( defaultValues );

		this.setupShaders();

		this.setValues( params );

	}

	setupShaders() {

		const useAlphaToCoverage = this.alphaToCoverage;
		const useColor = this.useColor;

		this.vertexNode = tslFn( () => {

			//vUv = uv;
			varying( vec2(), 'vUv' ).assign( uv() ); // @TODO: Analyze other way to do this

			const instancePosition = attribute( 'instancePosition' );

			// camera space
			const mvPos = property( 'vec4', 'mvPos' );
			mvPos.assign( modelViewMatrix.mul( vec4( instancePosition, 1.0 ) ) );

			const aspect = viewport.z.div( viewport.w );

			// clip space
			const clipPos = cameraProjectionMatrix.mul( mvPos );

			// offset in ndc space
			const offset = property( 'vec2', 'offset' );
			offset.assign( positionGeometry.xy );
			offset.assign( offset.mul( materialPointWidth ) );
			offset.assign( offset.div( viewport.z ) );
			offset.y.assign( offset.y.mul( aspect ) );

			// back to clip space
			offset.assign( offset.mul( clipPos.w ) );

			//clipPos.xy += offset;
			clipPos.assign( clipPos.add( vec4( offset, 0, 0 ) ) );

			return clipPos;

			//vec4 mvPosition = mvPos; // this was used for somethihng...

		} )();

		this.colorNode = tslFn( () => {

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

					pointColorNode = color( instanceColor ).mul( color( materialColor ) );

				} else {

					pointColorNode = materialColor;

				}

			}

			return vec4( pointColorNode, alpha );

		} )();

		this.needsUpdate = true;

	}

	get alphaToCoverage() {

		return this.useAlphaToCoverage;

	}

	set alphaToCoverage( value ) {

		if ( this.useAlphaToCoverage !== value ) {

			this.useAlphaToCoverage = value;
			this.setupShaders();

		}

	}

}

export default FatPointsNodeMaterial;

addNodeMaterial( 'FatPointsNodeMaterial', FatPointsNodeMaterial );
