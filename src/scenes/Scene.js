THREE.Scene = function () {

	this.objects = [];

	this.add = function (object) {
	
		this.objects.push(object);
	}
	
	/*
	this.remove = function (object) {
		
		var nrObjects = this.objects.length;
	
		for(var i = 0; i < nrObjects; i++) {
		
			if(object == this.objects[i]) {
			
				alert("yay");
			}
		}
	}
	*/
	
	this.toString = function () {
	
		return 'THREE.Scene ( ' + this.objects + ' )';
	}
}
