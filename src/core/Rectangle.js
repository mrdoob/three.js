/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Rectangle = function () {

	var _x1, _y1, _x2, _y2,
	_width, _height,
	_isEmpty = true;

	function resize() {

		_width = _x2 - _x1;
		_height = _y2 - _y1;

	}

	this.getX = function () {

		return _x1;

	};

	this.getY = function () {

		return _y1;

	};

	this.getWidth = function () {

		return _width;

	};

	this.getHeight = function () {

		return _height;

	};

	this.getX1 = function() {

		return _x1;

	};

	this.getY1 = function() {

		return _y1;

	};

	this.getX2 = function() {

		return _x2;

	};

	this.getY2 = function() {

		return _y2;

	};

	this.set = function ( x1, y1, x2, y2 ) {

		_isEmpty = false;

		_x1 = x1; _y1 = y1;
		_x2 = x2; _y2 = y2;

		resize();

	};

	this.addPoint = function ( x, y ) {

		if ( _isEmpty ) {

			_isEmpty = false;
			_x1 = x; _y1 = y;
			_x2 = x; _y2 = y;

		} else {

			_x1 = Math.min( _x1, x );
			_y1 = Math.min( _y1, y );
			_x2 = Math.max( _x2, x );
			_y2 = Math.max( _y2, y );

		}

		resize();

	};

	this.addRectangle = function ( r ) {

		if ( _isEmpty ) {

			_isEmpty = false;
			_x1 = r.getX1(); _y1 = r.getY1();
			_x2 = r.getX2(); _y2 = r.getY2();

		} else {

			_x1 = Math.min(_x1, r.getX1());
			_y1 = Math.min(_y1, r.getY1());
			_x2 = Math.max(_x2, r.getX2());
			_y2 = Math.max(_y2, r.getY2());

		}

		resize();

	};

	this.inflate = function ( v ) {

		_x1 -= v; _y1 -= v;
		_x2 += v; _y2 += v;

		resize();

	};

	this.minSelf = function( r ) {

		_x1 = Math.max( _x1, r.getX1() );
		_y1 = Math.max( _y1, r.getY1() );
		_x2 = Math.min( _x2, r.getX2() );
		_y2 = Math.min( _y2, r.getY2() );

		resize();

	};

	/*
	this.containsPoint = function (x, y) {

		return x > _x1 && x < _x2 && y > _y1 && y < _y2;

	}
	*/

	this.instersects = function ( r ) {

		return Math.min( _x2, r.getX2() ) - Math.max( _x1, r.getX1() ) >= 0 && Math.min( _y2, r.getY2() ) - Math.max( _y1, r.getY1() ) >= 0;

	};

	this.empty = function () {

		_isEmpty = true;

		_x1 = 0; _y1 = 0;
		_x2 = 0; _y2 = 0;

		resize();

	};

	this.isEmpty = function () {

		return _isEmpty;

	};

	this.toString = function () {

		return "THREE.Rectangle (x1: " + _x1 + ", y1: " + _y2 + ", x2: " + _x2 + ", y1: " + _y1 + ", width: " + _width + ", height: " + _height + ")";

	};

};
