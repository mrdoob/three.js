import { nodeObject } from '../shadernode/ShaderNode.js';
import { addNodeClass } from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import PassNode from './PassNode.js';
import { Vector2 } from '../../math/Vector2.js';
import { MeshNormalNodeMaterial } from '../Nodes.js';

const _size = new Vector2();

class PixelationPassNode extends PassNode {

	constructor( scene, camera, pixelSize, normalEdgeStrength, depthEdgeStrength ) {

		super( 'normal', scene, camera );

		this.pixelSize = pixelSize;
		this.normalEdgeStrength = normalEdgeStrength;
		this.depthEdgeStrength = depthEdgeStrength;

		this.updateBeforeType = NodeUpdateType.FRAME;

		this.isPixelationPassNode = true;

	}

	updateBefore( frame ) {

		const { renderer } = frame;
		const { scene, camera } = this;

		this._pixelRatio = renderer.getPixelRatio();

		const size = renderer.getSize( _size );
		const pixelSize = this.pixelSize.value ? this.pixelSize.value : this.pixelSize;

		this.setSize( pixelSize >= 1 ? (size.width / pixelSize) | 0 : size.width, pixelSize >= 1 ? (size.height / pixelSize) | 0 : size.height );

		const currentRenderTarget = renderer.getRenderTarget();

		this._cameraNear.value = camera.near;
		this._cameraFar.value = camera.far;

		renderer.setRenderTarget( this.renderTarget );

		renderer.render( scene, camera );

		renderer.setRenderTarget( this.normalRenderTarget );
		const oldMaterial = scene.overrideMaterial;
		scene.overrideMaterial = new MeshNormalNodeMaterial();
		renderer.render( scene, camera );
		scene.overrideMaterial = oldMaterial;

		renderer.setRenderTarget( currentRenderTarget );

	}

	setSize( width, height ) {

		super.setSize( width, height );
		
	}

	setup() {

		const pass = super.getTextureNode();
		return pass.pixelation( this._depthTextureNode, this._normalTextureNode, this.pixelSize, this.normalEdgeStrength, this.depthEdgeStrength );

	}

	dispose() {

		super.dispose();
		this.normalRenderTarget.dispose();


	}

}

export default PixelationPassNode;

export const pixelationPass = ( scene, camera, pixelSize, normalEdgeStrength, depthEdgeStrength ) => nodeObject( new PixelationPassNode( scene, camera, pixelSize, normalEdgeStrength, depthEdgeStrength ) );

addNodeClass( 'PixelationPassNode', PixelationPassNode );
