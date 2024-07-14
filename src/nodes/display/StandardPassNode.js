import Node, { addNodeClass } from '../core/Node.js';
import NodeHandler from '../core/NodeHandler.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import { transformedNormalView } from '../accessors/NormalNode.js';
import { ao } from './GTAONode.js';
import { pass } from './PassNode.js';
import NodeMaterial from '../materials/NodeMaterial.js';
import { NearestFilter, UnsignedByteType } from '../../constants.js';

class StandardPassNode extends Node {

	constructor( scene, camera, options = { enableAO: false } ) {

		super( 'vec4' );

		const { enableAO } = options;

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

		// Final

		const scenePass = pass( scene, camera );

		// Assigns

		this.scene = scene;
		this.camera = camera;

		this.aoPassNode = aoPass;
		this.scenePassNode = scenePass;
		this.opaquePassNode = opaquePass;

		this.normalViewNode = normalView;
		this.depthNode = depth;

		this.enableAO = enableAO;
		this.aoIntensityNode = null;

		//

		this.isStandardPassNode = true;

	}

	set needsUpdate( value ) {

		if ( value === true ) {

			this.dispose();

		}

	}

	dispose() {

		this.scenePassNode.dispose();

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

		const handler = new NodeHandler();

		let composer = this.scenePassNode;

		if ( this.enableAO ) {

			const aoTexture = this.aoPassNode.getTextureNode();

			handler.onHandle( 'ao', ( node ) => {

				const sceneAO = this.aoIntensityNode !== null ? this.aoIntensityNode.mix( 1, aoTexture ) : aoTexture;

				return node !== null ? sceneAO.mul( node ) : sceneAO;

			} );

			composer = composer.before( this.aoPassNode );

		}

		this.scenePassNode.handler = handler;

		return composer;

	}

}

export default StandardPassNode;

export const standardPass = ( scene, camera, options ) => nodeObject( new StandardPassNode( scene, camera, options ) );

addNodeClass( 'StandardPassNode', StandardPassNode );
