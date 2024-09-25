import { float, nodeObject, normalize, vec4 } from '../tsl/TSLBase.js';
import { Color } from '../../math/Color.js';
import NodeMaterial from '../../materials/nodes/NodeMaterial.js';
import { cameraProjectionMatrix } from '../../nodes/accessors/Camera.js';
import { modelViewMatrix } from '../../nodes/accessors/ModelNode.js';
import { positionLocal } from '../../nodes/accessors/Position.js';
import { normalLocal } from '../../nodes/accessors/Normal.js';
import { BackSide } from '../../constants.js';
import PassNode from './PassNode.js';

class ToonOutlinePassNode extends PassNode {

	static get type() {

		return 'ToonOutlinePassNode';

	}

	constructor( scene, camera, colorNode, thicknessNode, alphaNode ) {

		super( PassNode.COLOR, scene, camera );

		this.colorNode = colorNode;
		this.thicknessNode = thicknessNode;
		this.alphaNode = alphaNode;

		this._materialCache = new WeakMap();

	}

	updateBefore( frame ) {

		const { renderer } = frame;

		const currentRenderObjectFunction = renderer.getRenderObjectFunction();

		renderer.setRenderObjectFunction( ( object, scene, camera, geometry, material, group, lightsNode ) => {

			// only render outline for supported materials

			if ( material.isMeshToonMaterial || material.isMeshToonNodeMaterial ) {

				if ( material.wireframe === false ) {

					const outlineMaterial = this._getOutlineMaterial( material );
					renderer.renderObject( object, scene, camera, geometry, outlineMaterial, group, lightsNode );

				}

			}

			// default

			renderer.renderObject( object, scene, camera, geometry, material, group, lightsNode );

		} );

		super.updateBefore( frame );

		renderer.setRenderObjectFunction( currentRenderObjectFunction );

	}

	_createMaterial() {

		const material = new NodeMaterial();
		material.isMeshToonOutlineMaterial = true;
		material.name = 'Toon_Outline';
		material.side = BackSide;

		// vertex node

		const outlineNormal = normalLocal.negate();
		const mvp = cameraProjectionMatrix.mul( modelViewMatrix );

		const ratio = float( 1.0 ); // TODO: support outline thickness ratio for each vertex
		const pos = mvp.mul( vec4( positionLocal, 1.0 ) );
		const pos2 = mvp.mul( vec4( positionLocal.add( outlineNormal ), 1.0 ) );
		const norm = normalize( pos.sub( pos2 ) ); // NOTE: subtract pos2 from pos because BackSide objectNormal is negative

		material.vertexNode = pos.add( norm.mul( this.thicknessNode ).mul( pos.w ).mul( ratio ) );

		// color node

		material.colorNode = vec4( this.colorNode, this.alphaNode );

		return material;

	}

	_getOutlineMaterial( originalMaterial ) {

		let outlineMaterial = this._materialCache.get( originalMaterial );

		if ( outlineMaterial === undefined ) {

			outlineMaterial = this._createMaterial();

			this._materialCache.set( originalMaterial, outlineMaterial );

		}

		return outlineMaterial;

	}

}

export default ToonOutlinePassNode;

export const toonOutlinePass = ( scene, camera, color = new Color( 0, 0, 0 ), thickness = 0.003, alpha = 1 ) => nodeObject( new ToonOutlinePassNode( scene, camera, nodeObject( color ), nodeObject( thickness ), nodeObject( alpha ) ) );
