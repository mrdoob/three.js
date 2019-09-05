/**
 * @author sunag / http://www.sunag.com.br/
 */

import {
	Mesh,
	OrthographicCamera,
	PlaneBufferGeometry,
	Scene,
	WebGLRenderTarget
} from '../../../../build/three.module.js';

import { NodeBuilder } from '../core/NodeBuilder.js';
import { NodeMaterial } from '../materials/NodeMaterial.js';
import { TextureNode } from './TextureNode.js';

export class RTTNode extends TextureNode {

	constructor( width, height, input, clear ) {

		super();

		this.input = input;
		this.clear = clear !== undefined ? clear : true;

		this.renderTarget = new WebGLRenderTarget( width, height, { clear: this.clear  } );

		this.material = new NodeMaterial();

		this.camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
		this.scene = new Scene();

		this.quad = new Mesh( new PlaneBufferGeometry( 2, 2 ), this.material );
		this.quad.frustumCulled = false; // Avoid getting clipped
		this.scene.add( this.quad );

		this.render = true;

		this.nodeType = "RTT";

	}

	get value() {

		return this.renderTarget.texture;

	}

	set value( val ) { }

	build( builder, output, uuid ) {

		var rttBuilder = new NodeBuilder();
		rttBuilder.nodes = builder.nodes;
		rttBuilder.updaters = builder.updaters;

		this.material.fragment.value = this.input;
		this.material.build( { builder: rttBuilder } );

		return super.build( builder, output, uuid );

	}

	updateFrameSaveTo( frame ) {

		this.saveTo.render = false;

		if ( this.saveTo !== this.saveToCurrent ) {

			if ( this.saveToMaterial ) this.saveToMaterial.dispose();

			var material = new NodeMaterial();
			material.fragment.value = this;
			material.build();

			var scene = new Scene();

			var quad = new Mesh( new PlaneBufferGeometry( 2, 2 ), material );
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

				this.updateFrameSaveTo( frame );

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

				this.updateFrameSaveTo( frame );

			}

		} else {

			console.warn( "RTTNode need a renderer in NodeFrame" );

		}

	}

	copy( source ) {

		super.copy( source );

		this.saveTo = source.saveTo;

		return this;

	}

	toJSON = function ( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = TextureNode.prototype.toJSON.call( this, meta );

			if ( this.saveTo ) data.saveTo = this.saveTo.toJSON( meta ).uuid;

		}

		return data;

	}

}
