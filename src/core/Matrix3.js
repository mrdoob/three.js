THREE.Matrix3 = function () {

	this.m = [];

};

THREE.Matrix3.prototype = {

	transpose: function () {

		var tmp;

		tmp = this.m[1]; this.m[1] = this.m[3]; this.m[3] = tmp;
		tmp = this.m[2]; this.m[2] = this.m[6]; this.m[6] = tmp;
		tmp = this.m[5]; this.m[5] = this.m[7]; this.m[7] = tmp;

		return this;

	}

}
