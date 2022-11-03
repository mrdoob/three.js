import {
	Matrix4,
	Vector3
} from 'three';

const UncategorizedPlaneType = - 1;
const WallPlaneType = 2;
const FloorPlaneType = 3;
const CeilingPlaneType = 4;
const PlatformPlaneType = 5;

class XRPlaneUtils {

	constructor( renderer ) {

		this.renderer = renderer;
    }

    getPlaneType( plane ) {

        const planes = this.renderer.xr.getPlanes()

        const planeCenterPoint = new Map();
        const planeNormal = new Map();
        const planeHorizontal = new Map();

        const xrReferenceSpace = this.renderer.xr.getReferenceSpace();
        const xrFrame = this.renderer.xr.getFrame();

        planes.forEach( plane => {

            const planePose = xrFrame.getPose( plane.planeSpace, xrReferenceSpace );
            const matrix = new Matrix4();
            matrix.fromArray( planePose.transform.matrix );

            const points = plane.polygon.map( point => new Vector3( point.x, point.y, point.z ).applyMatrix4( matrix ) );

            const avgX = points.reduce( ( sum, point ) => sum + point.x, 0 ) / points.length;
            const avgY = points.reduce( ( sum, point ) => sum + point.y, 0 ) / points.length;
            const avgZ = points.reduce( ( sum, point ) => sum + point.z, 0 ) / points.length;

            planeCenterPoint.set( plane, new Vector3( avgX, avgY, avgZ ) );

            const [ v1, v2, v3 ] = points;

            const normal = new Vector3().crossVectors(
                new Vector3().subVectors( v2, v1 ),
                new Vector3().subVectors( v3, v1 ) ).normalize();

            planeNormal.set( plane, normal );

            if ( Math.round( normal.y ) == 1 || Math.round( normal.y ) == - 1 ) {

                planeHorizontal.set( plane, true );

            } else {

                planeHorizontal.set( plane, false );

            }

        } );

        const horizontalPlanes = [];
        const verticalPlanes = [];

        planes.forEach( plane => {

            if ( planeHorizontal.get( plane ) ) {

                horizontalPlanes.push( plane );

            } else {

                verticalPlanes.push( plane );

            }

        } );

        let [ lowestHorizontalPlane ] = planes;

        horizontalPlanes.forEach( plane => {

            if ( planeCenterPoint.get( plane ).y < planeCenterPoint.get( lowestHorizontalPlane ).y ) {

                lowestHorizontalPlane = plane;

            }

        } );


        let [ highestHorizontalPlane ] = planes;

        horizontalPlanes.forEach( plane => {

            if ( planeCenterPoint.get( plane ).y > planeCenterPoint.get( highestHorizontalPlane ).y ) {

                highestHorizontalPlane = plane;

            }

        } );

        const normal = planeNormal.get( plane );
        const planeIsFacingUp = normal.y > 0 ? true : false;
        const planeIsVertical = planeHorizontal.get( plane ) ? false : true;

        if ( planeIsVertical ) {

            return WallPlaneType;

        } else {

            if ( plane === highestHorizontalPlane && ! planeIsFacingUp ) {

                return CeilingPlaneType;

            } else if ( plane === lowestHorizontalPlane && planeIsFacingUp ) {

                return FloorPlaneType;

            } else if ( planeIsFacingUp ) {

                return PlatformPlaneType;

            }

        }

        return UncategorizedPlaneType;

    };

}

export { 
    XRPlaneUtils,
    UncategorizedPlaneType,
    WallPlaneType,
    FloorPlaneType,
    CeilingPlaneType,
    PlatformPlaneType,
};
