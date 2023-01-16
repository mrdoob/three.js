import { Material, WebGLRenderer, Mesh, PlaneGeometry, Scene, Camera } from 'three';
import { NodeFrame, MeshBasicNodeMaterial } from 'three/nodes';
import { WebGLNodeBuilder } from './WebGLNodeBuilder.js';

const builders = new WeakMap();
export const nodeFrame = new NodeFrame();

Material.prototype.onBuild = function ( object, parameters, renderer ) {

	if ( object.material.isNodeMaterial === true ) {

		const builder = new WebGLNodeBuilder( object, renderer, parameters );
		builder.build();
		builders.set( this, builder );

	}

};

Material.prototype.onBeforeRender = function ( renderer, scene, camera, geometry, object ) {

	const nodeBuilder = builders.get( this );

	if ( nodeBuilder !== undefined ) {

		nodeFrame.material = this;
		nodeFrame.camera = camera;
		nodeFrame.object = object;
		nodeFrame.renderer = renderer;

		const updateNodes = nodeBuilder.updateNodes;

		if ( updateNodes.length > 0 ) {

			// force refresh material uniforms
			renderer.state.useProgram( null );

			//this.uniformsNeedUpdate = true;

			for ( const node of updateNodes ) {

				nodeFrame.updateNode( node );

			}

		}

	}

};

WebGLRenderer.prototype.compute = async function ( ...computeNodes ) {

	const material = new MeshBasicNodeMaterial();
	const geometry = new PlaneGeometry( 2, 2 );
	const object = new Mesh( geometry, material );
	const scene = new Scene().add( object );
	const camera = new Camera();

	const currentRenderTarget = this.getRenderTarget();

	for ( const computeNode of computeNodes ) {

		material.colorNode = computeNode.computeNode;
		material.needsUpdate = true;

		this.compile( scene, camera ); // Compile material and populate outComputeBuffer

		const outBuffer = builders.get( material ).outComputeBuffer;

		this.setRenderTarget( outBuffer.renderTarget );
		nodeFrame.update();
		this.render( scene, camera );

	}

	this.setRenderTarget( currentRenderTarget );

	material.dispose();
	geometry.dispose();

};

WebGLRenderer.prototype.deuploadBufferAttribute = async function ( attribute ) {

	const { renderTarget } = this.bindings.get( attribute );
	this.readRenderTargetPixels( renderTarget, 0, 0, renderTarget.width, renderTarget.height, attribute.array );

};

const dispose = WebGLRenderer.prototype.dispose;
WebGLRenderer.prototype.dispose = function() {

	dispose.apply( this );
	if ( this.bindings !== undefined ) {

		this.bindings.forEach( buffer => buffer.dispose() );
		this.bindings.clear();

	}

};
