/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Rectangle = function () {

	var _left, _top, _right, _bottom,
	_width, _height, _isEmpty = true;

	function resize() {

		_width = _right - _left;
		_height = _bottom - _top;

	}

	this.getX = function () {

		return _left;

	};

	this.getY = function () {

		return _top;

	};

	this.getWidth = function () {

		return _width;

	};

	this.getHeight = function () {

		return _height;

	};

	this.getLeft = function() {

		return _left;

	};

	this.getTop = function() {

		return _top;

	};

	this.getRight = function() {

		return _right;

	};

	this.getBottom = function() {

		return _bottom;

	};

	this.set = function ( left, top, right, bottom ) {

		_isEmpty = false;

		_left = left; _top = top;
		_right = right; _bottom = bottom;

		resize();

	};

	this.addPoint = function ( x, y ) {

		if ( _isEmpty ) {

			_isEmpty = false;
			_left = x; _top = y;
			_right = x; _bottom = y;

		} else {

			_left = Math.min( _left, x );
			_top = Math.min( _top, y );
			_right = Math.max( _right, x );
			_bottom = Math.max( _bottom, y );

		}

		resize();

	};

	this.addRectangle = function ( r ) {

		if ( _isEmpty ) {

			_isEmpty = false;
			_left = r.getLeft(); _top = r.getTop();
			_right = r.getRight(); _bottom = r.getBottom();

		} else {

			_left = Math.min(_left, r.getLeft());
			_top = Math.min(_top, r.getTop());
			_right = Math.max(_right, r.getRight());
			_bottom = Math.max(_bottom, r.getBottom());

		}

		resize();

	};

	this.inflate = function ( v ) {

		_left -= v; _top -= v;
		_right += v; _bottom += v;

		resize();

	};

	this.minSelf = function ( r ) {

		_left = Math.max( _left, r.getLeft() );
		_top = Math.max( _top, r.getTop() );
		_right = Math.min( _right, r.getRight() );
		_bottom = Math.min( _bottom, r.getBottom() );

		resize();

	};

	/*
	this.contains = function ( x, y ) {

		return x > _left && x < _right && y > _top && y < _bottom;

	};
	*/

	this.instersects = function ( r ) {

		// return this.contains( r.getLeft(), r.getTop() ) || this.contains( r.getRight(), r.getTop() ) || this.contains( r.getLeft(), r.getBottom() ) || this.contains( r.getRight(), r.getBottom() );

		return Math.min( _right, r.getRight() ) - Math.max( _left, r.getLeft() ) >= 0 && Math.min( _bottom, r.getBottom() ) - Math.max( _top, r.getTop() ) >= 0;

	};

	this.empty = function () {

		_isEmpty = true;

		_left = 0; _top = 0;
		_right = 0; _bottom = 0;

		resize();

	};

	this.isEmpty = function () {

		return _isEmpty;

	};

	this.toString = function () {

		return "THREE.Rectangle ( left: " + _left + ", right: " + _right + ", top: " + _top + ", bottom: " + _bottom + ", width: " + _width + ", height: " + _height + " )";

	};

};
