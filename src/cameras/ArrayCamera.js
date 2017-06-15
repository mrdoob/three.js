/**
 * @author mrdoob / http://mrdoob.com/
 */

import { PerspectiveCamera } from './PerspectiveCamera';
import { Frustum } from '../math/Frustum';

function ArrayFrustum() {

	this.frustumList = [];

}

ArrayFrustum.prototype = Object.assign( Object.create( Frustum.prototype ), {

	constructor: ArrayFrustum,

	intersectsObject: function ( object ) {

		for ( var i = 0; i < this.frustumList.length; ++i ) {

			if ( this.frustumList[i].intersectsObject( object ) ) {

				return true;

			}

		}

		return false;

	},

	intersectsSprite: function ( sprite ) {

		for ( var i = 0; i < this.frustumList.length; ++i ) {

			if ( this.frustumList[i].intersectsSprite( sprite ) ) {

				return true;

			}

		}

		return false;

	},

	intersectsSphere: function ( sphere ) {

		for ( var i = 0; i < this.frustumList.length; ++i ) {

			if ( this.frustumList[i].intersectsSphere( sphere ) ) {

				return true;

			}

		}

		return false;

	},

	intersectsBox: function ( box ) {

		for ( var i = 0; i < this.frustumList.length; ++i ) {

			if ( this.frustumList[i].intersectsBox( box ) ) {

				return true;

			}

		}

		return false;

	},

	containsPoint: function ( point ) {

		for ( var i = 0; i < this.frustumList.length; ++i ) {

			if ( this.frustumList[i].containsPoint( point ) ) {

				return true;

			}

		}

		return false;

	}

} );


function ArrayCamera( array ) {

	PerspectiveCamera.call( this );

	this.cameras = array || [];

}

ArrayCamera.prototype = Object.assign( Object.create( PerspectiveCamera.prototype ), {

	constructor: ArrayCamera,

	isArrayCamera: true,

	_cullingVolume: null,

	getCullingVolume: function () {

		return function getCullingVolume() {

			if (! this._cullingVolume ) {

				this._cullingVolume = new ArrayFrustum();

			}

			this._cullingVolume.frustumList.length = this.cameras.length;

			for ( var i = 0; i < this.cameras.length; ++i ) {

				this._cullingVolume.frustumList[ i ] = this.cameras[ i ].getCullingVolume();

			}

			return this._cullingVolume;

		};

	}()

} );


export { ArrayCamera };
