import { Texture } from './Texture';
import { CubeReflectionMapping } from '../constants';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function CubeTexture( images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding ) {

	images = images !== undefined ? images : [];
	mapping = mapping !== undefined ? mapping : CubeReflectionMapping;

	Texture.call( this, images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding );

	this.flipY = false;

}

CubeTexture.prototype = Object.create( Texture.prototype );
CubeTexture.prototype.constructor = CubeTexture;

CubeTexture.prototype.isCubeTexture = true;

Object.defineProperty( CubeTexture.prototype, 'images', {

	get: function () {

		return this.image;

	},

	set: function ( value ) {

		this.image = value;

	}

} );

CubeTexture.prototype.fromEquirectangular = function( renderer, source, size ) {

	var scene = new THREE.Scene();

	var gl = renderer.getContext();
	var maxSize = gl.getParameter( gl.MAX_CUBE_MAP_TEXTURE_SIZE )

	var camera = new THREE.CubeCamera( 1, 100000, Math.min( size, maxSize ) );

	var material = new THREE.MeshBasicMaterial( {
		map: source,
		side: THREE.BackSide
	} );

	var mesh = new THREE.Mesh(
		new THREE.IcosahedronGeometry( 100, 4 ),
		material
	);

	scene.add( mesh );

	camera.updateCubeMap( renderer, scene );

	return camera.renderTarget.texture;

}

export { CubeTexture };
