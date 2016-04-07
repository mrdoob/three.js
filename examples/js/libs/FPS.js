/**
 * Created by Master James for getting average FPS
 * The goal is a simple tool to aid in tuning down settings to help maintain a target FPS
 */

function FPS( dataTarget, timeLog, logLimit ) {

	this.dataTarget = dataTarget || {};

	this.timeLog = timeLog || dataTarget.timeLog || [ new Date().getTime() ];

	this.logLimit = logLimit || dataTarget.logLimit || 180;

	FPS.prototype.softMerge(dataTarget, { fps: 1, average: 60, last: 0, minFPS: 10000000000000000, maxFPS: 0 } );

}

FPS.prototype.reset = function () {

	this.timeLog = [ new Date().getTime() ];

	this.dataTarget.minFPS = 10000000000000000;

	this.dataTarget.maxFPS = 0;

};

FPS.prototype.update = function ( time, compute ) {

	if( this.logLimit < this.timeLog.length ) this.timeLog.shift();

	this.timeLog.push( time || new Date().getTime() );

	if(compute != false) this.fps();

};

FPS.prototype.average = function ( precision, compute ) {

	if( precision === undefined ) precision = 1;

	if(compute != false) this.fps();

	return parseFloat( this.dataTarget.average.toFixed( precision ) );

};

FPS.prototype.fps = function ( precision ) {

	if( precision === undefined ) precision = 1;

	var timeLog = this.timeLog;

	var length = timeLog.length;

	var end, upto, factor, data = this.dataTarget;

	data.last = ( timeLog[ ( length - 1 ) ] - timeLog[ ( length - 2 ) ] );

	data.fps = ( 1000 / data.last );

	if( length > 2 ) {

		factor = ( data.last / 1000 );

		end = ( length - 1 );

		upto = Math.max( ( end - ( Math.ceil( data.fps ) * ( this.logLimit / 60 ) ) ), 0 );

		data.average = ( ( ( end - upto ) / ( timeLog[ end ] - timeLog[ upto ]) ) * 1000 );

		if ( length > Math.max( ( ( this.logLimit * factor ) / 4 ), 1 ) ) {

			data.minFPS = Math.min( data.average, data.minFPS );

			data.maxFPS = Math.max( data.average, data.maxFPS );

		}
	}
	else data.fps = -1;

	return parseFloat( data.fps.toFixed( precision ) );

};

FPS.prototype.timeLog = function ( newArray ) {

	var timeLog = this.timeLog;

	if( newArray !== undefined ) timeLog = newArray;

	if( typeof( timeLog ) !== 'array' ) timeLog = [ new Date().getTime() ];

	return timeLog;

};

FPS.prototype.logLimit = function ( newLimit ) {

	var logLimit = this.logLimit;

	if( newLimit === undefined ) return logLimit;

	logLimit = newLimit;

	if( typeof( logLimit ) !== 'number' ) logLimit = 360;

	if( logLimit < 16 ) logLimit = 16;

	logLimit.slice( logLimit );

	return logLimit;

};

FPS.prototype.dataTarget = function ( newTarget ) {

	if( newTarget !== undefined ) this.dataTarget = newTarget;

	return this.dataTarget;

};

FPS.prototype.softMerge = function(obj1, obj2, over) {
	if(over === undefined) over = true;
	var itm, res = {};
	for(itm in obj1) {
		if((itm in obj2) && (typeof(obj1[itm]) === "object") && (itm !== null)){
			res[itm] = this.softMerge(obj1[itm], obj2[itm]);
		}
		else {
			var obj3 = obj2[itm];
			if(over === true && obj3 !== undefined) res[itm] = obj3;
			else res[itm] = obj1[itm];
		}
	}
	for(itm in obj2){
		if(itm in res) continue;
		res[itm] = obj2[itm];
	}
	return FPS.prototype.softExtend(obj1, res);
};

FPS.prototype.softExtend = function (){
	var i, len, k, a;
	a = arguments;
	len = a.length;
	for(i = 1; i < len; i++) for(k in a[i]) if(a[i].hasOwnProperty(k)) a[0][k] = a[i][k];
	return a[0];
};
