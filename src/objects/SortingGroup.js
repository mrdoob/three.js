import { Object3D } from '../core/Object3D.js';

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

function SortingGroup() {

	Object3D.call( this );

	this.type = 'SortingGroup';

}

SortingGroup.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: SortingGroup,

	isSortingGroup: true

} );


export { SortingGroup };
