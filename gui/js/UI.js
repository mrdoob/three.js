var UI = function () {

	var _domElement = document.createElement( 'div' );
	_domElement.style.position = 'absolute';

	var _viewports = new UI.Viewports();
	_domElement.appendChild( _viewports.getDOMElement() );

	var _toolbar = new UI.Toolbar();
	_domElement.appendChild( _toolbar.getDOMElement() );

	this.getDOMElement = function () {

		return _domElement;

	}

	this.setSize = function ( width, height ) {

		_domElement.style.width = width + 'px';
		_domElement.style.height = height + 'px';

		_viewports.setSize( width, height - 50 );

		_toolbar.setPosition( 0, height - 50 );
		_toolbar.setSize( width, 50 );

	}

};
