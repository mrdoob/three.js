import { EventDispatcher } from './EventDispatcher';
import { Uniform } from './Uniform';

export class UniformsGroup extends EventDispatcher {

	constructor();

	name: string;
	dynamic: boolean;
	uniforms: Uniform[];

	add( uniform: Uniform ): this;
	clone(): UniformsGroup;
	copy( source: UniformsGroup ): this;
	dispose(): this;
	remove( uniform: Uniform ): this;
	setName( name: string ): this;

}
