import {
	Object3D
} from '../../../../src/Three';

export class DaydreamController extends Object3D {

	constructor( id: number );

	getTouchpadState(): boolean;
	getGamepad(): object;
	update(): void;

}
