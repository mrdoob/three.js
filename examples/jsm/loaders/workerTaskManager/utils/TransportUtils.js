/**
 * @author Kai Salmen / https://kaisalmen.de
 * Development repository: https://github.com/kaisalmen/WWOBJLoader
 */

import {
	BufferGeometry,
	BufferAttribute,
	Box3,
	Sphere,
	Texture,
	Material,
	MeshStandardMaterial,
	MaterialLoader
} from "../../../../../build/three.module.js";
import {
	MaterialUtils
} from './MaterialUtils.js';

/**
 * Define a base structure that is used to ship data in between main and workers.
 */
class DataTransport {

	/**
	 * Creates a new {@link DataTransport}.
	 *
	 * @param {string} [cmd]
	 * @param {string} [id]
	 */
	constructor( cmd, id ) {

		this.main = {
			cmd: ( cmd !== undefined ) ? cmd : 'unknown',
			id: ( id !== undefined ) ? id : 0,
			type: 'DataTransport',
			/** @type {number} */
			progress: 0,
			buffers: {},
			params: {
			}
		};
		this.transferables = [];
	}

	/**
	 *
	 * @param {object} transportObject
	 *
	 * @return {DataTransport}
	 */
	loadData( transportObject ) {
		this.main.cmd = transportObject.cmd;
		this.main.id = transportObject.id;
		this.main.type = 'DataTransport';
		this.setProgress( transportObject.progress );
		this.setParams( transportObject.params );

		if ( transportObject.buffers ) {
			Object.entries( transportObject.buffers ).forEach( ( [name, buffer] ) => {
				this.main.buffers[ name ] = buffer;
			} );
		}
		return this;
	}

	/**
	 *
	 * @return {string}
	 */
	getCmd () {
		return this.main.cmd;
	}

	/**
	 *
	 * @return {number|string}
	 */
	getId() {
		return this.main.id;
	}

	/**
	 *
	 * @param {object.<string, *>} params
	 * @return {DataTransport}
	 */
	setParams( params ) {

		if ( params !== null && params !== undefined ) {
			this.main.params = params;
		}
		return this;

	}

	getParams() {
		return this.main.params;
	}

	/**
	 *
	 * @param {number} numericalValue
	 *
	 * @return {DataTransport}
	 */
	setProgress( numericalValue ) {

		this.main.progress = numericalValue;
		return this;

	}

	/**
	 *
	 * @param name
	 * @param buffer
	 * @return {DataTransport}
	 */
	addBuffer ( name, buffer ) {
		this.main.buffers[ name ] = buffer;
		return this;
	}

	/**
	 *
	 * @param name
	 * @return {ArrayBuffer}
	 */
	getBuffer( name ) {
		return this.main.buffers[ name ];
	}

	/**
	 * Package all data buffers
	 *
	 * @param {boolean} cloneBuffers
	 *
	 * @return {DataTransport}
	 */
	package( cloneBuffers ) {
		for ( let buffer of Object.values( this.main.buffers ) ) {

			if ( buffer !== null && buffer !== undefined ) {

				const potentialClone = cloneBuffers ? buffer.slice( 0 ) : buffer;
				this.transferables.push( potentialClone );

			}

		}
		return this;
	}

	/**
	 * Return main data object
	 * @return {object}
	 */
	getMain() {

		return this.main;

	}

	/**
	 * Return all transferable in one array.
	 * @return {[]|any[]|*}
	 */
	getTransferables() {

		return this.transferables;

	}

	/**
	 * Posts a message by invoking the method on the provided object.
	 *
	 * @param {object} postMessageImpl
	 *
	 * @return {DataTransport}
	 */
	postMessage( postMessageImpl ) {

		postMessageImpl.postMessage( this.main, this.transferables );
		return this;

	}
}

/**
 * Define a structure that is used to ship materials data between main and workers.
 */
class MaterialsTransport extends DataTransport {

	/**
	 * Creates a new {@link MeshMessageStructure}.
	 *
	 * @param {string} [cmd]
	 * @param {string} [id]
	 */
	constructor( cmd, id ) {
		super( cmd, id );
		this.main.type = 'MaterialsTransport';
		this.main.materials = {};
		this.main.multiMaterialNames = {};
		this.main.cloneInstructions = [];
	}

