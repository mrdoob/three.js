/**
 * @author sunag / http://www.sunag.com.br/
 */

import { FloatNode } from '../inputs/FloatNode.js';

function MaxMIPLevelNode( texture ) {

	FloatNode.call( this );

	this.texture = texture;

	this.maxMIPLevel = 0;

}

MaxMIPLevelNode.prototype = Object.create( FloatNode.prototype );
MaxMIPLevelNode.prototype.constructor = MaxMIPLevelNode;
MaxMIPLevelNode.prototype.nodeType = "MaxMIPLevel";

Object.defineProperties( MaxMIPLevelNode.prototype, {

	value: {

		get: function () {

			if ( this.maxMIPLevel === 0 ) {

				var image = this.texture.value.image;

				if ( Array.isArray( image ) ) image = image[ 0 ];

				this.maxMIPLevel = image !== undefined ? Math.log( Math.max( image.width, image.height ) ) * Math.LOG2E : 0;

			}

			return this.maxMIPLevel;

		},

		set: function () { }

	}

} );

MaxMIPLevelNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.texture = this.texture.uuid;

	}

	return data;

};

export { MaxMIPLevelNode };
