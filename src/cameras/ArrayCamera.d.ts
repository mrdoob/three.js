import { PerspectiveCamera } from './PerspectiveCamera';

export class ArrayCamera extends PerspectiveCamera {

	constructor( cameras?: PerspectiveCamera[] );

	/**
	 * @default []
	 */
	cameras: PerspectiveCamera[];
	readonly isArrayCamera: true;

}
