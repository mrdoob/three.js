import { 
	PlaneBufferGeometry, 
	Texture, 
	Uniform, 
	PerspectiveCamera, 
	Scene, 
	Mesh, 
	ShaderMaterial, 
	WebGLRenderer, 
	MathUtils,
	Matrix4, 
	RepeatWrapping, 
	MirroredRepeatWrapping, 
	DoubleSide
} from 'three';
import * as fflate from 'three/addons/libs/fflate.module.js';

function makeNameSafe(str){
	return str.replace(/[^a-zA-Z0-9_]/g, '');
}

class USDZDocument {

	get isDocumentRoot() {

		return true;

	}
	get isDynamic() {

		return false;

	}

	constructor() {

		this.name = 'StageRoot';
		this.children = [];
		this.stageLength = 200;

	}

	add( child ) {

		child.parent = this;
		this.children.push( child );

	}

	remove( child ) {

		const index = this.children.indexOf( child );
		if ( index >= 0 ) {

			if ( child.parent === this ) child.parent = null;
			this.children.splice( index, 1 );

		}

	}


	traverse( callback, current = null ) {

		if ( current !== null ) callback( current );
		else current = this;
		if ( current.children ) {

			for ( const child of current.children ) {

				this.traverse( callback, child );

			}

		}

	}

	findById( uuid ) {

		let found = false;
		function search( current ) {

			if ( found ) return;
			if ( current.uuid === uuid ) {

				found = true;
				return current;

			}

			if ( current.children ) {

				for ( const child of current.children ) {

					const res = search( child );
					if ( res ) return res;

				}

			}

		}

		return search( this );

	}


	buildHeader() {

		return `#usda 1.0
(
	customLayerData = {
		string creator = "Three.js USDZExporter"
	}
	defaultPrim = "${makeNameSafe(this.name)}"
	metersPerUnit = 1
	upAxis = "Y"
	startTimeCode = 0
	endTimeCode = ${this.stageLength}
	timeCodesPerSecond = 60
	framesPerSecond = 60
)
`;

	}

}

export class USDZObject {

	static _id;

	static createEmptyParent( object ) {

		const emptyParent = new USDZObject( MathUtils.generateUUID(), object.name + '_empty_' + ( this._id ++ ), object.matrix );
		const parent = object.parent;
		parent.add( emptyParent );
		emptyParent.add( object );
		emptyParent.isDynamic = true;
		object.matrix = new Matrix4().identity();
		return emptyParent;

	}

	constructor( id, name, matrix, mesh, material, camera ) {

		this.uuid = id;
		this.name = makeNameSafe(name);
		this.matrix = matrix;
		this.geometry = mesh;
		this.material = material;
		this.camera = camera;
		this.parent = null;
		this.children = [];
		this._eventListeners = {};
		this.isDynamic = false;

	}

	is( obj ) {

		if ( ! obj ) return false;
		return this.uuid === obj.uuid;

	}

	isEmpty() {

		return ! this.geometry;

	}

	clone() {

		const clone = new USDZObject( MathUtils.generateUUID(), this.name, this.matrix, this.mesh, this.material );
		clone.isDynamic = this.isDynamic;
		return clone;

	}

	getPath() {

		let current = this.parent;
		let path = this.name;
		while ( current ) {

			path = current.name + '/' + path;
			current = current.parent;

		}

		return '</' + path + '>';

	}

	add( child ) {

		if ( child.parent ) {

			child.parent.remove( child );

		}

		child.parent = this;
		this.children.push( child );

	}

	remove( child ) {

		const index = this.children.indexOf( child );
		if ( index >= 0 ) {

			if ( child.parent === this ) child.parent = null;
			this.children.splice( index, 1 );

		}

	}

	addEventListener( evt, listener ) {

		if ( ! this._eventListeners[ evt ] ) this._eventListeners[ evt ] = [];
		this._eventListeners[ evt ].push( listener );

	}

