/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.MaxMIPLevelNode = function ( texture ) {

	THREE.FloatNode.call( this );

	this.texture = texture;

	this.maxMIPLevel = 0;

};

THREE.MaxMIPLevelNode.prototype = Object.create( THREE.FloatNode.prototype );
THREE.MaxMIPLevelNode.prototype.constructor = THREE.MaxMIPLevelNode;
THREE.MaxMIPLevelNode.prototype.nodeType = "MaxMIPLevel";

Object.defineProperties( THREE.MaxMIPLevelNode.prototype, {

	value: {
		get: function () {

			if ( this.maxMIPLevel === 0 ) {

				var image = this.texture.value.image ? this.texture.value.image[0] : undefined;

				this.maxMIPLevel = image !== undefined ? ( Math.log( Math.max( image.width, image.height ) ) + 1 ) * Math.LOG2E : 0;

			}

			return this.maxMIPLevel;

		}
	}

} );

THREE.MaxMIPLevelNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.texture = this.texture.uuid;

	}

	return data;

};
