var fs = require("fs");
var THREE = require("../../../build/three");

var inputpath = "../../../examples/models/json/scene-animation.json";
var outputpath= "../../../examples/models/json/scene-animation.json";

var json = JSON.parse(fs.readFileSync(inputpath, "utf8"));

json.animations.forEach(function(animation){
   
	animation.tracks.forEach(function(track){
	
		if ( track.times === undefined ) {

			console.warn( "legacy JSON format detected, converting" );

			var times = [], values = [];

			THREE.AnimationUtils.flattenJSON( track.keys, times, values, 'value' );

			track.times = times;
			track.values = values;

		}
		
	});
	
});

fs.writeFileSync(outputpath, JSON.stringify(json,undefined,4), "utf8" );