	/**
	 *
	 * @param {object} transportObject
	 *
	 * @return {MaterialsTransport}
	 */
	loadData( transportObject ) {
		super.loadData( transportObject );
		this.main.type = 'MaterialsTransport';
		Object.assign( this.main, transportObject );

		const materialLoader = new MaterialLoader();
		Object.entries( this.main.materials ).forEach( ( [ name, materialObject ] ) => {

			this.main.materials[ name ] = materialLoader.parse( materialObject )

		} );
		return this;
	}

	_cleanMaterial ( material ) {
		Object.entries( material ).forEach( ( [key, value] ) => {
			if ( value instanceof Texture || value === null ) {
				material[ key ] = undefined;
			}
		} );
		return material;
	}

	/**
	 *
	 * @param name
	 * @param buffer
	 * @return {DataTransport}
	 */
	addBuffer( name, buffer ) {
		return super.addBuffer( name, buffer );
	}

	setParams( params ) {
		super.setParams( params );
		return this;
	}

	/**
	 *
	 * @param materials
	 */
	setMaterials ( materials ) {
		if ( materials !== undefined && materials !== null && Object.keys( materials ).length > 0 ) this.main.materials = materials;
		return this;
	}

	getMaterials () {
		return this.main.materials;
	}

	/**
	 * Removes all textures and null values from all materials
	 */
	cleanMaterials () {
		let clonedMaterials = {};
		let clonedMaterial;
		for ( let material of Object.values( this.main.materials ) ) {

			if ( material instanceof Material ) {

				clonedMaterial = material.clone();
				clonedMaterials[ clonedMaterial.name ] = this._cleanMaterial( clonedMaterial );

			}

		}
		this.setMaterials( clonedMaterials );
		return this;
	}

	package ( cloneBuffers) {

		super.package( cloneBuffers );

		this.main.materials = MaterialUtils.getMaterialsJSON( this.main.materials );
		return this;

	}

	hasMultiMaterial () {

		return ( Object.keys( this.main.multiMaterialNames ).length > 0 );

	}

	getSingleMaterial () {

		if ( Object.keys( this.main.materials ).length > 0 ) {
			return Object.entries( this.main.materials )[ 0 ][ 1 ];
		}
		else {
			return new MeshStandardMaterial( { color: 0xFF0000 } );
		}

	}

	/**
	 * Updates the materials with contained material objects (sync) or from alteration instructions (async).
	 *
	 * @param {Object.<string, Material>} materials
	 * @param {boolean} log
	 *
	 * @return {Material|Material[]}
	 */
	processMaterialTransport ( materials, log ) {

		for ( let i = 0; i < this.main.cloneInstructions.length; i ++ ) {

			MaterialUtils.cloneMaterial( materials, this.main.cloneInstructions[ i ], log );

		}

		let outputMaterial;
		if ( this.hasMultiMaterial() ) {

			// multi-material
			outputMaterial = [];
			Object.entries( this.main.multiMaterialNames ).forEach( ( [ materialIndex, materialName ] ) => {

				outputMaterial[ materialIndex ] = materials[ materialName ];

			} );

		}
		else {

			const singleMaterial = this.getSingleMaterial();
			if (singleMaterial !== null ) {
				outputMaterial = materials[ singleMaterial.name ];
				if ( !outputMaterial ) outputMaterial = singleMaterial;
			}

		}
		return outputMaterial;

	}
}

/**
 * Define a structure that is used to send geometry data between main and workers.
 */
class GeometryTransport extends DataTransport {

	/**
	 * Creates a new {@link GeometrySender}.
	 *
	 * @param {string} [cmd]
	 * @param {string} [id]
	 */
	constructor( cmd, id ) {
		super( cmd, id );
		this.main.type = 'GeometryTransport';
		/**
		 * @type {number}
		 * 0: mesh, 1: line, 2: point
		 */
		this.main.geometryType = 0;
		/** @type {object} */
		this.main.geometry = {};
		/** @type {BufferGeometry} */
		this.main.bufferGeometry = null;
	}

	/**
	 *
	 * @param {object} transportObject
	 *
	 * @return {GeometryTransport}
	 */
	loadData( transportObject ) {
		super.loadData( transportObject );
		this.main.type = 'GeometryTransport';
		return this.setGeometry( transportObject.geometry, transportObject.geometryType );
	}

	setParams( params ) {
		super.setParams( params );
		return this;
	}

	/**
	 * Only add the {@link BufferGeometry}
	 *
	 * @param {BufferGeometry} geometry
	 * @param {number} geometryType
	 *
	 * @return {GeometryTransport}
	 */
	setGeometry( geometry, geometryType ) {
		this.main.geometry = geometry;
		this.main.geometryType = geometryType;
		if ( geometry instanceof BufferGeometry ) this.main.bufferGeometry = geometry;

		return this;
	}

