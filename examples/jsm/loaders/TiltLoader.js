import {
	BufferAttribute,
	BufferGeometry,
	Color,
	DoubleSide,
	FileLoader,
	Group,
	Loader,
	Mesh,
	MeshBasicMaterial,
	Quaternion,
	Vector3
} from '../../../build/three.module.js';
import { JSZip } from '../libs/jszip.module.min.js';

class TiltLoader extends Loader {

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setWithCredentials( this.withCredentials );

		loader.load( url, function ( buffer ) {

			try {

				onLoad( scope.parse( buffer ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	parse( buffer ) {

		const group = new Group();
		// https://docs.google.com/document/d/11ZsHozYn9FnWG7y3s3WAyKIACfbfwb4PbaS8cZ_xjvo/edit#

		const zip = new JSZip( buffer.slice( 16 ) ); // eslint-disable-line no-undef

		/*
		const thumbnail = zip.files[ 'thumbnail.png' ].asArrayBuffer();
		const img = document.createElement( 'img' );
		img.src = URL.createObjectURL( new Blob( [ thumbnail ] ) );
		document.body.appendChild( img );

		const metadata = JSON.parse( zip.files[ 'metadata.json' ].asText() );
		*/

		/*
		const blob = new Blob( [ zip.files[ 'data.sketch' ].asArrayBuffer() ], { type: 'application/octet-stream' } );
		window.open( URL.createObjectURL( blob ) );
		*/

		const data = new DataView( zip.files[ 'data.sketch' ].asArrayBuffer() );

		const num_strokes = data.getInt32( 16, true );

		let offset = 20;

		for ( let i = 0; i < num_strokes; i ++ ) {

			// const brush_index = data.getInt32( offset, true );
			const brush_color = [
				data.getFloat32( offset + 4, true ),
				data.getFloat32( offset + 8, true ),
				data.getFloat32( offset + 12, true ),
				data.getFloat32( offset + 16, true )
			];
			const brush_size = data.getFloat32( offset + 20, true );
			const stroke_mask = data.getUint32( offset + 24, true );
			const controlpoint_mask = data.getUint32( offset + 28, true );

			let offset_stroke_mask = 0;
			let offset_controlpoint_mask = 0;

			for ( let j = 0; j < 4; j ++ ) {

				// TOFIX: I don't understand these masks yet

				const byte = 1 << j;
				if ( ( stroke_mask & byte ) > 0 ) offset_stroke_mask += 4;
				if ( ( controlpoint_mask & byte ) > 0 ) offset_controlpoint_mask += 4;

			}

			// console.log( { brush_index, brush_color, brush_size, stroke_mask, controlpoint_mask } );
			// console.log( offset_stroke_mask, offset_controlpoint_mask );

			offset = offset + 28 + offset_stroke_mask + 4; // TOFIX: This is wrong

			const num_control_points = data.getInt32( offset, true );

			// console.log( { num_control_points } );

			const positions = new Float32Array( num_control_points * 3 );
			const quaternions = new Float32Array( num_control_points * 4 );

			offset = offset + 4;

			for ( let j = 0, k = 0; j < positions.length; j += 3, k += 4 ) {

				positions[ j + 0 ] = data.getFloat32( offset + 0, true );
				positions[ j + 1 ] = data.getFloat32( offset + 4, true );
				positions[ j + 2 ] = data.getFloat32( offset + 8, true );

				quaternions[ k + 0 ] = data.getFloat32( offset + 12, true );
				quaternions[ k + 1 ] = data.getFloat32( offset + 16, true );
				quaternions[ k + 2 ] = data.getFloat32( offset + 20, true );
				quaternions[ k + 3 ] = data.getFloat32( offset + 24, true );

				offset = offset + 28 + offset_controlpoint_mask; // TOFIX: This is wrong

			}

			// console.log( positions, quaternions );

			const color = new Color().fromArray( brush_color );
			const opacity = brush_color[ 3 ];

			const geometry = new StrokeGeometry( positions, quaternions, brush_size );
			const material = new MeshBasicMaterial( {
				color: color, opacity: opacity, transparent: opacity < 1, side: DoubleSide
			} );
			group.add( new Mesh( geometry, material ) );

		}

		return group;

	}

}

class StrokeGeometry extends BufferGeometry {

	constructor( positions, quaternions, size ) {

		super();

		const vertices = [];

		const position = new Vector3();
		const prevPosition = new Vector3().fromArray( positions, 0 );

		const quaternion = new Quaternion();
		const prevQuaternion = new Quaternion().fromArray( quaternions, 0 );

		const vector1 = new Vector3();
		const vector2 = new Vector3();
		const vector3 = new Vector3();
		const vector4 = new Vector3();

		size = size / 2;

		for ( let i = 0, j = 0; i < positions.length; i += 3, j += 4 ) {

			position.fromArray( positions, i );
			quaternion.fromArray( quaternions, j );

			vector1.set( - size, 0, 0 );
			vector1.applyQuaternion( quaternion );
			vector1.add( position );

			vector2.set( size, 0, 0 );
			vector2.applyQuaternion( quaternion );
			vector2.add( position );

			vector3.set( size, 0, 0 );
			vector3.applyQuaternion( prevQuaternion );
			vector3.add( prevPosition );

			vector4.set( - size, 0, 0 );
			vector4.applyQuaternion( prevQuaternion );
			vector4.add( prevPosition );

			vertices.push( vector1.x, vector1.y, - vector1.z );
			vertices.push( vector2.x, vector2.y, - vector2.z );
			vertices.push( vector4.x, vector4.y, - vector4.z );

			vertices.push( vector2.x, vector2.y, - vector2.z );
			vertices.push( vector3.x, vector3.y, - vector3.z );
			vertices.push( vector4.x, vector4.y, - vector4.z );

			prevPosition.copy( position );
			prevQuaternion.copy( quaternion );

		}

		this.setAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 3 ) );

	}

}

export { TiltLoader };
