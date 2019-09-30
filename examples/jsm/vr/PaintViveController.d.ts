import {
	Color
} from '../../../src/Three';

import { ViveController } from './ViveController';

export class PaintViveController extends ViveController {

	constructor( id: number );

	getColor(): Color;
	getSize(): number;

}