	removeEventListener( evt, listener ) {

		if ( ! this._eventListeners[ evt ] ) return;
		const index = this._eventListeners[ evt ].indexOf( listener );
		if ( index >= 0 ) {

			this._eventListeners[ evt ].splice( index, 1 );

		}

	}

	onSerialize( writer, context ) {

		this._eventListeners[ 'serialize' ]?.forEach( listener => listener( writer, context ) );

	}

}

const newLine = '\n';
export class CodeWriter {

	constructor() {

		this.str = '';
		this.indent = 0;

	}

	clear() {

		this.str = '';
		this.indent = 0;

	}

	beginBlock( str ) {

		str = this.applyIndent( str );
		this.str += str;
		this.str += newLine;
		this.str += this.applyIndent( '{' );
		this.str += newLine;
		this.indent += 1;

	}

	closeBlock() {

		this.indent -= 1;
		this.str += this.applyIndent( '}' ) + newLine;

	}

	beginArray( str ) {

		str = this.applyIndent( str + ' = [' );
		this.str += str;
		this.str += newLine;
		this.indent += 1;

	}

	closeArray() {

		this.indent -= 1;
		this.str += this.applyIndent( ']' ) + newLine;

	}

	appendLine( str = '' ) {

		str = this.applyIndent( str );
		this.str += str;
		this.str += newLine;

	}

	toString() {

		return this.str;

	}

	applyIndent( str ) {

		let indents = '';
		for ( let i = 0; i < this.indent; i ++ ) indents += '\t';
		return indents + str;

	}

}

class USDZExporterContext {

	constructor( root, exporter, extensions ) {

		this.root = root;
		this.exporter = exporter;

		if ( extensions )
			this.extensions = extensions;

		this.materials = {};
		this.textures = {};
		this.files = {};
		this.document = new USDZDocument();
		this.output = '';

	}

}

class USDZExporter {

	constructor(){
		this.debug = false;
	}

	async parse( scene, options = {} ) {

		options = Object.assign( {
			ar: {
				anchoring: { type: 'plane' },
				planeAnchoring: { alignment: 'horizontal' }
			},
			extensions: []
		}, options );

		this.sceneAnchoringOptions = options;
		const context = new USDZExporterContext( scene, this, options.extensions );
		this.extensions = context.extensions;

		const files = context.files;
		const modelFileName = 'model.usda';

		// model file should be first in USDZ archive so we init it here
		files[ modelFileName ] = null;

		const materials = context.materials;
		const textures = context.textures;

		invokeAll( context, 'onBeforeBuildDocument' );

		traverseVisible( scene, context.document, context );

		invokeAll( context, 'onAfterBuildDocument' );

		parseDocument( context );

		invokeAll( context, 'onAfterSerialize' );

		context.output += buildMaterials( materials, textures );

		const header = context.document.buildHeader();
		const final = header + '\n' + context.output;

		// temporarily for debugging
		this.lastUsda = final;

		// full output file
		if(this.debug)
			console.log( final );

		files[ modelFileName ] = fflate.strToU8( final );
		context.output = null;

		for ( const id in textures ) {

			let texture = textures[ id ];
			const isRGBA = texture.format === 1023;
			if ( texture.isCompressedTexture ) {

				texture = copyTexture( texture );

			}

			// TODO add readback options for textures that don't have texture.image
			const canvas = await imageToCanvas( texture.image );

			if ( canvas ) {

				const blob = await new Promise( resolve => canvas.toBlob( resolve, isRGBA ? 'image/png' : 'image/jpeg', 1 ) );
				files[ `textures/Texture_${id}.${isRGBA ? 'png' : 'jpg'}` ] = new Uint8Array( await blob.arrayBuffer() );

			}
			else {

				console.warn( 'Can`t export texture: ', texture );

			}

		}

		// 64 byte alignment
		// https://github.com/101arrowz/fflate/issues/39#issuecomment-777263109

		let offset = 0;

		for ( const filename in files ) {

			const file = files[ filename ];
			const headerSize = 34 + filename.length;

			offset += headerSize;

			const offsetMod64 = offset & 63;

			if ( offsetMod64 !== 4 ) {

				const padLength = 64 - offsetMod64;
				const padding = new Uint8Array( padLength );

				files[ filename ] = [ file, { extra: { 12345: padding } } ];

			}

			offset = file.length;

		}

		return fflate.zipSync( files, { level: 0 } );

	}

}

