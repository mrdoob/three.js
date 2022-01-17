import {
	Mesh,
	OrthographicCamera,
	PlaneGeometry,
	Scene,
	WebGLRenderTarget
} from 'three';

import { NodeBuilder } from '../core/NodeBuilder.js';
import { NodeMaterial } from '../materials/NodeMaterial.js';
import { TextureNode } from './TextureNode.js';

class RTTNode extends TextureNode {

	constructor( width, height, input, options = {} ) {

		const renderTarget = new WebGLRenderTarget( width, height, options );

		super( renderTarget.texture );

		this.input = input;

		this.clear = options.clear !== undefined ? options.clear : true;

		this.renderTarget = renderTarget;

		this.material = new NodeMaterial();

		this.camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
		this.scene = new Scene();

		this.quad = new Mesh( new PlaneGeometry( 2, 2 ), this.material );
		this.quad.frustumCulled = false; // Avoid getting clipped
		this.scene.add( this.quad );

		this.render = true;


	}

	build( builder, output, uuid ) {

		const rttBuilder = new NodeBuilder();
		rttBuilder.nodes = builder.nodes;
		rttBuilder.updaters = builder.updaters;

		this.material.fragment.value = this.input;
		this.material.build( { builder: rttBuilder } );

		return super.build( builder, output, uuid );

	}

	updateFramesaveTo( frame ) {

		this.saveTo.render = false;

		if ( this.saveTo !== this.saveToCurrent ) {

			if ( this.saveToMaterial ) this.saveToMaterial.dispose();

			const material = new NodeMaterial();
			material.fragment.value = this;
			material.build();

			const scene = new Scene();

			const quad = new Mesh( new PlaneGeometry( 2, 2 ), material );
			quad.frustumCulled = false; // Avoid getting clipped
			scene.add( quad );

			this.saveToScene = scene;
			this.saveToMaterial = material;

		}

		this.saveToCurrent = this.saveTo;

		frame.renderer.setRenderTarget( this.saveTo.renderTarget );
		if ( this.saveTo.clear ) frame.renderer.clear();
		frame.renderer.render( this.saveToScene, this.camera );

	}

	updateFrame( frame ) {

		if ( frame.renderer ) {

			// from the second frame

			if ( this.saveTo && this.saveTo.render === false ) {

				this.updateFramesaveTo( frame );

			}

			if ( this.render ) {

				if ( this.material.uniforms.renderTexture ) {

					this.material.uniforms.renderTexture.value = frame.renderTexture;

				}

				frame.renderer.setRenderTarget( this.renderTarget );
				if ( this.clear ) frame.renderer.clear();
				frame.renderer.render( this.scene, this.camera );

			}

			// first frame

			if ( this.saveTo && this.saveTo.render === true ) {

				this.updateFramesaveTo( frame );

			}

		} else {

			console.warn( 'RTTNode need a renderer in NodeFrame' );

		}

	}

	copy( source ) {

		super.copy( source );

		this.saveTo = source.saveTo;

		return this;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = super.toJSON( meta );

			if ( this.saveTo ) data.saveTo = this.saveTo.toJSON( meta ).uuid;

		}

		return data;

	}

}

RTTNode.prototype.nodeType = 'RTT';

export { RTTNode };
