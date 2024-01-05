import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import { property } from '../core/PropertyNode.js';
import { attribute } from '../core/AttributeNode.js';
import { cameraProjectionMatrix } from '../accessors/CameraNode.js';
import { materialColor } from '../accessors/MaterialNode.js';
import { modelViewMatrix } from '../accessors/ModelNode.js';
import { positionGeometry } from '../accessors/PositionNode.js';
import { tslFn, vec2, vec4 } from '../shadernode/ShaderNode.js';
import { uv } from '../accessors/UVNode.js';
import { materialPointWidth } from '../accessors/FatPointsMaterialNode.js'; // or should this be a property, instead?
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

			const instancePosition = attribute( 'instancePosition' );

			// camera space
			const mvPos = property( 'vec4', 'mvPos' );
			mvPos.assign( modelViewMatrix.mul( instancePosition ) );

			const aspect = viewport.z.div( viewport.w );

			// clip space
			const clipPos = cameraProjectionMatrix.mul( mvPos );

			// offset in ndc space
			const offset = property( 'vec2', 'offset' );
			offset.assign( positionGeometry.xy.mul( materialPointWidth ).div( viewport.z ) );
			offset.y.mulAssign( aspect );

			// back to clip space
			offset.mulAssign( clipPos.w );

			clipPos.xy.addAssign( offset );

			return clipPos;

			//vec4 mvPosition = mvPos; // this was used for somethihng...

		} )();

		this.colorNode = tslFn( () => {

			let alpha;

			const len2 = uv().length();

			if ( useAlphaToCoverage ) {

				const dlen = len2.fwidth();
				alpha = len2.smoothstep( dlen.oneMinus(), dlen.add( 1 ) ).oneMinus();

			} else {

				len2.greaterThan( 1.0 ).discard();
				alpha = 1.0;

			}

			const pointColorNode = this.pointColorNode || ( useColor === true ? attribute( 'instanceColor', 'color' ).mul( materialColor ) : materialColor );

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
