import { Texture } from './Texture';
import { CubeReflectionMapping } from '../constants';

import { Scene } from '../scenes/Scene';
import { CubeCamera } from '../cameras/CubeCamera'
import { MeshBasicMaterial } from '../materials/MeshBasicMaterial'
import { BackSide, RepeatWrapping } from '../constants'
import { Mesh } from '../objects/Mesh'
import { IcosahedronGeometry } from '../geometries/IcosahedronGeometry'

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

CubeTexture.prototype.fromEquirectangular = function( renderer, source, size, detail ) {

	var scene = new Scene();

	var gl = renderer.getContext();
	var maxSize = gl.getParameter( gl.MAX_CUBE_MAP_TEXTURE_SIZE )

	var camera = new CubeCamera( 1, 100000, Math.min( size, maxSize ) );

	source.wrapS = source.wrapT = RepeatWrapping;

	var material = new MeshBasicMaterial( {
		map: source,
		side: BackSide
	} );

	var mesh = new Mesh(
		new IcosahedronGeometry( 100, detail || 3 ),
		material
	);

	scene.add( mesh );

	camera.updateCubeMap( renderer, scene );
	camera.renderTarget.texture.isRenderTargetCubeTexture = true;

	return camera.renderTarget.texture;

}

export { CubeTexture };
