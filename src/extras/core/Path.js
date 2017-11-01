/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Creates free form 2d path using series of points, lines or curves.
 **/

import { PathPrototype } from './PathPrototype.js';
import { Vector2 } from '../../math/Vector2.js';
import { CurvePath } from './CurvePath.js';


function Path( points ) {

	CurvePath.call( this );

	this.type = 'Path';

	this.currentPoint = new Vector2();

	if ( points ) {

		this.setFromPoints( points );

	}

}

Path.prototype = PathPrototype;
PathPrototype.constructor = Path;

export { Path };
