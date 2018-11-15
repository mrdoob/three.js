/**
 * @author Kai Salmen / www.kaisalmen.de
 */

'use strict';

THREE.WLPCDLoader = function ( manager ) {
	THREE.PCDLoader.call( this, manager );
	this.builderPath = '../';
	this.resourcePath;
};

THREE.WLPCDLoader.prototype = Object.create( THREE.PCDLoader.prototype );
THREE.WLPCDLoader.prototype.constructor = THREE.WLPCDLoader;

THREE.WLPCDLoader.prototype.setBuilderPath = function ( builderPath ) {
	this.builderPath = builderPath;
};

THREE.WLPCDLoader.prototype.setResourcePath = function ( resourcePath ) {
	this.resourcePath = resourcePath;
};

THREE.WLPCDLoader.prototype.getParseFunctionName = function () {
	return '_parse';
};

THREE.WLPCDLoader.prototype._parse = function ( data ) {
	return this.parse( data, this.resourcePath );
};

THREE.WLPCDLoader.prototype.buildWorkerCode = function ( codeSerializer, scope ) {
	scope = ( scope === null || scope === undefined ) ? this : scope;
	var workerCode = codeSerializer.serializeClass( 'THREE.PCDLoader', THREE.PCDLoader );
	var pcdInclude = [ 'setBasePath', 'setResourcePath', 'getParseFunctionName', '_parse' ];
	workerCode += codeSerializer.serializeClass( 'THREE.WLPCDLoader', THREE.WLPCDLoader, 'THREE.WLPCDLoader', 'THREE.PCDLoader', null, pcdInclude );
	return {
		code: workerCode,
		parserName: 'THREE.WLPCDLoader',
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