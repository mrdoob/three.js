/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.ReflectNode = function( scope ) {

	THREE.TempNode.call( this, 'v3', { unique: true } );

	this.scope = scope || THREE.ReflectNode.CUBE;

};

THREE.ReflectNode.CUBE = 'cube';
THREE.ReflectNode.SPHERE = 'sphere';
THREE.ReflectNode.VECTOR = 'vector';

THREE.ReflectNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.ReflectNode.prototype.constructor = THREE.ReflectNode;

THREE.ReflectNode.prototype.getType = function( builder ) {

	switch ( this.scope ) {
		case THREE.ReflectNode.SPHERE:
			return 'v2';
	}

	return this.type;

};

THREE.ReflectNode.prototype.generate = function( builder, output ) {

	var result;

	switch ( this.scope ) {

		case THREE.ReflectNode.VECTOR:

			builder.material.addFragmentNode( 'vec3 reflectVec = inverseTransformDirection( reflect( -normalize( vViewPosition ), normal ), viewMatrix );' );

			result = 'reflectVec';

			break;

		case THREE.ReflectNode.CUBE:

			var reflectVec = new THREE.ReflectNode( THREE.ReflectNode.VECTOR ).build( builder, 'v3' );

			builder.material.addFragmentNode( 'vec3 reflectCubeVec = vec3( -1.0 * ' + reflectVec + '.x, ' + reflectVec + '.yz );' );

			result = 'reflectCubeVec';

			break;

		case THREE.ReflectNode.SPHERE:

			var reflectVec = new THREE.ReflectNode( THREE.ReflectNode.VECTOR ).build( builder, 'v3' );

			builder.material.addFragmentNode( 'vec2 reflectSphereVec = normalize((viewMatrix * vec4(' + reflectVec + ', 0.0 )).xyz + vec3(0.0,0.0,1.0)).xy * 0.5 + 0.5;' );

			result = 'reflectSphereVec';

			break;
	}

	return builder.format( result, this.getType( this.type ), output );

};
