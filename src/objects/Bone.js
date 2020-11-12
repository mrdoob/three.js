import { Object3D } from '../core/Object3D.js';

function Bone() {

	Object3D.call( this );

	this.type = 'Bone';

}

Bone.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: Bone,

	isBone: true

} );


export { Bone };
