import { PerspectiveCamera } from './PerspectiveCamera';

export class ArrayCamera extends PerspectiveCamera {

	constructor( cameras?: PerspectiveCamera[] );

	cameras: PerspectiveCamera[];
	readonly isArrayCamera: true;

}
