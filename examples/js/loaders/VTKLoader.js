/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.VTKLoader = function () {};

THREE.VTKLoader.prototype = new THREE.Loader();
THREE.VTKLoader.prototype.constructor = THREE.VTKLoader;

THREE.VTKLoader.prototype.load = function ( url, callback ) {

	var that = this;
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function () {

		if ( xhr.readyState == 4 ) {

			if ( xhr.status == 200 || xhr.status == 0 ) {

				callback( that.parse( xhr.responseText ) );

			} else {

				console.error( 'THREE.VTKLoader: Couldn\'t load ' + url + ' (' + xhr.status + ')' );

			}

		}

	};

	xhr.open( "GET", url, true );
	xhr.send( null );

};

THREE.VTKLoader.prototype.parse = function ( data ) {

	var geometry=new THREE.Geometry();
	var lines=data.split("\n");

	function v( x, y, z ) {

		geometry.vertices.push( new THREE.Vector3( x, y, z ) );

	}

	function f3( a, b, c ) {

		geometry.faces.push( new THREE.Face3( a, b, c ) );

	}

	var lineIndex=0;

	var line=lines[0].split(" ");
	var lineLength=line.length;
	var columnIndex=-1;


	function readNextString ()
	{
		while (1)
		{
			var nextWord=line[columnIndex];
			columnIndex++;
			if (columnIndex==lineLength)
			{
				lineIndex++;
				columnIndex=0;
				if (lineIndex>lines.length)
					return ("");
				line=lines[lineIndex].split(" ");
				lineLength=line.length;
			}
			if (nextWord!=null)
				if (nextWord.length>0)
					return (nextWord);
		}
	}

	// read point data
	var found=false;
	while (!found)
	{
		var readString=readNextString();
		switch (readString.toUpperCase())
		{
			case "POINTS":
				found=true;
				break;
			case "":
				alert ("error while reading "+url+" : \n");
				return;
			default:
		}

	}

	var newIndex;
	var new2old;

	var numberOfPoints=parseInt(readNextString());

	if (numberOfPoints>5000000)
	{
		alert ("mesh is too big : "+numberOfPoints+" vertices");
		return;
	}

	var coord=[0,0,0];
	var index2=0;

	var number;
	var coordIndex;
	for (var j=0;j!=numberOfPoints;j++)
	{
		for (coordIndex=0;coordIndex<3;coordIndex++)
		{
			do
			{
				number=parseFloat(line[columnIndex]);
				columnIndex++;
				if (columnIndex==lineLength)
				{
					lineIndex++;
					columnIndex=0;
					if (lineIndex>lines.length)
					{
						alert ("error while reading "+url+" : \n");
						return;
					}
					line=lines[lineIndex].split(" ");
					lineLength=line.length;
				}
			} while (isNaN(number))
			coord[coordIndex]=number;
		}
		v(coord[0],coord[1],coord[2]);
	}

	found=false;
	while (!found)
	{
		var readString=readNextString();
		switch (readString)
		{
			case "POLYGONS":
				found=true;
				break;
			case "":
				alert ("error while reading "+url+" : \n");
				return;
			default:
		}
	}

	var numberOfPolygons=parseInt(readNextString());
	var numberOfpolygonElements=parseInt(readNextString());

	index2=0;
	var connectivity=[];
	for (var p=0;p!=numberOfpolygonElements;p++)
	{
		do
		{
			number=parseInt(line[columnIndex]);
			columnIndex++;
			if (columnIndex==lineLength)
			{
				lineIndex++;
				columnIndex=0;
				if (lineIndex>lines.length)
				{
					alert ("error while reading "+url+" : \n");
					return;
				}
				line=lines[lineIndex].split(" ");
				lineLength=line.length;
			}
		} while (isNaN(number))

		connectivity[index2]=number;
		index2++;

		if (index2==connectivity[0]+1)
		{
			var triangle=[0,0,0];
			index2=0;
			var numberOfTrianglesInCell=connectivity[0]-2;
			var vertex1=triangle[0]=connectivity[1];

			for (var i=0;i<numberOfTrianglesInCell;i++)
			{
				var vertex2=connectivity[i+2];
				var vertex3=triangle[2]=connectivity[i+3];
				f3(vertex1,vertex2,vertex3);
			}
		}
	}

	geometry.computeCentroids();
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();
	geometry.computeBoundingSphere();
	return (geometry);

}
