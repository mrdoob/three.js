/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Creates free form 2d path using series of points, lines or curves.
 **/

import { PathPrototype } from './PathPrototype';
import { Vector2 } from '../../math/Vector2';
import { CurvePath } from './CurvePath';


function Path( points ) {

	CurvePath.call( this );
	this.currentPoint = new Vector2();

	if ( points ) {

		this.fromPoints( points );

	}

}

Path.prototype = PathPrototype;
PathPrototype.constructor = Path;

export { Path };
