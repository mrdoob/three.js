/**
 * @author sunag / http://www.sunag.com.br/
 */

import { Vector2 } from '../../../../build/three.module.js';

import { Vector2Node } from '../inputs/Vector2Node.js';

export class ResolutionNode extends Vector2Node {

	constructor() {

		super();

		this.size = new Vector2();

		this.nodeType = "Resolution";

	}

	updateFrame( frame ) {

		if ( frame.renderer ) {

			frame.renderer.getSize( this.size );

			var pixelRatio = frame.renderer.getPixelRatio();

			this.x = this.size.width * pixelRatio;
			this.y = this.size.height * pixelRatio;

		} else {

			console.warn( "ResolutionNode need a renderer in NodeFrame" );

		}

	}

	copy( source ) {

		super.copy( source );

		this.renderer = source.renderer;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.renderer = this.renderer.uuid;

		}

		return data;

	}

}
