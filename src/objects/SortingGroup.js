import { Group } from './Group.js';

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

function SortingGroup() {

	Group.call( this );

	this.type = 'SortingGroup';

}

SortingGroup.prototype = Object.assign( Object.create( Group.prototype ), {

	constructor: SortingGroup,

	isSortingGroup: true

} );


export { SortingGroup };
