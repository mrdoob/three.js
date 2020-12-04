import {
	BufferAttribute,
	BufferGeometry,
	Color,
	FileLoader,
	Group,
	Loader,
	Points,
	PointsMaterial
} from "../../../build/three.module.js";
import { JSZip } from "../libs/jszip.module.min.js";

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

			const brush_index = data.getInt32( offset, true );
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

				const byte = 1 << j;
				if ( ( stroke_mask & byte ) > 0 ) offset_stroke_mask += 4;
				if ( ( controlpoint_mask & byte ) > 0 ) offset_controlpoint_mask += 4;

			}

			// console.log( { brush_index, brush_color, brush_size, stroke_mask, controlpoint_mask } );
			// console.log( offset_stroke_mask, offset_controlpoint_mask );

			offset = offset + 28 + offset_stroke_mask + 4; // TOFIX

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

				offset = offset + 28 + offset_controlpoint_mask;

			}

			// console.log( positions, quaternions );

			const geometry = new BufferGeometry();
			geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );
			const material = new PointsMaterial( { color: new Color().fromArray( brush_color ), size: brush_size } );
			group.add( new Points( geometry, material ) );

		}

		return group;

	}

}

export { TiltLoader };