function traverseVisible( object, parentModel, context ) {

	if ( ! object.visible ) return;

	let model = undefined;
	const geometry = object.geometry;
	const material = object.material;

	if ( object.isMesh && material?.isMeshStandardMaterial && ! object.isSkinnedMesh ) {

		const name = getObjectId( object );
		model = new USDZObject( object.uuid, name, object.matrix, geometry, material );

	} else if ( object.isCamera ) {

		const name = getObjectId( object );
		model = new USDZObject( object.uuid, name, object.matrix, undefined, undefined, object );

	} else {

		const name = getObjectId( object );
		model = new USDZObject( object.uuid, name, object.matrix );

	}

	if ( model ) {

		if ( parentModel ) {

			parentModel.add( model );

		}

		parentModel = model;

		if ( context.extensions ) {

			for ( const ext of context.extensions ) {

				ext.onExportObject?.call( ext, object, model, context );

			}

		}

	} else {

		const name = getObjectId( object );
		const empty = new USDZObject( object.uuid, name, object.matrix );
		if ( parentModel ) {

			parentModel.add( empty );

		}

		parentModel = empty;

	}

	for ( const ch of object.children ) {

		traverseVisible( ch, parentModel, context );

	}

}

function parseDocument( context ) {

	for ( const child of context.document.children ) {

		addResources( child, context );

	}

	const writer = new CodeWriter();

	writer.beginBlock( `def Xform "${context.document.name}"` );
	
	writer.beginBlock( `def Scope "Scenes" (
			kind = "sceneLibrary"
		)`);

	writer.beginBlock(`def Xform "Scene" (
			customData = {
				bool preliminary_collidesWithEnvironment = 0
				string sceneName = "Scene"
			}
			sceneName = "Scene"
		)`);

	writer.appendLine(`token preliminary:anchoring:type = "${context.exporter.sceneAnchoringOptions.ar.anchoring.type}"`);
	writer.appendLine(`token preliminary:planeAnchoring:alignment = "${context.exporter.sceneAnchoringOptions.ar.planeAnchoring.alignment}"`);
	writer.appendLine();

	for ( const child of context.document.children ) {

		buildXform( child, writer, context );

	}

	invokeAll( context, 'onAfterHierarchy', writer );

	writer.closeBlock();
	writer.closeBlock();
	writer.closeBlock();

	context.output += writer.toString();

}

function addResources( object, context ) {

	const geometry = object.geometry;
	const material = object.material;

	if ( geometry ) {

		if ( material.isMeshStandardMaterial ) {

			const geometryFileName = 'geometries/Geometry_' + geometry.id + '.usd';

			if ( ! ( geometryFileName in context.files ) ) {

				const meshObject = buildMeshObject( geometry );
				context.files[ geometryFileName ] = buildUSDFileAsString( meshObject, context );

			}

			if ( ! ( material.uuid in context.materials ) ) {

				context.materials[ material.uuid ] = material;

			}

		} else {

			console.warn( 'THREE.USDZExporter: Unsupported material type (USDZ only supports MeshStandardMaterial)', name );

		}

	}

	for ( const ch of object.children ) {

		addResources( ch, context );

	}

}

function invokeAll( context, name, writer = null ) {

	if ( context.extensions ) {

		for ( const ext of context.extensions ) {

			if ( typeof ext[ name ] === 'function' )
				ext[ name ]( context, writer );

		}

	}

}

