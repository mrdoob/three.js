import { Vector3 } from '../math/Vector3.js';
import { Object3D } from '../core/Object3D.js';

const _v1 = new Vector3();
const _v2 = new Vector3();

function LOD() {

	Object3D.call( this );

	this._currentLevel = 0;

	this.type = 'LOD';

	Object.defineProperties( this, {
		levels: {
			enumerable: true,
			value: []
		}
	} );

	this.autoUpdate = true;

}

LOD.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: LOD,

	isLOD: true,

	copy: function ( source ) {

		Object3D.prototype.copy.call( this, source, false );

		const levels = source.levels;

		for ( let i = 0, l = levels.length; i < l; i ++ ) {

			const level = levels[ i ];

			this.addLevel( level.object.clone(), level.distance );

		}

		this.autoUpdate = source.autoUpdate;

		return this;

	},

	addLevel: function ( object, distance ) {

		if ( distance === undefined ) distance = 0;

		distance = Math.abs( distance );

		const levels = this.levels;

		let l;

		for ( l = 0; l < levels.length; l ++ ) {

			if ( distance < levels[ l ].distance ) {

				break;

			}

		}

		levels.splice( l, 0, { distance: distance, object: object } );

		this.add( object );

		return this;

	},

	getCurrentLevel: function () {

		return this._currentLevel;

	},

	getObjectForDistance: function ( distance ) {

		const levels = this.levels;

		if ( levels.length > 0 ) {

			let i, l;

			for ( i = 1, l = levels.length; i < l; i ++ ) {

				if ( distance < levels[ i ].distance ) {

					break;

				}

			}

			return levels[ i - 1 ].object;

		}

		return null;

	},

	raycast: function ( raycaster, intersects ) {

		const levels = this.levels;

		if ( levels.length > 0 ) {

			_v1.setFromMatrixPosition( this.matrixWorld );

			const distance = raycaster.ray.origin.distanceTo( _v1 );

			this.getObjectForDistance( distance ).raycast( raycaster, intersects );

		}

	},

	update: function ( camera ) {

		const levels = this.levels;

		if ( levels.length > 1 ) {

			_v1.setFromMatrixPosition( camera.matrixWorld );
			_v2.setFromMatrixPosition( this.matrixWorld );

			const distance = _v1.distanceTo( _v2 ) / camera.zoom;

			levels[ 0 ].object.visible = true;

			let i, l;

			for ( i = 1, l = levels.length; i < l; i ++ ) {

				if ( distance >= levels[ i ].distance ) {

					levels[ i - 1 ].object.visible = false;
					levels[ i ].object.visible = true;

				} else {

					break;

				}

			}

			this._currentLevel = i - 1;

			for ( ; i < l; i ++ ) {

				levels[ i ].object.visible = false;

			}

		}

	},

	toJSON: function ( meta ) {

		const data = Object3D.prototype.toJSON.call( this, meta );

		if ( this.autoUpdate === false ) data.object.autoUpdate = false;

		data.object.levels = [];

		const levels = this.levels;

		for ( let i = 0, l = levels.length; i < l; i ++ ) {

			const level = levels[ i ];

			data.object.levels.push( {
				object: level.object.uuid,
				distance: level.distance
			} );

		}

		return data;

	}

} );


export { LOD };
