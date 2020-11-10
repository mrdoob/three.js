import {
	Line
} from '../../../src/Three';

import { LineSegmentsGeometry } from './LineSegmentsGeometry';

export class LineGeometry extends LineSegmentsGeometry {

	constructor();
	readonly isLineGeometry: true;

	fromLine( line: Line ): this;

}