function copyTexture( texture ) {

	const geometry = new PlaneBufferGeometry( 2, 2, 1, 1 );
	const material = new ShaderMaterial( {
		uniforms: { blitTexture: new Uniform( texture ) },
		vertexShader: `
			varying vec2 vUv;
			void main(){
				vUv = uv;
				gl_Position = vec4(position.xy * 1.0,0.,.999999);
			}`,
		fragmentShader: `
			uniform sampler2D blitTexture; 
			varying vec2 vUv;
			void main(){ 
				gl_FragColor = vec4(vUv.xy, 0, 1);
				gl_FragColor = texture2D( blitTexture, vUv);
			}`
	} );

	const mesh = new Mesh( geometry, material );
	mesh.frustumCulled = false;
	const cam = new PerspectiveCamera();
	const scene = new Scene();
	scene.add( mesh );
	const renderer = new WebGLRenderer( { antialias: false } );
	renderer.setSize( texture.image.width, texture.image.height );
	renderer.clear();
	renderer.render( scene, cam );

	return new Texture( renderer.domElement );

}


function isImageBitmap( image ) {

	return ( typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement ) ||
		( typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement ) ||
		( typeof OffscreenCanvas !== 'undefined' && image instanceof OffscreenCanvas ) ||
		( typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap );

}

async function imageToCanvas( image, color, flipY ) {

	if ( isImageBitmap( image ) ) {

		const scale = 1024 / Math.max( image.width, image.height );

		const canvas = document.createElement( 'canvas' );
		canvas.width = image.width * Math.min( 1, scale );
		canvas.height = image.height * Math.min( 1, scale );

		const context = canvas.getContext( '2d' );

		if ( flipY === true ) {

			context.translate( 0, canvas.height );
			context.scale( 1, - 1 );

		}

		context.drawImage( image, 0, 0, canvas.width, canvas.height );

		// TODO remove, not used anymore
		if ( color !== undefined ) {

			const hex = parseInt( color, 16 );

			const r = ( hex >> 16 & 255 ) / 255;
			const g = ( hex >> 8 & 255 ) / 255;
			const b = ( hex & 255 ) / 255;

			const imagedata = context.getImageData( 0, 0, canvas.width, canvas.height );
			const data = imagedata.data;

			for ( let i = 0; i < data.length; i += 4 ) {

				data[ i + 0 ] = data[ i + 0 ] * r;
				data[ i + 1 ] = data[ i + 1 ] * g;
				data[ i + 2 ] = data[ i + 2 ] * b;

			}

			context.putImageData( imagedata, 0, 0 );

		}

		return canvas;

	} else {

		throw new Error( 'THREE.USDZExporter: No valid image data found. Unable to process texture.' );

	}

}

//

const PRECISION = 7;

function buildHeader() {

	return `#usda 1.0
(
    customLayerData = {
        string creator = "Three.js USDZExporter"
    }
    metersPerUnit = 1
    upAxis = "Y"
)
`;

}

function buildUSDFileAsString( dataToInsert ) {

	let output = buildHeader();
	output += dataToInsert;
	return fflate.strToU8( output );

}

function getObjectId( object ) {

	return object.name.replace( /[-<>\(\)\[\]§$%&\/\\\=\?\,\;]/g, '' ) + '_' + object.id;

}

// Xform

