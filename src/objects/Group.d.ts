import { Object3D } from './../core/Object3D';

export class Group<TChild extends Object3D = Object3D> extends Object3D<TChild> {

	constructor();
	type: 'Group';
	readonly isGroup: true;

}
