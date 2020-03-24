/**
 * @author WestLangley / http://github.com/WestLangley
 * @author zz85 / http://github.com/zz85
 * @author bhouston / http://clara.io
 *
 * Creates an arrow for visualizing directions
 *
 * Parameters:
 *  dir - Vector3
 *  origin - Vector3
 *  length - Number
 *  color - color in hex value
 *  headLength - Number
 *  headWidth - Number
 */

import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Object3D } from '../core/Object3D.js';
import { CylinderBufferGeometry } from '../geometries/CylinderGeometry.js';
import { MeshBasicMaterial } from '../materials/MeshBasicMaterial.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { Mesh } from '../objects/Mesh.js';
import { Line } from '../objects/Line.js';
import { Vector3 } from '../math/Vector3.js';

var _axis = new Vector3();
var _lineGeometry, _coneGeometry;

class ArrowHelper extends Object3D {

	constructor( dir, origin, length, color, headLength, headWidth ) {

		// dir is assumed to be normalized
		super();
		if ( dir === undefined ) dir = new Vector3( 0, 0, 1 );
		if ( origin === undefined ) origin = new Vector3( 0, 0, 0 );
		if ( length === undefined ) length = 1;
		if ( color === undefined ) color = 0xffff00;
		if ( headLength === undefined ) headLength = 0.2 * length;
		if ( headWidth === undefined ) headWidth = 0.2 * headLength;
		if ( _lineGeometry === undefined ) {

			_lineGeometry = new BufferGeometry();
			_lineGeometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 0, 1, 0 ], 3 ) );
			_coneGeometry = new CylinderBufferGeometry( 0, 0.5, 1, 5, 1 );
			_coneGeometry.translate( 0, - 0.5, 0 );

		}

		this.position.copy( origin );

		this.line = new Line( _lineGeometry, new LineBasicMaterial( { color: color } ) );
		this.line.matrixAutoUpdate = false;
		this.add( this.line );

		this.cone = new Mesh( _coneGeometry, new MeshBasicMaterial( { color: color } ) );
		this.cone.matrixAutoUpdate = false;
		this.add( this.cone );

		this.setDirection( dir );
		this.setLength( length, headLength, headWidth );

	}

	setDirection( dir ) {

		// dir is assumed to be normalized
		if ( dir.y > 0.99999 ) {

			this.quaternion.set( 0, 0, 0, 1 );

		} else if ( dir.y < - 0.99999 ) {

			this.quaternion.set( 1, 0, 0, 0 );

		} else {

			_axis.set( dir.z, 0, - dir.x ).normalize();
			var radians = Math.acos( dir.y );
			this.quaternion.setFromAxisAngle( _axis, radians );

		}

	}

	setLength( length, headLength, headWidth ) {

		if ( headLength === undefined ) headLength = 0.2 * length;
		if ( headWidth === undefined ) headWidth = 0.2 * headLength;

		this.line.scale.set( 1, Math.max( 0.0001, length - headLength ), 1 ); // see #17458
		this.line.updateMatrix();

		this.cone.scale.set( headWidth, headLength, headWidth );
		this.cone.position.y = length;
		this.cone.updateMatrix();

	}

	setColor( color ) {

		this.line.material.color.set( color );
		this.cone.material.color.set( color );

	}

	copy( source ) {

		super.copy( source, false );
		this.line.copy( source.line );
		this.cone.copy( source.cone );
		return this;

	}

	clone() {

		return new ArrowHelper( this.dir, this.origin, this.length, this.color, this.headLength, this.headWidth );

	}

}


export { ArrowHelper };