export function buildXform( model, writer, context ) {

	const matrix = model.matrix;
	const geometry = model.geometry;
	const material = model.material;
	const camera = model.camera;
	const name = model.name;
	const transform = buildMatrix( matrix );

	if ( matrix.determinant() < 0 ) {

		console.warn( 'THREE.USDZExporter: USDZ does not support negative scales', path );

	}

	if ( geometry )
		writer.beginBlock( `def Xform "${name}" (prepend references = @./geometries/Geometry_${geometry.id}.usd@</Geometry>)` );
	else if ( camera )
		writer.beginBlock( `def Camera "${name}"` );
	else
		writer.beginBlock( `def Xform "${name}"` );

	if ( material )
		writer.appendLine( `rel material:binding = </Materials/Material_${material.id}>` );
	writer.appendLine( `matrix4d xformOp:transform = ${transform}` );
	writer.appendLine( 'uniform token[] xformOpOrder = ["xformOp:transform"]' );

	if ( camera  ) {
		 
		if ( camera.isOrthographicCamera ) {

			writer.appendLine(`float2 clippingRange = (${camera.near}, ${camera.far})`);
			writer.appendLine(`float horizontalAperture = ${(( Math.abs( camera.left ) + Math.abs( camera.right ) ) * 10).toPrecision( PRECISION )}`);
			writer.appendLine(`float verticalAperture = ${(( Math.abs( camera.top ) + Math.abs( camera.bottom ) ) * 10).toPrecision( PRECISION )}`);
			writer.appendLine(`token projection = "orthographic"`);
	
		} else {
	
			writer.appendLine(`float2 clippingRange = (${camera.near.toPrecision( PRECISION )}, ${camera.far.toPrecision( PRECISION )})`);
			writer.appendLine(`float focalLength = ${camera.getFocalLength().toPrecision( PRECISION )}`);
			writer.appendLine(`float focusDistance = ${camera.focus.toPrecision( PRECISION )}`);
			writer.appendLine(`float horizontalAperture = ${camera.getFilmWidth().toPrecision( PRECISION )}`);
			writer.appendLine(`token projection = "perspective"`);
			writer.appendLine(`float verticalAperture = ${camera.getFilmHeight().toPrecision( PRECISION )}`);

		}

	}

	if ( model.onSerialize ) {

		model.onSerialize( writer, context );

	}

	if ( model.children ) {

		writer.appendLine();
		for ( const ch of model.children ) {

			buildXform( ch, writer, context );

		}

	}

	writer.closeBlock();

}

function fn(num) {
	return num.toFixed(10);
}

export function buildMatrix( matrix ) {

	const array = matrix.elements;

	return `( ${buildMatrixRow( array, 0 )}, ${buildMatrixRow( array, 4 )}, ${buildMatrixRow( array, 8 )}, ${buildMatrixRow( array, 12 )} )`;

}

function buildMatrixRow( array, offset ) {

	return `(${fn(array[ offset + 0 ])}, ${fn(array[ offset + 1 ])}, ${fn(array[ offset + 2 ])}, ${fn(array[ offset + 3 ])})`;

}

// Mesh

function buildMeshObject( geometry ) {

	const mesh = buildMesh( geometry );
	return `
def "Geometry"
{
  ${mesh}
}
`;

}

function buildMesh( geometry ) {

	const name = 'Geometry';
	const attributes = geometry.attributes;
	const count = attributes.position.count;

	return `
    def Mesh "${name}"
    {
        int[] faceVertexCounts = [${buildMeshVertexCount( geometry )}]
        int[] faceVertexIndices = [${buildMeshVertexIndices( geometry )}]
        normal3f[] normals = [${buildVector3Array( attributes.normal, count )}] (
            interpolation = "vertex"
        )
        point3f[] points = [${buildVector3Array( attributes.position, count )}]
        ${attributes.uv ? 
		`float2[] primvars:st = [${buildVector2Array( attributes.uv, count )}] (
            interpolation = "vertex"
        )` : '' }
		${attributes.uv2 ? 
        `float2[] primvars:st2 = [${buildVector2Array( attributes.uv2, count )}] (
            interpolation = "vertex"
        )` : '' }
        uniform token subdivisionScheme = "none"
    }
`;

}

function buildMeshVertexCount( geometry ) {

	const count = geometry.index !== null ? geometry.index.count : geometry.attributes.position.count;

	return Array( count / 3 ).fill( 3 ).join( ', ' );

}

