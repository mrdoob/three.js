/**
 * @author Kai Salmen / www.kaisalmen.de
 */

'use strict';

var WLPCDLoader = function ( manager ) {
	THREE.PCDLoader.call( this, manager );
	this.builderPath = '../';
	this.url = '';
};

WLPCDLoader.prototype = Object.create( THREE.PCDLoader.prototype );
WLPCDLoader.prototype.constructor = WLPCDLoader;

WLPCDLoader.prototype.setBuilderPath = function ( builderPath ) {
	this.builderPath = builderPath;
};

WLPCDLoader.prototype.setUrl = function ( url ) {
	this.url = url;
};

WLPCDLoader.prototype.getParseFunctionName = function () {
	return '_parse';
};

WLPCDLoader.prototype._parse = function ( data ) {
	return this.parse( data, this.url );
};

WLPCDLoader.prototype.buildWorkerCode = function ( codeSerializer, scope ) {
	scope = ( scope === null || scope === undefined ) ? this : scope;
	var workerCode = codeSerializer.serializeClass( 'THREE.PCDLoader', THREE.PCDLoader );
	var pcdInclude = [ 'setBasePath', 'setUrl', 'getParseFunctionName', '_parse' ];
	workerCode += codeSerializer.serializeClass( 'WLPCDLoader', WLPCDLoader, 'WLPCDLoader', 'THREE.PCDLoader', null, pcdInclude );
	return {
		code: workerCode,
		parserName: 'WLPCDLoader',
		usesMeshDisassembler: true,
		defaultGeometryType: 2,
		libs: {
			locations: [
				'build/three.min.js'
			],
			path: scope.builderPath
		},
		provideThree: true
	}
};