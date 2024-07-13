import Node, { addNodeClass } from '../core/Node.js';
import NodeHandler from '../core/NodeHandler.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import { transformedNormalView } from '../accessors/NormalNode.js';
import { ao } from './GTAONode.js';
import { pass } from './PassNode.js';
import NodeMaterial from '../materials/NodeMaterial.js';
import { NearestFilter, UnsignedByteType } from '../../constants.js';

class StandardPassNode extends Node {

	constructor( scene, camera ) {

		super( 'vec4' );

		// Opaque Pass

		const normalPassMaterial = new NodeMaterial();
		normalPassMaterial.lights = false;
		normalPassMaterial.fog = false;
		normalPassMaterial.colorNode = transformedNormalView.directionToColor();

		const opaquePass = pass( scene, camera, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			type: UnsignedByteType
		} );

		opaquePass.transparent = false;
		opaquePass.overrideMaterial = normalPassMaterial;

		// Textures

		const normalView = opaquePass.getTextureNode().colorToDirection();
		const depth = opaquePass.getTextureNode( 'depth' );

		// AO

		const aoPass = ao( depth, normalView, camera );
		const aoTexture = aoPass.getTextureNode();

		aoPass.scale.value = 2;
		aoPass.thickness.value = 1;
		aoPass.distanceExponent.value = 1;

		// Node Handler

		const handler = new NodeHandler();
		handler.onHandle( 'ao', ( node ) => {

			return node !== null ? aoTexture.mul( node ) : aoTexture;

		} );

		// Final

		const scenePass = pass( scene, camera );
		scenePass.handler = handler;

		// Assigns

		this.scene = scene;
		this.camera = camera;

		this.aoPassNode = aoPass;
		this.scenePassNode = scenePass;
		this.opaquePassNode = opaquePass;

		this.normalViewNode = normalView;
		this.depthNode = depth;

		//

		this.isStandardPassNode = true;

	}

	isGlobal() {

		return true;

	}

	getViewZNode() {

		return this.scenePassNode.getViewZNode().before( this );

	}

	getLinearDepthNode() {

		return this.scenePassNode.getLinearDepthNode().before( this );

	}

	getTextureNode( name ) {

		return this.scenePassNode.getTextureNode( name ).before( this );

	}

	setup() {

		return this.aoPassNode.after( this.scenePassNode );

	}

}

export default StandardPassNode;

export const standardPass = ( scene, camera ) => nodeObject( new StandardPassNode( scene, camera ) );

addNodeClass( 'StandardPassNode', StandardPassNode );
