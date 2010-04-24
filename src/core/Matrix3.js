var Matrix3 = Class.extend
({
	n11: null, n12: null, n13: null,
	n21: null, n22: null, n23: null,
	n31: null, n32: null, n33: null,

	init: function()
	{
		this.identity();
	},

	identity: function()
	{
		this.n11 = 1; this.n12 = 0; this.n13 = 0;
		this.n21 = 0; this.n22 = 1; this.n23 = 0;
		this.n31 = 0; this.n32 = 0; this.n33 = 1;
	},

	assign: function(m)
	{
		this.n11 = m.n11; this.n12 = m.n12; this.n13 = m.n13;
		this.n21 = m.n21; this.n22 = m.n22; this.n23 = m.n23;
		this.n31 = m.n31; this.n32 = m.n32; this.n33 = m.n33;
	},

	multiplySelf: function(m)
	{
		var n11 = this.n11, n12 = this.n12, n13 = this.n13, n14 = this.n14;
		var n21 = this.n21, n22 = this.n22, n23 = this.n23, n24 = this.n24;
		var n31 = this.n31, n32 = this.n32, n33 = this.n33, n34 = this.n34;

		this.n11 = n11 * m.n11 + n12 * m.n21 + n13 * m.n31;
		this.n12 = n11 * m.n12 + n12 * m.n22 + n13 * m.n32;
		this.n13 = n11 * m.n13 + n12 * m.n23 + n13 * m.n33;

		this.n21 = n21 * m.n11 + n22 * m.n21 + n23 * m.n31;
		this.n22 = n21 * m.n12 + n22 * m.n22 + n23 * m.n32;
		this.n23 = n21 * m.n13 + n22 * m.n23 + n23 * m.n33;

		this.n31 = n31 * m.n11 + n32 * m.n21 + n33 * m.n31;
		this.n32 = n31 * m.n12 + n32 * m.n22 + n33 * m.n32;
		this.n33 = n31 * m.n13 + n32 * m.n23 + n33 * m.n33;
	},

	inverse: function()
	{
		var n11 = this.n11, n12 = this.n12, n13 = this.n13, n14 = this.n14;
		var n21 = this.n21, n22 = this.n22, n23 = this.n23, n24 = this.n24;
		var n31 = this.n31, n32 = this.n32, n33 = this.n33, n34 = this.n34;

		this.n11 = n11; this.n12 = n21; this.n13 = n31;
		this.n21 = n12; this.n22 = n22; this.n23 = n32;
		this.n31 = n13; this.n32 = n23; this.n33 = n33;
	},

	clone: function()
	{
		var m = new Matrix3();
		m.n11 = this.n11; m.n12 = this.n12; m.n13 = this.n13;
		m.n21 = this.n21; m.n22 = this.n22; m.n23 = this.n23;
		m.n31 = this.n31; m.n32 = this.n32; m.n33 = this.n33;
		return m;
	},
    
	toString: function()
	{
        	return "| " + this.n11 + " " + this.n12 + " " + this.n13 + " |\n" +
                        "| " + this.n21 + " " + this.n22 + " " + this.n23 + " |\n" +
                        "| " + this.n31 + " " + this.n32 + " " + this.n33 + " |";
	}
});
