import { Object3D } from '../core/Object3D.js';

function RenderGroup() {

	Object3D.call( this );

	this.type = 'RenderGroup';

}

RenderGroup.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: RenderGroup,

	excludeTransparent: true,

	isGroup: true

} );


export { RenderGroup };