function buildMeshVertexIndices( geometry ) {

	const index = geometry.index;
	const array = [];

	if ( index !== null ) {

		for ( let i = 0; i < index.count; i ++ ) {

			array.push( index.getX( i ) );

		}

	} else {

		const length = geometry.attributes.position.count;

		for ( let i = 0; i < length; i ++ ) {

			array.push( i );

		}

	}

	return array.join( ', ' );

}

function buildVector3Array( attribute, count ) {

	if ( attribute === undefined ) {

		console.warn( 'USDZExporter: Normals missing.' );
		return Array( count ).fill( '(0, 0, 0)' ).join( ', ' );

	}

	const array = [];

	for ( let i = 0; i < attribute.count; i ++ ) {

		const x = attribute.getX( i );
		const y = attribute.getY( i );
		const z = attribute.getZ( i );

		array.push( `(${x.toPrecision( PRECISION )}, ${y.toPrecision( PRECISION )}, ${z.toPrecision( PRECISION )})` );

	}

	return array.join( ', ' );

}

function buildVector2Array( attribute, count ) {

	if ( attribute === undefined ) {

		console.warn( 'USDZExporter: UVs missing.' );
		return Array( count ).fill( '(0, 0)' ).join( ', ' );

	}

	const array = [];

	for ( let i = 0; i < attribute.count; i ++ ) {

		const x = attribute.getX( i );
		const y = attribute.getY( i );

		array.push( `(${x.toPrecision( PRECISION )}, ${1 - y.toPrecision( PRECISION )})` );

	}

	return array.join( ', ' );

}

// Materials

function buildMaterials( materials, textures ) {

	const array = [];

	for ( const uuid in materials ) {

		const material = materials[ uuid ];

		array.push( buildMaterial( material, textures ) );

	}

	return `def "Materials"
{
${array.join( '' )}
}

`;

}