	/**
	 * Package {@link BufferGeometry}
	 *
	 * @param {boolean} cloneBuffers
	 *
	 * @return {GeometryTransport}
	 */
	package( cloneBuffers ) {
		super.package( cloneBuffers );
		const vertexBA = this.main.geometry.getAttribute( 'position' );
		const normalBA = this.main.geometry.getAttribute( 'normal' );
		const uvBA = this.main.geometry.getAttribute( 'uv' );
		const colorBA = this.main.geometry.getAttribute( 'color' );
		const skinIndexBA = this.main.geometry.getAttribute( 'skinIndex' );
		const skinWeightBA = this.main.geometry.getAttribute( 'skinWeight' );
		const indexBA = this.main.geometry.getIndex();

		this.addBufferAttributeToTransferable( vertexBA, cloneBuffers );
		this.addBufferAttributeToTransferable( normalBA, cloneBuffers );
		this.addBufferAttributeToTransferable( uvBA, cloneBuffers );
		this.addBufferAttributeToTransferable( colorBA, cloneBuffers );
		this.addBufferAttributeToTransferable( skinIndexBA, cloneBuffers );
		this.addBufferAttributeToTransferable( skinWeightBA, cloneBuffers );

		this.addBufferAttributeToTransferable( indexBA, cloneBuffers );

		return this;
	}

	/**
	 * @param {boolean} cloneBuffers
	 *
	 * @return {GeometryTransport}
	 */
	reconstruct( cloneBuffers ) {
		if ( this.main.bufferGeometry instanceof BufferGeometry ) return this;
		this.main.bufferGeometry = new BufferGeometry();

		const transferredGeometry = this.main.geometry;
		this.assignAttribute( transferredGeometry.attributes.position, 'position', cloneBuffers );
		this.assignAttribute( transferredGeometry.attributes.normal, 'normal', cloneBuffers );
		this.assignAttribute( transferredGeometry.attributes.uv, 'uv', cloneBuffers );
		this.assignAttribute( transferredGeometry.attributes.color, 'color', cloneBuffers );
		this.assignAttribute( transferredGeometry.attributes.skinIndex, 'skinIndex', cloneBuffers );
		this.assignAttribute( transferredGeometry.attributes.skinWeight, 'skinWeight', cloneBuffers );

		const index = transferredGeometry.index;
		if ( index !== null && index !== undefined ) {

			const indexBuffer = cloneBuffers ? index.array.slice( 0 ) : index.array;
			this.main.bufferGeometry.setIndex( new BufferAttribute( indexBuffer, index.itemSize, index.normalized ) );

		}
		const boundingBox = transferredGeometry.boundingBox;
		if ( boundingBox !== null ) this.main.bufferGeometry.boundingBox = Object.assign( new Box3(), boundingBox );

		const boundingSphere = transferredGeometry.boundingSphere;
		if ( boundingSphere !== null ) this.main.bufferGeometry.boundingSphere = Object.assign( new Sphere(), boundingSphere );

		this.main.bufferGeometry.uuid = transferredGeometry.uuid;
		this.main.bufferGeometry.name = transferredGeometry.name;
		this.main.bufferGeometry.type = transferredGeometry.type;
		this.main.bufferGeometry.groups = transferredGeometry.groups;
		this.main.bufferGeometry.drawRange = transferredGeometry.drawRange;
		this.main.bufferGeometry.userData = transferredGeometry.userData;

		return this;
	}

	/**
	 *
	 * @return {BufferGeometry|null}
	 */
	getBufferGeometry() {
		return this.main.bufferGeometry
	}

	/**
	 *
	 * @param input
	 * @param cloneBuffer
	 *
	 * @return {GeometryTransport}
	 */
	addBufferAttributeToTransferable( input, cloneBuffer ) {
		if ( input !== null && input !== undefined ) {

			const arrayBuffer = cloneBuffer ? input.array.slice( 0 ) : input.array;
			this.transferables.push( arrayBuffer.buffer );

		}
		return this;
	}

	/**
	 *
	 * @param attr
	 * @param attrName
	 * @param cloneBuffer
	 *
	 * @return {GeometryTransport}
	 */
	assignAttribute( attr, attrName, cloneBuffer ) {
		if ( attr ) {
			const arrayBuffer = cloneBuffer ? attr.array.slice( 0 ) : attr.array;
			this.main.bufferGeometry.setAttribute( attrName, new BufferAttribute( arrayBuffer, attr.itemSize, attr.normalized ) );
		}
		return this;
	}

}

