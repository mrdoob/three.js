/*
 *
 * Author: Kaleb Murphy
 *
 */



THREE.RingGeometry = function ( innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength ) {

    THREE.Geometry.call( this );

    innerRadius = innerRadius || 0;
    outerRadius = outerRadius || 50;

    thetaStart = thetaStart !== undefined ? thetaStart : 0;
    thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2;

    thetaSegments = thetaSegments !== undefined ? Math.max( 3, thetaSegments ) : 8;
    phiSegments = phiSegments !== undefined ? Math.max( 3, phiSegments ) : 8;
    
    var i, o, uvs = [], radius = innerRadius, radiusStep = ( ( outerRadius - innerRadius ) / phiSegments);
   
    for( i = 0; i <= phiSegments; i++) {//concentric circles inside ring

        //Accounts for special case when inner radius is zero and we only have a single point in the first cirlce
        if( innerRadius === 0 && i === 0 ) {
            var vertex = new THREE.Vector3();
            this.vertices.push( vertex );
            uvs.push( new THREE.Vector2( ( vertex.x / radius + 1 ) / 2, - ( vertex.y / radius + 1 ) / 2 + 1 ) );
            radius += radiusStep;
            continue;
        }
        
        for( o = 0; o <= thetaSegments; o++) {//number of segments per circle

            var vertex = new THREE.Vector3();
            
            vertex.x = radius * Math.cos( thetaStart + o / thetaSegments * thetaLength );
            vertex.y = radius * Math.sin( thetaStart + o / thetaSegments * thetaLength );
            
            this.vertices.push( vertex );
            uvs.push( new THREE.Vector2( ( vertex.x / radius + 1 ) / 2, - ( vertex.y / radius + 1 ) / 2 + 1 ) );
        }
        
        radius += radiusStep;

    }

    var n = new THREE.Vector3( 0, 0, 1 ), mod = 0;
    
    for( i = 0; i < phiSegments; i++) {//concentric circles inside ring

        for( o = 0; o <= thetaSegments; o++) {//number of segments per circle
            
            var v1, v2, v3;

            //Accounts for special case when inner radius is zero and we only have a single point in the first cirlce
            if( innerRadius === 0 && i === 0 ) {

                v1 = 0;
                v2 = o+1;
                v3 = o+2;
                this.faces.push( new THREE.Face3( v1, v2, v3, [ n, n, n ] ) );
                this.faceVertexUvs[ 0 ].push( [ uvs[ v1 ], uvs[ v2 ], uvs[ v3 ] ]);
                
            }else if( innerRadius === 0 && i !== 0 ) {

                mod = -thetaSegments ;

            }

            v1 = o + (thetaSegments * i) + i + mod;
            v3 = o + (thetaSegments * i) + thetaSegments + 1 + i + mod;
            v2 = o + (thetaSegments * i) + thetaSegments + i + mod;
            
            this.faces.push( new THREE.Face3( v1, v2, v3, [ n, n, n ] ) );
            this.faceVertexUvs[ 0 ].push( [ uvs[ v1 ], uvs[ v2 ], uvs[ v3 ] ]);
            
            v1 = o + (thetaSegments * i) + i + mod;
            v2 = o + (thetaSegments * i) + thetaSegments + 1 + i + mod;
            v3 = o + (thetaSegments * i) + 1 + i + mod;
            
            this.faces.push( new THREE.Face3( v1, v2, v3, [ n, n, n ] ) );
            this.faceVertexUvs[ 0 ].push( [ uvs[ v1 ], uvs[ v2 ], uvs[ v3 ] ]);

        }
    }
    
    this.computeCentroids();
    this.computeFaceNormals();

    this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius ); 

};

THREE.RingGeometry.prototype = Object.create( THREE.Geometry.prototype );