function buildMaterial( material, textures ) {

	// https://graphics.pixar.com/usd/docs/UsdPreviewSurface-Proposal.html

	const pad = '            ';
	const inputs = [];
	const samplers = [];
	const exportForQuickLook = true;

	function buildTexture( texture, mapType, color, opacity ) {

		const id = texture.id + ( color ? '_' + color.getHexString() : '' ) + ( opacity ? '_' + opacity : '' );
		const isRGBA = texture.format === 1023;

		const wrapS = ( texture.wrapS == RepeatWrapping ) ? 'repeat' : ( texture.wrapS == MirroredRepeatWrapping ? 'mirror' : 'clamp' );
		const wrapT = ( texture.wrapT == RepeatWrapping ) ? 'repeat' : ( texture.wrapT == MirroredRepeatWrapping ? 'mirror' : 'clamp' );

		const repeat = texture.repeat.clone();
		const offset = texture.offset.clone();

		// texture coordinates start in the opposite corner, need to correct
		offset.y = 1 - offset.y - repeat.y;

		// turns out QuickLook is buggy and interprets texture repeat inverted.
		// Apple Feedback: 	FB10036297 and FB11442287
		if ( exportForQuickLook ) {

			offset.x = offset.x / repeat.x;
			offset.y = offset.y / repeat.y;

		}

		textures[ id ] = texture;
		const uvReader = mapType == 'occlusion' ? 'uvReader_st2' : 'uvReader_st';

		const needsTextureTransform = ( repeat.x != 1 || repeat.y != 1 || offset.x != 0 || offset.y != 0 );
		const textureTransformInput = `</Materials/Material_${material.id}/${uvReader}.outputs:result>`;
		const textureTransformOutput = `</Materials/Material_${material.id}/Transform2d_${mapType}.outputs:result>`;

		return `
        ${needsTextureTransform ? `def Shader "Transform2d_${mapType}" (
            sdrMetadata = {
                string role = "math"
            }
        )
        {
            uniform token info:id = "UsdTransform2d"
            float2 inputs:in.connect = ${textureTransformInput}
            float2 inputs:scale = ${buildVector2( repeat )}
            float2 inputs:translation = ${buildVector2( offset )}
            float2 outputs:result
        }
		` : '' }
		def Shader "Texture_${texture.id}_${mapType}"
        {
            uniform token info:id = "UsdUVTexture"
            asset inputs:file = @textures/Texture_${id}.${isRGBA ? 'png' : 'jpg'}@
            float2 inputs:st.connect = ${needsTextureTransform ? textureTransformOutput : textureTransformInput}
			float4 inputs:scale = (${color ? color.r + ', ' + color.g + ', ' + color.b : '1, 1, 1'}, ${opacity ? opacity : '1'})
            token inputs:wrapS = "${wrapS}"
            token inputs:wrapT = "${wrapT}"
            float outputs:r
            float outputs:g
            float outputs:b
            float3 outputs:rgb
            ${material.transparent || material.alphaTest > 0.0 ? 'float outputs:a' : ''}
        }`;

	}

	const effectiveOpacity = (material.transparent || material.alphaTest) ? material.opacity : 1;

	if ( material.side === DoubleSide ) {

		console.warn( 'THREE.USDZExporter: USDZ does not support double sided materials', material );

	}

	if ( material.map !== null ) {

		inputs.push( `${pad}color3f inputs:diffuseColor.connect = </Materials/Material_${material.id}/Texture_${material.map.id}_diffuse.outputs:rgb>` );

		if ( material.transparent ) {

			inputs.push( `${pad}float inputs:opacity.connect = </Materials/Material_${material.id}/Texture_${material.map.id}_diffuse.outputs:a>` );

		} else if ( material.alphaTest > 0.0 ) {

			inputs.push( `${pad}float inputs:opacity.connect = </Materials/Material_${material.id}/Texture_${material.map.id}_diffuse.outputs:a>` );
			inputs.push( `${pad}float inputs:opacityThreshold = ${material.alphaTest}` );

		}

		samplers.push( buildTexture( material.map, 'diffuse', material.color, effectiveOpacity ) );

	} else {

		inputs.push( `${pad}color3f inputs:diffuseColor = ${buildColor( material.color )}` );

	}

	if ( material.emissiveMap !== null ) {

		inputs.push( `${pad}color3f inputs:emissiveColor.connect = </Materials/Material_${material.id}/Texture_${material.emissiveMap.id}_emissive.outputs:rgb>` );

		samplers.push( buildTexture( material.emissiveMap, 'emissive' ) );

	} else if ( material.emissive.getHex() > 0 ) {

		inputs.push( `${pad}color3f inputs:emissiveColor = ${buildColor( material.emissive )}` );

	}

	if ( material.normalMap !== null ) {

		inputs.push( `${pad}normal3f inputs:normal.connect = </Materials/Material_${material.id}/Texture_${material.normalMap.id}_normal.outputs:rgb>` );

		samplers.push( buildTexture( material.normalMap, 'normal' ) );

	}

	if ( material.aoMap !== null ) {

		inputs.push( `${pad}float inputs:occlusion.connect = </Materials/Material_${material.id}/Texture_${material.aoMap.id}_occlusion.outputs:r>` );

		samplers.push( buildTexture( material.aoMap, 'occlusion' ) );

	}

	if ( material.roughnessMap !== null && material.roughness === 1 ) {

		inputs.push( `${pad}float inputs:roughness.connect = </Materials/Material_${material.id}/Texture_${material.roughnessMap.id}_roughness.outputs:g>` );

		samplers.push( buildTexture( material.roughnessMap, 'roughness' ) );

	} else {

		inputs.push( `${pad}float inputs:roughness = ${material.roughness}` );

	}

	if ( material.metalnessMap !== null && material.metalness === 1 ) {

		inputs.push( `${pad}float inputs:metallic.connect = </Materials/Material_${material.id}/Texture_${material.metalnessMap.id}_metallic.outputs:b>` );

		samplers.push( buildTexture( material.metalnessMap, 'metallic' ) );

	} else {

		inputs.push( `${pad}float inputs:metallic = ${material.metalness}` );

	}

	if ( material.alphaMap !== null ) {

		inputs.push( `${pad}float inputs:opacity.connect = </Materials/Material_${material.id}/Texture_${material.alphaMap.id}_opacity.outputs:r>` );
		inputs.push( `${pad}float inputs:opacityThreshold = 0.0001` );

		samplers.push( buildTexture( material.alphaMap, 'opacity' ) );

	} else {

		inputs.push( `${pad}float inputs:opacity = ${effectiveOpacity}` );

	}

	if ( material.isMeshPhysicalMaterial ) {

		inputs.push( `${pad}float inputs:clearcoat = ${material.clearcoat}` );
		inputs.push( `${pad}float inputs:clearcoatRoughness = ${material.clearcoatRoughness}` );
		inputs.push( `${pad}float inputs:ior = ${material.ior}` );

	}

	return `
    def Material "Material_${material.id}"
    {
        def Shader "PreviewSurface"
        {
            uniform token info:id = "UsdPreviewSurface"
${inputs.join( '\n' )}
            int inputs:useSpecularWorkflow = 0
            token outputs:surface
        }

        token outputs:surface.connect = </Materials/Material_${material.id}/PreviewSurface.outputs:surface>

        def Shader "uvReader_st"
        {
            uniform token info:id = "UsdPrimvarReader_float2"
            token inputs:varname = "st"
            float2 inputs:fallback = (0.0, 0.0)
            float2 outputs:result
        }

		def Shader "uvReader_st2"
        {
            uniform token info:id = "UsdPrimvarReader_float2"
            token inputs:varname = "st2"
            float2 inputs:fallback = (0.0, 0.0)
            float2 outputs:result
        }

${samplers.join( '\n' )}

    }
`;

}