class MeshTransport extends GeometryTransport {

	/**
	 * Creates a new {@link MeshTransport}.
	 *
	 * @param {string} [cmd]
	 * @param {string} [id]
	 */
	constructor( cmd, id ) {
		super( cmd, id );

		this.main.type = 'MeshTransport';
		// needs to be added as we cannot inherit from both materials and geometry
		this.main.materialsTransport = new MaterialsTransport();
	}

	/**
	 *
	 * @param {object} transportObject
	 *
	 * @return {MeshTransport}
	 */
	loadData( transportObject ) {
		super.loadData( transportObject );
		this.main.type = 'MeshTransport';
		this.main.meshName = transportObject.meshName;
		this.main.materialsTransport = new MaterialsTransport().loadData( transportObject.materialsTransport.main );

		return this;
	}

	setParams( params ) {
		super.setParams( params );
		return this;
	}

	/**
	 * Only set the material.
	 *
	 * @param {MaterialsTransport} materialsTransport
	 *
	 * @return {MeshTransport}
	 */
	setMaterialsTransport( materialsTransport ) {

		if ( materialsTransport instanceof MaterialsTransport ) this.main.materialsTransport = materialsTransport;
		return this;

	}

	/**
	 * @return {MaterialsTransport}
	 */
	getMaterialsTransport() {

		return this.main.materialsTransport;

	}

	/**
	 *
	 * @param {Mesh} mesh
	 * @param {number} geometryType
	 *
	 * @return {MeshTransport}
	 */
	setMesh( mesh, geometryType ) {
		this.main.meshName = mesh.name;
		super.setGeometry( mesh.geometry, geometryType );

		return this;
	}

	/**
	 * Package {@link Mesh}
	 *
	 * @param {boolean} cloneBuffers
	 *
	 * @return {MeshTransport}
	 */
	package( cloneBuffers ) {
		super.package( cloneBuffers );
		if ( this.main.materialsTransport !== null ) this.main.materialsTransport.package();

		return this;
	}

	/**
	 * @param {boolean} cloneBuffers
	 *
	 * @return {MeshTransport}
	 */
	reconstruct( cloneBuffers ) {
		super.reconstruct( cloneBuffers );

		// so far nothing needs to be done for material

		return this;
	}

}


class ObjectUtils {

	static serializePrototype( targetClass, targetPrototype, fullObjectName, processPrototype ) {

		let prototypeFunctions = [];
		let objectString = '';
		let target;
		if ( processPrototype ) {
			objectString = targetClass.toString() + "\n\n"
			target = targetPrototype;
		} else {
			target = targetClass;
		}
		for ( let name in target ) {

			let objectPart = target[ name ];
			let code = objectPart.toString();

			if ( typeof objectPart === 'function' ) {

				prototypeFunctions.push( '\t' + name + ': ' + code + ',\n\n' );

			}

		}

		let protoString = processPrototype ? '.prototype' : '';
		objectString += fullObjectName + protoString + ' = {\n\n';
		for ( let i = 0; i < prototypeFunctions.length; i ++ ) {

			objectString += prototypeFunctions[ i ];

		}
		objectString += '\n}\n;';
		return objectString;

	}

	static serializeClass( targetClass ) {

		return targetClass.toString() + "\n\n";

	}

}

class ObjectManipulator {

	/**
	 * Applies values from parameter object via set functions or via direct assignment.
	 *
	 * @param {Object} objToAlter The objToAlter instance
	 * @param {Object} params The parameter object
	 * @param {boolean} forceCreation Force the creation of a property
	 */
	static applyProperties ( objToAlter, params, forceCreation ) {

		// fast-fail
		if ( objToAlter === undefined || objToAlter === null || params === undefined || params === null ) return;

		let property, funcName, values;
		for ( property in params ) {

			funcName = 'set' + property.substring( 0, 1 ).toLocaleUpperCase() + property.substring( 1 );
			values = params[ property ];

			if ( typeof objToAlter[ funcName ] === 'function' ) {

				objToAlter[ funcName ]( values );

			} else if ( objToAlter.hasOwnProperty( property ) || forceCreation ) {

				objToAlter[ property ] = values;

			}

		}

	}

}

export {
	DataTransport,
	GeometryTransport,
	MeshTransport,
	MaterialsTransport,
	ObjectUtils,
	ObjectManipulator
}
