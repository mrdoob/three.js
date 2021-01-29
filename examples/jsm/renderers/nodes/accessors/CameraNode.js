import Node from '../core/Node.js';
import Vector3Node from '../inputs/Vector3Node.js';
import Matrix4Node from '../inputs/Matrix4Node.js';
import { NodeUpdateType } from '../core/constants.js';

class CameraNode extends Node {

	static POSITION = 'position';
	static PROJECTION = 'projection';
	static VIEW = 'view';

	constructor( scope = CameraNode.POSITION ) {

		super();

		this.updateType = NodeUpdateType.Frame;

		this.scope = scope;
		
		this.inputNode = null;

	}

	getType() {

		if ( this.scope === CameraNode.PROJECTION || this.scope === CameraNode.VIEW ) {
			
			return 'mat4';
			
		}

		return 'vec3';

	}
	
	update( frame ) {

		const camera = frame.camera;
		const inputNode = this.inputNode;

		if ( this.scope === CameraNode.PROJECTION ) {
			
			inputNode.value = camera.projectionMatrix;
			
		} else if ( this.scope === CameraNode.VIEW ) {
			
			inputNode.value = camera.matrixWorldInverse;
			
		} else if ( this.scope === CameraNode.POSITION ) {
			
			camera.getWorldPosition( inputNode.value );
			
		}

	}

	generate( builder, output ) {

		const nodeData = builder.getDataFromNode( this );

		if ( this.initialized !== true ) {
			
			if ( this.scope === CameraNode.PROJECTION || this.scope === CameraNode.VIEW ) {
				
				this.inputNode = new Matrix4Node( null );
				
			} else {
				
				this.inputNode = new Vector3Node();
				
			}
			
			nodeData.initialized = true;
			
		}

		return this.inputNode.build( builder, output );

	}

}

export default CameraNode;
