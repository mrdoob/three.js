import { FloatNode } from '../inputs/FloatNode.js';

class MaxMIPLevelNode extends FloatNode {

	constructor( texture ) {

		super();

		this.texture = texture;

		this.maxMIPLevel = 0;

	}

	get value() {

		if ( this.maxMIPLevel === 0 ) {

			var image = this.texture.value.image;

			if ( Array.isArray( image ) ) image = image[ 0 ];

			this.maxMIPLevel = image !== undefined ? Math.log( Math.max( image.width, image.height ) ) * Math.LOG2E : 0;

		}

		return this.maxMIPLevel;

	}

	set value( val ) {


	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.texture = this.texture.uuid;

		}

		return data;

	}

}

MaxMIPLevelNode.prototype.nodeType = 'MaxMIPLevel';

export { MaxMIPLevelNode };