function buildColor( color ) {

	return `(${color.r}, ${color.g}, ${color.b})`;

}

function buildVector2( vector ) {

	return `(${ vector.x }, ${ vector.y })`;

}


function buildCamera( camera ) {

	const name = camera.name ? camera.name : 'Camera_' + camera.id;

	const transform = buildMatrix( camera.matrixWorld );

	if ( camera.matrixWorld.determinant() < 0 ) {

		console.warn( 'THREE.USDZExporter: USDZ does not support negative scales', camera );

	}

	if ( camera.isOrthographicCamera ) {

		return `def Camera "${name}"
		{
			matrix4d xformOp:transform = ${ transform }
			uniform token[] xformOpOrder = ["xformOp:transform"]
	
			float2 clippingRange = (${ camera.near.toPrecision( PRECISION ) }, ${ camera.far.toPrecision( PRECISION ) })
			float horizontalAperture = ${ ( ( Math.abs( camera.left ) + Math.abs( camera.right ) ) * 10 ).toPrecision( PRECISION ) }
			float verticalAperture = ${ ( ( Math.abs( camera.top ) + Math.abs( camera.bottom ) ) * 10 ).toPrecision( PRECISION ) }
			token projection = "orthographic"
		}
	
	`;

	} else {

		return `def Camera "${name}"
		{
			matrix4d xformOp:transform = ${ transform }
			uniform token[] xformOpOrder = ["xformOp:transform"]
	
			float2 clippingRange = (${ camera.near.toPrecision( PRECISION ) }, ${ camera.far.toPrecision( PRECISION ) })
			float focalLength = ${ camera.getFocalLength().toPrecision( PRECISION ) }
			float focusDistance = ${ camera.focus.toPrecision( PRECISION ) }
			float horizontalAperture = ${ camera.getFilmWidth().toPrecision( PRECISION ) }
			token projection = "perspective"
			float verticalAperture = ${ camera.getFilmHeight().toPrecision( PRECISION ) }
		}
	
	`;

	}

}

export { USDZExporter };
