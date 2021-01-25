import { Object3D } from './../core/Object3D';

export class Group<TChild extends Object3D = Object3D> extends Object3D {

	constructor();
	children: TChild[];
	type: 'Group';
	readonly isGroup: true;

	add( ...object: TChild[] ): this;
	remove( ...object: TChild[] ): this;
	attach( object: TChild ): this;

	getObjectById( id: number ): TChild | undefined;
	getObjectByName( name: string ): TChild | undefined;
	getObjectByProperty( name: string, value: string ): TChild | undefined;

}
