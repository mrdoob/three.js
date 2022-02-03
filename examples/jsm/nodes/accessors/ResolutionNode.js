import { Vector2 } from 'three';

import { Vector2Node } from '../inputs/Vector2Node.js';

class ResolutionNode extends Vector2Node {

	constructor() {

		super();

		this.size = new Vector2();

	}

	updateFrame( frame ) {

		if ( frame.renderer ) {

			frame.renderer.getSize( this.size );

			const pixelRatio = frame.renderer.getPixelRatio();

			this.x = this.size.width * pixelRatio;
			this.y = this.size.height * pixelRatio;

		} else {

			console.warn( 'ResolutionNode need a renderer in NodeFrame' );

		}

	}

	copy( source ) {

		super.copy( source );

		this.renderer = source.renderer;

		return this;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.renderer = this.renderer.uuid;

		}

		return data;

	}

}

ResolutionNode.prototype.nodeType = 'Resolution';

export { ResolutionNode };
