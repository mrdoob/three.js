/**
 * Records what objects are colliding with each other
 * @class ObjectCollisionMatrix
 * @constructor
 */
class ObjectCollisionMatrix {
  // The matrix storage.
  constructor() {
    this.matrix = {};
  }
  /**
   * @method get
   * @param  {Body} i
   * @param  {Body} j
   * @return {boolean}
   */


  get(bi, bj) {
    let {
      id: i
    } = bi;
    let {
      id: j
    } = bj;

    if (j > i) {
      const temp = j;
      j = i;
      i = temp;
    }

    return i + "-" + j in this.matrix;
  }
  /**
   * @method set
   * @param  {Body} i
   * @param  {Body} j
   * @param {boolean} value
   */


  set(bi, bj, value) {
    let {
      id: i
    } = bi;
    let {
      id: j
    } = bj;

    if (j > i) {
      const temp = j;
      j = i;
      i = temp;
    }

    if (value) {
      this.matrix[i + "-" + j] = true;
    } else {
      delete this.matrix[i + "-" + j];
    }
  }
  /**
   * Empty the matrix
   * @method reset
   */


  reset() {
    this.matrix = {};
  }
  /**
   * Set max number of objects
   * @method setNumObjects
   * @param {Number} n
   */


  setNumObjects(n) {}

}

/**
 * A 3x3 matrix.
 * @class Mat3
 * @constructor
 * @param {Array} elements A vector of length 9, containing all matrix elements. Optional.
 * @author schteppe / http://github.com/schteppe
 */
class Mat3 {
  constructor(elements = [0, 0, 0, 0, 0, 0, 0, 0, 0]) {
    this.elements = elements;
  }
  /**
   * Sets the matrix to identity
   * @method identity
   * @todo Should perhaps be renamed to setIdentity() to be more clear.
   * @todo Create another function that immediately creates an identity matrix eg. eye()
   */


  identity() {
    const e = this.elements;
    e[0] = 1;
    e[1] = 0;
    e[2] = 0;
    e[3] = 0;
    e[4] = 1;
    e[5] = 0;
    e[6] = 0;
    e[7] = 0;
    e[8] = 1;
  }
  /**
   * Set all elements to zero
   * @method setZero
   */


  setZero() {
    const e = this.elements;
    e[0] = 0;
    e[1] = 0;
    e[2] = 0;
    e[3] = 0;
    e[4] = 0;
    e[5] = 0;
    e[6] = 0;
    e[7] = 0;
    e[8] = 0;
  }
  /**
   * Sets the matrix diagonal elements from a Vec3
   * @method setTrace
   * @param {Vec3} vec3
   */


  setTrace(vector) {
    const e = this.elements;
    e[0] = vector.x;
    e[4] = vector.y;
    e[8] = vector.z;
  }
  /**
   * Gets the matrix diagonal elements
   * @method getTrace
   * @return {Vec3}
   */


  getTrace(target = new Vec3()) {
    const e = this.elements;
    target.x = e[0];
    target.y = e[4];
    target.z = e[8];
  }
  /**
   * Matrix-Vector multiplication
   * @method vmult
   * @param {Vec3} v The vector to multiply with
   * @param {Vec3} target Optional, target to save the result in.
   */


  vmult(v, target = new Vec3()) {
    const e = this.elements;
    const x = v.x;
    const y = v.y;
    const z = v.z;
    target.x = e[0] * x + e[1] * y + e[2] * z;
    target.y = e[3] * x + e[4] * y + e[5] * z;
    target.z = e[6] * x + e[7] * y + e[8] * z;
    return target;
  }
  /**
   * Matrix-scalar multiplication
   * @method smult
   * @param {Number} s
   */


  smult(s) {
    for (let i = 0; i < this.elements.length; i++) {
      this.elements[i] *= s;
    }
  }
  /**
   * Matrix multiplication
   * @method mmult
   * @param {Mat3} matrix Matrix to multiply with from left side.
   * @return {Mat3} The result.
   */


  mmult(matrix, target = new Mat3()) {
    const {
      elements
    } = matrix;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let sum = 0.0;

        for (let k = 0; k < 3; k++) {
          sum += elements[i + k * 3] * this.elements[k + j * 3];
        }

        target.elements[i + j * 3] = sum;
      }
    }

    return target;
  }
  /**
   * Scale each column of the matrix
   * @method scale
   * @param {Vec3} v
   * @return {Mat3} The result.
   */


  scale(vector, target = new Mat3()) {
    const e = this.elements;
    const t = target.elements;

    for (let i = 0; i !== 3; i++) {
      t[3 * i + 0] = vector.x * e[3 * i + 0];
      t[3 * i + 1] = vector.y * e[3 * i + 1];
      t[3 * i + 2] = vector.z * e[3 * i + 2];
    }

    return target;
  }
  /**
   * Solve Ax=b
   * @method solve
   * @param {Vec3} b The right hand side
   * @param {Vec3} target Optional. Target vector to save in.
   * @return {Vec3} The solution x
   * @todo should reuse arrays
   */


  solve(b, target = new Vec3()) {
    // Construct equations
    const nr = 3; // num rows

    const nc = 4; // num cols

    const eqns = [];
    let i;
    let j;

    for (i = 0; i < nr * nc; i++) {
      eqns.push(0);
    }

    for (i = 0; i < 3; i++) {
      for (j = 0; j < 3; j++) {
        eqns[i + nc * j] = this.elements[i + 3 * j];
      }
    }

    eqns[3 + 4 * 0] = b.x;
    eqns[3 + 4 * 1] = b.y;
    eqns[3 + 4 * 2] = b.z; // Compute right upper triangular version of the matrix - Gauss elimination

    let n = 3;
    const k = n;
    let np;
    const kp = 4; // num rows

    let p;

    do {
      i = k - n;

      if (eqns[i + nc * i] === 0) {
        // the pivot is null, swap lines
        for (j = i + 1; j < k; j++) {
          if (eqns[i + nc * j] !== 0) {
            np = kp;

            do {
              // do ligne( i ) = ligne( i ) + ligne( k )
              p = kp - np;
              eqns[p + nc * i] += eqns[p + nc * j];
            } while (--np);

            break;
          }
        }
      }

      if (eqns[i + nc * i] !== 0) {
        for (j = i + 1; j < k; j++) {
          const multiplier = eqns[i + nc * j] / eqns[i + nc * i];
          np = kp;

          do {
            // do ligne( k ) = ligne( k ) - multiplier * ligne( i )
            p = kp - np;
            eqns[p + nc * j] = p <= i ? 0 : eqns[p + nc * j] - eqns[p + nc * i] * multiplier;
          } while (--np);
        }
      }
    } while (--n); // Get the solution


    target.z = eqns[2 * nc + 3] / eqns[2 * nc + 2];
    target.y = (eqns[1 * nc + 3] - eqns[1 * nc + 2] * target.z) / eqns[1 * nc + 1];
    target.x = (eqns[0 * nc + 3] - eqns[0 * nc + 2] * target.z - eqns[0 * nc + 1] * target.y) / eqns[0 * nc + 0];

    if (isNaN(target.x) || isNaN(target.y) || isNaN(target.z) || target.x === Infinity || target.y === Infinity || target.z === Infinity) {
      throw "Could not solve equation! Got x=[" + target.toString() + "], b=[" + b.toString() + "], A=[" + this.toString() + "]";
    }

    return target;
  }
  /**
   * Get an element in the matrix by index. Index starts at 0, not 1!!!
   * @method e
   * @param {Number} row
   * @param {Number} column
   * @param {Number} value Optional. If provided, the matrix element will be set to this value.
   * @return {Number}
   */


  e(row, column, value) {
    if (value === undefined) {
      return this.elements[column + 3 * row];
    } else {
      // Set value
      this.elements[column + 3 * row] = value;
    }
  }
  /**
   * Copy another matrix into this matrix object.
   * @method copy
   * @param {Mat3} source
   * @return {Mat3} this
   */


  copy(matrix) {
    for (let i = 0; i < matrix.elements.length; i++) {
      this.elements[i] = matrix.elements[i];
    }

    return this;
  }
  /**
   * Returns a string representation of the matrix.
   * @method toString
   * @return string
   */


  toString() {
    let r = '';
    const sep = ',';

    for (let i = 0; i < 9; i++) {
      r += this.elements[i] + sep;
    }

    return r;
  }
  /**
   * reverse the matrix
   * @method reverse
   * @param {Mat3} target Optional. Target matrix to save in.
   * @return {Mat3} The solution x
   */


  reverse(target = new Mat3()) {
    // Construct equations
    const nr = 3; // num rows

    const nc = 6; // num cols

    const eqns = [];
    let i;
    let j;

    for (i = 0; i < nr * nc; i++) {
      eqns.push(0);
    }

    for (i = 0; i < 3; i++) {
      for (j = 0; j < 3; j++) {
        eqns[i + nc * j] = this.elements[i + 3 * j];
      }
    }

    eqns[3 + 6 * 0] = 1;
    eqns[3 + 6 * 1] = 0;
    eqns[3 + 6 * 2] = 0;
    eqns[4 + 6 * 0] = 0;
    eqns[4 + 6 * 1] = 1;
    eqns[4 + 6 * 2] = 0;
    eqns[5 + 6 * 0] = 0;
    eqns[5 + 6 * 1] = 0;
    eqns[5 + 6 * 2] = 1; // Compute right upper triangular version of the matrix - Gauss elimination

    let n = 3;
    const k = n;
    let np;
    const kp = nc; // num rows

    let p;

    do {
      i = k - n;

      if (eqns[i + nc * i] === 0) {
        // the pivot is null, swap lines
        for (j = i + 1; j < k; j++) {
          if (eqns[i + nc * j] !== 0) {
            np = kp;

            do {
              // do line( i ) = line( i ) + line( k )
              p = kp - np;
              eqns[p + nc * i] += eqns[p + nc * j];
            } while (--np);

            break;
          }
        }
      }

      if (eqns[i + nc * i] !== 0) {
        for (j = i + 1; j < k; j++) {
          const multiplier = eqns[i + nc * j] / eqns[i + nc * i];
          np = kp;

          do {
            // do line( k ) = line( k ) - multiplier * line( i )
            p = kp - np;
            eqns[p + nc * j] = p <= i ? 0 : eqns[p + nc * j] - eqns[p + nc * i] * multiplier;
          } while (--np);
        }
      }
    } while (--n); // eliminate the upper left triangle of the matrix


    i = 2;

    do {
      j = i - 1;

      do {
        const multiplier = eqns[i + nc * j] / eqns[i + nc * i];
        np = nc;

        do {
          p = nc - np;
          eqns[p + nc * j] = eqns[p + nc * j] - eqns[p + nc * i] * multiplier;
        } while (--np);
      } while (j--);
    } while (--i); // operations on the diagonal


    i = 2;

    do {
      const multiplier = 1 / eqns[i + nc * i];
      np = nc;

      do {
        p = nc - np;
        eqns[p + nc * i] = eqns[p + nc * i] * multiplier;
      } while (--np);
    } while (i--);

    i = 2;

    do {
      j = 2;

      do {
        p = eqns[nr + j + nc * i];

        if (isNaN(p) || p === Infinity) {
          throw "Could not reverse! A=[" + this.toString() + "]";
        }

        target.e(i, j, p);
      } while (j--);
    } while (i--);

    return target;
  }
  /**
   * Set the matrix from a quaterion
   * @method setRotationFromQuaternion
   * @param {Quaternion} q
   */


  setRotationFromQuaternion(q) {
    const x = q.x;
    const y = q.y;
    const z = q.z;
    const w = q.w;
    const x2 = x + x;
    const y2 = y + y;
    const z2 = z + z;
    const xx = x * x2;
    const xy = x * y2;
    const xz = x * z2;
    const yy = y * y2;
    const yz = y * z2;
    const zz = z * z2;
    const wx = w * x2;
    const wy = w * y2;
    const wz = w * z2;
    const e = this.elements;
    e[3 * 0 + 0] = 1 - (yy + zz);
    e[3 * 0 + 1] = xy - wz;
    e[3 * 0 + 2] = xz + wy;
    e[3 * 1 + 0] = xy + wz;
    e[3 * 1 + 1] = 1 - (xx + zz);
    e[3 * 1 + 2] = yz - wx;
    e[3 * 2 + 0] = xz - wy;
    e[3 * 2 + 1] = yz + wx;
    e[3 * 2 + 2] = 1 - (xx + yy);
    return this;
  }
  /**
   * Transpose the matrix
   * @method transpose
   * @param  {Mat3} target Optional. Where to store the result.
   * @return {Mat3} The target Mat3, or a new Mat3 if target was omitted.
   */


  transpose(target = new Mat3()) {
    const Mt = target.elements;
    const M = this.elements;

    for (let i = 0; i !== 3; i++) {
      for (let j = 0; j !== 3; j++) {
        Mt[3 * i + j] = M[3 * j + i];
      }
    }

    return target;
  }

}

/**
 * 3-dimensional vector
 * @class Vec3
 * @constructor
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @author schteppe
 * @example
 *     const v = new Vec3(1, 2, 3);
 *     console.log('x=' + v.x); // x=1
 */

class Vec3 {
  constructor(x = 0.0, y = 0.0, z = 0.0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  /**
   * Vector cross product
   * @method cross
   * @param {Vec3} v
   * @param {Vec3} target Optional. Target to save in.
   * @return {Vec3}
   */


  cross(vector, target = new Vec3()) {
    const vx = vector.x;
    const vy = vector.y;
    const vz = vector.z;
    const x = this.x;
    const y = this.y;
    const z = this.z;
    target.x = y * vz - z * vy;
    target.y = z * vx - x * vz;
    target.z = x * vy - y * vx;
    return target;
  }
  /**
   * Set the vectors' 3 elements
   * @method set
   * @param {Number} x
   * @param {Number} y
   * @param {Number} z
   * @return Vec3
   */


  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
  /**
   * Set all components of the vector to zero.
   * @method setZero
   */


  setZero() {
    this.x = this.y = this.z = 0;
  }
  /**
   * Vector addition
   * @method vadd
   * @param {Vec3} v
   * @param {Vec3} target Optional.
   * @return {Vec3}
   */


  vadd(vector, target) {
    if (target) {
      target.x = vector.x + this.x;
      target.y = vector.y + this.y;
      target.z = vector.z + this.z;
    } else {
      return new Vec3(this.x + vector.x, this.y + vector.y, this.z + vector.z);
    }
  }
  /**
   * Vector subtraction
   * @method vsub
   * @param {Vec3} v
   * @param {Vec3} target Optional. Target to save in.
   * @return {Vec3}
   */


  vsub(vector, target) {
    if (target) {
      target.x = this.x - vector.x;
      target.y = this.y - vector.y;
      target.z = this.z - vector.z;
    } else {
      return new Vec3(this.x - vector.x, this.y - vector.y, this.z - vector.z);
    }
  }
  /**
   * Get the cross product matrix a_cross from a vector, such that a x b = a_cross * b = c
   * @method crossmat
   * @see http://www8.cs.umu.se/kurser/TDBD24/VT06/lectures/Lecture6.pdf
   * @return {Mat3}
   */


  crossmat() {
    return new Mat3([0, -this.z, this.y, this.z, 0, -this.x, -this.y, this.x, 0]);
  }
  /**
   * Normalize the vector. Note that this changes the values in the vector.
   * @method normalize
   * @return {Number} Returns the norm of the vector
   */


  normalize() {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const n = Math.sqrt(x * x + y * y + z * z);

    if (n > 0.0) {
      const invN = 1 / n;
      this.x *= invN;
      this.y *= invN;
      this.z *= invN;
    } else {
      // Make something up
      this.x = 0;
      this.y = 0;
      this.z = 0;
    }

    return n;
  }
  /**
   * Get the version of this vector that is of length 1.
   * @method unit
   * @param {Vec3} target Optional target to save in
   * @return {Vec3} Returns the unit vector
   */


  unit(target = new Vec3()) {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    let ninv = Math.sqrt(x * x + y * y + z * z);

    if (ninv > 0.0) {
      ninv = 1.0 / ninv;
      target.x = x * ninv;
      target.y = y * ninv;
      target.z = z * ninv;
    } else {
      target.x = 1;
      target.y = 0;
      target.z = 0;
    }

    return target;
  }
  /**
   * Get the length of the vector
   * @method length
   * @return {Number}
   */


  length() {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    return Math.sqrt(x * x + y * y + z * z);
  }
  /**
   * Get the squared length of the vector.
   * @method lengthSquared
   * @return {Number}
   */


  lengthSquared() {
    return this.dot(this);
  }
  /**
   * Get distance from this point to another point
   * @method distanceTo
   * @param  {Vec3} p
   * @return {Number}
   */


  distanceTo(p) {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const px = p.x;
    const py = p.y;
    const pz = p.z;
    return Math.sqrt((px - x) * (px - x) + (py - y) * (py - y) + (pz - z) * (pz - z));
  }
  /**
   * Get squared distance from this point to another point
   * @method distanceSquared
   * @param  {Vec3} p
   * @return {Number}
   */


  distanceSquared(p) {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const px = p.x;
    const py = p.y;
    const pz = p.z;
    return (px - x) * (px - x) + (py - y) * (py - y) + (pz - z) * (pz - z);
  }
  /**
   * Multiply all the components of the vector with a scalar.
   * @method scale
   * @param {Number} scalar
   * @param {Vec3} target The vector to save the result in.
   * @return {Vec3}
   */


  scale(scalar, target = new Vec3()) {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    target.x = scalar * x;
    target.y = scalar * y;
    target.z = scalar * z;
    return target;
  }
  /**
   * Multiply the vector with an other vector, component-wise.
   * @method vmult
   * @param {Number} vector
   * @param {Vec3} target The vector to save the result in.
   * @return {Vec3}
   */


  vmul(vector, target = new Vec3()) {
    target.x = vector.x * this.x;
    target.y = vector.y * this.y;
    target.z = vector.z * this.z;
    return target;
  }
  /**
   * Scale a vector and add it to this vector. Save the result in "target". (target = this + vector * scalar)
   * @method addScaledVector
   * @param {Number} scalar
   * @param {Vec3} vector
   * @param {Vec3} target The vector to save the result in.
   * @return {Vec3}
   */


  addScaledVector(scalar, vector, target = new Vec3()) {
    target.x = this.x + scalar * vector.x;
    target.y = this.y + scalar * vector.y;
    target.z = this.z + scalar * vector.z;
    return target;
  }
  /**
   * Calculate dot product
   * @method dot
   * @param {Vec3} v
   * @return {Number}
   */


  dot(vector) {
    return this.x * vector.x + this.y * vector.y + this.z * vector.z;
  }
  /**
   * @method isZero
   * @return bool
   */


  isZero() {
    return this.x === 0 && this.y === 0 && this.z === 0;
  }
  /**
   * Make the vector point in the opposite direction.
   * @method negate
   * @param {Vec3} target Optional target to save in
   * @return {Vec3}
   */


  negate(target = new Vec3()) {
    target.x = -this.x;
    target.y = -this.y;
    target.z = -this.z;
    return target;
  }
  /**
   * Compute two artificial tangents to the vector
   * @method tangents
   * @param {Vec3} t1 Vector object to save the first tangent in
   * @param {Vec3} t2 Vector object to save the second tangent in
   */


  tangents(t1, t2) {
    const norm = this.length();

    if (norm > 0.0) {
      const n = Vec3_tangents_n;
      const inorm = 1 / norm;
      n.set(this.x * inorm, this.y * inorm, this.z * inorm);
      const randVec = Vec3_tangents_randVec;

      if (Math.abs(n.x) < 0.9) {
        randVec.set(1, 0, 0);
        n.cross(randVec, t1);
      } else {
        randVec.set(0, 1, 0);
        n.cross(randVec, t1);
      }

      n.cross(t1, t2);
    } else {
      // The normal length is zero, make something up
      t1.set(1, 0, 0);
      t2.set(0, 1, 0);
    }
  }
  /**
   * Converts to a more readable format
   * @method toString
   * @return string
   */


  toString() {
    return this.x + "," + this.y + "," + this.z;
  }
  /**
   * Converts to an array
   * @method toArray
   * @return Array
   */


  toArray() {
    return [this.x, this.y, this.z];
  }
  /**
   * Copies value of source to this vector.
   * @method copy
   * @param {Vec3} source
   * @return {Vec3} this
   */


  copy(vector) {
    this.x = vector.x;
    this.y = vector.y;
    this.z = vector.z;
    return this;
  }
  /**
   * Do a linear interpolation between two vectors
   * @method lerp
   * @param {Vec3} v
   * @param {Number} t A number between 0 and 1. 0 will make this function return u, and 1 will make it return v. Numbers in between will generate a vector in between them.
   * @param {Vec3} target
   */


  lerp(vector, t, target) {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    target.x = x + (vector.x - x) * t;
    target.y = y + (vector.y - y) * t;
    target.z = z + (vector.z - z) * t;
  }
  /**
   * Check if a vector equals is almost equal to another one.
   * @method almostEquals
   * @param {Vec3} v
   * @param {Number} precision
   * @return bool
   */


  almostEquals(vector, precision = 1e-6) {
    if (Math.abs(this.x - vector.x) > precision || Math.abs(this.y - vector.y) > precision || Math.abs(this.z - vector.z) > precision) {
      return false;
    }

    return true;
  }
  /**
   * Check if a vector is almost zero
   * @method almostZero
   * @param {Number} precision
   */


  almostZero(precision = 1e-6) {
    if (Math.abs(this.x) > precision || Math.abs(this.y) > precision || Math.abs(this.z) > precision) {
      return false;
    }

    return true;
  }
  /**
   * Check if the vector is anti-parallel to another vector.
   * @method isAntiparallelTo
   * @param  {Vec3}  v
   * @param  {Number}  precision Set to zero for exact comparisons
   * @return {Boolean}
   */


  isAntiparallelTo(vector, precision) {
    this.negate(antip_neg);
    return antip_neg.almostEquals(vector, precision);
  }
  /**
   * Clone the vector
   * @method clone
   * @return {Vec3}
   */


  clone() {
    return new Vec3(this.x, this.y, this.z);
  }

}
Vec3.ZERO = new Vec3(0, 0, 0);
Vec3.UNIT_X = new Vec3(1, 0, 0);
Vec3.UNIT_Y = new Vec3(0, 1, 0);
Vec3.UNIT_Z = new Vec3(0, 0, 1);
/**
 * Compute two artificial tangents to the vector
 * @method tangents
 * @param {Vec3} t1 Vector object to save the first tangent in
 * @param {Vec3} t2 Vector object to save the second tangent in
 */

const Vec3_tangents_n = new Vec3();
const Vec3_tangents_randVec = new Vec3();
const antip_neg = new Vec3();

/**
 * Axis aligned bounding box class.
 * @class AABB
 * @constructor
 * @param {Object} [options]
 * @param {Vec3}   [options.upperBound] The upper bound of the bounding box.
 * @param {Vec3}   [options.lowerBound] The lower bound of the bounding box
 */
class AABB {
  // The lower bound of the bounding box
  // The upper bound of the bounding box
  constructor(options = {}) {
    this.lowerBound = new Vec3();
    this.upperBound = new Vec3();

    if (options.lowerBound) {
      this.lowerBound.copy(options.lowerBound);
    }

    if (options.upperBound) {
      this.upperBound.copy(options.upperBound);
    }
  }
  /**
   * Set the AABB bounds from a set of points.
   * @method setFromPoints
   * @param {Array} points An array of Vec3's.
   * @param {Vec3} position Optional.
   * @param {Quaternion} quaternion Optional.
   * @param {number} skinSize Optional.
   * @return {AABB} The self object
   */


  setFromPoints(points, position, quaternion, skinSize) {
    const l = this.lowerBound;
    const u = this.upperBound;
    const q = quaternion; // Set to the first point

    l.copy(points[0]);

    if (q) {
      q.vmult(l, l);
    }

    u.copy(l);

    for (let i = 1; i < points.length; i++) {
      let p = points[i];

      if (q) {
        q.vmult(p, tmp);
        p = tmp;
      }

      if (p.x > u.x) {
        u.x = p.x;
      }

      if (p.x < l.x) {
        l.x = p.x;
      }

      if (p.y > u.y) {
        u.y = p.y;
      }

      if (p.y < l.y) {
        l.y = p.y;
      }

      if (p.z > u.z) {
        u.z = p.z;
      }

      if (p.z < l.z) {
        l.z = p.z;
      }
    } // Add offset


    if (position) {
      position.vadd(l, l);
      position.vadd(u, u);
    }

    if (skinSize) {
      l.x -= skinSize;
      l.y -= skinSize;
      l.z -= skinSize;
      u.x += skinSize;
      u.y += skinSize;
      u.z += skinSize;
    }

    return this;
  }
  /**
   * Copy bounds from an AABB to this AABB
   * @method copy
   * @param  {AABB} aabb Source to copy from
   * @return {AABB} The this object, for chainability
   */


  copy(aabb) {
    this.lowerBound.copy(aabb.lowerBound);
    this.upperBound.copy(aabb.upperBound);
    return this;
  }
  /**
   * Clone an AABB
   * @method clone
   */


  clone() {
    return new AABB().copy(this);
  }
  /**
   * Extend this AABB so that it covers the given AABB too.
   * @method extend
   * @param  {AABB} aabb
   */


  extend(aabb) {
    this.lowerBound.x = Math.min(this.lowerBound.x, aabb.lowerBound.x);
    this.upperBound.x = Math.max(this.upperBound.x, aabb.upperBound.x);
    this.lowerBound.y = Math.min(this.lowerBound.y, aabb.lowerBound.y);
    this.upperBound.y = Math.max(this.upperBound.y, aabb.upperBound.y);
    this.lowerBound.z = Math.min(this.lowerBound.z, aabb.lowerBound.z);
    this.upperBound.z = Math.max(this.upperBound.z, aabb.upperBound.z);
  }
  /**
   * Returns true if the given AABB overlaps this AABB.
   * @method overlaps
   * @param  {AABB} aabb
   * @return {Boolean}
   */


  overlaps(aabb) {
    const l1 = this.lowerBound;
    const u1 = this.upperBound;
    const l2 = aabb.lowerBound;
    const u2 = aabb.upperBound; //      l2        u2
    //      |---------|
    // |--------|
    // l1       u1

    const overlapsX = l2.x <= u1.x && u1.x <= u2.x || l1.x <= u2.x && u2.x <= u1.x;
    const overlapsY = l2.y <= u1.y && u1.y <= u2.y || l1.y <= u2.y && u2.y <= u1.y;
    const overlapsZ = l2.z <= u1.z && u1.z <= u2.z || l1.z <= u2.z && u2.z <= u1.z;
    return overlapsX && overlapsY && overlapsZ;
  } // Mostly for debugging


  volume() {
    const l = this.lowerBound;
    const u = this.upperBound;
    return (u.x - l.x) * (u.y - l.y) * (u.z - l.z);
  }
  /**
   * Returns true if the given AABB is fully contained in this AABB.
   * @method contains
   * @param {AABB} aabb
   * @return {Boolean}
   */


  contains(aabb) {
    const l1 = this.lowerBound;
    const u1 = this.upperBound;
    const l2 = aabb.lowerBound;
    const u2 = aabb.upperBound; //      l2        u2
    //      |---------|
    // |---------------|
    // l1              u1

    return l1.x <= l2.x && u1.x >= u2.x && l1.y <= l2.y && u1.y >= u2.y && l1.z <= l2.z && u1.z >= u2.z;
  }
  /**
   * @method getCorners
   * @param {Vec3} a
   * @param {Vec3} b
   * @param {Vec3} c
   * @param {Vec3} d
   * @param {Vec3} e
   * @param {Vec3} f
   * @param {Vec3} g
   * @param {Vec3} h
   */


  getCorners(a, b, c, d, e, f, g, h) {
    const l = this.lowerBound;
    const u = this.upperBound;
    a.copy(l);
    b.set(u.x, l.y, l.z);
    c.set(u.x, u.y, l.z);
    d.set(l.x, u.y, u.z);
    e.set(u.x, l.y, u.z);
    f.set(l.x, u.y, l.z);
    g.set(l.x, l.y, u.z);
    h.copy(u);
  }
  /**
   * Get the representation of an AABB in another frame.
   * @method toLocalFrame
   * @param  {Transform} frame
   * @param  {AABB} target
   * @return {AABB} The "target" AABB object.
   */


  toLocalFrame(frame, target) {
    const corners = transformIntoFrame_corners;
    const a = corners[0];
    const b = corners[1];
    const c = corners[2];
    const d = corners[3];
    const e = corners[4];
    const f = corners[5];
    const g = corners[6];
    const h = corners[7]; // Get corners in current frame

    this.getCorners(a, b, c, d, e, f, g, h); // Transform them to new local frame

    for (let i = 0; i !== 8; i++) {
      const corner = corners[i];
      frame.pointToLocal(corner, corner);
    }

    return target.setFromPoints(corners);
  }
  /**
   * Get the representation of an AABB in the global frame.
   * @method toWorldFrame
   * @param  {Transform} frame
   * @param  {AABB} target
   * @return {AABB} The "target" AABB object.
   */


  toWorldFrame(frame, target) {
    const corners = transformIntoFrame_corners;
    const a = corners[0];
    const b = corners[1];
    const c = corners[2];
    const d = corners[3];
    const e = corners[4];
    const f = corners[5];
    const g = corners[6];
    const h = corners[7]; // Get corners in current frame

    this.getCorners(a, b, c, d, e, f, g, h); // Transform them to new local frame

    for (let i = 0; i !== 8; i++) {
      const corner = corners[i];
      frame.pointToWorld(corner, corner);
    }

    return target.setFromPoints(corners);
  }
  /**
   * Check if the AABB is hit by a ray.
   * @param  {Ray} ray
   * @return {Boolean}
   */


  overlapsRay(ray) {
    const {
      direction,
      from
    } = ray;

    const dirFracX = 1 / direction.x;
    const dirFracY = 1 / direction.y;
    const dirFracZ = 1 / direction.z; // this.lowerBound is the corner of AABB with minimal coordinates - left bottom, rt is maximal corner

    const t1 = (this.lowerBound.x - from.x) * dirFracX;
    const t2 = (this.upperBound.x - from.x) * dirFracX;
    const t3 = (this.lowerBound.y - from.y) * dirFracY;
    const t4 = (this.upperBound.y - from.y) * dirFracY;
    const t5 = (this.lowerBound.z - from.z) * dirFracZ;
    const t6 = (this.upperBound.z - from.z) * dirFracZ; // const tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)));
    // const tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)));

    const tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
    const tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6)); // if tmax < 0, ray (line) is intersecting AABB, but whole AABB is behing us

    if (tmax < 0) {
      //t = tmax;
      return false;
    } // if tmin > tmax, ray doesn't intersect AABB


    if (tmin > tmax) {
      //t = tmax;
      return false;
    }

    return true;
  }

}
const tmp = new Vec3();
const transformIntoFrame_corners = [new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3()];

/**
 * Collision "matrix". It's actually a triangular-shaped array of whether two bodies are touching this step, for reference next step
 * @class ArrayCollisionMatrix
 * @constructor
 */
class ArrayCollisionMatrix {
  // The matrix storage.
  constructor() {
    this.matrix = [];
  }
  /**
   * Get an element
   * @method get
   * @param  {Body} i
   * @param  {Body} j
   * @return {Number}
   */


  get(bi, bj) {
    let {
      index: i
    } = bi;
    let {
      index: j
    } = bj;

    if (j > i) {
      const temp = j;
      j = i;
      i = temp;
    }

    return this.matrix[(i * (i + 1) >> 1) + j - 1];
  }
  /**
   * Set an element
   * @method set
   * @param {Body} i
   * @param {Body} j
   * @param {boolean} value
   */


  set(bi, bj, value) {
    let {
      index: i
    } = bi;
    let {
      index: j
    } = bj;

    if (j > i) {
      const temp = j;
      j = i;
      i = temp;
    }

    this.matrix[(i * (i + 1) >> 1) + j - 1] = value ? 1 : 0;
  }
  /**
   * Sets all elements to zero
   * @method reset
   */


  reset() {
    for (let i = 0, l = this.matrix.length; i !== l; i++) {
      this.matrix[i] = 0;
    }
  }
  /**
   * Sets the max number of objects
   * @method setNumObjects
   * @param {Number} n
   */


  setNumObjects(n) {
    this.matrix.length = n * (n - 1) >> 1;
  }

}

/**
 * Base class for objects that dispatches events.
 * @class EventTarget
 * @constructor
 */
class EventTarget {
  constructor() {}
  /**
   * Add an event listener
   * @method addEventListener
   * @param  {String} type
   * @param  {Function} listener
   * @return {EventTarget} The self object, for chainability.
   */


  addEventListener(type, listener) {
    if (this._listeners === undefined) {
      this._listeners = {};
    }

    const listeners = this._listeners;

    if (listeners[type] === undefined) {
      listeners[type] = [];
    }

    if (!listeners[type].includes(listener)) {
      listeners[type].push(listener);
    }

    return this;
  }
  /**
   * Check if an event listener is added
   * @method hasEventListener
   * @param  {String} type
   * @param  {Function} listener
   * @return {Boolean}
   */


  hasEventListener(type, listener) {
    if (this._listeners === undefined) {
      return false;
    }

    const listeners = this._listeners;

    if (listeners[type] !== undefined && listeners[type].includes(listener)) {
      return true;
    }

    return false;
  }
  /**
   * Check if any event listener of the given type is added
   * @method hasAnyEventListener
   * @param  {String} type
   * @return {Boolean}
   */


  hasAnyEventListener(type) {
    if (this._listeners === undefined) {
      return false;
    }

    const listeners = this._listeners;
    return listeners[type] !== undefined;
  }
  /**
   * Remove an event listener
   * @method removeEventListener
   * @param  {String} type
   * @param  {Function} listener
   * @return {EventTarget} The self object, for chainability.
   */


  removeEventListener(type, listener) {
    if (this._listeners === undefined) {
      return this;
    }

    const listeners = this._listeners;

    if (listeners[type] === undefined) {
      return this;
    }

    const index = listeners[type].indexOf(listener);

    if (index !== -1) {
      listeners[type].splice(index, 1);
    }

    return this;
  }
  /**
   * Emit an event.
   * @method dispatchEvent
   * @param  {Object} event
   * @param  {String} event.type
   * @return {EventTarget} The self object, for chainability.
   */


  dispatchEvent(event) {
    if (this._listeners === undefined) {
      return this;
    }

    const listeners = this._listeners;
    const listenerArray = listeners[event.type];

    if (listenerArray !== undefined) {
      event.target = this;

      for (let i = 0, l = listenerArray.length; i < l; i++) {
        listenerArray[i].call(this, event);
      }
    }

    return this;
  }

}

/**
 * A Quaternion describes a rotation in 3D space. The Quaternion is mathematically defined as Q = x*i + y*j + z*k + w, where (i,j,k) are imaginary basis vectors. (x,y,z) can be seen as a vector related to the axis of rotation, while the real multiplier, w, is related to the amount of rotation.
 * @param {Number} x Multiplier of the imaginary basis vector i.
 * @param {Number} y Multiplier of the imaginary basis vector j.
 * @param {Number} z Multiplier of the imaginary basis vector k.
 * @param {Number} w Multiplier of the real part.
 * @see http://en.wikipedia.org/wiki/Quaternion
 */

class Quaternion {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
  /**
   * Set the value of the quaternion.
   */


  set(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  }
  /**
   * Convert to a readable format
   * @return {String} "x,y,z,w"
   */


  toString() {
    return this.x + "," + this.y + "," + this.z + "," + this.w;
  }
  /**
   * Convert to an Array
   * @return {Array} [x, y, z, w]
   */


  toArray() {
    return [this.x, this.y, this.z, this.w];
  }
  /**
   * Set the quaternion components given an axis and an angle in radians.
   */


  setFromAxisAngle(vector, angle) {
    const s = Math.sin(angle * 0.5);
    this.x = vector.x * s;
    this.y = vector.y * s;
    this.z = vector.z * s;
    this.w = Math.cos(angle * 0.5);
    return this;
  }
  /**
   * Converts the quaternion to [ axis, angle ] representation.
   * @param {Vec3} [targetAxis] A vector object to reuse for storing the axis.
   * @return {Array} An array, first element is the axis and the second is the angle in radians.
   */


  toAxisAngle(targetAxis = new Vec3()) {
    this.normalize(); // if w>1 acos and sqrt will produce errors, this cant happen if quaternion is normalised

    const angle = 2 * Math.acos(this.w);
    const s = Math.sqrt(1 - this.w * this.w); // assuming quaternion normalised then w is less than 1, so term always positive.

    if (s < 0.001) {
      // test to avoid divide by zero, s is always positive due to sqrt
      // if s close to zero then direction of axis not important
      targetAxis.x = this.x; // if it is important that axis is normalised then replace with x=1; y=z=0;

      targetAxis.y = this.y;
      targetAxis.z = this.z;
    } else {
      targetAxis.x = this.x / s; // normalise axis

      targetAxis.y = this.y / s;
      targetAxis.z = this.z / s;
    }

    return [targetAxis, angle];
  }
  /**
   * Set the quaternion value given two vectors. The resulting rotation will be the needed rotation to rotate u to v.
   */


  setFromVectors(u, v) {
    if (u.isAntiparallelTo(v)) {
      const t1 = sfv_t1;
      const t2 = sfv_t2;
      u.tangents(t1, t2);
      this.setFromAxisAngle(t1, Math.PI);
    } else {
      const a = u.cross(v);
      this.x = a.x;
      this.y = a.y;
      this.z = a.z;
      this.w = Math.sqrt(u.length() ** 2 * v.length() ** 2) + u.dot(v);
      this.normalize();
    }

    return this;
  }
  /**
   * Multiply the quaternion with an other quaternion.
   */


  mult(quat, target = new Quaternion()) {
    const ax = this.x;
    const ay = this.y;
    const az = this.z;
    const aw = this.w;
    const bx = quat.x;
    const by = quat.y;
    const bz = quat.z;
    const bw = quat.w;
    target.x = ax * bw + aw * bx + ay * bz - az * by;
    target.y = ay * bw + aw * by + az * bx - ax * bz;
    target.z = az * bw + aw * bz + ax * by - ay * bx;
    target.w = aw * bw - ax * bx - ay * by - az * bz;
    return target;
  }
  /**
   * Get the inverse quaternion rotation.
   */


  inverse(target = new Quaternion()) {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const w = this.w;
    this.conjugate(target);
    const inorm2 = 1 / (x * x + y * y + z * z + w * w);
    target.x *= inorm2;
    target.y *= inorm2;
    target.z *= inorm2;
    target.w *= inorm2;
    return target;
  }
  /**
   * Get the quaternion conjugate
   */


  conjugate(target = new Quaternion()) {
    target.x = -this.x;
    target.y = -this.y;
    target.z = -this.z;
    target.w = this.w;
    return target;
  }
  /**
   * Normalize the quaternion. Note that this changes the values of the quaternion.
   * @method normalize
   */


  normalize() {
    let l = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);

    if (l === 0) {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 0;
    } else {
      l = 1 / l;
      this.x *= l;
      this.y *= l;
      this.z *= l;
      this.w *= l;
    }

    return this;
  }
  /**
   * Approximation of quaternion normalization. Works best when quat is already almost-normalized.
   * @see http://jsperf.com/fast-quaternion-normalization
   * @author unphased, https://github.com/unphased
   */


  normalizeFast() {
    const f = (3.0 - (this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)) / 2.0;

    if (f === 0) {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 0;
    } else {
      this.x *= f;
      this.y *= f;
      this.z *= f;
      this.w *= f;
    }

    return this;
  }
  /**
   * Multiply the quaternion by a vector
   */


  vmult(v, target = new Vec3()) {
    const x = v.x;
    const y = v.y;
    const z = v.z;
    const qx = this.x;
    const qy = this.y;
    const qz = this.z;
    const qw = this.w; // q*v

    const ix = qw * x + qy * z - qz * y;
    const iy = qw * y + qz * x - qx * z;
    const iz = qw * z + qx * y - qy * x;
    const iw = -qx * x - qy * y - qz * z;
    target.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    target.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    target.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return target;
  }
  /**
   * Copies value of source to this quaternion.
   * @method copy
   * @param {Quaternion} source
   * @return {Quaternion} this
   */


  copy(quat) {
    this.x = quat.x;
    this.y = quat.y;
    this.z = quat.z;
    this.w = quat.w;
    return this;
  }
  /**
   * Convert the quaternion to euler angle representation. Order: YZX, as this page describes: http://www.euclideanspace.com/maths/standards/index.htm
   * @method toEuler
   * @param {Vec3} target
   * @param {String} order Three-character string, defaults to "YZX"
   */


  toEuler(target, order = 'YZX') {
    let heading;
    let attitude;
    let bank;
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const w = this.w;

    switch (order) {
      case 'YZX':
        const test = x * y + z * w;

        if (test > 0.499) {
          // singularity at north pole
          heading = 2 * Math.atan2(x, w);
          attitude = Math.PI / 2;
          bank = 0;
        }

        if (test < -0.499) {
          // singularity at south pole
          heading = -2 * Math.atan2(x, w);
          attitude = -Math.PI / 2;
          bank = 0;
        }

        if (heading === undefined) {
          const sqx = x * x;
          const sqy = y * y;
          const sqz = z * z;
          heading = Math.atan2(2 * y * w - 2 * x * z, 1 - 2 * sqy - 2 * sqz); // Heading

          attitude = Math.asin(2 * test); // attitude

          bank = Math.atan2(2 * x * w - 2 * y * z, 1 - 2 * sqx - 2 * sqz); // bank
        }

        break;

      default:
        throw new Error("Euler order " + order + " not supported yet.");
    }

    target.y = heading;
    target.z = attitude;
    target.x = bank;
  }
  /**
   * @param {Number} x
   * @param {Number} y
   * @param {Number} z
   * @param {String} order The order to apply angles: 'XYZ' or 'YXZ' or any other combination
   * @see http://www.mathworks.com/matlabcentral/fileexchange/20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/content/SpinCalc.m
   */


  setFromEuler(x, y, z, order = 'XYZ') {
    const c1 = Math.cos(x / 2);
    const c2 = Math.cos(y / 2);
    const c3 = Math.cos(z / 2);
    const s1 = Math.sin(x / 2);
    const s2 = Math.sin(y / 2);
    const s3 = Math.sin(z / 2);

    if (order === 'XYZ') {
      this.x = s1 * c2 * c3 + c1 * s2 * s3;
      this.y = c1 * s2 * c3 - s1 * c2 * s3;
      this.z = c1 * c2 * s3 + s1 * s2 * c3;
      this.w = c1 * c2 * c3 - s1 * s2 * s3;
    } else if (order === 'YXZ') {
      this.x = s1 * c2 * c3 + c1 * s2 * s3;
      this.y = c1 * s2 * c3 - s1 * c2 * s3;
      this.z = c1 * c2 * s3 - s1 * s2 * c3;
      this.w = c1 * c2 * c3 + s1 * s2 * s3;
    } else if (order === 'ZXY') {
      this.x = s1 * c2 * c3 - c1 * s2 * s3;
      this.y = c1 * s2 * c3 + s1 * c2 * s3;
      this.z = c1 * c2 * s3 + s1 * s2 * c3;
      this.w = c1 * c2 * c3 - s1 * s2 * s3;
    } else if (order === 'ZYX') {
      this.x = s1 * c2 * c3 - c1 * s2 * s3;
      this.y = c1 * s2 * c3 + s1 * c2 * s3;
      this.z = c1 * c2 * s3 - s1 * s2 * c3;
      this.w = c1 * c2 * c3 + s1 * s2 * s3;
    } else if (order === 'YZX') {
      this.x = s1 * c2 * c3 + c1 * s2 * s3;
      this.y = c1 * s2 * c3 + s1 * c2 * s3;
      this.z = c1 * c2 * s3 - s1 * s2 * c3;
      this.w = c1 * c2 * c3 - s1 * s2 * s3;
    } else if (order === 'XZY') {
      this.x = s1 * c2 * c3 - c1 * s2 * s3;
      this.y = c1 * s2 * c3 - s1 * c2 * s3;
      this.z = c1 * c2 * s3 + s1 * s2 * c3;
      this.w = c1 * c2 * c3 + s1 * s2 * s3;
    }

    return this;
  }
  /**
   * @method clone
   * @return {Quaternion}
   */


  clone() {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }
  /**
   * Performs a spherical linear interpolation between two quat
   *
   * @param {Quaternion} toQuat second operand
   * @param {Number} t interpolation amount between the self quaternion and toQuat
   * @param {Quaternion} [target] A quaternion to store the result in. If not provided, a new one will be created.
   * @returns {Quaternion} The "target" object
   */


  slerp(toQuat, t, target = new Quaternion()) {
    const ax = this.x;
    const ay = this.y;
    const az = this.z;
    const aw = this.w;
    let bx = toQuat.x;
    let by = toQuat.y;
    let bz = toQuat.z;
    let bw = toQuat.w;
    let omega;
    let cosom;
    let sinom;
    let scale0;
    let scale1; // calc cosine

    cosom = ax * bx + ay * by + az * bz + aw * bw; // adjust signs (if necessary)

    if (cosom < 0.0) {
      cosom = -cosom;
      bx = -bx;
      by = -by;
      bz = -bz;
      bw = -bw;
    } // calculate coefficients


    if (1.0 - cosom > 0.000001) {
      // standard case (slerp)
      omega = Math.acos(cosom);
      sinom = Math.sin(omega);
      scale0 = Math.sin((1.0 - t) * omega) / sinom;
      scale1 = Math.sin(t * omega) / sinom;
    } else {
      // "from" and "to" quaternions are very close
      //  ... so we can do a linear interpolation
      scale0 = 1.0 - t;
      scale1 = t;
    } // calculate final values


    target.x = scale0 * ax + scale1 * bx;
    target.y = scale0 * ay + scale1 * by;
    target.z = scale0 * az + scale1 * bz;
    target.w = scale0 * aw + scale1 * bw;
    return target;
  }
  /**
   * Rotate an absolute orientation quaternion given an angular velocity and a time step.
   */


  integrate(angularVelocity, dt, angularFactor, target = new Quaternion()) {
    const ax = angularVelocity.x * angularFactor.x,
          ay = angularVelocity.y * angularFactor.y,
          az = angularVelocity.z * angularFactor.z,
          bx = this.x,
          by = this.y,
          bz = this.z,
          bw = this.w;
    const half_dt = dt * 0.5;
    target.x += half_dt * (ax * bw + ay * bz - az * by);
    target.y += half_dt * (ay * bw + az * bx - ax * bz);
    target.z += half_dt * (az * bw + ax * by - ay * bx);
    target.w += half_dt * (-ax * bx - ay * by - az * bz);
    return target;
  }

}
const sfv_t1 = new Vec3();
const sfv_t2 = new Vec3();

const SHAPE_TYPES = {
  SPHERE: 1,
  PLANE: 2,
  BOX: 4,
  COMPOUND: 8,
  CONVEXPOLYHEDRON: 16,
  HEIGHTFIELD: 32,
  PARTICLE: 64,
  CYLINDER: 128,
  TRIMESH: 256
};

/**
 * Base class for shapes
 * @class Shape
 * @constructor
 * @param {object} [options]
 * @param {number} [options.collisionFilterGroup=1]
 * @param {number} [options.collisionFilterMask=-1]
 * @param {number} [options.collisionResponse=true]
 * @param {number} [options.material=null]
 * @author schteppe
 */
class Shape {
  // Identifyer of the Shape.
  // The type of this shape. Must be set to an int > 0 by subclasses.
  // The local bounding sphere radius of this shape.
  // Whether to produce contact forces when in contact with other bodies. Note that contacts will be generated, but they will be disabled.
  constructor(options = {}) {
    this.id = Shape.idCounter++;
    this.type = options.type || 0;
    this.boundingSphereRadius = 0;
    this.collisionResponse = options.collisionResponse ? options.collisionResponse : true;
    this.collisionFilterGroup = options.collisionFilterGroup !== undefined ? options.collisionFilterGroup : 1;
    this.collisionFilterMask = options.collisionFilterMask !== undefined ? options.collisionFilterMask : -1;
    this.material = options.material ? options.material : null;
    this.body = null;
  }
  /**
   * Computes the bounding sphere radius. The result is stored in the property .boundingSphereRadius
   * @method updateBoundingSphereRadius
   */


  updateBoundingSphereRadius() {
    throw "computeBoundingSphereRadius() not implemented for shape type " + this.type;
  }
  /**
   * Get the volume of this shape
   * @method volume
   * @return {Number}
   */


  volume() {
    throw "volume() not implemented for shape type " + this.type;
  }
  /**
   * Calculates the inertia in the local frame for this shape.
   * @method calculateLocalInertia
   * @param {Number} mass
   * @param {Vec3} target
   * @see http://en.wikipedia.org/wiki/List_of_moments_of_inertia
   */


  calculateLocalInertia(mass, target) {
    throw "calculateLocalInertia() not implemented for shape type " + this.type;
  }

  calculateWorldAABB(pos, quat, min, max) {
    throw "calculateWorldAABB() not implemented for shape type " + this.type;
  }

}
Shape.idCounter = 0;
/**
 * The available shape types.
 * @static
 * @property types
 * @type {Object}
 */

Shape.types = SHAPE_TYPES;

class Transform {
  constructor(options = {}) {
    this.position = new Vec3();
    this.quaternion = new Quaternion();

    if (options.position) {
      this.position.copy(options.position);
    }

    if (options.quaternion) {
      this.quaternion.copy(options.quaternion);
    }
  }
  /**
   * Get a global point in local transform coordinates.
   */


  pointToLocal(worldPoint, result) {
    return Transform.pointToLocalFrame(this.position, this.quaternion, worldPoint, result);
  }
  /**
   * Get a local point in global transform coordinates.
   */


  pointToWorld(localPoint, result) {
    return Transform.pointToWorldFrame(this.position, this.quaternion, localPoint, result);
  }

  vectorToWorldFrame(localVector, result = new Vec3()) {
    this.quaternion.vmult(localVector, result);
    return result;
  }

  static pointToLocalFrame(position, quaternion, worldPoint, result = new Vec3()) {
    worldPoint.vsub(position, result);
    quaternion.conjugate(tmpQuat);
    tmpQuat.vmult(result, result);
    return result;
  }

  static pointToWorldFrame(position, quaternion, localPoint, result = new Vec3()) {
    quaternion.vmult(localPoint, result);
    result.vadd(position, result);
    return result;
  }

  static vectorToWorldFrame(quaternion, localVector, result = new Vec3()) {
    quaternion.vmult(localVector, result);
    return result;
  }

  static vectorToLocalFrame(position, quaternion, worldVector, result = new Vec3()) {
    quaternion.w *= -1;
    quaternion.vmult(worldVector, result);
    quaternion.w *= -1;
    return result;
  }

}
const tmpQuat = new Quaternion();

/**
 * A set of polygons describing a convex shape.
 * @class ConvexPolyhedron
 * @constructor
 * @extends Shape
 * @description The shape MUST be convex for the code to work properly. No polygons may be coplanar (contained
 * in the same 3D plane), instead these should be merged into one polygon.
 *
 * @param {array} points An array of Vec3's
 * @param {array} faces Array of integer arrays, describing which vertices that is included in each face.
 *
 * @author qiao / https://github.com/qiao (original author, see https://github.com/qiao/three.js/commit/85026f0c769e4000148a67d45a9e9b9c5108836f)
 * @author schteppe / https://github.com/schteppe
 * @see http://www.altdevblogaday.com/2011/05/13/contact-generation-between-3d-convex-meshes/
 *
 * @todo Move the clipping functions to ContactGenerator?
 * @todo Automatically merge coplanar polygons in constructor.
 */
class ConvexPolyhedron extends Shape {
  // Array of integer arrays, indicating which vertices each face consists of
  // If given, these locally defined, normalized axes are the only ones being checked when doing separating axis check.
  constructor(props = {}) {
    const {
      vertices = [],
      faces = [],
      normals = [],
      axes,
      boundingSphereRadius
    } = props;
    super({
      type: Shape.types.CONVEXPOLYHEDRON
    });
    this.vertices = vertices;
    this.faces = faces;
    this.faceNormals = normals;

    if (this.faceNormals.length === 0) {
      this.computeNormals();
    }

    if (!boundingSphereRadius) {
      this.updateBoundingSphereRadius();
    } else {
      this.boundingSphereRadius = boundingSphereRadius;
    }

    this.worldVertices = []; // World transformed version of .vertices

    this.worldVerticesNeedsUpdate = true;
    this.worldFaceNormals = []; // World transformed version of .faceNormals

    this.worldFaceNormalsNeedsUpdate = true;
    this.uniqueAxes = axes ? axes.slice() : null;
    this.uniqueEdges = [];
    this.computeEdges();
  }
  /**
   * Computes uniqueEdges
   * @method computeEdges
   */


  computeEdges() {
    const faces = this.faces;
    const vertices = this.vertices;
    const edges = this.uniqueEdges;
    edges.length = 0;
    const edge = new Vec3();

    for (let i = 0; i !== faces.length; i++) {
      const face = faces[i];
      const numVertices = face.length;

      for (let j = 0; j !== numVertices; j++) {
        const k = (j + 1) % numVertices;
        vertices[face[j]].vsub(vertices[face[k]], edge);
        edge.normalize();
        let found = false;

        for (let p = 0; p !== edges.length; p++) {
          if (edges[p].almostEquals(edge) || edges[p].almostEquals(edge)) {
            found = true;
            break;
          }
        }

        if (!found) {
          edges.push(edge.clone());
        }
      }
    }
  }
  /**
   * Compute the normals of the faces. Will reuse existing Vec3 objects in the .faceNormals array if they exist.
   * @method computeNormals
   */


  computeNormals() {
    this.faceNormals.length = this.faces.length; // Generate normals

    for (let i = 0; i < this.faces.length; i++) {
      // Check so all vertices exists for this face
      for (let j = 0; j < this.faces[i].length; j++) {
        if (!this.vertices[this.faces[i][j]]) {
          throw new Error("Vertex " + this.faces[i][j] + " not found!");
        }
      }

      const n = this.faceNormals[i] || new Vec3();
      this.getFaceNormal(i, n);
      n.negate(n);
      this.faceNormals[i] = n;
      const vertex = this.vertices[this.faces[i][0]];

      if (n.dot(vertex) < 0) {
        console.error(".faceNormals[" + i + "] = Vec3(" + n.toString() + ") looks like it points into the shape? The vertices follow. Make sure they are ordered CCW around the normal, using the right hand rule.");

        for (let j = 0; j < this.faces[i].length; j++) {
          console.warn(".vertices[" + this.faces[i][j] + "] = Vec3(" + this.vertices[this.faces[i][j]].toString() + ")");
        }
      }
    }
  }
  /**
   * Compute the normal of a face from its vertices
   * @method getFaceNormal
   * @param  {Number} i
   * @param  {Vec3} target
   */


  getFaceNormal(i, target) {
    const f = this.faces[i];
    const va = this.vertices[f[0]];
    const vb = this.vertices[f[1]];
    const vc = this.vertices[f[2]];
    ConvexPolyhedron.computeNormal(va, vb, vc, target);
  }
  /**
   * @method clipAgainstHull
   * @param {Vec3} posA
   * @param {Quaternion} quatA
   * @param {ConvexPolyhedron} hullB
   * @param {Vec3} posB
   * @param {Quaternion} quatB
   * @param {Vec3} separatingNormal
   * @param {Number} minDist Clamp distance
   * @param {Number} maxDist
   * @param {array} result The an array of contact point objects, see clipFaceAgainstHull
   */


  clipAgainstHull(posA, quatA, hullB, posB, quatB, separatingNormal, minDist, maxDist, result) {
    const WorldNormal = new Vec3();
    let closestFaceB = -1;
    let dmax = -Number.MAX_VALUE;

    for (let face = 0; face < hullB.faces.length; face++) {
      WorldNormal.copy(hullB.faceNormals[face]);
      quatB.vmult(WorldNormal, WorldNormal);
      const d = WorldNormal.dot(separatingNormal);

      if (d > dmax) {
        dmax = d;
        closestFaceB = face;
      }
    }

    const worldVertsB1 = [];

    for (let i = 0; i < hullB.faces[closestFaceB].length; i++) {
      const b = hullB.vertices[hullB.faces[closestFaceB][i]];
      const worldb = new Vec3();
      worldb.copy(b);
      quatB.vmult(worldb, worldb);
      posB.vadd(worldb, worldb);
      worldVertsB1.push(worldb);
    }

    if (closestFaceB >= 0) {
      this.clipFaceAgainstHull(separatingNormal, posA, quatA, worldVertsB1, minDist, maxDist, result);
    }
  }
  /**
   * Find the separating axis between this hull and another
   * @method findSeparatingAxis
   * @param {ConvexPolyhedron} hullB
   * @param {Vec3} posA
   * @param {Quaternion} quatA
   * @param {Vec3} posB
   * @param {Quaternion} quatB
   * @param {Vec3} target The target vector to save the axis in
   * @return {bool} Returns false if a separation is found, else true
   */


  findSeparatingAxis(hullB, posA, quatA, posB, quatB, target, faceListA, faceListB) {
    const faceANormalWS3 = new Vec3();
    const Worldnormal1 = new Vec3();
    const deltaC = new Vec3();
    const worldEdge0 = new Vec3();
    const worldEdge1 = new Vec3();
    const Cross = new Vec3();
    let dmin = Number.MAX_VALUE;
    const hullA = this;

    if (!hullA.uniqueAxes) {
      const numFacesA = faceListA ? faceListA.length : hullA.faces.length; // Test face normals from hullA

      for (let i = 0; i < numFacesA; i++) {
        const fi = faceListA ? faceListA[i] : i; // Get world face normal

        faceANormalWS3.copy(hullA.faceNormals[fi]);
        quatA.vmult(faceANormalWS3, faceANormalWS3);
        const d = hullA.testSepAxis(faceANormalWS3, hullB, posA, quatA, posB, quatB);

        if (d === false) {
          return false;
        }

        if (d < dmin) {
          dmin = d;
          target.copy(faceANormalWS3);
        }
      }
    } else {
      // Test unique axes
      for (let i = 0; i !== hullA.uniqueAxes.length; i++) {
        // Get world axis
        quatA.vmult(hullA.uniqueAxes[i], faceANormalWS3);
        const d = hullA.testSepAxis(faceANormalWS3, hullB, posA, quatA, posB, quatB);

        if (d === false) {
          return false;
        }

        if (d < dmin) {
          dmin = d;
          target.copy(faceANormalWS3);
        }
      }
    }

    if (!hullB.uniqueAxes) {
      // Test face normals from hullB
      const numFacesB = faceListB ? faceListB.length : hullB.faces.length;

      for (let i = 0; i < numFacesB; i++) {
        const fi = faceListB ? faceListB[i] : i;
        Worldnormal1.copy(hullB.faceNormals[fi]);
        quatB.vmult(Worldnormal1, Worldnormal1);
        const d = hullA.testSepAxis(Worldnormal1, hullB, posA, quatA, posB, quatB);

        if (d === false) {
          return false;
        }

        if (d < dmin) {
          dmin = d;
          target.copy(Worldnormal1);
        }
      }
    } else {
      // Test unique axes in B
      for (let i = 0; i !== hullB.uniqueAxes.length; i++) {
        quatB.vmult(hullB.uniqueAxes[i], Worldnormal1);
        const d = hullA.testSepAxis(Worldnormal1, hullB, posA, quatA, posB, quatB);

        if (d === false) {
          return false;
        }

        if (d < dmin) {
          dmin = d;
          target.copy(Worldnormal1);
        }
      }
    } // Test edges


    for (let e0 = 0; e0 !== hullA.uniqueEdges.length; e0++) {
      // Get world edge
      quatA.vmult(hullA.uniqueEdges[e0], worldEdge0);

      for (let e1 = 0; e1 !== hullB.uniqueEdges.length; e1++) {
        // Get world edge 2
        quatB.vmult(hullB.uniqueEdges[e1], worldEdge1);
        worldEdge0.cross(worldEdge1, Cross);

        if (!Cross.almostZero()) {
          Cross.normalize();
          const dist = hullA.testSepAxis(Cross, hullB, posA, quatA, posB, quatB);

          if (dist === false) {
            return false;
          }

          if (dist < dmin) {
            dmin = dist;
            target.copy(Cross);
          }
        }
      }
    }

    posB.vsub(posA, deltaC);

    if (deltaC.dot(target) > 0.0) {
      target.negate(target);
    }

    return true;
  }
  /**
   * Test separating axis against two hulls. Both hulls are projected onto the axis and the overlap size is returned if there is one.
   * @method testSepAxis
   * @param {Vec3} axis
   * @param {ConvexPolyhedron} hullB
   * @param {Vec3} posA
   * @param {Quaternion} quatA
   * @param {Vec3} posB
   * @param {Quaternion} quatB
   * @return {number} The overlap depth, or FALSE if no penetration.
   */


  testSepAxis(axis, hullB, posA, quatA, posB, quatB) {
    const hullA = this;
    ConvexPolyhedron.project(hullA, axis, posA, quatA, maxminA);
    ConvexPolyhedron.project(hullB, axis, posB, quatB, maxminB);
    const maxA = maxminA[0];
    const minA = maxminA[1];
    const maxB = maxminB[0];
    const minB = maxminB[1];

    if (maxA < minB || maxB < minA) {
      return false; // Separated
    }

    const d0 = maxA - minB;
    const d1 = maxB - minA;
    const depth = d0 < d1 ? d0 : d1;
    return depth;
  }
  /**
   * @method calculateLocalInertia
   * @param  {Number} mass
   * @param  {Vec3} target
   */


  calculateLocalInertia(mass, target) {
    // Approximate with box inertia
    // Exact inertia calculation is overkill, but see http://geometrictools.com/Documentation/PolyhedralMassProperties.pdf for the correct way to do it
    const aabbmax = new Vec3();
    const aabbmin = new Vec3();
    this.computeLocalAABB(aabbmin, aabbmax);
    const x = aabbmax.x - aabbmin.x;
    const y = aabbmax.y - aabbmin.y;
    const z = aabbmax.z - aabbmin.z;
    target.x = 1.0 / 12.0 * mass * (2 * y * 2 * y + 2 * z * 2 * z);
    target.y = 1.0 / 12.0 * mass * (2 * x * 2 * x + 2 * z * 2 * z);
    target.z = 1.0 / 12.0 * mass * (2 * y * 2 * y + 2 * x * 2 * x);
  }
  /**
   * @method getPlaneConstantOfFace
   * @param  {Number} face_i Index of the face
   * @return {Number}
   */


  getPlaneConstantOfFace(face_i) {
    const f = this.faces[face_i];
    const n = this.faceNormals[face_i];
    const v = this.vertices[f[0]];
    const c = -n.dot(v);
    return c;
  }
  /**
   * Clip a face against a hull.
   * @method clipFaceAgainstHull
   * @param {Vec3} separatingNormal
   * @param {Vec3} posA
   * @param {Quaternion} quatA
   * @param {Array} worldVertsB1 An array of Vec3 with vertices in the world frame.
   * @param {Number} minDist Distance clamping
   * @param {Number} maxDist
   * @param Array result Array to store resulting contact points in. Will be objects with properties: point, depth, normal. These are represented in world coordinates.
   */


  clipFaceAgainstHull(separatingNormal, posA, quatA, worldVertsB1, minDist, maxDist, result) {
    const faceANormalWS = new Vec3();
    const edge0 = new Vec3();
    const WorldEdge0 = new Vec3();
    const worldPlaneAnormal1 = new Vec3();
    const planeNormalWS1 = new Vec3();
    const worldA1 = new Vec3();
    const localPlaneNormal = new Vec3();
    const planeNormalWS = new Vec3();
    const hullA = this;
    const worldVertsB2 = [];
    const pVtxIn = worldVertsB1;
    const pVtxOut = worldVertsB2;
    let closestFaceA = -1;
    let dmin = Number.MAX_VALUE; // Find the face with normal closest to the separating axis

    for (let face = 0; face < hullA.faces.length; face++) {
      faceANormalWS.copy(hullA.faceNormals[face]);
      quatA.vmult(faceANormalWS, faceANormalWS);
      const d = faceANormalWS.dot(separatingNormal);

      if (d < dmin) {
        dmin = d;
        closestFaceA = face;
      }
    }

    if (closestFaceA < 0) {
      return;
    } // Get the face and construct connected faces


    const polyA = hullA.faces[closestFaceA];
    polyA.connectedFaces = [];

    for (let i = 0; i < hullA.faces.length; i++) {
      for (let j = 0; j < hullA.faces[i].length; j++) {
        if (
        /* Sharing a vertex*/
        polyA.indexOf(hullA.faces[i][j]) !== -1 &&
        /* Not the one we are looking for connections from */
        i !== closestFaceA &&
        /* Not already added */
        polyA.connectedFaces.indexOf(i) === -1) {
          polyA.connectedFaces.push(i);
        }
      }
    } // Clip the polygon to the back of the planes of all faces of hull A,
    // that are adjacent to the witness face


    const numVerticesA = polyA.length;

    for (let i = 0; i < numVerticesA; i++) {
      const a = hullA.vertices[polyA[i]];
      const b = hullA.vertices[polyA[(i + 1) % numVerticesA]];
      a.vsub(b, edge0);
      WorldEdge0.copy(edge0);
      quatA.vmult(WorldEdge0, WorldEdge0);
      posA.vadd(WorldEdge0, WorldEdge0);
      worldPlaneAnormal1.copy(this.faceNormals[closestFaceA]);
      quatA.vmult(worldPlaneAnormal1, worldPlaneAnormal1);
      posA.vadd(worldPlaneAnormal1, worldPlaneAnormal1);
      WorldEdge0.cross(worldPlaneAnormal1, planeNormalWS1);
      planeNormalWS1.negate(planeNormalWS1);
      worldA1.copy(a);
      quatA.vmult(worldA1, worldA1);
      posA.vadd(worldA1, worldA1);
      const otherFace = polyA.connectedFaces[i];
      localPlaneNormal.copy(this.faceNormals[otherFace]);
      const localPlaneEq = this.getPlaneConstantOfFace(otherFace);
      planeNormalWS.copy(localPlaneNormal);
      quatA.vmult(planeNormalWS, planeNormalWS);
      const planeEqWS = localPlaneEq - planeNormalWS.dot(posA); // Clip face against our constructed plane

      this.clipFaceAgainstPlane(pVtxIn, pVtxOut, planeNormalWS, planeEqWS); // Throw away all clipped points, but save the remaining until next clip

      while (pVtxIn.length) {
        pVtxIn.shift();
      }

      while (pVtxOut.length) {
        pVtxIn.push(pVtxOut.shift());
      }
    } // only keep contact points that are behind the witness face


    localPlaneNormal.copy(this.faceNormals[closestFaceA]);
    const localPlaneEq = this.getPlaneConstantOfFace(closestFaceA);
    planeNormalWS.copy(localPlaneNormal);
    quatA.vmult(planeNormalWS, planeNormalWS);
    const planeEqWS = localPlaneEq - planeNormalWS.dot(posA);

    for (let i = 0; i < pVtxIn.length; i++) {
      let depth = planeNormalWS.dot(pVtxIn[i]) + planeEqWS; // ???

      if (depth <= minDist) {
        console.log("clamped: depth=" + depth + " to minDist=" + minDist);
        depth = minDist;
      }

      if (depth <= maxDist) {
        const point = pVtxIn[i];

        if (depth <= 1e-6) {
          const p = {
            point,
            normal: planeNormalWS,
            depth
          };
          result.push(p);
        }
      }
    }
  }
  /**
   * Clip a face in a hull against the back of a plane.
   * @method clipFaceAgainstPlane
   * @param {Array} inVertices
   * @param {Array} outVertices
   * @param {Vec3} planeNormal
   * @param {Number} planeConstant The constant in the mathematical plane equation
   */


  clipFaceAgainstPlane(inVertices, outVertices, planeNormal, planeConstant) {
    let n_dot_first;
    let n_dot_last;
    const numVerts = inVertices.length;

    if (numVerts < 2) {
      return outVertices;
    }

    let firstVertex = inVertices[inVertices.length - 1];
    let lastVertex = inVertices[0];
    n_dot_first = planeNormal.dot(firstVertex) + planeConstant;

    for (let vi = 0; vi < numVerts; vi++) {
      lastVertex = inVertices[vi];
      n_dot_last = planeNormal.dot(lastVertex) + planeConstant;

      if (n_dot_first < 0) {
        if (n_dot_last < 0) {
          // Start < 0, end < 0, so output lastVertex
          const newv = new Vec3();
          newv.copy(lastVertex);
          outVertices.push(newv);
        } else {
          // Start < 0, end >= 0, so output intersection
          const newv = new Vec3();
          firstVertex.lerp(lastVertex, n_dot_first / (n_dot_first - n_dot_last), newv);
          outVertices.push(newv);
        }
      } else {
        if (n_dot_last < 0) {
          // Start >= 0, end < 0 so output intersection and end
          const newv = new Vec3();
          firstVertex.lerp(lastVertex, n_dot_first / (n_dot_first - n_dot_last), newv);
          outVertices.push(newv);
          outVertices.push(lastVertex);
        }
      }

      firstVertex = lastVertex;
      n_dot_first = n_dot_last;
    }

    return outVertices;
  } // Updates .worldVertices and sets .worldVerticesNeedsUpdate to false.


  computeWorldVertices(position, quat) {
    while (this.worldVertices.length < this.vertices.length) {
      this.worldVertices.push(new Vec3());
    }

    const verts = this.vertices;
    const worldVerts = this.worldVertices;

    for (let i = 0; i !== this.vertices.length; i++) {
      quat.vmult(verts[i], worldVerts[i]);
      position.vadd(worldVerts[i], worldVerts[i]);
    }

    this.worldVerticesNeedsUpdate = false;
  }

  computeLocalAABB(aabbmin, aabbmax) {
    const vertices = this.vertices;
    aabbmin.set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    aabbmax.set(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);

    for (let i = 0; i < this.vertices.length; i++) {
      const v = vertices[i];

      if (v.x < aabbmin.x) {
        aabbmin.x = v.x;
      } else if (v.x > aabbmax.x) {
        aabbmax.x = v.x;
      }

      if (v.y < aabbmin.y) {
        aabbmin.y = v.y;
      } else if (v.y > aabbmax.y) {
        aabbmax.y = v.y;
      }

      if (v.z < aabbmin.z) {
        aabbmin.z = v.z;
      } else if (v.z > aabbmax.z) {
        aabbmax.z = v.z;
      }
    }
  }
  /**
   * Updates .worldVertices and sets .worldVerticesNeedsUpdate to false.
   * @method computeWorldFaceNormals
   * @param  {Quaternion} quat
   */


  computeWorldFaceNormals(quat) {
    const N = this.faceNormals.length;

    while (this.worldFaceNormals.length < N) {
      this.worldFaceNormals.push(new Vec3());
    }

    const normals = this.faceNormals;
    const worldNormals = this.worldFaceNormals;

    for (let i = 0; i !== N; i++) {
      quat.vmult(normals[i], worldNormals[i]);
    }

    this.worldFaceNormalsNeedsUpdate = false;
  }
  /**
   * @method updateBoundingSphereRadius
   */


  updateBoundingSphereRadius() {
    // Assume points are distributed with local (0,0,0) as center
    let max2 = 0;
    const verts = this.vertices;

    for (let i = 0; i !== verts.length; i++) {
      const norm2 = verts[i].lengthSquared();

      if (norm2 > max2) {
        max2 = norm2;
      }
    }

    this.boundingSphereRadius = Math.sqrt(max2);
  }
  /**
   * @method calculateWorldAABB
   * @param {Vec3}        pos
   * @param {Quaternion}  quat
   * @param {Vec3}        min
   * @param {Vec3}        max
   */


  calculateWorldAABB(pos, quat, min, max) {
    const verts = this.vertices;
    let minx;
    let miny;
    let minz;
    let maxx;
    let maxy;
    let maxz;
    let tempWorldVertex = new Vec3();

    for (let i = 0; i < verts.length; i++) {
      tempWorldVertex.copy(verts[i]);
      quat.vmult(tempWorldVertex, tempWorldVertex);
      pos.vadd(tempWorldVertex, tempWorldVertex);
      const v = tempWorldVertex;

      if (minx === undefined || v.x < minx) {
        minx = v.x;
      }

      if (maxx === undefined || v.x > maxx) {
        maxx = v.x;
      }

      if (miny === undefined || v.y < miny) {
        miny = v.y;
      }

      if (maxy === undefined || v.y > maxy) {
        maxy = v.y;
      }

      if (minz === undefined || v.z < minz) {
        minz = v.z;
      }

      if (maxz === undefined || v.z > maxz) {
        maxz = v.z;
      }
    }

    min.set(minx, miny, minz);
    max.set(maxx, maxy, maxz);
  }
  /**
   * Get approximate convex volume
   * @method volume
   * @return {Number}
   */


  volume() {
    return 4.0 * Math.PI * this.boundingSphereRadius / 3.0;
  }
  /**
   * Get an average of all the vertices positions
   * @method getAveragePointLocal
   * @param  {Vec3} target
   * @return {Vec3}
   */


  getAveragePointLocal(target = new Vec3()) {
    const verts = this.vertices;

    for (let i = 0; i < verts.length; i++) {
      target.vadd(verts[i], target);
    }

    target.scale(1 / verts.length, target);
    return target;
  }
  /**
   * Transform all local points. Will change the .vertices
   * @method transformAllPoints
   * @param  {Vec3} offset
   * @param  {Quaternion} quat
   */


  transformAllPoints(offset, quat) {
    const n = this.vertices.length;
    const verts = this.vertices; // Apply rotation

    if (quat) {
      // Rotate vertices
      for (let i = 0; i < n; i++) {
        const v = verts[i];
        quat.vmult(v, v);
      } // Rotate face normals


      for (let i = 0; i < this.faceNormals.length; i++) {
        const v = this.faceNormals[i];
        quat.vmult(v, v);
      }
      /*
            // Rotate edges
            for(let i=0; i<this.uniqueEdges.length; i++){
                const v = this.uniqueEdges[i];
                quat.vmult(v,v);
            }*/

    } // Apply offset


    if (offset) {
      for (let i = 0; i < n; i++) {
        const v = verts[i];
        v.vadd(offset, v);
      }
    }
  }
  /**
   * Checks whether p is inside the polyhedra. Must be in local coords.
   * The point lies outside of the convex hull of the other points if and only if the direction
   * of all the vectors from it to those other points are on less than one half of a sphere around it.
   * @method pointIsInside
   * @param  {Vec3} p      A point given in local coordinates
   * @return {Boolean}
   */


  pointIsInside(p) {
    const verts = this.vertices;
    const faces = this.faces;
    const normals = this.faceNormals;
    const pointInside = new Vec3();
    this.getAveragePointLocal(pointInside);

    for (let i = 0; i < this.faces.length; i++) {
      let n = normals[i];
      const v = verts[faces[i][0]]; // We only need one point in the face
      // This dot product determines which side of the edge the point is

      const vToP = new Vec3();
      p.vsub(v, vToP);
      const r1 = n.dot(vToP);
      const vToPointInside = new Vec3();
      pointInside.vsub(v, vToPointInside);
      const r2 = n.dot(vToPointInside);

      if (r1 < 0 && r2 > 0 || r1 > 0 && r2 < 0) {
        return false; // Encountered some other sign. Exit.
      }
    } // If we got here, all dot products were of the same sign.


    return  -1;
  }

}
/**
 * Get face normal given 3 vertices
 * @static
 * @method computeNormal
 * @param {Vec3} va
 * @param {Vec3} vb
 * @param {Vec3} vc
 * @param {Vec3} target
 */

ConvexPolyhedron.computeNormal = (va, vb, vc, target) => {
  const cb = new Vec3();
  const ab = new Vec3();
  vb.vsub(va, ab);
  vc.vsub(vb, cb);
  cb.cross(ab, target);

  if (!target.isZero()) {
    target.normalize();
  }
};

const maxminA = [];
const maxminB = [];
/**
 * Get max and min dot product of a convex hull at position (pos,quat) projected onto an axis.
 * Results are saved in the array maxmin.
 * @static
 * @method project
 * @param {ConvexPolyhedron} hull
 * @param {Vec3} axis
 * @param {Vec3} pos
 * @param {Quaternion} quat
 * @param {array} result result[0] and result[1] will be set to maximum and minimum, respectively.
 */

ConvexPolyhedron.project = (shape, axis, pos, quat, result) => {
  const n = shape.vertices.length;
  const localAxis = new Vec3();
  let max = 0;
  let min = 0;
  const localOrigin = new Vec3();
  const vs = shape.vertices;
  localOrigin.setZero(); // Transform the axis to local

  Transform.vectorToLocalFrame(pos, quat, axis, localAxis);
  Transform.pointToLocalFrame(pos, quat, localOrigin, localOrigin);
  const add = localOrigin.dot(localAxis);
  min = max = vs[0].dot(localAxis);

  for (let i = 1; i < n; i++) {
    const val = vs[i].dot(localAxis);

    if (val > max) {
      max = val;
    }

    if (val < min) {
      min = val;
    }
  }

  min -= add;
  max -= add;

  if (min > max) {
    // Inconsistent - swap
    const temp = min;
    min = max;
    max = temp;
  } // Output


  result[0] = max;
  result[1] = min;
};

/**
 * A 3d box shape.
 * @class Box
 * @constructor
 * @param {Vec3} halfExtents
 * @author schteppe
 * @extends Shape
 */
class Box extends Shape {
  // Used by the contact generator to make contacts with other convex polyhedra for example.
  constructor(halfExtents) {
    super({
      type: Shape.types.BOX
    });
    this.halfExtents = halfExtents;
    this.convexPolyhedronRepresentation = null;
    this.updateConvexPolyhedronRepresentation();
    this.updateBoundingSphereRadius();
  }
  /**
   * Updates the local convex polyhedron representation used for some collisions.
   * @method updateConvexPolyhedronRepresentation
   */


  updateConvexPolyhedronRepresentation() {
    const sx = this.halfExtents.x;
    const sy = this.halfExtents.y;
    const sz = this.halfExtents.z;
    const V = Vec3;
    const vertices = [new V(-sx, -sy, -sz), new V(sx, -sy, -sz), new V(sx, sy, -sz), new V(-sx, sy, -sz), new V(-sx, -sy, sz), new V(sx, -sy, sz), new V(sx, sy, sz), new V(-sx, sy, sz)];
    const faces = [[3, 2, 1, 0], // -z
    [4, 5, 6, 7], // +z
    [5, 4, 0, 1], // -y
    [2, 3, 7, 6], // +y
    [0, 4, 7, 3], // -x
    [1, 2, 6, 5] // +x
    ];
    const axes = [new V(0, 0, 1), new V(0, 1, 0), new V(1, 0, 0)];
    const h = new ConvexPolyhedron({
      vertices,
      faces,
      axes
    });
    this.convexPolyhedronRepresentation = h;
    h.material = this.material;
  }
  /**
   * @method calculateLocalInertia
   * @param  {Number} mass
   * @param  {Vec3} target
   * @return {Vec3}
   */


  calculateLocalInertia(mass, target = new Vec3()) {
    Box.calculateInertia(this.halfExtents, mass, target);
    return target;
  }
  /**
   * Get the box 6 side normals
   * @method getSideNormals
   * @param {array}      sixTargetVectors An array of 6 vectors, to store the resulting side normals in.
   * @param {Quaternion} quat             Orientation to apply to the normal vectors. If not provided, the vectors will be in respect to the local frame.
   * @return {array}
   */


  getSideNormals(sixTargetVectors, quat) {
    const sides = sixTargetVectors;
    const ex = this.halfExtents;
    sides[0].set(ex.x, 0, 0);
    sides[1].set(0, ex.y, 0);
    sides[2].set(0, 0, ex.z);
    sides[3].set(-ex.x, 0, 0);
    sides[4].set(0, -ex.y, 0);
    sides[5].set(0, 0, -ex.z);

    if (quat !== undefined) {
      for (let i = 0; i !== sides.length; i++) {
        quat.vmult(sides[i], sides[i]);
      }
    }

    return sides;
  }

  volume() {
    return 8.0 * this.halfExtents.x * this.halfExtents.y * this.halfExtents.z;
  }

  updateBoundingSphereRadius() {
    this.boundingSphereRadius = this.halfExtents.length();
  }

  forEachWorldCorner(pos, quat, callback) {
    const e = this.halfExtents;
    const corners = [[e.x, e.y, e.z], [-e.x, e.y, e.z], [-e.x, -e.y, e.z], [-e.x, -e.y, -e.z], [e.x, -e.y, -e.z], [e.x, e.y, -e.z], [-e.x, e.y, -e.z], [e.x, -e.y, e.z]];

    for (let i = 0; i < corners.length; i++) {
      worldCornerTempPos.set(corners[i][0], corners[i][1], corners[i][2]);
      quat.vmult(worldCornerTempPos, worldCornerTempPos);
      pos.vadd(worldCornerTempPos, worldCornerTempPos);
      callback(worldCornerTempPos.x, worldCornerTempPos.y, worldCornerTempPos.z);
    }
  }

  calculateWorldAABB(pos, quat, min, max) {
    const e = this.halfExtents;
    worldCornersTemp[0].set(e.x, e.y, e.z);
    worldCornersTemp[1].set(-e.x, e.y, e.z);
    worldCornersTemp[2].set(-e.x, -e.y, e.z);
    worldCornersTemp[3].set(-e.x, -e.y, -e.z);
    worldCornersTemp[4].set(e.x, -e.y, -e.z);
    worldCornersTemp[5].set(e.x, e.y, -e.z);
    worldCornersTemp[6].set(-e.x, e.y, -e.z);
    worldCornersTemp[7].set(e.x, -e.y, e.z);
    const wc = worldCornersTemp[0];
    quat.vmult(wc, wc);
    pos.vadd(wc, wc);
    max.copy(wc);
    min.copy(wc);

    for (let i = 1; i < 8; i++) {
      const wc = worldCornersTemp[i];
      quat.vmult(wc, wc);
      pos.vadd(wc, wc);
      const x = wc.x;
      const y = wc.y;
      const z = wc.z;

      if (x > max.x) {
        max.x = x;
      }

      if (y > max.y) {
        max.y = y;
      }

      if (z > max.z) {
        max.z = z;
      }

      if (x < min.x) {
        min.x = x;
      }

      if (y < min.y) {
        min.y = y;
      }

      if (z < min.z) {
        min.z = z;
      }
    } // Get each axis max
    // min.set(Infinity,Infinity,Infinity);
    // max.set(-Infinity,-Infinity,-Infinity);
    // this.forEachWorldCorner(pos,quat,function(x,y,z){
    //     if(x > max.x){
    //         max.x = x;
    //     }
    //     if(y > max.y){
    //         max.y = y;
    //     }
    //     if(z > max.z){
    //         max.z = z;
    //     }
    //     if(x < min.x){
    //         min.x = x;
    //     }
    //     if(y < min.y){
    //         min.y = y;
    //     }
    //     if(z < min.z){
    //         min.z = z;
    //     }
    // });

  }

}

Box.calculateInertia = (halfExtents, mass, target) => {
  const e = halfExtents;
  target.x = 1.0 / 12.0 * mass * (2 * e.y * 2 * e.y + 2 * e.z * 2 * e.z);
  target.y = 1.0 / 12.0 * mass * (2 * e.x * 2 * e.x + 2 * e.z * 2 * e.z);
  target.z = 1.0 / 12.0 * mass * (2 * e.y * 2 * e.y + 2 * e.x * 2 * e.x);
};

const worldCornerTempPos = new Vec3();
const worldCornersTemp = [new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3()];

const BODY_TYPES = {
  DYNAMIC: 1,
  STATIC: 2,
  KINEMATIC: 4
};
const BODY_SLEEP_STATES = {
  AWAKE: 0,
  SLEEPY: 1,
  SLEEPING: 2
};

/**
 * Base class for all body types.
 * @class Body
 * @constructor
 * @extends EventTarget
 * @param {object} [options]
 * @param {Vec3} [options.position]
 * @param {Vec3} [options.velocity]
 * @param {Vec3} [options.angularVelocity]
 * @param {Quaternion} [options.quaternion]
 * @param {number} [options.mass]
 * @param {Material} [options.material]
 * @param {number} [options.type]
 * @param {number} [options.linearDamping=0.01]
 * @param {number} [options.angularDamping=0.01]
 * @param {boolean} [options.allowSleep=true]
 * @param {number} [options.sleepSpeedLimit=0.1]
 * @param {number} [options.sleepTimeLimit=1]
 * @param {number} [options.collisionFilterGroup=1]
 * @param {number} [options.collisionFilterMask=-1]
 * @param {boolean} [options.fixedRotation=false]
 * @param {Vec3} [options.linearFactor]
 * @param {Vec3} [options.angularFactor]
 * @param {Shape} [options.shape]
 * @example
 *     const body = new Body({
 *         mass: 1
 *     });
 *     const shape = new Sphere(1);
 *     body.addShape(shape);
 *     world.addBody(body);
 */
class Body extends EventTarget {
  // Position of body in World.bodies. Updated by World and used in ArrayCollisionMatrix.
  // Reference to the world the body is living in.
  // Callback function that is used BEFORE stepping the system. Use it to apply forces, for example. Inside the function, "this" will refer to this Body object. Deprecated - use World events instead.
  // Callback function that is used AFTER stepping the system. Inside the function, "this" will refer to this Body object. Deprecated - use World events instead.
  // Whether to produce contact forces when in contact with other bodies. Note that contacts will be generated, but they will be disabled - i.e. "collide" events will be raised, but forces will not be altered.
  // World space position of the body.
  // Interpolated position of the body.
  // Initial position of the body.
  // World space velocity of the body.
  // Linear force on the body in world space.
  // One of: Body.DYNAMIC, Body.STATIC and Body.KINEMATIC.
  // If true, the body will automatically fall to sleep.
  // Current sleep state.
  // If the speed (the norm of the velocity) is smaller than this value, the body is considered sleepy.
  // If the body has been sleepy for this sleepTimeLimit seconds, it is considered sleeping.
  // World space rotational force on the body, around center of mass.
  // World space orientation of the body.
  // Interpolated orientation of the body.
  // Angular velocity of the body, in world space. Think of the angular velocity as a vector, which the body rotates around. The length of this vector determines how fast (in radians per second) the body rotates.
  // Position of each Shape in the body, given in local Body space.
  // Orientation of each Shape, given in local Body space.
  // Set to true if you don't want the body to rotate. Make sure to run .updateMassProperties() after changing this.
  // Use this property to limit the motion along any world axis. (1,1,1) will allow motion along all axes while (0,0,0) allows none.
  // Use this property to limit the rotational motion along any world axis. (1,1,1) will allow rotation along all axes while (0,0,0) allows none.
  // World space bounding box of the body and its shapes.
  // Indicates if the AABB needs to be updated before use.
  // Total bounding radius of the Body including its shapes, relative to body.position.
  constructor(options = {}) {
    super();
    this.id = Body.idCounter++;
    this.index = -1;
    this.world = null;
    this.preStep = null;
    this.postStep = null;
    this.vlambda = new Vec3();
    this.collisionFilterGroup = typeof options.collisionFilterGroup === 'number' ? options.collisionFilterGroup : 1;
    this.collisionFilterMask = typeof options.collisionFilterMask === 'number' ? options.collisionFilterMask : -1;
    this.collisionResponse = typeof options.collisionResponse === 'boolean' ? options.collisionResponse : true;
    this.position = new Vec3();
    this.previousPosition = new Vec3();
    this.interpolatedPosition = new Vec3();
    this.initPosition = new Vec3();

    if (options.position) {
      this.position.copy(options.position);
      this.previousPosition.copy(options.position);
      this.interpolatedPosition.copy(options.position);
      this.initPosition.copy(options.position);
    }

    this.velocity = new Vec3();

    if (options.velocity) {
      this.velocity.copy(options.velocity);
    }

    this.initVelocity = new Vec3();
    this.force = new Vec3();
    const mass = typeof options.mass === 'number' ? options.mass : 0;
    this.mass = mass;
    this.invMass = mass > 0 ? 1.0 / mass : 0;
    this.material = options.material || null;
    this.linearDamping = typeof options.linearDamping === 'number' ? options.linearDamping : 0.01;
    this.type = mass <= 0.0 ? Body.STATIC : Body.DYNAMIC;

    if (typeof options.type === typeof Body.STATIC) {
      this.type = options.type;
    }

    this.allowSleep = typeof options.allowSleep !== 'undefined' ? options.allowSleep : true;
    this.sleepState = 0;
    this.sleepSpeedLimit = typeof options.sleepSpeedLimit !== 'undefined' ? options.sleepSpeedLimit : 0.1;
    this.sleepTimeLimit = typeof options.sleepTimeLimit !== 'undefined' ? options.sleepTimeLimit : 1;
    this.timeLastSleepy = 0;
    this.wakeUpAfterNarrowphase = false;
    this.torque = new Vec3();
    this.quaternion = new Quaternion();
    this.initQuaternion = new Quaternion();
    this.previousQuaternion = new Quaternion();
    this.interpolatedQuaternion = new Quaternion();

    if (options.quaternion) {
      this.quaternion.copy(options.quaternion);
      this.initQuaternion.copy(options.quaternion);
      this.previousQuaternion.copy(options.quaternion);
      this.interpolatedQuaternion.copy(options.quaternion);
    }

    this.angularVelocity = new Vec3();

    if (options.angularVelocity) {
      this.angularVelocity.copy(options.angularVelocity);
    }

    this.initAngularVelocity = new Vec3();
    this.shapes = [];
    this.shapeOffsets = [];
    this.shapeOrientations = [];
    this.inertia = new Vec3();
    this.invInertia = new Vec3();
    this.invInertiaWorld = new Mat3();
    this.invMassSolve = 0;
    this.invInertiaSolve = new Vec3();
    this.invInertiaWorldSolve = new Mat3();
    this.fixedRotation = typeof options.fixedRotation !== 'undefined' ? options.fixedRotation : false;
    this.angularDamping = typeof options.angularDamping !== 'undefined' ? options.angularDamping : 0.01;
    this.linearFactor = new Vec3(1, 1, 1);

    if (options.linearFactor) {
      this.linearFactor.copy(options.linearFactor);
    }

    this.angularFactor = new Vec3(1, 1, 1);

    if (options.angularFactor) {
      this.angularFactor.copy(options.angularFactor);
    }

    this.aabb = new AABB();
    this.aabbNeedsUpdate = true;
    this.boundingRadius = 0;
    this.wlambda = new Vec3();

    if (options.shape) {
      this.addShape(options.shape);
    }

    this.updateMassProperties();
  }
  /**
   * Wake the body up.
   * @method wakeUp
   */


  wakeUp() {
    const prevState = this.sleepState;
    this.sleepState = 0;
    this.wakeUpAfterNarrowphase = false;

    if (prevState === Body.SLEEPING) {
      this.dispatchEvent(Body.wakeupEvent);
    }
  }
  /**
   * Force body sleep
   * @method sleep
   */


  sleep() {
    this.sleepState = Body.SLEEPING;
    this.velocity.set(0, 0, 0);
    this.angularVelocity.set(0, 0, 0);
    this.wakeUpAfterNarrowphase = false;
  }
  /**
   * Called every timestep to update internal sleep timer and change sleep state if needed.
   * @method sleepTick
   * @param {Number} time The world time in seconds
   */


  sleepTick(time) {
    if (this.allowSleep) {
      const sleepState = this.sleepState;
      const speedSquared = this.velocity.lengthSquared() + this.angularVelocity.lengthSquared();
      const speedLimitSquared = this.sleepSpeedLimit ** 2;

      if (sleepState === Body.AWAKE && speedSquared < speedLimitSquared) {
        this.sleepState = Body.SLEEPY; // Sleepy

        this.timeLastSleepy = time;
        this.dispatchEvent(Body.sleepyEvent);
      } else if (sleepState === Body.SLEEPY && speedSquared > speedLimitSquared) {
        this.wakeUp(); // Wake up
      } else if (sleepState === Body.SLEEPY && time - this.timeLastSleepy > this.sleepTimeLimit) {
        this.sleep(); // Sleeping

        this.dispatchEvent(Body.sleepEvent);
      }
    }
  }
  /**
   * If the body is sleeping, it should be immovable / have infinite mass during solve. We solve it by having a separate "solve mass".
   * @method updateSolveMassProperties
   */


  updateSolveMassProperties() {
    if (this.sleepState === Body.SLEEPING || this.type === Body.KINEMATIC) {
      this.invMassSolve = 0;
      this.invInertiaSolve.setZero();
      this.invInertiaWorldSolve.setZero();
    } else {
      this.invMassSolve = this.invMass;
      this.invInertiaSolve.copy(this.invInertia);
      this.invInertiaWorldSolve.copy(this.invInertiaWorld);
    }
  }
  /**
   * Convert a world point to local body frame.
   * @method pointToLocalFrame
   * @param  {Vec3} worldPoint
   * @param  {Vec3} result
   * @return {Vec3}
   */


  pointToLocalFrame(worldPoint, result = new Vec3()) {
    worldPoint.vsub(this.position, result);
    this.quaternion.conjugate().vmult(result, result);
    return result;
  }
  /**
   * Convert a world vector to local body frame.
   * @method vectorToLocalFrame
   * @param  {Vec3} worldPoint
   * @param  {Vec3} result
   * @return {Vec3}
   */


  vectorToLocalFrame(worldVector, result = new Vec3()) {
    this.quaternion.conjugate().vmult(worldVector, result);
    return result;
  }
  /**
   * Convert a local body point to world frame.
   * @method pointToWorldFrame
   * @param  {Vec3} localPoint
   * @param  {Vec3} result
   * @return {Vec3}
   */


  pointToWorldFrame(localPoint, result = new Vec3()) {
    this.quaternion.vmult(localPoint, result);
    result.vadd(this.position, result);
    return result;
  }
  /**
   * Convert a local body point to world frame.
   * @method vectorToWorldFrame
   * @param  {Vec3} localVector
   * @param  {Vec3} result
   * @return {Vec3}
   */


  vectorToWorldFrame(localVector, result = new Vec3()) {
    this.quaternion.vmult(localVector, result);
    return result;
  }
  /**
   * Add a shape to the body with a local offset and orientation.
   * @method addShape
   * @param {Shape} shape
   * @param {Vec3} [_offset]
   * @param {Quaternion} [_orientation]
   * @return {Body} The body object, for chainability.
   */


  addShape(shape, _offset, _orientation) {
    const offset = new Vec3();
    const orientation = new Quaternion();

    if (_offset) {
      offset.copy(_offset);
    }

    if (_orientation) {
      orientation.copy(_orientation);
    }

    this.shapes.push(shape);
    this.shapeOffsets.push(offset);
    this.shapeOrientations.push(orientation);
    this.updateMassProperties();
    this.updateBoundingRadius();
    this.aabbNeedsUpdate = true;
    shape.body = this;
    return this;
  }
  /**
   * Update the bounding radius of the body. Should be done if any of the shapes are changed.
   * @method updateBoundingRadius
   */


  updateBoundingRadius() {
    const shapes = this.shapes;
    const shapeOffsets = this.shapeOffsets;
    const N = shapes.length;
    let radius = 0;

    for (let i = 0; i !== N; i++) {
      const shape = shapes[i];
      shape.updateBoundingSphereRadius();
      const offset = shapeOffsets[i].length();
      const r = shape.boundingSphereRadius;

      if (offset + r > radius) {
        radius = offset + r;
      }
    }

    this.boundingRadius = radius;
  }
  /**
   * Updates the .aabb
   * @method computeAABB
   * @todo rename to updateAABB()
   */


  computeAABB() {
    const shapes = this.shapes;
    const shapeOffsets = this.shapeOffsets;
    const shapeOrientations = this.shapeOrientations;
    const N = shapes.length;
    const offset = tmpVec;
    const orientation = tmpQuat$1;
    const bodyQuat = this.quaternion;
    const aabb = this.aabb;
    const shapeAABB = computeAABB_shapeAABB;

    for (let i = 0; i !== N; i++) {
      const shape = shapes[i]; // Get shape world position

      bodyQuat.vmult(shapeOffsets[i], offset);
      offset.vadd(this.position, offset); // Get shape world quaternion

      bodyQuat.mult(shapeOrientations[i], orientation); // Get shape AABB

      shape.calculateWorldAABB(offset, orientation, shapeAABB.lowerBound, shapeAABB.upperBound);

      if (i === 0) {
        aabb.copy(shapeAABB);
      } else {
        aabb.extend(shapeAABB);
      }
    }

    this.aabbNeedsUpdate = false;
  }
  /**
   * Update .inertiaWorld and .invInertiaWorld
   * @method updateInertiaWorld
   */


  updateInertiaWorld(force) {
    const I = this.invInertia;

    if (I.x === I.y && I.y === I.z && !force) ; else {
      const m1 = uiw_m1;
      const m2 = uiw_m2;
      m1.setRotationFromQuaternion(this.quaternion);
      m1.transpose(m2);
      m1.scale(I, m1);
      m1.mmult(m2, this.invInertiaWorld);
    }
  }

  applyForce(force, relativePoint) {
    if (this.type !== Body.DYNAMIC) {
      // Needed?
      return;
    } // Compute produced rotational force


    const rotForce = Body_applyForce_rotForce;
    relativePoint.cross(force, rotForce); // Add linear force

    this.force.vadd(force, this.force); // Add rotational force

    this.torque.vadd(rotForce, this.torque);
  }

  applyLocalForce(localForce, localPoint) {
    if (this.type !== Body.DYNAMIC) {
      return;
    }

    const worldForce = Body_applyLocalForce_worldForce;
    const relativePointWorld = Body_applyLocalForce_relativePointWorld; // Transform the force vector to world space

    this.vectorToWorldFrame(localForce, worldForce);
    this.vectorToWorldFrame(localPoint, relativePointWorld);
    this.applyForce(worldForce, relativePointWorld);
  }

  applyImpulse(impulse, relativePoint) {
    if (this.type !== Body.DYNAMIC) {
      return;
    } // Compute point position relative to the body center


    const r = relativePoint; // Compute produced central impulse velocity

    const velo = Body_applyImpulse_velo;
    velo.copy(impulse);
    velo.scale(this.invMass, velo); // Add linear impulse

    this.velocity.vadd(velo, this.velocity); // Compute produced rotational impulse velocity

    const rotVelo = Body_applyImpulse_rotVelo;
    r.cross(impulse, rotVelo);
    /*
     rotVelo.x *= this.invInertia.x;
     rotVelo.y *= this.invInertia.y;
     rotVelo.z *= this.invInertia.z;
     */

    this.invInertiaWorld.vmult(rotVelo, rotVelo); // Add rotational Impulse

    this.angularVelocity.vadd(rotVelo, this.angularVelocity);
  }

  applyLocalImpulse(localImpulse, localPoint) {
    if (this.type !== Body.DYNAMIC) {
      return;
    }

    const worldImpulse = Body_applyLocalImpulse_worldImpulse;
    const relativePointWorld = Body_applyLocalImpulse_relativePoint; // Transform the force vector to world space

    this.vectorToWorldFrame(localImpulse, worldImpulse);
    this.vectorToWorldFrame(localPoint, relativePointWorld);
    this.applyImpulse(worldImpulse, relativePointWorld);
  }
  /**
   * Should be called whenever you change the body shape or mass.
   * @method updateMassProperties
   */


  updateMassProperties() {
    const halfExtents = Body_updateMassProperties_halfExtents;
    this.invMass = this.mass > 0 ? 1.0 / this.mass : 0;
    const I = this.inertia;
    const fixed = this.fixedRotation; // Approximate with AABB box

    this.computeAABB();
    halfExtents.set((this.aabb.upperBound.x - this.aabb.lowerBound.x) / 2, (this.aabb.upperBound.y - this.aabb.lowerBound.y) / 2, (this.aabb.upperBound.z - this.aabb.lowerBound.z) / 2);
    Box.calculateInertia(halfExtents, this.mass, I);
    this.invInertia.set(I.x > 0 && !fixed ? 1.0 / I.x : 0, I.y > 0 && !fixed ? 1.0 / I.y : 0, I.z > 0 && !fixed ? 1.0 / I.z : 0);
    this.updateInertiaWorld(true);
  }
  /**
   * Get world velocity of a point in the body.
   * @method getVelocityAtWorldPoint
   * @param  {Vec3} worldPoint
   * @param  {Vec3} result
   * @return {Vec3} The result vector.
   */


  getVelocityAtWorldPoint(worldPoint, result) {
    const r = new Vec3();
    worldPoint.vsub(this.position, r);
    this.angularVelocity.cross(r, result);
    this.velocity.vadd(result, result);
    return result;
  }
  /**
   * Move the body forward in time.
   * @param {number} dt Time step
   * @param {boolean} quatNormalize Set to true to normalize the body quaternion
   * @param {boolean} quatNormalizeFast If the quaternion should be normalized using "fast" quaternion normalization
   */


  integrate(dt, quatNormalize, quatNormalizeFast) {
    // Save previous position
    this.previousPosition.copy(this.position);
    this.previousQuaternion.copy(this.quaternion);

    if (!(this.type === Body.DYNAMIC || this.type === Body.KINEMATIC) || this.sleepState === Body.SLEEPING) {
      // Only for dynamic
      return;
    }

    const velo = this.velocity;
    const angularVelo = this.angularVelocity;
    const pos = this.position;
    const force = this.force;
    const torque = this.torque;
    const quat = this.quaternion;
    const invMass = this.invMass;
    const invInertia = this.invInertiaWorld;
    const linearFactor = this.linearFactor;
    const iMdt = invMass * dt;
    velo.x += force.x * iMdt * linearFactor.x;
    velo.y += force.y * iMdt * linearFactor.y;
    velo.z += force.z * iMdt * linearFactor.z;
    const e = invInertia.elements;
    const angularFactor = this.angularFactor;
    const tx = torque.x * angularFactor.x;
    const ty = torque.y * angularFactor.y;
    const tz = torque.z * angularFactor.z;
    angularVelo.x += dt * (e[0] * tx + e[1] * ty + e[2] * tz);
    angularVelo.y += dt * (e[3] * tx + e[4] * ty + e[5] * tz);
    angularVelo.z += dt * (e[6] * tx + e[7] * ty + e[8] * tz); // Use new velocity  - leap frog

    pos.x += velo.x * dt;
    pos.y += velo.y * dt;
    pos.z += velo.z * dt;
    quat.integrate(this.angularVelocity, dt, this.angularFactor, quat);

    if (quatNormalize) {
      if (quatNormalizeFast) {
        quat.normalizeFast();
      } else {
        quat.normalize();
      }
    }

    this.aabbNeedsUpdate = true; // Update world inertia

    this.updateInertiaWorld();
  }

}
/**
 * Dispatched after two bodies collide. This event is dispatched on each
 * of the two bodies involved in the collision.
 * @event collide
 * @param {Body} body The body that was involved in the collision.
 * @param {ContactEquation} contact The details of the collision.
 */

Body.COLLIDE_EVENT_NAME = 'collide';
/**
 * A dynamic body is fully simulated. Can be moved manually by the user, but normally they move according to forces. A dynamic body can collide with all body types. A dynamic body always has finite, non-zero mass.
 * @static
 * @property DYNAMIC
 * @type {Number}
 */

Body.DYNAMIC = 1;
/**
 * A static body does not move during simulation and behaves as if it has infinite mass. Static bodies can be moved manually by setting the position of the body. The velocity of a static body is always zero. Static bodies do not collide with other static or kinematic bodies.
 * @static
 * @property STATIC
 * @type {Number}
 */

Body.STATIC = 2;
/**
 * A kinematic body moves under simulation according to its velocity. They do not respond to forces. They can be moved manually, but normally a kinematic body is moved by setting its velocity. A kinematic body behaves as if it has infinite mass. Kinematic bodies do not collide with other static or kinematic bodies.
 * @static
 * @property KINEMATIC
 * @type {Number}
 */

Body.KINEMATIC = 4;
/**
 * @static
 * @property AWAKE
 * @type {number}
 */

Body.AWAKE = BODY_SLEEP_STATES.AWAKE;
Body.SLEEPY = BODY_SLEEP_STATES.SLEEPY;
Body.SLEEPING = BODY_SLEEP_STATES.SLEEPING;
Body.idCounter = 0;
/**
 * Dispatched after a sleeping body has woken up.
 * @event wakeup
 */

Body.wakeupEvent = {
  type: 'wakeup'
};
/**
 * Dispatched after a body has gone in to the sleepy state.
 * @event sleepy
 */

Body.sleepyEvent = {
  type: 'sleepy'
};
/**
 * Dispatched after a body has fallen asleep.
 * @event sleep
 */

Body.sleepEvent = {
  type: 'sleep'
};
const tmpVec = new Vec3();
const tmpQuat$1 = new Quaternion();
const computeAABB_shapeAABB = new AABB();
const uiw_m1 = new Mat3();
const uiw_m2 = new Mat3();
/**
 * Apply force to a world point. This could for example be a point on the Body surface. Applying force this way will add to Body.force and Body.torque.
 * @method applyForce
 * @param  {Vec3} force The amount of force to add.
 * @param  {Vec3} relativePoint A point relative to the center of mass to apply the force on.
 */

const Body_applyForce_rotForce = new Vec3();
/**
 * Apply force to a local point in the body.
 * @method applyLocalForce
 * @param  {Vec3} force The force vector to apply, defined locally in the body frame.
 * @param  {Vec3} localPoint A local point in the body to apply the force on.
 */

const Body_applyLocalForce_worldForce = new Vec3();
const Body_applyLocalForce_relativePointWorld = new Vec3();
/**
 * Apply impulse to a world point. This could for example be a point on the Body surface. An impulse is a force added to a body during a short period of time (impulse = force * time). Impulses will be added to Body.velocity and Body.angularVelocity.
 * @method applyImpulse
 * @param  {Vec3} impulse The amount of impulse to add.
 * @param  {Vec3} relativePoint A point relative to the center of mass to apply the force on.
 */

const Body_applyImpulse_velo = new Vec3();
const Body_applyImpulse_rotVelo = new Vec3();
/**
 * Apply locally-defined impulse to a local point in the body.
 * @method applyLocalImpulse
 * @param  {Vec3} force The force vector to apply, defined locally in the body frame.
 * @param  {Vec3} localPoint A local point in the body to apply the force on.
 */

const Body_applyLocalImpulse_worldImpulse = new Vec3();
const Body_applyLocalImpulse_relativePoint = new Vec3();
const Body_updateMassProperties_halfExtents = new Vec3();

/**
 * Base class for broadphase implementations
 * @class Broadphase
 * @constructor
 * @author schteppe
 */
class Broadphase {
  // The world to search for collisions in.
  // If set to true, the broadphase uses bounding boxes for intersection test, else it uses bounding spheres.
  // Set to true if the objects in the world moved.
  constructor() {
    this.world = null;
    this.useBoundingBoxes = false;
    this.dirty = true;
  }
  /**
   * Get the collision pairs from the world
   * @method collisionPairs
   * @param {World} world The world to search in
   * @param {Array} p1 Empty array to be filled with body objects
   * @param {Array} p2 Empty array to be filled with body objects
   */


  collisionPairs(world, p1, p2) {
    throw new Error('collisionPairs not implemented for this BroadPhase class!');
  }
  /**
   * Check if a body pair needs to be intersection tested at all.
   * @method needBroadphaseCollision
   * @param {Body} bodyA
   * @param {Body} bodyB
   * @return {bool}
   */


  needBroadphaseCollision(bodyA, bodyB) {
    // Check collision filter masks
    if ((bodyA.collisionFilterGroup & bodyB.collisionFilterMask) === 0 || (bodyB.collisionFilterGroup & bodyA.collisionFilterMask) === 0) {
      return false;
    } // Check types


    if (((bodyA.type & Body.STATIC) !== 0 || bodyA.sleepState === Body.SLEEPING) && ((bodyB.type & Body.STATIC) !== 0 || bodyB.sleepState === Body.SLEEPING)) {
      // Both bodies are static or sleeping. Skip.
      return false;
    }

    return true;
  }
  /**
   * Check if the bounding volumes of two bodies intersect.
   * @method intersectionTest
   * @param {Body} bodyA
   * @param {Body} bodyB
   * @param {array} pairs1
   * @param {array} pairs2
   */


  intersectionTest(bodyA, bodyB, pairs1, pairs2) {
    if (this.useBoundingBoxes) {
      this.doBoundingBoxBroadphase(bodyA, bodyB, pairs1, pairs2);
    } else {
      this.doBoundingSphereBroadphase(bodyA, bodyB, pairs1, pairs2);
    }
  }

  doBoundingSphereBroadphase(bodyA, bodyB, pairs1, pairs2) {
    const r = Broadphase_collisionPairs_r;
    bodyB.position.vsub(bodyA.position, r);
    const boundingRadiusSum2 = (bodyA.boundingRadius + bodyB.boundingRadius) ** 2;
    const norm2 = r.lengthSquared();

    if (norm2 < boundingRadiusSum2) {
      pairs1.push(bodyA);
      pairs2.push(bodyB);
    }
  }
  /**
   * Check if the bounding boxes of two bodies are intersecting.
   * @method doBoundingBoxBroadphase
   * @param {Body} bodyA
   * @param {Body} bodyB
   * @param {Array} pairs1
   * @param {Array} pairs2
   */


  doBoundingBoxBroadphase(bodyA, bodyB, pairs1, pairs2) {
    if (bodyA.aabbNeedsUpdate) {
      bodyA.computeAABB();
    }

    if (bodyB.aabbNeedsUpdate) {
      bodyB.computeAABB();
    } // Check AABB / AABB


    if (bodyA.aabb.overlaps(bodyB.aabb)) {
      pairs1.push(bodyA);
      pairs2.push(bodyB);
    }
  }

  makePairsUnique(pairs1, pairs2) {
    const t = Broadphase_makePairsUnique_temp;
    const p1 = Broadphase_makePairsUnique_p1;
    const p2 = Broadphase_makePairsUnique_p2;
    const N = pairs1.length;

    for (let i = 0; i !== N; i++) {
      p1[i] = pairs1[i];
      p2[i] = pairs2[i];
    }

    pairs1.length = 0;
    pairs2.length = 0;

    for (let i = 0; i !== N; i++) {
      const id1 = p1[i].id;
      const id2 = p2[i].id;
      const key = id1 < id2 ? id1 + "," + id2 : id2 + "," + id1;
      t[key] = i;
      t.keys.push(key);
    }

    for (let i = 0; i !== t.keys.length; i++) {
      const key = t.keys.pop();
      const pairIndex = t[key];
      pairs1.push(p1[pairIndex]);
      pairs2.push(p2[pairIndex]);
      delete t[key];
    }
  }
  /**
   * To be implemented by subcasses
   * @method setWorld
   * @param {World} world
   */


  setWorld(world) {}
  /**
   * Returns all the bodies within the AABB.
   * @method aabbQuery
   * @param  {World} world
   * @param  {AABB} aabb
   * @param  {array} result An array to store resulting bodies in.
   * @return {array}
   */


  aabbQuery(world, aabb, result) {
    console.warn('.aabbQuery is not implemented in this Broadphase subclass.');
    return [];
  }

}
/**
 * Check if the bounding spheres of two bodies are intersecting.
 * @method doBoundingSphereBroadphase
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Array} pairs1 bodyA is appended to this array if intersection
 * @param {Array} pairs2 bodyB is appended to this array if intersection
 */

const // Temp objects
Broadphase_collisionPairs_r = new Vec3();
/**
 * Removes duplicate pairs from the pair arrays.
 * @method makePairsUnique
 * @param {Array} pairs1
 * @param {Array} pairs2
 */

const Broadphase_makePairsUnique_temp = {
  keys: []
};
const Broadphase_makePairsUnique_p1 = [];
const Broadphase_makePairsUnique_p2 = [];

Broadphase.boundingSphereCheck = (bodyA, bodyB) => {
  const dist = new Vec3(); // bsc_dist;

  bodyA.position.vsub(bodyB.position, dist);
  const sa = bodyA.shapes[0];
  const sb = bodyB.shapes[0];
  return Math.pow(sa.boundingSphereRadius + sb.boundingSphereRadius, 2) > dist.lengthSquared();
};

/**
 * Axis aligned uniform grid broadphase.
 * @class GridBroadphase
 * @constructor
 * @extends Broadphase
 * @todo Needs support for more than just planes and spheres.
 * @param {Vec3} aabbMin
 * @param {Vec3} aabbMax
 * @param {Number} nx Number of boxes along x
 * @param {Number} ny Number of boxes along y
 * @param {Number} nz Number of boxes along z
 */
class GridBroadphase extends Broadphase {
  constructor(aabbMin = new Vec3(100, 100, 100), aabbMax = new Vec3(-100, -100, -100), nx = 10, ny = 10, nz = 10) {
    super();
    this.nx = nx;
    this.ny = ny;
    this.nz = nz;
    this.aabbMin = aabbMin;
    this.aabbMax = aabbMax;
    const nbins = this.nx * this.ny * this.nz;

    if (nbins <= 0) {
      throw "GridBroadphase: Each dimension's n must be >0";
    }

    this.bins = [];
    this.binLengths = []; //Rather than continually resizing arrays (thrashing the memory), just record length and allow them to grow

    this.bins.length = nbins;
    this.binLengths.length = nbins;

    for (let i = 0; i < nbins; i++) {
      this.bins[i] = [];
      this.binLengths[i] = 0;
    }
  }

  collisionPairs(world, pairs1, pairs2) {
    const N = world.numObjects();
    const bodies = world.bodies;
    const max = this.aabbMax;
    const min = this.aabbMin;
    const nx = this.nx;
    const ny = this.ny;
    const nz = this.nz;
    const xstep = ny * nz;
    const ystep = nz;
    const zstep = 1;
    const xmax = max.x;
    const ymax = max.y;
    const zmax = max.z;
    const xmin = min.x;
    const ymin = min.y;
    const zmin = min.z;
    const xmult = nx / (xmax - xmin);
    const ymult = ny / (ymax - ymin);
    const zmult = nz / (zmax - zmin);
    const binsizeX = (xmax - xmin) / nx;
    const binsizeY = (ymax - ymin) / ny;
    const binsizeZ = (zmax - zmin) / nz;
    const binRadius = Math.sqrt(binsizeX * binsizeX + binsizeY * binsizeY + binsizeZ * binsizeZ) * 0.5;
    const types = Shape.types;
    const SPHERE = types.SPHERE;
    const PLANE = types.PLANE;
    const BOX = types.BOX;
    const COMPOUND = types.COMPOUND;
    const CONVEXPOLYHEDRON = types.CONVEXPOLYHEDRON;
    const bins = this.bins;
    const binLengths = this.binLengths;
    const Nbins = this.bins.length; // Reset bins

    for (let i = 0; i !== Nbins; i++) {
      binLengths[i] = 0;
    }

    const ceil = Math.ceil;

    function addBoxToBins(x0, y0, z0, x1, y1, z1, bi) {
      let xoff0 = (x0 - xmin) * xmult | 0;
      let yoff0 = (y0 - ymin) * ymult | 0;
      let zoff0 = (z0 - zmin) * zmult | 0;
      let xoff1 = ceil((x1 - xmin) * xmult);
      let yoff1 = ceil((y1 - ymin) * ymult);
      let zoff1 = ceil((z1 - zmin) * zmult);

      if (xoff0 < 0) {
        xoff0 = 0;
      } else if (xoff0 >= nx) {
        xoff0 = nx - 1;
      }

      if (yoff0 < 0) {
        yoff0 = 0;
      } else if (yoff0 >= ny) {
        yoff0 = ny - 1;
      }

      if (zoff0 < 0) {
        zoff0 = 0;
      } else if (zoff0 >= nz) {
        zoff0 = nz - 1;
      }

      if (xoff1 < 0) {
        xoff1 = 0;
      } else if (xoff1 >= nx) {
        xoff1 = nx - 1;
      }

      if (yoff1 < 0) {
        yoff1 = 0;
      } else if (yoff1 >= ny) {
        yoff1 = ny - 1;
      }

      if (zoff1 < 0) {
        zoff1 = 0;
      } else if (zoff1 >= nz) {
        zoff1 = nz - 1;
      }

      xoff0 *= xstep;
      yoff0 *= ystep;
      zoff0 *= zstep;
      xoff1 *= xstep;
      yoff1 *= ystep;
      zoff1 *= zstep;

      for (let xoff = xoff0; xoff <= xoff1; xoff += xstep) {
        for (let yoff = yoff0; yoff <= yoff1; yoff += ystep) {
          for (let zoff = zoff0; zoff <= zoff1; zoff += zstep) {
            const idx = xoff + yoff + zoff;
            bins[idx][binLengths[idx]++] = bi;
          }
        }
      }
    } // Put all bodies into the bins


    for (let i = 0; i !== N; i++) {
      const bi = bodies[i];
      const si = bi.shapes[0];

      switch (si.type) {
        case SPHERE:
          {
            const shape = si; // Put in bin
            // check if overlap with other bins

            const x = bi.position.x;
            const y = bi.position.y;
            const z = bi.position.z;
            const r = shape.radius;
            addBoxToBins(x - r, y - r, z - r, x + r, y + r, z + r, bi);
            break;
          }

        case PLANE:
          {
            const shape = si;

            if (shape.worldNormalNeedsUpdate) {
              shape.computeWorldNormal(bi.quaternion);
            }

            const planeNormal = shape.worldNormal; //Relative position from origin of plane object to the first bin
            //Incremented as we iterate through the bins

            const xreset = xmin + binsizeX * 0.5 - bi.position.x;
            const yreset = ymin + binsizeY * 0.5 - bi.position.y;
            const zreset = zmin + binsizeZ * 0.5 - bi.position.z;
            const d = GridBroadphase_collisionPairs_d;
            d.set(xreset, yreset, zreset);

            for (let xi = 0, xoff = 0; xi !== nx; xi++, xoff += xstep, d.y = yreset, d.x += binsizeX) {
              for (let yi = 0, yoff = 0; yi !== ny; yi++, yoff += ystep, d.z = zreset, d.y += binsizeY) {
                for (let zi = 0, zoff = 0; zi !== nz; zi++, zoff += zstep, d.z += binsizeZ) {
                  if (d.dot(planeNormal) < binRadius) {
                    const idx = xoff + yoff + zoff;
                    bins[idx][binLengths[idx]++] = bi;
                  }
                }
              }
            }

            break;
          }

        default:
          {
            if (bi.aabbNeedsUpdate) {
              bi.computeAABB();
            }

            addBoxToBins(bi.aabb.lowerBound.x, bi.aabb.lowerBound.y, bi.aabb.lowerBound.z, bi.aabb.upperBound.x, bi.aabb.upperBound.y, bi.aabb.upperBound.z, bi);
            break;
          }
      }
    } // Check each bin


    for (let i = 0; i !== Nbins; i++) {
      const binLength = binLengths[i]; //Skip bins with no potential collisions

      if (binLength > 1) {
        const bin = bins[i]; // Do N^2 broadphase inside

        for (let xi = 0; xi !== binLength; xi++) {
          const bi = bin[xi];

          for (let yi = 0; yi !== xi; yi++) {
            const bj = bin[yi];

            if (this.needBroadphaseCollision(bi, bj)) {
              this.intersectionTest(bi, bj, pairs1, pairs2);
            }
          }
        }
      }
    } //	for (let zi = 0, zoff=0; zi < nz; zi++, zoff+= zstep) {
    //		console.log("layer "+zi);
    //		for (let yi = 0, yoff=0; yi < ny; yi++, yoff += ystep) {
    //			const row = '';
    //			for (let xi = 0, xoff=0; xi < nx; xi++, xoff += xstep) {
    //				const idx = xoff + yoff + zoff;
    //				row += ' ' + binLengths[idx];
    //			}
    //			console.log(row);
    //		}
    //	}


    this.makePairsUnique(pairs1, pairs2);
  }

}
/**
 * Get all the collision pairs in the physics world
 * @method collisionPairs
 * @param {World} world
 * @param {Array} pairs1
 * @param {Array} pairs2
 */

const GridBroadphase_collisionPairs_d = new Vec3();

/**
 * Naive broadphase implementation, used in lack of better ones.
 * @class NaiveBroadphase
 * @constructor
 * @description The naive broadphase looks at all possible pairs without restriction, therefore it has complexity N^2 (which is bad)
 * @extends Broadphase
 */
class NaiveBroadphase extends Broadphase {
  constructor() {
    super();
  }
  /**
   * Get all the collision pairs in the physics world
   * @method collisionPairs
   * @param {World} world
   * @param {Array} pairs1
   * @param {Array} pairs2
   */


  collisionPairs(world, pairs1, pairs2) {
    const bodies = world.bodies;
    const n = bodies.length;
    let bi;
    let bj; // Naive N^2 ftw!

    for (let i = 0; i !== n; i++) {
      for (let j = 0; j !== i; j++) {
        bi = bodies[i];
        bj = bodies[j];

        if (!this.needBroadphaseCollision(bi, bj)) {
          continue;
        }

        this.intersectionTest(bi, bj, pairs1, pairs2);
      }
    }
  }
  /**
   * Returns all the bodies within an AABB.
   * @method aabbQuery
   * @param  {World} world
   * @param  {AABB} aabb
   * @param {array} result An array to store resulting bodies in.
   * @return {array}
   */


  aabbQuery(world, aabb, result = []) {
    for (let i = 0; i < world.bodies.length; i++) {
      const b = world.bodies[i];

      if (b.aabbNeedsUpdate) {
        b.computeAABB();
      } // Ugly hack until Body gets aabb


      if (b.aabb.overlaps(aabb)) {
        result.push(b);
      }
    }

    return result;
  }

}

/**
 * Storage for Ray casting data.
 * @class RaycastResult
 * @constructor
 */
class RaycastResult {
  // The index of the hit triangle, if the hit shape was a trimesh.
  // Distance to the hit. Will be set to -1 if there was no hit.
  // If the ray should stop traversing the bodies.
  constructor() {
    this.rayFromWorld = new Vec3();
    this.rayToWorld = new Vec3();
    this.hitNormalWorld = new Vec3();
    this.hitPointWorld = new Vec3();
    this.hasHit = false;
    this.shape = null;
    this.body = null;
    this.hitFaceIndex = -1;
    this.distance = -1;
    this.shouldStop = false;
  }
  /**
   * Reset all result data.
   * @method reset
   */


  reset() {
    this.rayFromWorld.setZero();
    this.rayToWorld.setZero();
    this.hitNormalWorld.setZero();
    this.hitPointWorld.setZero();
    this.hasHit = false;
    this.shape = null;
    this.body = null;
    this.hitFaceIndex = -1;
    this.distance = -1;
    this.shouldStop = false;
  }
  /**
   * @method abort
   */


  abort() {
    this.shouldStop = true;
  }
  /**
   * @method set
   * @param {Vec3} rayFromWorld
   * @param {Vec3} rayToWorld
   * @param {Vec3} hitNormalWorld
   * @param {Vec3} hitPointWorld
   * @param {Shape} shape
   * @param {Body} body
   * @param {number} distance
   */


  set(rayFromWorld, rayToWorld, hitNormalWorld, hitPointWorld, shape, body, distance) {
    this.rayFromWorld.copy(rayFromWorld);
    this.rayToWorld.copy(rayToWorld);
    this.hitNormalWorld.copy(hitNormalWorld);
    this.hitPointWorld.copy(hitPointWorld);
    this.shape = shape;
    this.body = body;
    this.distance = distance;
  }

}

const RAY_MODES = {
  CLOSEST: 1,
  ANY: 2,
  ALL: 4
};

/**
 * A line in 3D space that intersects bodies and return points.
 * @class Ray
 * @constructor
 * @param {Vec3} from
 * @param {Vec3} to
 */
class Ray {
  // The precision of the ray. Used when checking parallelity etc.
  // Set to true if you want the Ray to take .collisionResponse flags into account on bodies and shapes.
  // If set to true, the ray skips any hits with normal.dot(rayDirection) < 0.
  // The intersection mode. Should be Ray.ANY, Ray.ALL or Ray.CLOSEST.
  // Current result object.
  // Will be set to true during intersectWorld() if the ray hit anything.
  // User-provided result callback. Will be used if mode is Ray.ALL.
  constructor(from = new Vec3(), to = new Vec3()) {
    this.from = from.clone();
    this.to = to.clone();
    this.direction = new Vec3();
    this.precision = 0.0001;
    this.checkCollisionResponse = true;
    this.skipBackfaces = false;
    this.collisionFilterMask = -1;
    this.collisionFilterGroup = -1;
    this.mode = Ray.ANY;
    this.result = new RaycastResult();
    this.hasHit = false;

    this.callback = result => {};
  }
  /**
   * Do itersection against all bodies in the given World.
   * @method intersectWorld
   * @param  {World} world
   * @param  {object} options
   * @return {Boolean} True if the ray hit anything, otherwise false.
   */


  intersectWorld(world, options) {
    this.mode = options.mode || Ray.ANY;
    this.result = options.result || new RaycastResult();
    this.skipBackfaces = !!options.skipBackfaces;
    this.collisionFilterMask = typeof options.collisionFilterMask !== 'undefined' ? options.collisionFilterMask : -1;
    this.collisionFilterGroup = typeof options.collisionFilterGroup !== 'undefined' ? options.collisionFilterGroup : -1;
    this.checkCollisionResponse = typeof options.checkCollisionResponse !== 'undefined' ? options.checkCollisionResponse : true;

    if (options.from) {
      this.from.copy(options.from);
    }

    if (options.to) {
      this.to.copy(options.to);
    }

    this.callback = options.callback || (() => {});

    this.hasHit = false;
    this.result.reset();
    this.updateDirection();
    this.getAABB(tmpAABB);
    tmpArray.length = 0;
    world.broadphase.aabbQuery(world, tmpAABB, tmpArray);
    this.intersectBodies(tmpArray);
    return this.hasHit;
  }
  /**
   * Shoot a ray at a body, get back information about the hit.
   * @param {Body} body
   * @param {RaycastResult} [result] Deprecated - set the result property of the Ray instead.
   */


  intersectBody(body, result) {
    if (result) {
      this.result = result;
      this.updateDirection();
    }

    const checkCollisionResponse = this.checkCollisionResponse;

    if (checkCollisionResponse && !body.collisionResponse) {
      return;
    }

    if ((this.collisionFilterGroup & body.collisionFilterMask) === 0 || (body.collisionFilterGroup & this.collisionFilterMask) === 0) {
      return;
    }

    const xi = intersectBody_xi;
    const qi = intersectBody_qi;

    for (let i = 0, N = body.shapes.length; i < N; i++) {
      const shape = body.shapes[i];

      if (checkCollisionResponse && !shape.collisionResponse) {
        continue; // Skip
      }

      body.quaternion.mult(body.shapeOrientations[i], qi);
      body.quaternion.vmult(body.shapeOffsets[i], xi);
      xi.vadd(body.position, xi);
      this.intersectShape(shape, qi, xi, body);

      if (this.result.shouldStop) {
        break;
      }
    }
  }
  /**
   * @method intersectBodies
   * @param {Array} bodies An array of Body objects.
   * @param {RaycastResult} [result] Deprecated
   */


  intersectBodies(bodies, result) {
    if (result) {
      this.result = result;
      this.updateDirection();
    }

    for (let i = 0, l = bodies.length; !this.result.shouldStop && i < l; i++) {
      this.intersectBody(bodies[i]);
    }
  }
  /**
   * Updates the direction vector.
   */


  updateDirection() {
    this.to.vsub(this.from, this.direction);
    this.direction.normalize();
  }

  intersectShape(shape, quat, position, body) {
    const from = this.from; // Checking boundingSphere

    const distance = distanceFromIntersection(from, this.direction, position);

    if (distance > shape.boundingSphereRadius) {
      return;
    }

    const intersectMethod = this[shape.type];

    if (intersectMethod) {
      intersectMethod.call(this, shape, quat, position, body, shape);
    }
  }

  _intersectBox(box, quat, position, body, reportedShape) {
    return this._intersectConvex(box.convexPolyhedronRepresentation, quat, position, body, reportedShape);
  }

  _intersectPlane(shape, quat, position, body, reportedShape) {
    const from = this.from;
    const to = this.to;
    const direction = this.direction; // Get plane normal

    const worldNormal = new Vec3(0, 0, 1);
    quat.vmult(worldNormal, worldNormal);
    const len = new Vec3();
    from.vsub(position, len);
    const planeToFrom = len.dot(worldNormal);
    to.vsub(position, len);
    const planeToTo = len.dot(worldNormal);

    if (planeToFrom * planeToTo > 0) {
      // "from" and "to" are on the same side of the plane... bail out
      return;
    }

    if (from.distanceTo(to) < planeToFrom) {
      return;
    }

    const n_dot_dir = worldNormal.dot(direction);

    if (Math.abs(n_dot_dir) < this.precision) {
      // No intersection
      return;
    }

    const planePointToFrom = new Vec3();
    const dir_scaled_with_t = new Vec3();
    const hitPointWorld = new Vec3();
    from.vsub(position, planePointToFrom);
    const t = -worldNormal.dot(planePointToFrom) / n_dot_dir;
    direction.scale(t, dir_scaled_with_t);
    from.vadd(dir_scaled_with_t, hitPointWorld);
    this.reportIntersection(worldNormal, hitPointWorld, reportedShape, body, -1);
  }
  /**
   * Get the world AABB of the ray.
   */


  getAABB(aabb) {
    const {
      lowerBound,
      upperBound
    } = aabb;
    const to = this.to;
    const from = this.from;
    lowerBound.x = Math.min(to.x, from.x);
    lowerBound.y = Math.min(to.y, from.y);
    lowerBound.z = Math.min(to.z, from.z);
    upperBound.x = Math.max(to.x, from.x);
    upperBound.y = Math.max(to.y, from.y);
    upperBound.z = Math.max(to.z, from.z);
  }

  _intersectHeightfield(shape, quat, position, body, reportedShape) {
    const data = shape.data;
    const w = shape.elementSize; // Convert the ray to local heightfield coordinates

    const localRay = intersectHeightfield_localRay; //new Ray(this.from, this.to);

    localRay.from.copy(this.from);
    localRay.to.copy(this.to);
    Transform.pointToLocalFrame(position, quat, localRay.from, localRay.from);
    Transform.pointToLocalFrame(position, quat, localRay.to, localRay.to);
    localRay.updateDirection(); // Get the index of the data points to test against

    const index = intersectHeightfield_index;
    let iMinX;
    let iMinY;
    let iMaxX;
    let iMaxY; // Set to max

    iMinX = iMinY = 0;
    iMaxX = iMaxY = shape.data.length - 1;
    const aabb = new AABB();
    localRay.getAABB(aabb);
    shape.getIndexOfPosition(aabb.lowerBound.x, aabb.lowerBound.y, index, true);
    iMinX = Math.max(iMinX, index[0]);
    iMinY = Math.max(iMinY, index[1]);
    shape.getIndexOfPosition(aabb.upperBound.x, aabb.upperBound.y, index, true);
    iMaxX = Math.min(iMaxX, index[0] + 1);
    iMaxY = Math.min(iMaxY, index[1] + 1);

    for (let i = iMinX; i < iMaxX; i++) {
      for (let j = iMinY; j < iMaxY; j++) {
        if (this.result.shouldStop) {
          return;
        }

        shape.getAabbAtIndex(i, j, aabb);

        if (!aabb.overlapsRay(localRay)) {
          continue;
        } // Lower triangle


        shape.getConvexTrianglePillar(i, j, false);
        Transform.pointToWorldFrame(position, quat, shape.pillarOffset, worldPillarOffset);

        this._intersectConvex(shape.pillarConvex, quat, worldPillarOffset, body, reportedShape, intersectConvexOptions);

        if (this.result.shouldStop) {
          return;
        } // Upper triangle


        shape.getConvexTrianglePillar(i, j, true);
        Transform.pointToWorldFrame(position, quat, shape.pillarOffset, worldPillarOffset);

        this._intersectConvex(shape.pillarConvex, quat, worldPillarOffset, body, reportedShape, intersectConvexOptions);
      }
    }
  }

  _intersectSphere(sphere, quat, position, body, reportedShape) {
    const from = this.from;
    const to = this.to;
    const r = sphere.radius;
    const a = (to.x - from.x) ** 2 + (to.y - from.y) ** 2 + (to.z - from.z) ** 2;
    const b = 2 * ((to.x - from.x) * (from.x - position.x) + (to.y - from.y) * (from.y - position.y) + (to.z - from.z) * (from.z - position.z));
    const c = (from.x - position.x) ** 2 + (from.y - position.y) ** 2 + (from.z - position.z) ** 2 - r ** 2;
    const delta = b ** 2 - 4 * a * c;
    const intersectionPoint = Ray_intersectSphere_intersectionPoint;
    const normal = Ray_intersectSphere_normal;

    if (delta < 0) {
      // No intersection
      return;
    } else if (delta === 0) {
      // single intersection point
      from.lerp(to, delta, intersectionPoint);
      intersectionPoint.vsub(position, normal);
      normal.normalize();
      this.reportIntersection(normal, intersectionPoint, reportedShape, body, -1);
    } else {
      const d1 = (-b - Math.sqrt(delta)) / (2 * a);
      const d2 = (-b + Math.sqrt(delta)) / (2 * a);

      if (d1 >= 0 && d1 <= 1) {
        from.lerp(to, d1, intersectionPoint);
        intersectionPoint.vsub(position, normal);
        normal.normalize();
        this.reportIntersection(normal, intersectionPoint, reportedShape, body, -1);
      }

      if (this.result.shouldStop) {
        return;
      }

      if (d2 >= 0 && d2 <= 1) {
        from.lerp(to, d2, intersectionPoint);
        intersectionPoint.vsub(position, normal);
        normal.normalize();
        this.reportIntersection(normal, intersectionPoint, reportedShape, body, -1);
      }
    }
  }

  _intersectConvex(shape, quat, position, body, reportedShape, options) {
    const normal = intersectConvex_normal;
    const vector = intersectConvex_vector;
    const faceList = options && options.faceList || null; // Checking faces

    const faces = shape.faces;
    const vertices = shape.vertices;
    const normals = shape.faceNormals;
    const direction = this.direction;
    const from = this.from;
    const to = this.to;
    const fromToDistance = from.distanceTo(to);
    const Nfaces = faceList ? faceList.length : faces.length;
    const result = this.result;

    for (let j = 0; !result.shouldStop && j < Nfaces; j++) {
      const fi = faceList ? faceList[j] : j;
      const face = faces[fi];
      const faceNormal = normals[fi];
      const q = quat;
      const x = position; // determine if ray intersects the plane of the face
      // note: this works regardless of the direction of the face normal
      // Get plane point in world coordinates...

      vector.copy(vertices[face[0]]);
      q.vmult(vector, vector);
      vector.vadd(x, vector); // ...but make it relative to the ray from. We'll fix this later.

      vector.vsub(from, vector); // Get plane normal

      q.vmult(faceNormal, normal); // If this dot product is negative, we have something interesting

      const dot = direction.dot(normal); // Bail out if ray and plane are parallel

      if (Math.abs(dot) < this.precision) {
        continue;
      } // calc distance to plane


      const scalar = normal.dot(vector) / dot; // if negative distance, then plane is behind ray

      if (scalar < 0) {
        continue;
      } // if (dot < 0) {
      // Intersection point is from + direction * scalar


      direction.scale(scalar, intersectPoint);
      intersectPoint.vadd(from, intersectPoint); // a is the point we compare points b and c with.

      a.copy(vertices[face[0]]);
      q.vmult(a, a);
      x.vadd(a, a);

      for (let i = 1; !result.shouldStop && i < face.length - 1; i++) {
        // Transform 3 vertices to world coords
        b.copy(vertices[face[i]]);
        c.copy(vertices[face[i + 1]]);
        q.vmult(b, b);
        q.vmult(c, c);
        x.vadd(b, b);
        x.vadd(c, c);
        const distance = intersectPoint.distanceTo(from);

        if (!(pointInTriangle(intersectPoint, a, b, c) || pointInTriangle(intersectPoint, b, a, c)) || distance > fromToDistance) {
          continue;
        }

        this.reportIntersection(normal, intersectPoint, reportedShape, body, fi);
      } // }

    }
  }
  /**
   * @todo Optimize by transforming the world to local space first.
   * @todo Use Octree lookup
   */


  _intersectTrimesh(mesh, quat, position, body, reportedShape, options) {
    const normal = intersectTrimesh_normal;
    const triangles = intersectTrimesh_triangles;
    const treeTransform = intersectTrimesh_treeTransform;
    const vector = intersectConvex_vector;
    const localDirection = intersectTrimesh_localDirection;
    const localFrom = intersectTrimesh_localFrom;
    const localTo = intersectTrimesh_localTo;
    const worldIntersectPoint = intersectTrimesh_worldIntersectPoint;
    const worldNormal = intersectTrimesh_worldNormal;
    const faceList = options && options.faceList || null; // Checking faces

    const indices = mesh.indices;
    const vertices = mesh.vertices; // const normals = mesh.faceNormals

    const from = this.from;
    const to = this.to;
    const direction = this.direction;
    treeTransform.position.copy(position);
    treeTransform.quaternion.copy(quat); // Transform ray to local space!

    Transform.vectorToLocalFrame(position, quat, direction, localDirection);
    Transform.pointToLocalFrame(position, quat, from, localFrom);
    Transform.pointToLocalFrame(position, quat, to, localTo);
    localTo.x *= mesh.scale.x;
    localTo.y *= mesh.scale.y;
    localTo.z *= mesh.scale.z;
    localFrom.x *= mesh.scale.x;
    localFrom.y *= mesh.scale.y;
    localFrom.z *= mesh.scale.z;
    localTo.vsub(localFrom, localDirection);
    localDirection.normalize();
    const fromToDistanceSquared = localFrom.distanceSquared(localTo);
    mesh.tree.rayQuery(this, treeTransform, triangles);

    for (let i = 0, N = triangles.length; !this.result.shouldStop && i !== N; i++) {
      const trianglesIndex = triangles[i];
      mesh.getNormal(trianglesIndex, normal); // determine if ray intersects the plane of the face
      // note: this works regardless of the direction of the face normal
      // Get plane point in world coordinates...

      mesh.getVertex(indices[trianglesIndex * 3], a); // ...but make it relative to the ray from. We'll fix this later.

      a.vsub(localFrom, vector); // If this dot product is negative, we have something interesting

      const dot = localDirection.dot(normal); // Bail out if ray and plane are parallel
      // if (Math.abs( dot ) < this.precision){
      //     continue;
      // }
      // calc distance to plane

      const scalar = normal.dot(vector) / dot; // if negative distance, then plane is behind ray

      if (scalar < 0) {
        continue;
      } // Intersection point is from + direction * scalar


      localDirection.scale(scalar, intersectPoint);
      intersectPoint.vadd(localFrom, intersectPoint); // Get triangle vertices

      mesh.getVertex(indices[trianglesIndex * 3 + 1], b);
      mesh.getVertex(indices[trianglesIndex * 3 + 2], c);
      const squaredDistance = intersectPoint.distanceSquared(localFrom);

      if (!(pointInTriangle(intersectPoint, b, a, c) || pointInTriangle(intersectPoint, a, b, c)) || squaredDistance > fromToDistanceSquared) {
        continue;
      } // transform intersectpoint and normal to world


      Transform.vectorToWorldFrame(quat, normal, worldNormal);
      Transform.pointToWorldFrame(position, quat, intersectPoint, worldIntersectPoint);
      this.reportIntersection(worldNormal, worldIntersectPoint, reportedShape, body, trianglesIndex);
    }

    triangles.length = 0;
  }
  /**
   * @return {boolean} True if the intersections should continue
   */


  reportIntersection(normal, hitPointWorld, shape, body, hitFaceIndex) {
    const from = this.from;
    const to = this.to;
    const distance = from.distanceTo(hitPointWorld);
    const result = this.result; // Skip back faces?

    if (this.skipBackfaces && normal.dot(this.direction) > 0) {
      return;
    }

    result.hitFaceIndex = typeof hitFaceIndex !== 'undefined' ? hitFaceIndex : -1;

    switch (this.mode) {
      case Ray.ALL:
        this.hasHit = true;
        result.set(from, to, normal, hitPointWorld, shape, body, distance);
        result.hasHit = true;
        this.callback(result);
        break;

      case Ray.CLOSEST:
        // Store if closer than current closest
        if (distance < result.distance || !result.hasHit) {
          this.hasHit = true;
          result.hasHit = true;
          result.set(from, to, normal, hitPointWorld, shape, body, distance);
        }

        break;

      case Ray.ANY:
        // Report and stop.
        this.hasHit = true;
        result.hasHit = true;
        result.set(from, to, normal, hitPointWorld, shape, body, distance);
        result.shouldStop = true;
        break;
    }
  }

}
Ray.CLOSEST = 1;
Ray.ANY = 2;
Ray.ALL = 4;
const tmpAABB = new AABB();
const tmpArray = [];
const v1 = new Vec3();
const v2 = new Vec3();
/*
 * As per "Barycentric Technique" as named here http://www.blackpawn.com/texts/pointinpoly/default.html But without the division
 */

Ray.pointInTriangle = pointInTriangle;

function pointInTriangle(p, a, b, c) {
  c.vsub(a, v0);
  b.vsub(a, v1);
  p.vsub(a, v2);
  const dot00 = v0.dot(v0);
  const dot01 = v0.dot(v1);
  const dot02 = v0.dot(v2);
  const dot11 = v1.dot(v1);
  const dot12 = v1.dot(v2);
  let u;
  let v;
  return (u = dot11 * dot02 - dot01 * dot12) >= 0 && (v = dot00 * dot12 - dot01 * dot02) >= 0 && u + v < dot00 * dot11 - dot01 * dot01;
}

const intersectBody_xi = new Vec3();
const intersectBody_qi = new Quaternion();
const intersectPoint = new Vec3();
const a = new Vec3();
const b = new Vec3();
const c = new Vec3();
Ray.prototype[Shape.types.BOX] = Ray.prototype._intersectBox;
Ray.prototype[Shape.types.PLANE] = Ray.prototype._intersectPlane;
const intersectConvexOptions = {
  faceList: [0]
};
const worldPillarOffset = new Vec3();
const intersectHeightfield_localRay = new Ray();
const intersectHeightfield_index = [];
Ray.prototype[Shape.types.HEIGHTFIELD] = Ray.prototype._intersectHeightfield;
const Ray_intersectSphere_intersectionPoint = new Vec3();
const Ray_intersectSphere_normal = new Vec3();
Ray.prototype[Shape.types.SPHERE] = Ray.prototype._intersectSphere;
const intersectConvex_normal = new Vec3();
const intersectConvex_vector = new Vec3();
Ray.prototype[Shape.types.CONVEXPOLYHEDRON] = Ray.prototype._intersectConvex;
const intersectTrimesh_normal = new Vec3();
const intersectTrimesh_localDirection = new Vec3();
const intersectTrimesh_localFrom = new Vec3();
const intersectTrimesh_localTo = new Vec3();
const intersectTrimesh_worldNormal = new Vec3();
const intersectTrimesh_worldIntersectPoint = new Vec3();
const intersectTrimesh_localAABB = new AABB();
const intersectTrimesh_triangles = [];
const intersectTrimesh_treeTransform = new Transform();
Ray.prototype[Shape.types.TRIMESH] = Ray.prototype._intersectTrimesh;
const v0 = new Vec3();
const intersect = new Vec3();

function distanceFromIntersection(from, direction, position) {
  // v0 is vector from from to position
  position.vsub(from, v0);
  const dot = v0.dot(direction); // intersect = direction*dot + from

  direction.scale(dot, intersect);
  intersect.vadd(from, intersect);
  const distance = position.distanceTo(intersect);
  return distance;
}

/**
 * Sweep and prune broadphase along one axis.
 *
 * @class SAPBroadphase
 * @constructor
 * @param {World} [world]
 * @extends Broadphase
 */
class SAPBroadphase extends Broadphase {
  // List of bodies currently in the broadphase.
  // The world to search in.
  // Axis to sort the bodies along. Set to 0 for x axis, and 1 for y axis. For best performance, choose an axis that the bodies are spread out more on.
  constructor(world) {
    super();
    this.axisList = [];
    this.world = null;
    this.axisIndex = 0;
    const axisList = this.axisList;

    this._addBodyHandler = event => {
      axisList.push(event.body);
    };

    this._removeBodyHandler = event => {
      const idx = axisList.indexOf(event.body);

      if (idx !== -1) {
        axisList.splice(idx, 1);
      }
    };

    if (world) {
      this.setWorld(world);
    }
  }
  /**
   * Change the world
   * @method setWorld
   * @param  {World} world
   */


  setWorld(world) {
    // Clear the old axis array
    this.axisList.length = 0; // Add all bodies from the new world

    for (let i = 0; i < world.bodies.length; i++) {
      this.axisList.push(world.bodies[i]);
    } // Remove old handlers, if any


    world.removeEventListener('addBody', this._addBodyHandler);
    world.removeEventListener('removeBody', this._removeBodyHandler); // Add handlers to update the list of bodies.

    world.addEventListener('addBody', this._addBodyHandler);
    world.addEventListener('removeBody', this._removeBodyHandler);
    this.world = world;
    this.dirty = true;
  }
  /**
   * Collect all collision pairs
   * @method collisionPairs
   * @param  {World} world
   * @param  {Array} p1
   * @param  {Array} p2
   */


  collisionPairs(world, p1, p2) {
    const bodies = this.axisList;
    const N = bodies.length;
    const axisIndex = this.axisIndex;
    let i;
    let j;

    if (this.dirty) {
      this.sortList();
      this.dirty = false;
    } // Look through the list


    for (i = 0; i !== N; i++) {
      const bi = bodies[i];

      for (j = i + 1; j < N; j++) {
        const bj = bodies[j];

        if (!this.needBroadphaseCollision(bi, bj)) {
          continue;
        }

        if (!SAPBroadphase.checkBounds(bi, bj, axisIndex)) {
          break;
        }

        this.intersectionTest(bi, bj, p1, p2);
      }
    }
  }

  sortList() {
    const axisList = this.axisList;
    const axisIndex = this.axisIndex;
    const N = axisList.length; // Update AABBs

    for (let i = 0; i !== N; i++) {
      const bi = axisList[i];

      if (bi.aabbNeedsUpdate) {
        bi.computeAABB();
      }
    } // Sort the list


    if (axisIndex === 0) {
      SAPBroadphase.insertionSortX(axisList);
    } else if (axisIndex === 1) {
      SAPBroadphase.insertionSortY(axisList);
    } else if (axisIndex === 2) {
      SAPBroadphase.insertionSortZ(axisList);
    }
  }
  /**
   * Computes the variance of the body positions and estimates the best
   * axis to use. Will automatically set property .axisIndex.
   * @method autoDetectAxis
   */


  autoDetectAxis() {
    let sumX = 0;
    let sumX2 = 0;
    let sumY = 0;
    let sumY2 = 0;
    let sumZ = 0;
    let sumZ2 = 0;
    const bodies = this.axisList;
    const N = bodies.length;
    const invN = 1 / N;

    for (let i = 0; i !== N; i++) {
      const b = bodies[i];
      const centerX = b.position.x;
      sumX += centerX;
      sumX2 += centerX * centerX;
      const centerY = b.position.y;
      sumY += centerY;
      sumY2 += centerY * centerY;
      const centerZ = b.position.z;
      sumZ += centerZ;
      sumZ2 += centerZ * centerZ;
    }

    const varianceX = sumX2 - sumX * sumX * invN;
    const varianceY = sumY2 - sumY * sumY * invN;
    const varianceZ = sumZ2 - sumZ * sumZ * invN;

    if (varianceX > varianceY) {
      if (varianceX > varianceZ) {
        this.axisIndex = 0;
      } else {
        this.axisIndex = 2;
      }
    } else if (varianceY > varianceZ) {
      this.axisIndex = 1;
    } else {
      this.axisIndex = 2;
    }
  }
  /**
   * Returns all the bodies within an AABB.
   * @method aabbQuery
   * @param  {World} world
   * @param  {AABB} aabb
   * @param {array} result An array to store resulting bodies in.
   * @return {array}
   */


  aabbQuery(world, aabb, result = []) {
    if (this.dirty) {
      this.sortList();
      this.dirty = false;
    }

    const axisIndex = this.axisIndex;
    let axis = 'x';

    if (axisIndex === 1) {
      axis = 'y';
    }

    if (axisIndex === 2) {
      axis = 'z';
    }

    const axisList = this.axisList;
    const lower = aabb.lowerBound[axis];
    const upper = aabb.upperBound[axis];

    for (let i = 0; i < axisList.length; i++) {
      const b = axisList[i];

      if (b.aabbNeedsUpdate) {
        b.computeAABB();
      }

      if (b.aabb.overlaps(aabb)) {
        result.push(b);
      }
    }

    return result;
  }

}
/**
 * @static
 * @method insertionSortX
 * @param  {Array} a
 * @return {Array}
 */

SAPBroadphase.insertionSortX = a => {
  for (let i = 1, l = a.length; i < l; i++) {
    const v = a[i];
    let j;

    for (j = i - 1; j >= 0; j--) {
      if (a[j].aabb.lowerBound.x <= v.aabb.lowerBound.x) {
        break;
      }

      a[j + 1] = a[j];
    }

    a[j + 1] = v;
  }

  return a;
};
/**
 * @static
 * @method insertionSortY
 * @param  {Array} a
 * @return {Array}
 */


SAPBroadphase.insertionSortY = a => {
  for (let i = 1, l = a.length; i < l; i++) {
    const v = a[i];
    let j;

    for (j = i - 1; j >= 0; j--) {
      if (a[j].aabb.lowerBound.y <= v.aabb.lowerBound.y) {
        break;
      }

      a[j + 1] = a[j];
    }

    a[j + 1] = v;
  }

  return a;
};
/**
 * @static
 * @method insertionSortZ
 * @param  {Array} a
 * @return {Array}
 */


SAPBroadphase.insertionSortZ = a => {
  for (let i = 1, l = a.length; i < l; i++) {
    const v = a[i];
    let j;

    for (j = i - 1; j >= 0; j--) {
      if (a[j].aabb.lowerBound.z <= v.aabb.lowerBound.z) {
        break;
      }

      a[j + 1] = a[j];
    }

    a[j + 1] = v;
  }

  return a;
};
/**
 * Check if the bounds of two bodies overlap, along the given SAP axis.
 * @static
 * @method checkBounds
 * @param  {Body} bi
 * @param  {Body} bj
 * @param  {Number} axisIndex
 * @return {Boolean}
 */


SAPBroadphase.checkBounds = (bi, bj, axisIndex) => {
  let biPos;
  let bjPos;

  if (axisIndex === 0) {
    biPos = bi.position.x;
    bjPos = bj.position.x;
  } else if (axisIndex === 1) {
    biPos = bi.position.y;
    bjPos = bj.position.y;
  } else if (axisIndex === 2) {
    biPos = bi.position.z;
    bjPos = bj.position.z;
  }

  const ri = bi.boundingRadius,
        rj = bj.boundingRadius,
        // boundA1 = biPos - ri,
  boundA2 = biPos + ri,
        boundB1 = bjPos - rj; // boundB2 = bjPos + rj;

  return boundB1 < boundA2;
};

function Utils() {}
/**
 * Extend an options object with default values.
 * @static
 * @method defaults
 * @param  {object} options The options object. May be falsy: in this case, a new object is created and returned.
 * @param  {object} defaults An object containing default values.
 * @return {object} The modified options object.
 */

Utils.defaults = (options = {}, defaults) => {
  for (let key in defaults) {
    if (!(key in options)) {
      options[key] = defaults[key];
    }
  }

  return options;
};

/**
 * Constraint base class
 * @class Constraint
 * @author schteppe
 * @constructor
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {object} [options]
 * @param {boolean} [options.collideConnected=true]
 * @param {boolean} [options.wakeUpBodies=true]
 */
class Constraint {
  // Equations to be solved in this constraint.
  // Set to true if you want the bodies to collide when they are connected.
  constructor(bodyA, bodyB, options = {}) {
    options = Utils.defaults(options, {
      collideConnected: true,
      wakeUpBodies: true
    });
    this.equations = [];
    this.bodyA = bodyA;
    this.bodyB = bodyB;
    this.id = Constraint.idCounter++;
    this.collideConnected = options.collideConnected;

    if (options.wakeUpBodies) {
      if (bodyA) {
        bodyA.wakeUp();
      }

      if (bodyB) {
        bodyB.wakeUp();
      }
    }
  }
  /**
   * Update all the equations with data.
   * @method update
   */


  update() {
    throw new Error('method update() not implmemented in this Constraint subclass!');
  }
  /**
   * Enables all equations in the constraint.
   * @method enable
   */


  enable() {
    const eqs = this.equations;

    for (let i = 0; i < eqs.length; i++) {
      eqs[i].enabled = true;
    }
  }
  /**
   * Disables all equations in the constraint.
   * @method disable
   */


  disable() {
    const eqs = this.equations;

    for (let i = 0; i < eqs.length; i++) {
      eqs[i].enabled = false;
    }
  }

}
Constraint.idCounter = 0;

/**
 * An element containing 6 entries, 3 spatial and 3 rotational degrees of freedom.
 */

class JacobianElement {
  constructor() {
    this.spatial = new Vec3();
    this.rotational = new Vec3();
  }
  /**
   * Multiply with other JacobianElement
   */


  multiplyElement(element) {
    return element.spatial.dot(this.spatial) + element.rotational.dot(this.rotational);
  }
  /**
   * Multiply with two vectors
   */


  multiplyVectors(spatial, rotational) {
    return spatial.dot(this.spatial) + rotational.dot(this.rotational);
  }

}

/**
 * Equation base class
 * @class Equation
 * @constructor
 * @author schteppe
 * @param {Body} bi
 * @param {Body} bj
 * @param {Number} minForce Minimum (read: negative max) force to be applied by the constraint.
 * @param {Number} maxForce Maximum (read: positive max) force to be applied by the constraint.
 */
class Equation {
  // SPOOK parameter
  // SPOOK parameter
  // SPOOK parameter
  // A number, proportional to the force added to the bodies.
  constructor(bi, bj, minForce = -1e6, maxForce = 1e6) {
    this.id = Equation.id++;
    this.minForce = minForce;
    this.maxForce = maxForce;
    this.bi = bi;
    this.bj = bj;
    this.a = 0.0; // SPOOK parameter

    this.b = 0.0; // SPOOK parameter

    this.eps = 0.0; // SPOOK parameter

    this.jacobianElementA = new JacobianElement();
    this.jacobianElementB = new JacobianElement();
    this.enabled = true;
    this.multiplier = 0;
    this.setSpookParams(1e7, 4, 1 / 60); // Set typical spook params
  }
  /**
   * Recalculates a,b,eps.
   * @method setSpookParams
   */


  setSpookParams(stiffness, relaxation, timeStep) {
    const d = relaxation;
    const k = stiffness;
    const h = timeStep;
    this.a = 4.0 / (h * (1 + 4 * d));
    this.b = 4.0 * d / (1 + 4 * d);
    this.eps = 4.0 / (h * h * k * (1 + 4 * d));
  }
  /**
   * Computes the right hand side of the SPOOK equation
   * @method computeB
   * @return {Number}
   */


  computeB(a, b, h) {
    const GW = this.computeGW();
    const Gq = this.computeGq();
    const GiMf = this.computeGiMf();
    return -Gq * a - GW * b - GiMf * h;
  }
  /**
   * Computes G*q, where q are the generalized body coordinates
   * @method computeGq
   * @return {Number}
   */


  computeGq() {
    const GA = this.jacobianElementA;
    const GB = this.jacobianElementB;
    const bi = this.bi;
    const bj = this.bj;
    const xi = bi.position;
    const xj = bj.position;
    return GA.spatial.dot(xi) + GB.spatial.dot(xj);
  }
  /**
   * Computes G*W, where W are the body velocities
   * @method computeGW
   * @return {Number}
   */


  computeGW() {
    const GA = this.jacobianElementA;
    const GB = this.jacobianElementB;
    const bi = this.bi;
    const bj = this.bj;
    const vi = bi.velocity;
    const vj = bj.velocity;
    const wi = bi.angularVelocity;
    const wj = bj.angularVelocity;
    return GA.multiplyVectors(vi, wi) + GB.multiplyVectors(vj, wj);
  }
  /**
   * Computes G*Wlambda, where W are the body velocities
   * @method computeGWlambda
   * @return {Number}
   */


  computeGWlambda() {
    const GA = this.jacobianElementA;
    const GB = this.jacobianElementB;
    const bi = this.bi;
    const bj = this.bj;
    const vi = bi.vlambda;
    const vj = bj.vlambda;
    const wi = bi.wlambda;
    const wj = bj.wlambda;
    return GA.multiplyVectors(vi, wi) + GB.multiplyVectors(vj, wj);
  }

  computeGiMf() {
    const GA = this.jacobianElementA;
    const GB = this.jacobianElementB;
    const bi = this.bi;
    const bj = this.bj;
    const fi = bi.force;
    const ti = bi.torque;
    const fj = bj.force;
    const tj = bj.torque;
    const invMassi = bi.invMassSolve;
    const invMassj = bj.invMassSolve;
    fi.scale(invMassi, iMfi);
    fj.scale(invMassj, iMfj);
    bi.invInertiaWorldSolve.vmult(ti, invIi_vmult_taui);
    bj.invInertiaWorldSolve.vmult(tj, invIj_vmult_tauj);
    return GA.multiplyVectors(iMfi, invIi_vmult_taui) + GB.multiplyVectors(iMfj, invIj_vmult_tauj);
  }

  computeGiMGt() {
    const GA = this.jacobianElementA;
    const GB = this.jacobianElementB;
    const bi = this.bi;
    const bj = this.bj;
    const invMassi = bi.invMassSolve;
    const invMassj = bj.invMassSolve;
    const invIi = bi.invInertiaWorldSolve;
    const invIj = bj.invInertiaWorldSolve;
    let result = invMassi + invMassj;
    invIi.vmult(GA.rotational, tmp$1);
    result += tmp$1.dot(GA.rotational);
    invIj.vmult(GB.rotational, tmp$1);
    result += tmp$1.dot(GB.rotational);
    return result;
  }
  /**
   * Add constraint velocity to the bodies.
   * @method addToWlambda
   * @param {Number} deltalambda
   */


  addToWlambda(deltalambda) {
    const GA = this.jacobianElementA;
    const GB = this.jacobianElementB;
    const bi = this.bi;
    const bj = this.bj;
    const temp = addToWlambda_temp; // Add to linear velocity
    // v_lambda += inv(M) * delta_lamba * G

    bi.vlambda.addScaledVector(bi.invMassSolve * deltalambda, GA.spatial, bi.vlambda);
    bj.vlambda.addScaledVector(bj.invMassSolve * deltalambda, GB.spatial, bj.vlambda); // Add to angular velocity

    bi.invInertiaWorldSolve.vmult(GA.rotational, temp);
    bi.wlambda.addScaledVector(deltalambda, temp, bi.wlambda);
    bj.invInertiaWorldSolve.vmult(GB.rotational, temp);
    bj.wlambda.addScaledVector(deltalambda, temp, bj.wlambda);
  }
  /**
   * Compute the denominator part of the SPOOK equation: C = G*inv(M)*G' + eps
   * @method computeInvC
   * @param  {Number} eps
   * @return {Number}
   */


  computeC() {
    return this.computeGiMGt() + this.eps;
  }

}
Equation.id = 0;
/**
 * Computes G*inv(M)*f, where M is the mass matrix with diagonal blocks for each body, and f are the forces on the bodies.
 * @method computeGiMf
 * @return {Number}
 */

const iMfi = new Vec3();
const iMfj = new Vec3();
const invIi_vmult_taui = new Vec3();
const invIj_vmult_tauj = new Vec3();
/**
 * Computes G*inv(M)*G'
 * @method computeGiMGt
 * @return {Number}
 */

const tmp$1 = new Vec3();
const addToWlambda_temp = new Vec3();

/**
 * Contact/non-penetration constraint equation
 * @class ContactEquation
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @extends Equation
 */
class ContactEquation extends Equation {
  // "bounciness": u1 = -e*u0
  // World-oriented vector that goes from the center of bi to the contact point.
  // World-oriented vector that starts in body j position and goes to the contact point.
  // Contact normal, pointing out of body i.
  constructor(bodyA, bodyB, maxForce = 1e6) {
    super(bodyA, bodyB, 0, maxForce);
    this.restitution = 0.0;
    this.ri = new Vec3();
    this.rj = new Vec3();
    this.ni = new Vec3();
  }

  computeB(h) {
    const a = this.a;
    const b = this.b;
    const bi = this.bi;
    const bj = this.bj;
    const ri = this.ri;
    const rj = this.rj;
    const rixn = ContactEquation_computeB_temp1;
    const rjxn = ContactEquation_computeB_temp2;
    const vi = bi.velocity;
    const wi = bi.angularVelocity;
    const fi = bi.force;
    const taui = bi.torque;
    const vj = bj.velocity;
    const wj = bj.angularVelocity;
    const fj = bj.force;
    const tauj = bj.torque;
    const penetrationVec = ContactEquation_computeB_temp3;
    const GA = this.jacobianElementA;
    const GB = this.jacobianElementB;
    const n = this.ni; // Caluclate cross products

    ri.cross(n, rixn);
    rj.cross(n, rjxn); // g = xj+rj -(xi+ri)
    // G = [ -ni  -rixn  ni  rjxn ]

    n.negate(GA.spatial);
    rixn.negate(GA.rotational);
    GB.spatial.copy(n);
    GB.rotational.copy(rjxn); // Calculate the penetration vector

    penetrationVec.copy(bj.position);
    penetrationVec.vadd(rj, penetrationVec);
    penetrationVec.vsub(bi.position, penetrationVec);
    penetrationVec.vsub(ri, penetrationVec);
    const g = n.dot(penetrationVec); // Compute iteration

    const ePlusOne = this.restitution + 1;
    const GW = ePlusOne * vj.dot(n) - ePlusOne * vi.dot(n) + wj.dot(rjxn) - wi.dot(rixn);
    const GiMf = this.computeGiMf();
    const B = -g * a - GW * b - h * GiMf;
    return B;
  }
  /**
   * Get the current relative velocity in the contact point.
   * @method getImpactVelocityAlongNormal
   * @return {number}
   */


  getImpactVelocityAlongNormal() {
    const vi = ContactEquation_getImpactVelocityAlongNormal_vi;
    const vj = ContactEquation_getImpactVelocityAlongNormal_vj;
    const xi = ContactEquation_getImpactVelocityAlongNormal_xi;
    const xj = ContactEquation_getImpactVelocityAlongNormal_xj;
    const relVel = ContactEquation_getImpactVelocityAlongNormal_relVel;
    this.bi.position.vadd(this.ri, xi);
    this.bj.position.vadd(this.rj, xj);
    this.bi.getVelocityAtWorldPoint(xi, vi);
    this.bj.getVelocityAtWorldPoint(xj, vj);
    vi.vsub(vj, relVel);
    return this.ni.dot(relVel);
  }

}
const ContactEquation_computeB_temp1 = new Vec3(); // Temp vectors

const ContactEquation_computeB_temp2 = new Vec3();
const ContactEquation_computeB_temp3 = new Vec3();
const ContactEquation_getImpactVelocityAlongNormal_vi = new Vec3();
const ContactEquation_getImpactVelocityAlongNormal_vj = new Vec3();
const ContactEquation_getImpactVelocityAlongNormal_xi = new Vec3();
const ContactEquation_getImpactVelocityAlongNormal_xj = new Vec3();
const ContactEquation_getImpactVelocityAlongNormal_relVel = new Vec3();

/**
 * Connects two bodies at given offset points.
 * @class PointToPointConstraint
 * @extends Constraint
 * @constructor
 * @param {Body} bodyA
 * @param {Vec3} pivotA The point relative to the center of mass of bodyA which bodyA is constrained to.
 * @param {Body} bodyB Body that will be constrained in a similar way to the same point as bodyA. We will therefore get a link between bodyA and bodyB. If not specified, bodyA will be constrained to a static point.
 * @param {Vec3} pivotB See pivotA.
 * @param {Number} maxForce The maximum force that should be applied to constrain the bodies.
 *
 * @example
 *     const bodyA = new Body({ mass: 1 });
 *     const bodyB = new Body({ mass: 1 });
 *     bodyA.position.set(-1, 0, 0);
 *     bodyB.position.set(1, 0, 0);
 *     bodyA.addShape(shapeA);
 *     bodyB.addShape(shapeB);
 *     world.addBody(bodyA);
 *     world.addBody(bodyB);
 *     const localPivotA = new Vec3(1, 0, 0);
 *     const localPivotB = new Vec3(-1, 0, 0);
 *     const constraint = new PointToPointConstraint(bodyA, localPivotA, bodyB, localPivotB);
 *     world.addConstraint(constraint);
 */
class PointToPointConstraint extends Constraint {
  // Pivot, defined locally in bodyA.
  // Pivot, defined locally in bodyB.
  constructor(bodyA, pivotA = new Vec3(), bodyB, pivotB = new Vec3(), maxForce = 1e6) {
    super(bodyA, bodyB);
    this.pivotA = pivotA.clone();
    this.pivotB = pivotB.clone();
    const x = this.equationX = new ContactEquation(bodyA, bodyB);
    const y = this.equationY = new ContactEquation(bodyA, bodyB);
    const z = this.equationZ = new ContactEquation(bodyA, bodyB); // Equations to be fed to the solver

    this.equations.push(x, y, z); // Make the equations bidirectional

    x.minForce = y.minForce = z.minForce = -maxForce;
    x.maxForce = y.maxForce = z.maxForce = maxForce;
    x.ni.set(1, 0, 0);
    y.ni.set(0, 1, 0);
    z.ni.set(0, 0, 1);
  }

  update() {
    const bodyA = this.bodyA;
    const bodyB = this.bodyB;
    const x = this.equationX;
    const y = this.equationY;
    const z = this.equationZ; // Rotate the pivots to world space

    bodyA.quaternion.vmult(this.pivotA, x.ri);
    bodyB.quaternion.vmult(this.pivotB, x.rj);
    y.ri.copy(x.ri);
    y.rj.copy(x.rj);
    z.ri.copy(x.ri);
    z.rj.copy(x.rj);
  }

}

/**
 * Cone equation. Works to keep the given body world vectors aligned, or tilted within a given angle from each other.
 * @class ConeEquation
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Vec3} [options.axisA] Local axis in A
 * @param {Vec3} [options.axisB] Local axis in B
 * @param {Vec3} [options.angle] The "cone angle" to keep
 * @param {number} [options.maxForce=1e6]
 * @extends Equation
 */
class ConeEquation extends Equation {
  // The cone angle to keep.
  constructor(bodyA, bodyB, options = {}) {
    const maxForce = typeof options.maxForce !== 'undefined' ? options.maxForce : 1e6;
    super(bodyA, bodyB, -maxForce, maxForce);
    this.axisA = options.axisA ? options.axisA.clone() : new Vec3(1, 0, 0);
    this.axisB = options.axisB ? options.axisB.clone() : new Vec3(0, 1, 0);
    this.angle = typeof options.angle !== 'undefined' ? options.angle : 0;
  }

  computeB(h) {
    const a = this.a;
    const b = this.b;
    const ni = this.axisA;
    const nj = this.axisB;
    const nixnj = tmpVec1;
    const njxni = tmpVec2;
    const GA = this.jacobianElementA;
    const GB = this.jacobianElementB; // Caluclate cross products

    ni.cross(nj, nixnj);
    nj.cross(ni, njxni); // The angle between two vector is:
    // cos(theta) = a * b / (length(a) * length(b) = { len(a) = len(b) = 1 } = a * b
    // g = a * b
    // gdot = (b x a) * wi + (a x b) * wj
    // G = [0 bxa 0 axb]
    // W = [vi wi vj wj]

    GA.rotational.copy(njxni);
    GB.rotational.copy(nixnj);
    const g = Math.cos(this.angle) - ni.dot(nj);
    const GW = this.computeGW();
    const GiMf = this.computeGiMf();
    const B = -g * a - GW * b - h * GiMf;
    return B;
  }

}
const tmpVec1 = new Vec3();
const tmpVec2 = new Vec3();

/**
 * Rotational constraint. Works to keep the local vectors orthogonal to each other in world space.
 * @class RotationalEquation
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Vec3} [options.axisA]
 * @param {Vec3} [options.axisB]
 * @param {number} [options.maxForce]
 * @extends Equation
 */
class RotationalEquation extends Equation {
  constructor(bodyA, bodyB, options = {}) {
    const maxForce = typeof options.maxForce !== 'undefined' ? options.maxForce : 1e6;
    super(bodyA, bodyB, -maxForce, maxForce);
    this.axisA = options.axisA ? options.axisA.clone() : new Vec3(1, 0, 0);
    this.axisB = options.axisB ? options.axisB.clone() : new Vec3(0, 1, 0);
    this.maxAngle = Math.PI / 2;
  }

  computeB(h) {
    const a = this.a;
    const b = this.b;
    const ni = this.axisA;
    const nj = this.axisB;
    const nixnj = tmpVec1$1;
    const njxni = tmpVec2$1;
    const GA = this.jacobianElementA;
    const GB = this.jacobianElementB; // Caluclate cross products

    ni.cross(nj, nixnj);
    nj.cross(ni, njxni); // g = ni * nj
    // gdot = (nj x ni) * wi + (ni x nj) * wj
    // G = [0 njxni 0 nixnj]
    // W = [vi wi vj wj]

    GA.rotational.copy(njxni);
    GB.rotational.copy(nixnj);
    const g = Math.cos(this.maxAngle) - ni.dot(nj);
    const GW = this.computeGW();
    const GiMf = this.computeGiMf();
    const B = -g * a - GW * b - h * GiMf;
    return B;
  }

}
const tmpVec1$1 = new Vec3();
const tmpVec2$1 = new Vec3();

/**
 * @class ConeTwistConstraint
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {object} [options]
 * @param {Vec3} [options.pivotA]
 * @param {Vec3} [options.pivotB]
 * @param {Vec3} [options.axisA]
 * @param {Vec3} [options.axisB]
 * @param {Number} [options.maxForce=1e6]
 * @extends PointToPointConstraint
 */
class ConeTwistConstraint extends PointToPointConstraint {
  constructor(bodyA, bodyB, options = {}) {
    const maxForce = typeof options.maxForce !== 'undefined' ? options.maxForce : 1e6; // Set pivot point in between

    const pivotA = options.pivotA ? options.pivotA.clone() : new Vec3();
    const pivotB = options.pivotB ? options.pivotB.clone() : new Vec3();
    super(bodyA, pivotA, bodyB, pivotB, maxForce);
    this.axisA = options.axisA ? options.axisA.clone() : new Vec3();
    this.axisB = options.axisB ? options.axisB.clone() : new Vec3();
    this.collideConnected = !!options.collideConnected;
    this.angle = typeof options.angle !== 'undefined' ? options.angle : 0;
    const c = this.coneEquation = new ConeEquation(bodyA, bodyB, options);
    const t = this.twistEquation = new RotationalEquation(bodyA, bodyB, options);
    this.twistAngle = typeof options.twistAngle !== 'undefined' ? options.twistAngle : 0; // Make the cone equation push the bodies toward the cone axis, not outward

    c.maxForce = 0;
    c.minForce = -maxForce; // Make the twist equation add torque toward the initial position

    t.maxForce = 0;
    t.minForce = -maxForce;
    this.equations.push(c, t);
  }

  update() {
    const bodyA = this.bodyA;
    const bodyB = this.bodyB;
    const cone = this.coneEquation;
    const twist = this.twistEquation;
    super.update(); // Update the axes to the cone constraint

    bodyA.vectorToWorldFrame(this.axisA, cone.axisA);
    bodyB.vectorToWorldFrame(this.axisB, cone.axisB); // Update the world axes in the twist constraint

    this.axisA.tangents(twist.axisA, twist.axisA);
    bodyA.vectorToWorldFrame(twist.axisA, twist.axisA);
    this.axisB.tangents(twist.axisB, twist.axisB);
    bodyB.vectorToWorldFrame(twist.axisB, twist.axisB);
    cone.angle = this.angle;
    twist.maxAngle = this.twistAngle;
  }

}

/**
 * Constrains two bodies to be at a constant distance from each others center of mass.
 * @class DistanceConstraint
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Number} [distance] The distance to keep. If undefined, it will be set to the current distance between bodyA and bodyB
 * @param {Number} [maxForce=1e6]
 * @extends Constraint
 */
class DistanceConstraint extends Constraint {
  constructor(bodyA, bodyB, distance, maxForce = 1e6) {
    super(bodyA, bodyB);

    if (typeof distance === 'undefined') {
      distance = bodyA.position.distanceTo(bodyB.position);
    }

    this.distance = distance;
    const eq = this.distanceEquation = new ContactEquation(bodyA, bodyB);
    this.equations.push(eq); // Make it bidirectional

    eq.minForce = -maxForce;
    eq.maxForce = maxForce;
  }

  update() {
    const bodyA = this.bodyA;
    const bodyB = this.bodyB;
    const eq = this.distanceEquation;
    const halfDist = this.distance * 0.5;
    const normal = eq.ni;
    bodyB.position.vsub(bodyA.position, normal);
    normal.normalize();
    normal.scale(halfDist, eq.ri);
    normal.scale(-halfDist, eq.rj);
  }

}

/**
 * Lock constraint. Will remove all degrees of freedom between the bodies.
 * @class LockConstraint
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {object} [options]
 * @param {Number} [options.maxForce=1e6]
 * @extends PointToPointConstraint
 */
class LockConstraint extends PointToPointConstraint {
  constructor(bodyA, bodyB, options = {}) {
    const maxForce = typeof options.maxForce !== 'undefined' ? options.maxForce : 1e6; // Set pivot point in between

    const pivotA = new Vec3();
    const pivotB = new Vec3();
    const halfWay = new Vec3();
    bodyA.position.vadd(bodyB.position, halfWay);
    halfWay.scale(0.5, halfWay);
    bodyB.pointToLocalFrame(halfWay, pivotB);
    bodyA.pointToLocalFrame(halfWay, pivotA); // The point-to-point constraint will keep a point shared between the bodies

    super(bodyA, pivotA, bodyB, pivotB, maxForce); // Store initial rotation of the bodies as unit vectors in the local body spaces

    this.xA = bodyA.vectorToLocalFrame(Vec3.UNIT_X);
    this.xB = bodyB.vectorToLocalFrame(Vec3.UNIT_X);
    this.yA = bodyA.vectorToLocalFrame(Vec3.UNIT_Y);
    this.yB = bodyB.vectorToLocalFrame(Vec3.UNIT_Y);
    this.zA = bodyA.vectorToLocalFrame(Vec3.UNIT_Z);
    this.zB = bodyB.vectorToLocalFrame(Vec3.UNIT_Z); // ...and the following rotational equations will keep all rotational DOF's in place

    const r1 = this.rotationalEquation1 = new RotationalEquation(bodyA, bodyB, options);
    const r2 = this.rotationalEquation2 = new RotationalEquation(bodyA, bodyB, options);
    const r3 = this.rotationalEquation3 = new RotationalEquation(bodyA, bodyB, options);
    this.equations.push(r1, r2, r3);
  }

  update() {
    const bodyA = this.bodyA;
    const bodyB = this.bodyB;
    const motor = this.motorEquation;
    const r1 = this.rotationalEquation1;
    const r2 = this.rotationalEquation2;
    const r3 = this.rotationalEquation3;
    super.update(); // These vector pairs must be orthogonal

    bodyA.vectorToWorldFrame(this.xA, r1.axisA);
    bodyB.vectorToWorldFrame(this.yB, r1.axisB);
    bodyA.vectorToWorldFrame(this.yA, r2.axisA);
    bodyB.vectorToWorldFrame(this.zB, r2.axisB);
    bodyA.vectorToWorldFrame(this.zA, r3.axisA);
    bodyB.vectorToWorldFrame(this.xB, r3.axisB);
  }

}

/**
 * Rotational motor constraint. Tries to keep the relative angular velocity of the bodies to a given value.
 * @class RotationalMotorEquation
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Number} maxForce
 * @extends Equation
 */
class RotationalMotorEquation extends Equation {
  // World oriented rotational axis.
  // World oriented rotational axis.
  // Motor velocity.
  constructor(bodyA, bodyB, maxForce = 1e6) {
    super(bodyA, bodyB, -maxForce, maxForce);
    this.axisA = new Vec3();
    this.axisB = new Vec3();
    this.targetVelocity = 0;
  }

  computeB(h) {
    const a = this.a;
    const b = this.b;
    const bi = this.bi;
    const bj = this.bj;
    const axisA = this.axisA;
    const axisB = this.axisB;
    const GA = this.jacobianElementA;
    const GB = this.jacobianElementB; // g = 0
    // gdot = axisA * wi - axisB * wj
    // gdot = G * W = G * [vi wi vj wj]
    // =>
    // G = [0 axisA 0 -axisB]

    GA.rotational.copy(axisA);
    axisB.negate(GB.rotational);
    const GW = this.computeGW() - this.targetVelocity;
    const GiMf = this.computeGiMf();
    const B = -GW * b - h * GiMf;
    return B;
  }

}

/**
 * Hinge constraint. Think of it as a door hinge. It tries to keep the door in the correct place and with the correct orientation.
 * @class HingeConstraint
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {object} [options]
 * @param {Vec3} [options.pivotA] A point defined locally in bodyA. This defines the offset of axisA.
 * @param {Vec3} [options.axisA] An axis that bodyA can rotate around, defined locally in bodyA.
 * @param {Vec3} [options.pivotB]
 * @param {Vec3} [options.axisB]
 * @param {Number} [options.maxForce=1e6]
 * @extends PointToPointConstraint
 */
class HingeConstraint extends PointToPointConstraint {
  // Rotation axis, defined locally in bodyA.
  // Rotation axis, defined locally in bodyB.
  constructor(bodyA, bodyB, options = {}) {
    const maxForce = typeof options.maxForce !== 'undefined' ? options.maxForce : 1e6;
    const pivotA = options.pivotA ? options.pivotA.clone() : new Vec3();
    const pivotB = options.pivotB ? options.pivotB.clone() : new Vec3();
    super(bodyA, pivotA, bodyB, pivotB, maxForce);
    const axisA = this.axisA = options.axisA ? options.axisA.clone() : new Vec3(1, 0, 0);
    axisA.normalize();
    const axisB = this.axisB = options.axisB ? options.axisB.clone() : new Vec3(1, 0, 0);
    axisB.normalize();
    this.collideConnected = !!options.collideConnected;
    const rotational1 = this.rotationalEquation1 = new RotationalEquation(bodyA, bodyB, options);
    const rotational2 = this.rotationalEquation2 = new RotationalEquation(bodyA, bodyB, options);
    const motor = this.motorEquation = new RotationalMotorEquation(bodyA, bodyB, maxForce);
    motor.enabled = false; // Not enabled by default
    // Equations to be fed to the solver

    this.equations.push(rotational1, rotational2, motor);
  }
  /**
   * @method enableMotor
   */


  enableMotor() {
    this.motorEquation.enabled = true;
  }
  /**
   * @method disableMotor
   */


  disableMotor() {
    this.motorEquation.enabled = false;
  }
  /**
   * @method setMotorSpeed
   * @param {number} speed
   */


  setMotorSpeed(speed) {
    this.motorEquation.targetVelocity = speed;
  }
  /**
   * @method setMotorMaxForce
   * @param {number} maxForce
   */


  setMotorMaxForce(maxForce) {
    this.motorEquation.maxForce = maxForce;
    this.motorEquation.minForce = -maxForce;
  }

  update() {
    const bodyA = this.bodyA;
    const bodyB = this.bodyB;
    const motor = this.motorEquation;
    const r1 = this.rotationalEquation1;
    const r2 = this.rotationalEquation2;
    const worldAxisA = HingeConstraint_update_tmpVec1;
    const worldAxisB = HingeConstraint_update_tmpVec2;
    const axisA = this.axisA;
    const axisB = this.axisB;
    super.update(); // Get world axes

    bodyA.quaternion.vmult(axisA, worldAxisA);
    bodyB.quaternion.vmult(axisB, worldAxisB);
    worldAxisA.tangents(r1.axisA, r2.axisA);
    r1.axisB.copy(worldAxisB);
    r2.axisB.copy(worldAxisB);

    if (this.motorEquation.enabled) {
      bodyA.quaternion.vmult(this.axisA, motor.axisA);
      bodyB.quaternion.vmult(this.axisB, motor.axisB);
    }
  }

}
const HingeConstraint_update_tmpVec1 = new Vec3();
const HingeConstraint_update_tmpVec2 = new Vec3();

/**
 * Constrains the slipping in a contact along a tangent
 * @class FrictionEquation
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Number} slipForce should be +-F_friction = +-mu * F_normal = +-mu * m * g
 * @extends Equation
 */
class FrictionEquation extends Equation {
  // Tangent.
  constructor(bodyA, bodyB, slipForce) {
    super(bodyA, bodyB, -slipForce, slipForce);
    this.ri = new Vec3();
    this.rj = new Vec3();
    this.t = new Vec3();
  }

  computeB(h) {
    const a = this.a;
    const b = this.b;
    const bi = this.bi;
    const bj = this.bj;
    const ri = this.ri;
    const rj = this.rj;
    const rixt = FrictionEquation_computeB_temp1;
    const rjxt = FrictionEquation_computeB_temp2;
    const t = this.t; // Caluclate cross products

    ri.cross(t, rixt);
    rj.cross(t, rjxt); // G = [-t -rixt t rjxt]
    // And remember, this is a pure velocity constraint, g is always zero!

    const GA = this.jacobianElementA;
    const GB = this.jacobianElementB;
    t.negate(GA.spatial);
    rixt.negate(GA.rotational);
    GB.spatial.copy(t);
    GB.rotational.copy(rjxt);
    const GW = this.computeGW();
    const GiMf = this.computeGiMf();
    const B = -GW * b - h * GiMf;
    return B;
  }

}
const FrictionEquation_computeB_temp1 = new Vec3();
const FrictionEquation_computeB_temp2 = new Vec3();

/**
 * Defines what happens when two materials meet.
 * @class ContactMaterial
 * @constructor
 * @param {Material} m1
 * @param {Material} m2
 * @param {object} [options]
 * @param {Number} [options.friction=0.3]
 * @param {Number} [options.restitution=0.3]
 * @param {number} [options.contactEquationStiffness=1e7]
 * @param {number} [options.contactEquationRelaxation=3]
 * @param {number} [options.frictionEquationStiffness=1e7]
 * @param {Number} [options.frictionEquationRelaxation=3]
 * @todo Refactor materials to materialA and materialB
 */
class ContactMaterial {
  // Identifier of this material.
  // Participating materials.
  // Friction coefficient.
  // Restitution coefficient.
  // Stiffness of the produced contact equations.
  // Relaxation time of the produced contact equations.
  // Stiffness of the produced friction equations.
  // Relaxation time of the produced friction equations
  constructor(m1, m2, options) {
    options = Utils.defaults(options, {
      friction: 0.3,
      restitution: 0.3,
      contactEquationStiffness: 1e7,
      contactEquationRelaxation: 3,
      frictionEquationStiffness: 1e7,
      frictionEquationRelaxation: 3
    });
    this.id = ContactMaterial.idCounter++;
    this.materials = [m1, m2];
    this.friction = options.friction;
    this.restitution = options.restitution;
    this.contactEquationStiffness = options.contactEquationStiffness;
    this.contactEquationRelaxation = options.contactEquationRelaxation;
    this.frictionEquationStiffness = options.frictionEquationStiffness;
    this.frictionEquationRelaxation = options.frictionEquationRelaxation;
  }

}
ContactMaterial.idCounter = 0;

/**
 * Defines a physics material.
 * @class Material
 * @constructor
 * @param {object} [options]
 * @author schteppe
 */
class Material {
  // Material name.
  // Material id.
  // Friction for this material. If non-negative, it will be used instead of the friction given by ContactMaterials. If there's no matching ContactMaterial, the value from .defaultContactMaterial in the World will be used.
  // Restitution for this material. If non-negative, it will be used instead of the restitution given by ContactMaterials. If there's no matching ContactMaterial, the value from .defaultContactMaterial in the World will be used.
  constructor(options = {}) {
    let name = ''; // Backwards compatibility fix

    if (typeof options === 'string') {
      name = options;
      options = {};
    }

    this.name = name;
    this.id = Material.idCounter++;
    this.friction = typeof options.friction !== 'undefined' ? options.friction : -1;
    this.restitution = typeof options.restitution !== 'undefined' ? options.restitution : -1;
  }

}
Material.idCounter = 0;

/**
 * A spring, connecting two bodies.
 *
 * @class Spring
 * @constructor
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Object} [options]
 * @param {number} [options.restLength]   A number > 0. Default: 1
 * @param {number} [options.stiffness]    A number >= 0. Default: 100
 * @param {number} [options.damping]      A number >= 0. Default: 1
 * @param {Vec3}  [options.worldAnchorA] Where to hook the spring to body A, in world coordinates.
 * @param {Vec3}  [options.worldAnchorB]
 * @param {Vec3}  [options.localAnchorA] Where to hook the spring to body A, in local body coordinates.
 * @param {Vec3}  [options.localAnchorB]
 */
class Spring {
  // Rest length of the spring.
  // Stiffness of the spring.
  // Damping of the spring.
  // First connected body.
  // Second connected body.
  // Anchor for bodyA in local bodyA coordinates.
  // Anchor for bodyB in local bodyB coordinates.
  constructor(bodyA, bodyB, options = {}) {
    this.restLength = typeof options.restLength === 'number' ? options.restLength : 1;
    this.stiffness = options.stiffness || 100;
    this.damping = options.damping || 1;
    this.bodyA = bodyA;
    this.bodyB = bodyB;
    this.localAnchorA = new Vec3();
    this.localAnchorB = new Vec3();

    if (options.localAnchorA) {
      this.localAnchorA.copy(options.localAnchorA);
    }

    if (options.localAnchorB) {
      this.localAnchorB.copy(options.localAnchorB);
    }

    if (options.worldAnchorA) {
      this.setWorldAnchorA(options.worldAnchorA);
    }

    if (options.worldAnchorB) {
      this.setWorldAnchorB(options.worldAnchorB);
    }
  }
  /**
   * Set the anchor point on body A, using world coordinates.
   * @method setWorldAnchorA
   * @param {Vec3} worldAnchorA
   */


  setWorldAnchorA(worldAnchorA) {
    this.bodyA.pointToLocalFrame(worldAnchorA, this.localAnchorA);
  }
  /**
   * Set the anchor point on body B, using world coordinates.
   * @method setWorldAnchorB
   * @param {Vec3} worldAnchorB
   */


  setWorldAnchorB(worldAnchorB) {
    this.bodyB.pointToLocalFrame(worldAnchorB, this.localAnchorB);
  }
  /**
   * Get the anchor point on body A, in world coordinates.
   * @method getWorldAnchorA
   * @param {Vec3} result The vector to store the result in.
   */


  getWorldAnchorA(result) {
    this.bodyA.pointToWorldFrame(this.localAnchorA, result);
  }
  /**
   * Get the anchor point on body B, in world coordinates.
   * @method getWorldAnchorB
   * @param {Vec3} result The vector to store the result in.
   */


  getWorldAnchorB(result) {
    this.bodyB.pointToWorldFrame(this.localAnchorB, result);
  }
  /**
   * Apply the spring force to the connected bodies.
   * @method applyForce
   */


  applyForce() {
    const k = this.stiffness;
    const d = this.damping;
    const l = this.restLength;
    const bodyA = this.bodyA;
    const bodyB = this.bodyB;
    const r = applyForce_r;
    const r_unit = applyForce_r_unit;
    const u = applyForce_u;
    const f = applyForce_f;
    const tmp = applyForce_tmp;
    const worldAnchorA = applyForce_worldAnchorA;
    const worldAnchorB = applyForce_worldAnchorB;
    const ri = applyForce_ri;
    const rj = applyForce_rj;
    const ri_x_f = applyForce_ri_x_f;
    const rj_x_f = applyForce_rj_x_f; // Get world anchors

    this.getWorldAnchorA(worldAnchorA);
    this.getWorldAnchorB(worldAnchorB); // Get offset points

    worldAnchorA.vsub(bodyA.position, ri);
    worldAnchorB.vsub(bodyB.position, rj); // Compute distance vector between world anchor points

    worldAnchorB.vsub(worldAnchorA, r);
    const rlen = r.length();
    r_unit.copy(r);
    r_unit.normalize(); // Compute relative velocity of the anchor points, u

    bodyB.velocity.vsub(bodyA.velocity, u); // Add rotational velocity

    bodyB.angularVelocity.cross(rj, tmp);
    u.vadd(tmp, u);
    bodyA.angularVelocity.cross(ri, tmp);
    u.vsub(tmp, u); // F = - k * ( x - L ) - D * ( u )

    r_unit.scale(-k * (rlen - l) - d * u.dot(r_unit), f); // Add forces to bodies

    bodyA.force.vsub(f, bodyA.force);
    bodyB.force.vadd(f, bodyB.force); // Angular force

    ri.cross(f, ri_x_f);
    rj.cross(f, rj_x_f);
    bodyA.torque.vsub(ri_x_f, bodyA.torque);
    bodyB.torque.vadd(rj_x_f, bodyB.torque);
  }

}
const applyForce_r = new Vec3();
const applyForce_r_unit = new Vec3();
const applyForce_u = new Vec3();
const applyForce_f = new Vec3();
const applyForce_worldAnchorA = new Vec3();
const applyForce_worldAnchorB = new Vec3();
const applyForce_ri = new Vec3();
const applyForce_rj = new Vec3();
const applyForce_ri_x_f = new Vec3();
const applyForce_rj_x_f = new Vec3();
const applyForce_tmp = new Vec3();

/**
 * @class WheelInfo
 * @constructor
 * @param {Object} [options]
 *
 * @param {Vec3} [options.chassisConnectionPointLocal]
 * @param {Vec3} [options.chassisConnectionPointWorld]
 * @param {Vec3} [options.directionLocal]
 * @param {Vec3} [options.directionWorld]
 * @param {Vec3} [options.axleLocal]
 * @param {Vec3} [options.axleWorld]
 * @param {number} [options.suspensionRestLength=1]
 * @param {number} [options.suspensionMaxLength=2]
 * @param {number} [options.radius=1]
 * @param {number} [options.suspensionStiffness=100]
 * @param {number} [options.dampingCompression=10]
 * @param {number} [options.dampingRelaxation=10]
 * @param {number} [options.frictionSlip=10000]
 * @param {number} [options.steering=0]
 * @param {number} [options.rotation=0]
 * @param {number} [options.deltaRotation=0]
 * @param {number} [options.rollInfluence=0.01]
 * @param {number} [options.maxSuspensionForce]
 * @param {boolean} [options.isFrontWheel=true]
 * @param {number} [options.clippedInvContactDotSuspension=1]
 * @param {number} [options.suspensionRelativeVelocity=0]
 * @param {number} [options.suspensionForce=0]
 * @param {number} [options.skidInfo=0]
 * @param {number} [options.suspensionLength=0]
 * @param {number} [options.maxSuspensionTravel=1]
 * @param {boolean} [options.useCustomSlidingRotationalSpeed=false]
 * @param {number} [options.customSlidingRotationalSpeed=-0.1]
 */
class WheelInfo {
  // Max travel distance of the suspension, in meters.
  // Speed to apply to the wheel rotation when the wheel is sliding.
  // If the customSlidingRotationalSpeed should be used.
  // Connection point, defined locally in the chassis body frame.
  // Rotation value, in radians.
  // The result from raycasting.
  // Wheel world transform.
  constructor(options = {}) {
    options = Utils.defaults(options, {
      chassisConnectionPointLocal: new Vec3(),
      chassisConnectionPointWorld: new Vec3(),
      directionLocal: new Vec3(),
      directionWorld: new Vec3(),
      axleLocal: new Vec3(),
      axleWorld: new Vec3(),
      suspensionRestLength: 1,
      suspensionMaxLength: 2,
      radius: 1,
      suspensionStiffness: 100,
      dampingCompression: 10,
      dampingRelaxation: 10,
      frictionSlip: 10000,
      steering: 0,
      rotation: 0,
      deltaRotation: 0,
      rollInfluence: 0.01,
      maxSuspensionForce: Number.MAX_VALUE,
      isFrontWheel: true,
      clippedInvContactDotSuspension: 1,
      suspensionRelativeVelocity: 0,
      suspensionForce: 0,
      slipInfo: 0,
      skidInfo: 0,
      suspensionLength: 0,
      maxSuspensionTravel: 1,
      useCustomSlidingRotationalSpeed: false,
      customSlidingRotationalSpeed: -0.1
    });
    this.maxSuspensionTravel = options.maxSuspensionTravel;
    this.customSlidingRotationalSpeed = options.customSlidingRotationalSpeed;
    this.useCustomSlidingRotationalSpeed = options.useCustomSlidingRotationalSpeed;
    this.sliding = false;
    this.chassisConnectionPointLocal = options.chassisConnectionPointLocal.clone();
    this.chassisConnectionPointWorld = options.chassisConnectionPointWorld.clone();
    this.directionLocal = options.directionLocal.clone();
    this.directionWorld = options.directionWorld.clone();
    this.axleLocal = options.axleLocal.clone();
    this.axleWorld = options.axleWorld.clone();
    this.suspensionRestLength = options.suspensionRestLength;
    this.suspensionMaxLength = options.suspensionMaxLength;
    this.radius = options.radius;
    this.suspensionStiffness = options.suspensionStiffness;
    this.dampingCompression = options.dampingCompression;
    this.dampingRelaxation = options.dampingRelaxation;
    this.frictionSlip = options.frictionSlip;
    this.steering = 0;
    this.rotation = 0;
    this.deltaRotation = 0;
    this.rollInfluence = options.rollInfluence;
    this.maxSuspensionForce = options.maxSuspensionForce;
    this.engineForce = 0;
    this.brake = 0;
    this.isFrontWheel = options.isFrontWheel;
    this.clippedInvContactDotSuspension = 1;
    this.suspensionRelativeVelocity = 0;
    this.suspensionForce = 0;
    this.slipInfo = 0;
    this.skidInfo = 0;
    this.suspensionLength = 0;
    this.sideImpulse = 0;
    this.forwardImpulse = 0;
    this.raycastResult = new RaycastResult();
    this.worldTransform = new Transform();
    this.isInContact = false;
  }

  updateWheel(chassis) {
    const raycastResult = this.raycastResult;

    if (this.isInContact) {
      const project = raycastResult.hitNormalWorld.dot(raycastResult.directionWorld);
      raycastResult.hitPointWorld.vsub(chassis.position, relpos);
      chassis.getVelocityAtWorldPoint(relpos, chassis_velocity_at_contactPoint);
      const projVel = raycastResult.hitNormalWorld.dot(chassis_velocity_at_contactPoint);

      if (project >= -0.1) {
        this.suspensionRelativeVelocity = 0.0;
        this.clippedInvContactDotSuspension = 1.0 / 0.1;
      } else {
        const inv = -1 / project;
        this.suspensionRelativeVelocity = projVel * inv;
        this.clippedInvContactDotSuspension = inv;
      }
    } else {
      // Not in contact : position wheel in a nice (rest length) position
      raycastResult.suspensionLength = this.suspensionRestLength;
      this.suspensionRelativeVelocity = 0.0;
      raycastResult.directionWorld.scale(-1, raycastResult.hitNormalWorld);
      this.clippedInvContactDotSuspension = 1.0;
    }
  }

}
const chassis_velocity_at_contactPoint = new Vec3();
const relpos = new Vec3();

/**
 * Vehicle helper class that casts rays from the wheel positions towards the ground and applies forces.
 * @class RaycastVehicle
 * @constructor
 * @param {object} [options]
 * @param {Body} [options.chassisBody] The car chassis body.
 * @param {integer} [options.indexRightAxis] Axis to use for right. x=0, y=1, z=2
 * @param {integer} [options.indexLeftAxis]
 * @param {integer} [options.indexUpAxis]
 */
class RaycastVehicle {
  // Will be set to true if the car is sliding.
  // Index of the right axis, 0=x, 1=y, 2=z
  // Index of the forward axis, 0=x, 1=y, 2=z
  // Index of the up axis, 0=x, 1=y, 2=z
  constructor(options) {
    this.chassisBody = options.chassisBody;
    this.wheelInfos = [];
    this.sliding = false;
    this.world = null;
    this.indexRightAxis = typeof options.indexRightAxis !== 'undefined' ? options.indexRightAxis : 1;
    this.indexForwardAxis = typeof options.indexForwardAxis !== 'undefined' ? options.indexForwardAxis : 0;
    this.indexUpAxis = typeof options.indexUpAxis !== 'undefined' ? options.indexUpAxis : 2;
    this.constraints = [];

    this.preStepCallback = () => {};

    this.currentVehicleSpeedKmHour = 0;
  }
  /**
   * Add a wheel. For information about the options, see WheelInfo.
   * @method addWheel
   * @param {object} [options]
   */


  addWheel(options = {}) {
    const info = new WheelInfo(options);
    const index = this.wheelInfos.length;
    this.wheelInfos.push(info);
    return index;
  }
  /**
   * Set the steering value of a wheel.
   * @method setSteeringValue
   * @param {number} value
   * @param {integer} wheelIndex
   */


  setSteeringValue(value, wheelIndex) {
    const wheel = this.wheelInfos[wheelIndex];
    wheel.steering = value;
  }
  /**
   * Set the wheel force to apply on one of the wheels each time step
   * @method applyEngineForce
   * @param  {number} value
   * @param  {integer} wheelIndex
   */


  applyEngineForce(value, wheelIndex) {
    this.wheelInfos[wheelIndex].engineForce = value;
  }
  /**
   * Set the braking force of a wheel
   * @method setBrake
   * @param {number} brake
   * @param {integer} wheelIndex
   */


  setBrake(brake, wheelIndex) {
    this.wheelInfos[wheelIndex].brake = brake;
  }
  /**
   * Add the vehicle including its constraints to the world.
   * @method addToWorld
   * @param {World} world
   */


  addToWorld(world) {
    const constraints = this.constraints;
    world.addBody(this.chassisBody);
    const that = this;

    this.preStepCallback = () => {
      that.updateVehicle(world.dt);
    };

    world.addEventListener('preStep', this.preStepCallback);
    this.world = world;
  }
  /**
   * Get one of the wheel axles, world-oriented.
   * @private
   * @method getVehicleAxisWorld
   * @param  {integer} axisIndex
   * @param  {Vec3} result
   */


  getVehicleAxisWorld(axisIndex, result) {
    result.set(axisIndex === 0 ? 1 : 0, axisIndex === 1 ? 1 : 0, axisIndex === 2 ? 1 : 0);
    this.chassisBody.vectorToWorldFrame(result, result);
  }

  updateVehicle(timeStep) {
    const wheelInfos = this.wheelInfos;
    const numWheels = wheelInfos.length;
    const chassisBody = this.chassisBody;

    for (let i = 0; i < numWheels; i++) {
      this.updateWheelTransform(i);
    }

    this.currentVehicleSpeedKmHour = 3.6 * chassisBody.velocity.length();
    const forwardWorld = new Vec3();
    this.getVehicleAxisWorld(this.indexForwardAxis, forwardWorld);

    if (forwardWorld.dot(chassisBody.velocity) < 0) {
      this.currentVehicleSpeedKmHour *= -1;
    } // simulate suspension


    for (let i = 0; i < numWheels; i++) {
      this.castRay(wheelInfos[i]);
    }

    this.updateSuspension(timeStep);
    const impulse = new Vec3();
    const relpos = new Vec3();

    for (let i = 0; i < numWheels; i++) {
      //apply suspension force
      const wheel = wheelInfos[i];
      let suspensionForce = wheel.suspensionForce;

      if (suspensionForce > wheel.maxSuspensionForce) {
        suspensionForce = wheel.maxSuspensionForce;
      }

      wheel.raycastResult.hitNormalWorld.scale(suspensionForce * timeStep, impulse);
      wheel.raycastResult.hitPointWorld.vsub(chassisBody.position, relpos);
      chassisBody.applyImpulse(impulse, relpos);
    }

    this.updateFriction(timeStep);
    const hitNormalWorldScaledWithProj = new Vec3();
    const fwd = new Vec3();
    const vel = new Vec3();

    for (let i = 0; i < numWheels; i++) {
      const wheel = wheelInfos[i]; //const relpos = new Vec3();
      //wheel.chassisConnectionPointWorld.vsub(chassisBody.position, relpos);

      chassisBody.getVelocityAtWorldPoint(wheel.chassisConnectionPointWorld, vel); // Hack to get the rotation in the correct direction

      let m = 1;

      switch (this.indexUpAxis) {
        case 1:
          m = -1;
          break;
      }

      if (wheel.isInContact) {
        this.getVehicleAxisWorld(this.indexForwardAxis, fwd);
        const proj = fwd.dot(wheel.raycastResult.hitNormalWorld);
        wheel.raycastResult.hitNormalWorld.scale(proj, hitNormalWorldScaledWithProj);
        fwd.vsub(hitNormalWorldScaledWithProj, fwd);
        const proj2 = fwd.dot(vel);
        wheel.deltaRotation = m * proj2 * timeStep / wheel.radius;
      }

      if ((wheel.sliding || !wheel.isInContact) && wheel.engineForce !== 0 && wheel.useCustomSlidingRotationalSpeed) {
        // Apply custom rotation when accelerating and sliding
        wheel.deltaRotation = (wheel.engineForce > 0 ? 1 : -1) * wheel.customSlidingRotationalSpeed * timeStep;
      } // Lock wheels


      if (Math.abs(wheel.brake) > Math.abs(wheel.engineForce)) {
        wheel.deltaRotation = 0;
      }

      wheel.rotation += wheel.deltaRotation; // Use the old value

      wheel.deltaRotation *= 0.99; // damping of rotation when not in contact
    }
  }

  updateSuspension(deltaTime) {
    const chassisBody = this.chassisBody;
    const chassisMass = chassisBody.mass;
    const wheelInfos = this.wheelInfos;
    const numWheels = wheelInfos.length;

    for (let w_it = 0; w_it < numWheels; w_it++) {
      const wheel = wheelInfos[w_it];

      if (wheel.isInContact) {
        let force; // Spring

        const susp_length = wheel.suspensionRestLength;
        const current_length = wheel.suspensionLength;
        const length_diff = susp_length - current_length;
        force = wheel.suspensionStiffness * length_diff * wheel.clippedInvContactDotSuspension; // Damper

        const projected_rel_vel = wheel.suspensionRelativeVelocity;
        let susp_damping;

        if (projected_rel_vel < 0) {
          susp_damping = wheel.dampingCompression;
        } else {
          susp_damping = wheel.dampingRelaxation;
        }

        force -= susp_damping * projected_rel_vel;
        wheel.suspensionForce = force * chassisMass;

        if (wheel.suspensionForce < 0) {
          wheel.suspensionForce = 0;
        }
      } else {
        wheel.suspensionForce = 0;
      }
    }
  }
  /**
   * Remove the vehicle including its constraints from the world.
   * @method removeFromWorld
   * @param {World} world
   */


  removeFromWorld(world) {
    const constraints = this.constraints;
    world.removeBody(this.chassisBody);
    world.removeEventListener('preStep', this.preStepCallback);
    this.world = null;
  }

  castRay(wheel) {
    const rayvector = castRay_rayvector;
    const target = castRay_target;
    this.updateWheelTransformWorld(wheel);
    const chassisBody = this.chassisBody;
    let depth = -1;
    const raylen = wheel.suspensionRestLength + wheel.radius;
    wheel.directionWorld.scale(raylen, rayvector);
    const source = wheel.chassisConnectionPointWorld;
    source.vadd(rayvector, target);
    const raycastResult = wheel.raycastResult;
    raycastResult.reset(); // Turn off ray collision with the chassis temporarily

    const oldState = chassisBody.collisionResponse;
    chassisBody.collisionResponse = false; // Cast ray against world

    this.world.rayTest(source, target, raycastResult);
    chassisBody.collisionResponse = oldState;
    const object = raycastResult.body;
    wheel.raycastResult.groundObject = 0;

    if (object) {
      depth = raycastResult.distance;
      wheel.raycastResult.hitNormalWorld = raycastResult.hitNormalWorld;
      wheel.isInContact = true;
      const hitDistance = raycastResult.distance;
      wheel.suspensionLength = hitDistance - wheel.radius; // clamp on max suspension travel

      const minSuspensionLength = wheel.suspensionRestLength - wheel.maxSuspensionTravel;
      const maxSuspensionLength = wheel.suspensionRestLength + wheel.maxSuspensionTravel;

      if (wheel.suspensionLength < minSuspensionLength) {
        wheel.suspensionLength = minSuspensionLength;
      }

      if (wheel.suspensionLength > maxSuspensionLength) {
        wheel.suspensionLength = maxSuspensionLength;
        wheel.raycastResult.reset();
      }

      const denominator = wheel.raycastResult.hitNormalWorld.dot(wheel.directionWorld);
      const chassis_velocity_at_contactPoint = new Vec3();
      chassisBody.getVelocityAtWorldPoint(wheel.raycastResult.hitPointWorld, chassis_velocity_at_contactPoint);
      const projVel = wheel.raycastResult.hitNormalWorld.dot(chassis_velocity_at_contactPoint);

      if (denominator >= -0.1) {
        wheel.suspensionRelativeVelocity = 0;
        wheel.clippedInvContactDotSuspension = 1 / 0.1;
      } else {
        const inv = -1 / denominator;
        wheel.suspensionRelativeVelocity = projVel * inv;
        wheel.clippedInvContactDotSuspension = inv;
      }
    } else {
      //put wheel info as in rest position
      wheel.suspensionLength = wheel.suspensionRestLength + 0 * wheel.maxSuspensionTravel;
      wheel.suspensionRelativeVelocity = 0.0;
      wheel.directionWorld.scale(-1, wheel.raycastResult.hitNormalWorld);
      wheel.clippedInvContactDotSuspension = 1.0;
    }

    return depth;
  }

  updateWheelTransformWorld(wheel) {
    wheel.isInContact = false;
    const chassisBody = this.chassisBody;
    chassisBody.pointToWorldFrame(wheel.chassisConnectionPointLocal, wheel.chassisConnectionPointWorld);
    chassisBody.vectorToWorldFrame(wheel.directionLocal, wheel.directionWorld);
    chassisBody.vectorToWorldFrame(wheel.axleLocal, wheel.axleWorld);
  }
  /**
   * Update one of the wheel transform.
   * Note when rendering wheels: during each step, wheel transforms are updated BEFORE the chassis; ie. their position becomes invalid after the step. Thus when you render wheels, you must update wheel transforms before rendering them. See raycastVehicle demo for an example.
   * @method updateWheelTransform
   * @param {integer} wheelIndex The wheel index to update.
   */


  updateWheelTransform(wheelIndex) {
    const up = tmpVec4;
    const right = tmpVec5;
    const fwd = tmpVec6;
    const wheel = this.wheelInfos[wheelIndex];
    this.updateWheelTransformWorld(wheel);
    wheel.directionLocal.scale(-1, up);
    right.copy(wheel.axleLocal);
    up.cross(right, fwd);
    fwd.normalize();
    right.normalize(); // Rotate around steering over the wheelAxle

    const steering = wheel.steering;
    const steeringOrn = new Quaternion();
    steeringOrn.setFromAxisAngle(up, steering);
    const rotatingOrn = new Quaternion();
    rotatingOrn.setFromAxisAngle(right, wheel.rotation); // World rotation of the wheel

    const q = wheel.worldTransform.quaternion;
    this.chassisBody.quaternion.mult(steeringOrn, q);
    q.mult(rotatingOrn, q);
    q.normalize(); // world position of the wheel

    const p = wheel.worldTransform.position;
    p.copy(wheel.directionWorld);
    p.scale(wheel.suspensionLength, p);
    p.vadd(wheel.chassisConnectionPointWorld, p);
  }
  /**
   * Get the world transform of one of the wheels
   * @method getWheelTransformWorld
   * @param  {integer} wheelIndex
   * @return {Transform}
   */


  getWheelTransformWorld(wheelIndex) {
    return this.wheelInfos[wheelIndex].worldTransform;
  }

  updateFriction(timeStep) {
    const surfNormalWS_scaled_proj = updateFriction_surfNormalWS_scaled_proj; //calculate the impulse, so that the wheels don't move sidewards

    const wheelInfos = this.wheelInfos;
    const numWheels = wheelInfos.length;
    const chassisBody = this.chassisBody;
    const forwardWS = updateFriction_forwardWS;
    const axle = updateFriction_axle;

    for (let i = 0; i < numWheels; i++) {
      const wheel = wheelInfos[i];
      const groundObject = wheel.raycastResult.body;

      wheel.sideImpulse = 0;
      wheel.forwardImpulse = 0;

      if (!forwardWS[i]) {
        forwardWS[i] = new Vec3();
      }

      if (!axle[i]) {
        axle[i] = new Vec3();
      }
    }

    for (let i = 0; i < numWheels; i++) {
      const wheel = wheelInfos[i];
      const groundObject = wheel.raycastResult.body;

      if (groundObject) {
        const axlei = axle[i];
        const wheelTrans = this.getWheelTransformWorld(i); // Get world axle

        wheelTrans.vectorToWorldFrame(directions[this.indexRightAxis], axlei);
        const surfNormalWS = wheel.raycastResult.hitNormalWorld;
        const proj = axlei.dot(surfNormalWS);
        surfNormalWS.scale(proj, surfNormalWS_scaled_proj);
        axlei.vsub(surfNormalWS_scaled_proj, axlei);
        axlei.normalize();
        surfNormalWS.cross(axlei, forwardWS[i]);
        forwardWS[i].normalize();
        wheel.sideImpulse = resolveSingleBilateral(chassisBody, wheel.raycastResult.hitPointWorld, groundObject, wheel.raycastResult.hitPointWorld, axlei);
        wheel.sideImpulse *= sideFrictionStiffness2;
      }
    }

    const sideFactor = 1;
    const fwdFactor = 0.5;
    this.sliding = false;

    for (let i = 0; i < numWheels; i++) {
      const wheel = wheelInfos[i];
      const groundObject = wheel.raycastResult.body;
      let rollingFriction = 0;
      wheel.slipInfo = 1;

      if (groundObject) {
        const defaultRollingFrictionImpulse = 0;
        const maxImpulse = wheel.brake ? wheel.brake : defaultRollingFrictionImpulse; // btWheelContactPoint contactPt(chassisBody,groundObject,wheelInfraycastInfo.hitPointWorld,forwardWS[wheel],maxImpulse);
        // rollingFriction = calcRollingFriction(contactPt);

        rollingFriction = calcRollingFriction(chassisBody, groundObject, wheel.raycastResult.hitPointWorld, forwardWS[i], maxImpulse);
        rollingFriction += wheel.engineForce * timeStep; // rollingFriction = 0;

        const factor = maxImpulse / rollingFriction;
        wheel.slipInfo *= factor;
      } //switch between active rolling (throttle), braking and non-active rolling friction (nthrottle/break)


      wheel.forwardImpulse = 0;
      wheel.skidInfo = 1;

      if (groundObject) {
        wheel.skidInfo = 1;
        const maximp = wheel.suspensionForce * timeStep * wheel.frictionSlip;
        const maximpSide = maximp;
        const maximpSquared = maximp * maximpSide;
        wheel.forwardImpulse = rollingFriction; //wheelInfo.engineForce* timeStep;

        const x = wheel.forwardImpulse * fwdFactor;
        const y = wheel.sideImpulse * sideFactor;
        const impulseSquared = x * x + y * y;
        wheel.sliding = false;

        if (impulseSquared > maximpSquared) {
          this.sliding = true;
          wheel.sliding = true;
          const factor = maximp / Math.sqrt(impulseSquared);
          wheel.skidInfo *= factor;
        }
      }
    }

    if (this.sliding) {
      for (let i = 0; i < numWheels; i++) {
        const wheel = wheelInfos[i];

        if (wheel.sideImpulse !== 0) {
          if (wheel.skidInfo < 1) {
            wheel.forwardImpulse *= wheel.skidInfo;
            wheel.sideImpulse *= wheel.skidInfo;
          }
        }
      }
    } // apply the impulses


    for (let i = 0; i < numWheels; i++) {
      const wheel = wheelInfos[i];
      const rel_pos = new Vec3();
      wheel.raycastResult.hitPointWorld.vsub(chassisBody.position, rel_pos); // cannons applyimpulse is using world coord for the position
      //rel_pos.copy(wheel.raycastResult.hitPointWorld);

      if (wheel.forwardImpulse !== 0) {
        const impulse = new Vec3();
        forwardWS[i].scale(wheel.forwardImpulse, impulse);
        chassisBody.applyImpulse(impulse, rel_pos);
      }

      if (wheel.sideImpulse !== 0) {
        const groundObject = wheel.raycastResult.body;
        const rel_pos2 = new Vec3();
        wheel.raycastResult.hitPointWorld.vsub(groundObject.position, rel_pos2); //rel_pos2.copy(wheel.raycastResult.hitPointWorld);

        const sideImp = new Vec3();
        axle[i].scale(wheel.sideImpulse, sideImp); // Scale the relative position in the up direction with rollInfluence.
        // If rollInfluence is 1, the impulse will be applied on the hitPoint (easy to roll over), if it is zero it will be applied in the same plane as the center of mass (not easy to roll over).

        chassisBody.vectorToLocalFrame(rel_pos, rel_pos);
        rel_pos['xyz'[this.indexUpAxis]] *= wheel.rollInfluence;
        chassisBody.vectorToWorldFrame(rel_pos, rel_pos);
        chassisBody.applyImpulse(sideImp, rel_pos); //apply friction impulse on the ground

        sideImp.scale(-1, sideImp);
        groundObject.applyImpulse(sideImp, rel_pos2);
      }
    }
  }

}
const tmpVec4 = new Vec3();
const tmpVec5 = new Vec3();
const tmpVec6 = new Vec3();
const tmpRay = new Ray();
const castRay_rayvector = new Vec3();
const castRay_target = new Vec3();
const directions = [new Vec3(1, 0, 0), new Vec3(0, 1, 0), new Vec3(0, 0, 1)];
const updateFriction_surfNormalWS_scaled_proj = new Vec3();
const updateFriction_axle = [];
const updateFriction_forwardWS = [];
const sideFrictionStiffness2 = 1;
const calcRollingFriction_vel1 = new Vec3();
const calcRollingFriction_vel2 = new Vec3();
const calcRollingFriction_vel = new Vec3();

function calcRollingFriction(body0, body1, frictionPosWorld, frictionDirectionWorld, maxImpulse) {
  let j1 = 0;
  const contactPosWorld = frictionPosWorld; // const rel_pos1 = new Vec3();
  // const rel_pos2 = new Vec3();

  const vel1 = calcRollingFriction_vel1;
  const vel2 = calcRollingFriction_vel2;
  const vel = calcRollingFriction_vel; // contactPosWorld.vsub(body0.position, rel_pos1);
  // contactPosWorld.vsub(body1.position, rel_pos2);

  body0.getVelocityAtWorldPoint(contactPosWorld, vel1);
  body1.getVelocityAtWorldPoint(contactPosWorld, vel2);
  vel1.vsub(vel2, vel);
  const vrel = frictionDirectionWorld.dot(vel);
  const denom0 = computeImpulseDenominator(body0, frictionPosWorld, frictionDirectionWorld);
  const denom1 = computeImpulseDenominator(body1, frictionPosWorld, frictionDirectionWorld);
  const relaxation = 1;
  const jacDiagABInv = relaxation / (denom0 + denom1); // calculate j that moves us to zero relative velocity

  j1 = -vrel * jacDiagABInv;

  if (maxImpulse < j1) {
    j1 = maxImpulse;
  }

  if (j1 < -maxImpulse) {
    j1 = -maxImpulse;
  }

  return j1;
}

const computeImpulseDenominator_r0 = new Vec3();
const computeImpulseDenominator_c0 = new Vec3();
const computeImpulseDenominator_vec = new Vec3();
const computeImpulseDenominator_m = new Vec3();

function computeImpulseDenominator(body, pos, normal) {
  const r0 = computeImpulseDenominator_r0;
  const c0 = computeImpulseDenominator_c0;
  const vec = computeImpulseDenominator_vec;
  const m = computeImpulseDenominator_m;
  pos.vsub(body.position, r0);
  r0.cross(normal, c0);
  body.invInertiaWorld.vmult(c0, m);
  m.cross(r0, vec);
  return body.invMass + normal.dot(vec);
}

const resolveSingleBilateral_vel1 = new Vec3();
const resolveSingleBilateral_vel2 = new Vec3();
const resolveSingleBilateral_vel = new Vec3(); //bilateral constraint between two dynamic objects

function resolveSingleBilateral(body1, pos1, body2, pos2, normal) {
  const normalLenSqr = normal.lengthSquared();

  if (normalLenSqr > 1.1) {
    return 0; // no impulse
  } // const rel_pos1 = new Vec3();
  // const rel_pos2 = new Vec3();
  // pos1.vsub(body1.position, rel_pos1);
  // pos2.vsub(body2.position, rel_pos2);


  const vel1 = resolveSingleBilateral_vel1;
  const vel2 = resolveSingleBilateral_vel2;
  const vel = resolveSingleBilateral_vel;
  body1.getVelocityAtWorldPoint(pos1, vel1);
  body2.getVelocityAtWorldPoint(pos2, vel2);
  vel1.vsub(vel2, vel);
  const rel_vel = normal.dot(vel);
  const contactDamping = 0.2;
  const massTerm = 1 / (body1.invMass + body2.invMass);
  const impulse = -contactDamping * rel_vel * massTerm;
  return impulse;
}

/**
 * Spherical shape
 * @class Sphere
 * @constructor
 * @extends Shape
 * @param {Number} radius The radius of the sphere, a non-negative number.
 * @author schteppe / http://github.com/schteppe
 */
class Sphere extends Shape {
  constructor(radius) {
    super({
      type: Shape.types.SPHERE
    });
    this.radius = radius !== undefined ? radius : 1.0;

    if (this.radius < 0) {
      throw new Error('The sphere radius cannot be negative.');
    }

    this.updateBoundingSphereRadius();
  }

  calculateLocalInertia(mass, target = new Vec3()) {
    const I = 2.0 * mass * this.radius * this.radius / 5.0;
    target.x = I;
    target.y = I;
    target.z = I;
    return target;
  }

  volume() {
    return 4.0 * Math.PI * Math.pow(this.radius, 3) / 3.0;
  }

  updateBoundingSphereRadius() {
    this.boundingSphereRadius = this.radius;
  }

  calculateWorldAABB(pos, quat, min, max) {
    const r = this.radius;
    const axes = ['x', 'y', 'z'];

    for (let i = 0; i < axes.length; i++) {
      const ax = axes[i];
      min[ax] = pos[ax] - r;
      max[ax] = pos[ax] + r;
    }
  }

}

/**
 * Simple vehicle helper class with spherical rigid body wheels.
 * @class RigidVehicle
 * @constructor
 * @param {Body} [options.chassisBody]
 */
class RigidVehicle {
  constructor(options = {}) {
    this.wheelBodies = [];
    this.coordinateSystem = typeof options.coordinateSystem !== 'undefined' ? options.coordinateSystem.clone() : new Vec3(1, 2, 3);

    if (options.chassisBody) {
      this.chassisBody = options.chassisBody;
    } else {
      // No chassis body given. Create it!
      this.chassisBody = new Body({
        mass: 1,
        shape: new Box(new Vec3(5, 2, 0.5))
      });
    }

    this.constraints = [];
    this.wheelAxes = [];
    this.wheelForces = [];
  }
  /**
   * Add a wheel
   * @method addWheel
   * @param {object} options
   * @param {boolean} [options.isFrontWheel]
   * @param {Vec3} [options.position] Position of the wheel, locally in the chassis body.
   * @param {Vec3} [options.direction] Slide direction of the wheel along the suspension.
   * @param {Vec3} [options.axis] Axis of rotation of the wheel, locally defined in the chassis.
   * @param {Body} [options.body] The wheel body.
   */


  addWheel(options = {}) {
    let wheelBody;

    if (options.body) {
      wheelBody = options.body;
    } else {
      // No wheel body given. Create it!
      wheelBody = new Body({
        mass: 1,
        shape: new Sphere(1.2)
      });
    }

    this.wheelBodies.push(wheelBody);
    this.wheelForces.push(0); // Position constrain wheels
    const position = typeof options.position !== 'undefined' ? options.position.clone() : new Vec3(); // Set position locally to the chassis

    const worldPosition = new Vec3();
    this.chassisBody.pointToWorldFrame(position, worldPosition);
    wheelBody.position.set(worldPosition.x, worldPosition.y, worldPosition.z); // Constrain wheel

    const axis = typeof options.axis !== 'undefined' ? options.axis.clone() : new Vec3(0, 1, 0);
    this.wheelAxes.push(axis);
    const hingeConstraint = new HingeConstraint(this.chassisBody, wheelBody, {
      pivotA: position,
      axisA: axis,
      pivotB: Vec3.ZERO,
      axisB: axis,
      collideConnected: false
    });
    this.constraints.push(hingeConstraint);
    return this.wheelBodies.length - 1;
  }
  /**
   * Set the steering value of a wheel.
   * @method setSteeringValue
   * @param {number} value
   * @param {integer} wheelIndex
   * @todo check coordinateSystem
   */


  setSteeringValue(value, wheelIndex) {
    // Set angle of the hinge axis
    const axis = this.wheelAxes[wheelIndex];
    const c = Math.cos(value);
    const s = Math.sin(value);
    const x = axis.x;
    const y = axis.y;
    this.constraints[wheelIndex].axisA.set(c * x - s * y, s * x + c * y, 0);
  }
  /**
   * Set the target rotational speed of the hinge constraint.
   * @method setMotorSpeed
   * @param {number} value
   * @param {integer} wheelIndex
   */


  setMotorSpeed(value, wheelIndex) {
    const hingeConstraint = this.constraints[wheelIndex];
    hingeConstraint.enableMotor();
    hingeConstraint.motorTargetVelocity = value;
  }
  /**
   * Set the target rotational speed of the hinge constraint.
   * @method disableMotor
   * @param {number} value
   * @param {integer} wheelIndex
   */


  disableMotor(wheelIndex) {
    const hingeConstraint = this.constraints[wheelIndex];
    hingeConstraint.disableMotor();
  }
  /**
   * Set the wheel force to apply on one of the wheels each time step
   * @method setWheelForce
   * @param  {number} value
   * @param  {integer} wheelIndex
   */


  setWheelForce(value, wheelIndex) {
    this.wheelForces[wheelIndex] = value;
  }
  /**
   * Apply a torque on one of the wheels.
   * @method applyWheelForce
   * @param  {number} value
   * @param  {integer} wheelIndex
   */


  applyWheelForce(value, wheelIndex) {
    const axis = this.wheelAxes[wheelIndex];
    const wheelBody = this.wheelBodies[wheelIndex];
    const bodyTorque = wheelBody.torque;
    axis.scale(value, torque);
    wheelBody.vectorToWorldFrame(torque, torque);
    bodyTorque.vadd(torque, bodyTorque);
  }
  /**
   * Add the vehicle including its constraints to the world.
   * @method addToWorld
   * @param {World} world
   */


  addToWorld(world) {
    const constraints = this.constraints;
    const bodies = this.wheelBodies.concat([this.chassisBody]);

    for (let i = 0; i < bodies.length; i++) {
      world.addBody(bodies[i]);
    }

    for (let i = 0; i < constraints.length; i++) {
      world.addConstraint(constraints[i]);
    }

    world.addEventListener('preStep', this._update.bind(this));
  }

  _update() {
    const wheelForces = this.wheelForces;

    for (let i = 0; i < wheelForces.length; i++) {
      this.applyWheelForce(wheelForces[i], i);
    }
  }
  /**
   * Remove the vehicle including its constraints from the world.
   * @method removeFromWorld
   * @param {World} world
   */


  removeFromWorld(world) {
    const constraints = this.constraints;
    const bodies = this.wheelBodies.concat([this.chassisBody]);

    for (let i = 0; i < bodies.length; i++) {
      world.removeBody(bodies[i]);
    }

    for (let i = 0; i < constraints.length; i++) {
      world.removeConstraint(constraints[i]);
    }
  }
  /**
   * Get current rotational velocity of a wheel
   * @method getWheelSpeed
   * @param {integer} wheelIndex
   */


  getWheelSpeed(wheelIndex) {
    const axis = this.wheelAxes[wheelIndex];
    const wheelBody = this.wheelBodies[wheelIndex];
    const w = wheelBody.angularVelocity;
    this.chassisBody.vectorToWorldFrame(axis, worldAxis);
    return w.dot(worldAxis);
  }

}
const torque = new Vec3();
const worldAxis = new Vec3();

/**
 * Smoothed-particle hydrodynamics system
 * @class SPHSystem
 * @constructor
 */
class SPHSystem {
  // Density of the system (kg/m3).
  // Distance below which two particles are considered to be neighbors. It should be adjusted so there are about 15-20 neighbor particles within this radius.
  // Viscosity of the system.
  constructor() {
    this.particles = [];
    this.density = 1;
    this.smoothingRadius = 1;
    this.speedOfSound = 1;
    this.viscosity = 0.01;
    this.eps = 0.000001; // Stuff Computed per particle

    this.pressures = [];
    this.densities = [];
    this.neighbors = [];
  }
  /**
   * Add a particle to the system.
   * @method add
   * @param {Body} particle
   */


  add(particle) {
    this.particles.push(particle);

    if (this.neighbors.length < this.particles.length) {
      this.neighbors.push([]);
    }
  }
  /**
   * Remove a particle from the system.
   * @method remove
   * @param {Body} particle
   */


  remove(particle) {
    const idx = this.particles.indexOf(particle);

    if (idx !== -1) {
      this.particles.splice(idx, 1);

      if (this.neighbors.length > this.particles.length) {
        this.neighbors.pop();
      }
    }
  }

  getNeighbors(particle, neighbors) {
    const N = this.particles.length;
    const id = particle.id;
    const R2 = this.smoothingRadius * this.smoothingRadius;
    const dist = SPHSystem_getNeighbors_dist;

    for (let i = 0; i !== N; i++) {
      const p = this.particles[i];
      p.position.vsub(particle.position, dist);

      if (id !== p.id && dist.lengthSquared() < R2) {
        neighbors.push(p);
      }
    }
  }

  update() {
    const N = this.particles.length;
    const dist = SPHSystem_update_dist;
    const cs = this.speedOfSound;
    const eps = this.eps;

    for (let i = 0; i !== N; i++) {
      const p = this.particles[i]; // Current particle

      const neighbors = this.neighbors[i]; // Get neighbors

      neighbors.length = 0;
      this.getNeighbors(p, neighbors);
      neighbors.push(this.particles[i]); // Add current too

      const numNeighbors = neighbors.length; // Accumulate density for the particle

      let sum = 0.0;

      for (let j = 0; j !== numNeighbors; j++) {
        //printf("Current particle has position %f %f %f\n",objects[id].pos.x(),objects[id].pos.y(),objects[id].pos.z());
        p.position.vsub(neighbors[j].position, dist);
        const len = dist.length();
        const weight = this.w(len);
        sum += neighbors[j].mass * weight;
      } // Save


      this.densities[i] = sum;
      this.pressures[i] = cs * cs * (this.densities[i] - this.density);
    } // Add forces
    // Sum to these accelerations


    const a_pressure = SPHSystem_update_a_pressure;
    const a_visc = SPHSystem_update_a_visc;
    const gradW = SPHSystem_update_gradW;
    const r_vec = SPHSystem_update_r_vec;
    const u = SPHSystem_update_u;

    for (let i = 0; i !== N; i++) {
      const particle = this.particles[i];
      a_pressure.set(0, 0, 0);
      a_visc.set(0, 0, 0); // Init vars

      let Pij;
      let nabla;

      const neighbors = this.neighbors[i];
      const numNeighbors = neighbors.length; //printf("Neighbors: ");

      for (let j = 0; j !== numNeighbors; j++) {
        const neighbor = neighbors[j]; //printf("%d ",nj);
        // Get r once for all..

        particle.position.vsub(neighbor.position, r_vec);
        const r = r_vec.length(); // Pressure contribution

        Pij = -neighbor.mass * (this.pressures[i] / (this.densities[i] * this.densities[i] + eps) + this.pressures[j] / (this.densities[j] * this.densities[j] + eps));
        this.gradw(r_vec, gradW); // Add to pressure acceleration

        gradW.scale(Pij, gradW);
        a_pressure.vadd(gradW, a_pressure); // Viscosity contribution

        neighbor.velocity.vsub(particle.velocity, u);
        u.scale(1.0 / (0.0001 + this.densities[i] * this.densities[j]) * this.viscosity * neighbor.mass, u);
        nabla = this.nablaw(r);
        u.scale(nabla, u); // Add to viscosity acceleration

        a_visc.vadd(u, a_visc);
      } // Calculate force


      a_visc.scale(particle.mass, a_visc);
      a_pressure.scale(particle.mass, a_pressure); // Add force to particles

      particle.force.vadd(a_visc, particle.force);
      particle.force.vadd(a_pressure, particle.force);
    }
  } // Calculate the weight using the W(r) weightfunction


  w(r) {
    // 315
    const h = this.smoothingRadius;
    return 315.0 / (64.0 * Math.PI * h ** 9) * (h * h - r * r) ** 3;
  } // calculate gradient of the weight function


  gradw(rVec, resultVec) {
    const r = rVec.length();
    const h = this.smoothingRadius;
    rVec.scale(945.0 / (32.0 * Math.PI * h ** 9) * (h * h - r * r) ** 2, resultVec);
  } // Calculate nabla(W)


  nablaw(r) {
    const h = this.smoothingRadius;
    const nabla = 945.0 / (32.0 * Math.PI * h ** 9) * (h * h - r * r) * (7 * r * r - 3 * h * h);
    return nabla;
  }

}
/**
 * Get neighbors within smoothing volume, save in the array neighbors
 * @method getNeighbors
 * @param {Body} particle
 * @param {Array} neighbors
 */

const SPHSystem_getNeighbors_dist = new Vec3(); // Temp vectors for calculation

const SPHSystem_update_dist = new Vec3(); // Relative velocity

const SPHSystem_update_a_pressure = new Vec3();
const SPHSystem_update_a_visc = new Vec3();
const SPHSystem_update_gradW = new Vec3();
const SPHSystem_update_r_vec = new Vec3();
const SPHSystem_update_u = new Vec3();

/**
 * @class Cylinder
 * @constructor
 * @extends ConvexPolyhedron
 * @author schteppe / https://github.com/schteppe
 * @param {Number} radiusTop
 * @param {Number} radiusBottom
 * @param {Number} height
 * @param {Number} numSegments The number of segments to build the cylinder out of
 */

class Cylinder extends ConvexPolyhedron {
  constructor(radiusTop, radiusBottom, height, numSegments) {
    const N = numSegments;
    const vertices = [];
    const axes = [];
    const faces = [];
    const bottomface = [];
    const topface = [];
    const cos = Math.cos;
    const sin = Math.sin; // First bottom point

    vertices.push(new Vec3(-radiusBottom * sin(0), -height * 0.5, radiusBottom * cos(0)));
    bottomface.push(0); // First top point

    vertices.push(new Vec3(-radiusTop * sin(0), height * 0.5, radiusTop * cos(0)));
    topface.push(1);

    for (let i = 0; i < N; i++) {
      const theta = 2 * Math.PI / N * (i + 1);
      const thetaN = 2 * Math.PI / N * (i + 0.5);

      if (i < N - 1) {
        // Bottom
        vertices.push(new Vec3(-radiusBottom * sin(theta), -height * 0.5, radiusBottom * cos(theta)));
        bottomface.push(2 * i + 2); // Top

        vertices.push(new Vec3(-radiusTop * sin(theta), height * 0.5, radiusTop * cos(theta)));
        topface.push(2 * i + 3); // Face

        faces.push([2 * i, 2 * i + 1, 2 * i + 3, 2 * i + 2]);
      } else {
        faces.push([2 * i, 2 * i + 1, 1, 0]); // Connect
      } // Axis: we can cut off half of them if we have even number of segments


      if (N % 2 === 1 || i < N / 2) {
        axes.push(new Vec3(-sin(thetaN), 0, cos(thetaN)));
      }
    }

    faces.push(bottomface);
    axes.push(new Vec3(0, 1, 0)); // Reorder top face

    const temp = [];

    for (let i = 0; i < topface.length; i++) {
      temp.push(topface[topface.length - i - 1]);
    }

    faces.push(temp);
    super({
      vertices,
      faces,
      axes
    });
  }

}

/**
 * Particle shape.
 * @class Particle
 * @constructor
 * @author schteppe
 * @extends Shape
 */
class Particle extends Shape {
  constructor() {
    super({
      type: Shape.types.PARTICLE
    });
  }
  /**
   * @method calculateLocalInertia
   * @param  {Number} mass
   * @param  {Vec3} target
   * @return {Vec3}
   */


  calculateLocalInertia(mass, target = new Vec3()) {
    target.set(0, 0, 0);
    return target;
  }

  volume() {
    return 0;
  }

  updateBoundingSphereRadius() {
    this.boundingSphereRadius = 0;
  }

  calculateWorldAABB(pos, quat, min, max) {
    // Get each axis max
    min.copy(pos);
    max.copy(pos);
  }

}

/**
 * A plane, facing in the Z direction. The plane has its surface at z=0 and everything below z=0 is assumed to be solid plane. To make the plane face in some other direction than z, you must put it inside a Body and rotate that body. See the demos.
 * @class Plane
 * @constructor
 * @extends Shape
 * @author schteppe
 */
class Plane extends Shape {
  constructor() {
    super({
      type: Shape.types.PLANE
    }); // World oriented normal

    this.worldNormal = new Vec3();
    this.worldNormalNeedsUpdate = true;
    this.boundingSphereRadius = Number.MAX_VALUE;
  }

  computeWorldNormal(quat) {
    const n = this.worldNormal;
    n.set(0, 0, 1);
    quat.vmult(n, n);
    this.worldNormalNeedsUpdate = false;
  }

  calculateLocalInertia(mass, target = new Vec3()) {
    return target;
  }

  volume() {
    return (// The plane is infinite...
      Number.MAX_VALUE
    );
  }

  calculateWorldAABB(pos, quat, min, max) {
    // The plane AABB is infinite, except if the normal is pointing along any axis
    tempNormal.set(0, 0, 1); // Default plane normal is z

    quat.vmult(tempNormal, tempNormal);
    const maxVal = Number.MAX_VALUE;
    min.set(-maxVal, -maxVal, -maxVal);
    max.set(maxVal, maxVal, maxVal);

    if (tempNormal.x === 1) {
      max.x = pos.x;
    } else if (tempNormal.x === -1) {
      min.x = pos.x;
    }

    if (tempNormal.y === 1) {
      max.y = pos.y;
    } else if (tempNormal.y === -1) {
      min.y = pos.y;
    }

    if (tempNormal.z === 1) {
      max.z = pos.z;
    } else if (tempNormal.z === -1) {
      min.z = pos.z;
    }
  }

  updateBoundingSphereRadius() {
    this.boundingSphereRadius = Number.MAX_VALUE;
  }

}
const tempNormal = new Vec3();

/**
 * Heightfield shape class. Height data is given as an array. These data points are spread out evenly with a given distance.
 * @class Heightfield
 * @extends Shape
 * @constructor
 * @param {Array} data An array of Y values that will be used to construct the terrain.
 * @param {object} options
 * @param {Number} [options.minValue] Minimum value of the data points in the data array. Will be computed automatically if not given.
 * @param {Number} [options.maxValue] Maximum value.
 * @param {Number} [options.elementSize=0.1] World spacing between the data points in X direction.
 * @todo Should be possible to use along all axes, not just y
 * @todo should be possible to scale along all axes
 * @todo Refactor elementSize to elementSizeX and elementSizeY
 *
 * @example
 *     // Generate some height data (y-values).
 *     const data = [];
 *     for(let i = 0; i < 1000; i++){
 *         const y = 0.5 * Math.cos(0.2 * i);
 *         data.push(y);
 *     }
 *
 *     // Create the heightfield shape
 *     const heightfieldShape = new Heightfield(data, {
 *         elementSize: 1 // Distance between the data points in X and Y directions
 *     });
 *     const heightfieldBody = new Body();
 *     heightfieldBody.addShape(heightfieldShape);
 *     world.addBody(heightfieldBody);
 */
class Heightfield extends Shape {
  // An array of numbers, or height values, that are spread out along the x axis.
  // Max value of the data.
  // Max value of the data.
  // The width of each element. To do: elementSizeX and Y
  constructor(data, options = {}) {
    options = Utils.defaults(options, {
      maxValue: null,
      minValue: null,
      elementSize: 1
    });
    super({
      type: Shape.types.HEIGHTFIELD
    });
    this.data = data;
    this.maxValue = options.maxValue;
    this.minValue = options.minValue;
    this.elementSize = options.elementSize;

    if (options.minValue === null) {
      this.updateMinValue();
    }

    if (options.maxValue === null) {
      this.updateMaxValue();
    }

    this.cacheEnabled = true;
    this.pillarConvex = new ConvexPolyhedron();
    this.pillarOffset = new Vec3();
    this.updateBoundingSphereRadius(); // "i_j_isUpper" => { convex: ..., offset: ... }
    // for example:
    // _cachedPillars["0_2_1"]

    this._cachedPillars = {};
  }
  /**
   * Call whenever you change the data array.
   * @method update
   */


  update() {
    this._cachedPillars = {};
  }
  /**
   * Update the .minValue property
   * @method updateMinValue
   */


  updateMinValue() {
    const data = this.data;
    let minValue = data[0][0];

    for (let i = 0; i !== data.length; i++) {
      for (let j = 0; j !== data[i].length; j++) {
        const v = data[i][j];

        if (v < minValue) {
          minValue = v;
        }
      }
    }

    this.minValue = minValue;
  }
  /**
   * Update the .maxValue property
   * @method updateMaxValue
   */


  updateMaxValue() {
    const data = this.data;
    let maxValue = data[0][0];

    for (let i = 0; i !== data.length; i++) {
      for (let j = 0; j !== data[i].length; j++) {
        const v = data[i][j];

        if (v > maxValue) {
          maxValue = v;
        }
      }
    }

    this.maxValue = maxValue;
  }
  /**
   * Set the height value at an index. Don't forget to update maxValue and minValue after you're done.
   * @method setHeightValueAtIndex
   * @param {integer} xi
   * @param {integer} yi
   * @param {number} value
   */


  setHeightValueAtIndex(xi, yi, value) {
    const data = this.data;
    data[xi][yi] = value; // Invalidate cache

    this.clearCachedConvexTrianglePillar(xi, yi, false);

    if (xi > 0) {
      this.clearCachedConvexTrianglePillar(xi - 1, yi, true);
      this.clearCachedConvexTrianglePillar(xi - 1, yi, false);
    }

    if (yi > 0) {
      this.clearCachedConvexTrianglePillar(xi, yi - 1, true);
      this.clearCachedConvexTrianglePillar(xi, yi - 1, false);
    }

    if (yi > 0 && xi > 0) {
      this.clearCachedConvexTrianglePillar(xi - 1, yi - 1, true);
    }
  }
  /**
   * Get max/min in a rectangle in the matrix data
   * @method getRectMinMax
   * @param  {integer} iMinX
   * @param  {integer} iMinY
   * @param  {integer} iMaxX
   * @param  {integer} iMaxY
   * @param  {array} [result] An array to store the results in.
   * @return {array} The result array, if it was passed in. Minimum will be at position 0 and max at 1.
   */


  getRectMinMax(iMinX, iMinY, iMaxX, iMaxY, result = []) {
    // Get max and min of the data
    const data = this.data; // Set first value

    let max = this.minValue;

    for (let i = iMinX; i <= iMaxX; i++) {
      for (let j = iMinY; j <= iMaxY; j++) {
        const height = data[i][j];

        if (height > max) {
          max = height;
        }
      }
    }

    result[0] = this.minValue;
    result[1] = max;
  }
  /**
   * Get the index of a local position on the heightfield. The indexes indicate the rectangles, so if your terrain is made of N x N height data points, you will have rectangle indexes ranging from 0 to N-1.
   * @method getIndexOfPosition
   * @param  {number} x
   * @param  {number} y
   * @param  {array} result Two-element array
   * @param  {boolean} clamp If the position should be clamped to the heightfield edge.
   * @return {boolean}
   */


  getIndexOfPosition(x, y, result, clamp) {
    // Get the index of the data points to test against
    const w = this.elementSize;
    const data = this.data;
    let xi = Math.floor(x / w);
    let yi = Math.floor(y / w);
    result[0] = xi;
    result[1] = yi;

    if (clamp) {
      // Clamp index to edges
      if (xi < 0) {
        xi = 0;
      }

      if (yi < 0) {
        yi = 0;
      }

      if (xi >= data.length - 1) {
        xi = data.length - 1;
      }

      if (yi >= data[0].length - 1) {
        yi = data[0].length - 1;
      }
    } // Bail out if we are out of the terrain


    if (xi < 0 || yi < 0 || xi >= data.length - 1 || yi >= data[0].length - 1) {
      return false;
    }

    return true;
  }

  getTriangleAt(x, y, edgeClamp, a, b, c) {
    const idx = getHeightAt_idx;
    this.getIndexOfPosition(x, y, idx, edgeClamp);
    let xi = idx[0];
    let yi = idx[1];
    const data = this.data;

    if (edgeClamp) {
      xi = Math.min(data.length - 2, Math.max(0, xi));
      yi = Math.min(data[0].length - 2, Math.max(0, yi));
    }

    const elementSize = this.elementSize;
    const lowerDist2 = (x / elementSize - xi) ** 2 + (y / elementSize - yi) ** 2;
    const upperDist2 = (x / elementSize - (xi + 1)) ** 2 + (y / elementSize - (yi + 1)) ** 2;
    const upper = lowerDist2 > upperDist2;
    this.getTriangle(xi, yi, upper, a, b, c);
    return upper;
  }

  getNormalAt(x, y, edgeClamp, result) {
    const a = getNormalAt_a;
    const b = getNormalAt_b;
    const c = getNormalAt_c;
    const e0 = getNormalAt_e0;
    const e1 = getNormalAt_e1;
    this.getTriangleAt(x, y, edgeClamp, a, b, c);
    b.vsub(a, e0);
    c.vsub(a, e1);
    e0.cross(e1, result);
    result.normalize();
  }
  /**
   * Get an AABB of a square in the heightfield
   * @param  {number} xi
   * @param  {number} yi
   * @param  {AABB} result
   */


  getAabbAtIndex(xi, yi, {
    lowerBound,
    upperBound
  }) {
    const data = this.data;
    const elementSize = this.elementSize;
    lowerBound.set(xi * elementSize, yi * elementSize, data[xi][yi]);
    upperBound.set((xi + 1) * elementSize, (yi + 1) * elementSize, data[xi + 1][yi + 1]);
  }
  /**
   * Get the height in the heightfield at a given position
   * @param  {number} x
   * @param  {number} y
   * @param  {boolean} edgeClamp
   * @return {number}
   */


  getHeightAt(x, y, edgeClamp) {
    const data = this.data;
    const a = getHeightAt_a;
    const b = getHeightAt_b;
    const c = getHeightAt_c;
    const idx = getHeightAt_idx;
    this.getIndexOfPosition(x, y, idx, edgeClamp);
    let xi = idx[0];
    let yi = idx[1];

    if (edgeClamp) {
      xi = Math.min(data.length - 2, Math.max(0, xi));
      yi = Math.min(data[0].length - 2, Math.max(0, yi));
    }

    const upper = this.getTriangleAt(x, y, edgeClamp, a, b, c);
    barycentricWeights(x, y, a.x, a.y, b.x, b.y, c.x, c.y, getHeightAt_weights);
    const w = getHeightAt_weights;

    if (upper) {
      // Top triangle verts
      return data[xi + 1][yi + 1] * w.x + data[xi][yi + 1] * w.y + data[xi + 1][yi] * w.z;
    } else {
      // Top triangle verts
      return data[xi][yi] * w.x + data[xi + 1][yi] * w.y + data[xi][yi + 1] * w.z;
    }
  }

  getCacheConvexTrianglePillarKey(xi, yi, getUpperTriangle) {
    return xi + "_" + yi + "_" + (getUpperTriangle ? 1 : 0);
  }

  getCachedConvexTrianglePillar(xi, yi, getUpperTriangle) {
    return this._cachedPillars[this.getCacheConvexTrianglePillarKey(xi, yi, getUpperTriangle)];
  }

  setCachedConvexTrianglePillar(xi, yi, getUpperTriangle, convex, offset) {
    this._cachedPillars[this.getCacheConvexTrianglePillarKey(xi, yi, getUpperTriangle)] = {
      convex,
      offset
    };
  }

  clearCachedConvexTrianglePillar(xi, yi, getUpperTriangle) {
    delete this._cachedPillars[this.getCacheConvexTrianglePillarKey(xi, yi, getUpperTriangle)];
  }
  /**
   * Get a triangle from the heightfield
   * @param  {number} xi
   * @param  {number} yi
   * @param  {boolean} upper
   * @param  {Vec3} a
   * @param  {Vec3} b
   * @param  {Vec3} c
   */


  getTriangle(xi, yi, upper, a, b, c) {
    const data = this.data;
    const elementSize = this.elementSize;

    if (upper) {
      // Top triangle verts
      a.set((xi + 1) * elementSize, (yi + 1) * elementSize, data[xi + 1][yi + 1]);
      b.set(xi * elementSize, (yi + 1) * elementSize, data[xi][yi + 1]);
      c.set((xi + 1) * elementSize, yi * elementSize, data[xi + 1][yi]);
    } else {
      // Top triangle verts
      a.set(xi * elementSize, yi * elementSize, data[xi][yi]);
      b.set((xi + 1) * elementSize, yi * elementSize, data[xi + 1][yi]);
      c.set(xi * elementSize, (yi + 1) * elementSize, data[xi][yi + 1]);
    }
  }
  /**
   * Get a triangle in the terrain in the form of a triangular convex shape.
   * @method getConvexTrianglePillar
   * @param  {integer} i
   * @param  {integer} j
   * @param  {boolean} getUpperTriangle
   */


  getConvexTrianglePillar(xi, yi, getUpperTriangle) {
    let result = this.pillarConvex;
    let offsetResult = this.pillarOffset;

    if (this.cacheEnabled) {
      const data = this.getCachedConvexTrianglePillar(xi, yi, getUpperTriangle);

      if (data) {
        this.pillarConvex = data.convex;
        this.pillarOffset = data.offset;
        return;
      }

      result = new ConvexPolyhedron();
      offsetResult = new Vec3();
      this.pillarConvex = result;
      this.pillarOffset = offsetResult;
    }

    const data = this.data;
    const elementSize = this.elementSize;
    const faces = result.faces; // Reuse verts if possible

    result.vertices.length = 6;

    for (let i = 0; i < 6; i++) {
      if (!result.vertices[i]) {
        result.vertices[i] = new Vec3();
      }
    } // Reuse faces if possible


    faces.length = 5;

    for (let i = 0; i < 5; i++) {
      if (!faces[i]) {
        faces[i] = [];
      }
    }

    const verts = result.vertices;
    const h = (Math.min(data[xi][yi], data[xi + 1][yi], data[xi][yi + 1], data[xi + 1][yi + 1]) - this.minValue) / 2 + this.minValue;

    if (!getUpperTriangle) {
      // Center of the triangle pillar - all polygons are given relative to this one
      offsetResult.set((xi + 0.25) * elementSize, // sort of center of a triangle
      (yi + 0.25) * elementSize, h // vertical center
      ); // Top triangle verts

      verts[0].set(-0.25 * elementSize, -0.25 * elementSize, data[xi][yi] - h);
      verts[1].set(0.75 * elementSize, -0.25 * elementSize, data[xi + 1][yi] - h);
      verts[2].set(-0.25 * elementSize, 0.75 * elementSize, data[xi][yi + 1] - h); // bottom triangle verts

      verts[3].set(-0.25 * elementSize, -0.25 * elementSize, -h - 1);
      verts[4].set(0.75 * elementSize, -0.25 * elementSize, -h - 1);
      verts[5].set(-0.25 * elementSize, 0.75 * elementSize, -h - 1); // top triangle

      faces[0][0] = 0;
      faces[0][1] = 1;
      faces[0][2] = 2; // bottom triangle

      faces[1][0] = 5;
      faces[1][1] = 4;
      faces[1][2] = 3; // -x facing quad

      faces[2][0] = 0;
      faces[2][1] = 2;
      faces[2][2] = 5;
      faces[2][3] = 3; // -y facing quad

      faces[3][0] = 1;
      faces[3][1] = 0;
      faces[3][2] = 3;
      faces[3][3] = 4; // +xy facing quad

      faces[4][0] = 4;
      faces[4][1] = 5;
      faces[4][2] = 2;
      faces[4][3] = 1;
    } else {
      // Center of the triangle pillar - all polygons are given relative to this one
      offsetResult.set((xi + 0.75) * elementSize, // sort of center of a triangle
      (yi + 0.75) * elementSize, h // vertical center
      ); // Top triangle verts

      verts[0].set(0.25 * elementSize, 0.25 * elementSize, data[xi + 1][yi + 1] - h);
      verts[1].set(-0.75 * elementSize, 0.25 * elementSize, data[xi][yi + 1] - h);
      verts[2].set(0.25 * elementSize, -0.75 * elementSize, data[xi + 1][yi] - h); // bottom triangle verts

      verts[3].set(0.25 * elementSize, 0.25 * elementSize, -h - 1);
      verts[4].set(-0.75 * elementSize, 0.25 * elementSize, -h - 1);
      verts[5].set(0.25 * elementSize, -0.75 * elementSize, -h - 1); // Top triangle

      faces[0][0] = 0;
      faces[0][1] = 1;
      faces[0][2] = 2; // bottom triangle

      faces[1][0] = 5;
      faces[1][1] = 4;
      faces[1][2] = 3; // +x facing quad

      faces[2][0] = 2;
      faces[2][1] = 5;
      faces[2][2] = 3;
      faces[2][3] = 0; // +y facing quad

      faces[3][0] = 3;
      faces[3][1] = 4;
      faces[3][2] = 1;
      faces[3][3] = 0; // -xy facing quad

      faces[4][0] = 1;
      faces[4][1] = 4;
      faces[4][2] = 5;
      faces[4][3] = 2;
    }

    result.computeNormals();
    result.computeEdges();
    result.updateBoundingSphereRadius();
    this.setCachedConvexTrianglePillar(xi, yi, getUpperTriangle, result, offsetResult);
  }

  calculateLocalInertia(mass, target = new Vec3()) {
    target.set(0, 0, 0);
    return target;
  }

  volume() {
    return (// The terrain is infinite
      Number.MAX_VALUE
    );
  }

  calculateWorldAABB(pos, quat, min, max) {
    // TODO: do it properly
    min.set(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
    max.set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
  }

  updateBoundingSphereRadius() {
    // Use the bounding box of the min/max values
    const data = this.data;
    const s = this.elementSize;
    this.boundingSphereRadius = new Vec3(data.length * s, data[0].length * s, Math.max(Math.abs(this.maxValue), Math.abs(this.minValue))).length();
  }
  /**
   * Sets the height values from an image. Currently only supported in browser.
   * @method setHeightsFromImage
   * @param {Image} image
   * @param {Vec3} scale
   */


  setHeightsFromImage(image, scale) {
    const {
      x,
      z,
      y
    } = scale;
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    const imageData = context.getImageData(0, 0, image.width, image.height);
    const matrix = this.data;
    matrix.length = 0;
    this.elementSize = Math.abs(x) / imageData.width;

    for (let i = 0; i < imageData.height; i++) {
      const row = [];

      for (let j = 0; j < imageData.width; j++) {
        const a = imageData.data[(i * imageData.height + j) * 4];
        const b = imageData.data[(i * imageData.height + j) * 4 + 1];
        const c = imageData.data[(i * imageData.height + j) * 4 + 2];
        const height = (a + b + c) / 4 / 255 * z;

        if (x < 0) {
          row.push(height);
        } else {
          row.unshift(height);
        }
      }

      if (y < 0) {
        matrix.unshift(row);
      } else {
        matrix.push(row);
      }
    }

    this.updateMaxValue();
    this.updateMinValue();
    this.update();
  }

}
const getHeightAt_idx = [];
const getHeightAt_weights = new Vec3();
const getHeightAt_a = new Vec3();
const getHeightAt_b = new Vec3();
const getHeightAt_c = new Vec3();
const getNormalAt_a = new Vec3();
const getNormalAt_b = new Vec3();
const getNormalAt_c = new Vec3();
const getNormalAt_e0 = new Vec3();
const getNormalAt_e1 = new Vec3(); // from https://en.wikipedia.org/wiki/Barycentric_coordinate_system

function barycentricWeights(x, y, ax, ay, bx, by, cx, cy, result) {
  result.x = ((by - cy) * (x - cx) + (cx - bx) * (y - cy)) / ((by - cy) * (ax - cx) + (cx - bx) * (ay - cy));
  result.y = ((cy - ay) * (x - cx) + (ax - cx) * (y - cy)) / ((by - cy) * (ax - cx) + (cx - bx) * (ay - cy));
  result.z = 1 - result.x - result.y;
}

/**
 * @class OctreeNode
 * @constructor
 * @param {object} [options]
 * @param {Octree} [options.root]
 * @param {AABB} [options.aabb]
 */
class OctreeNode {
  // The root node
  // Boundary of this node
  // Contained data at the current node level
  // Children to this node
  constructor(options = {}) {
    this.root = options.root || null;
    this.aabb = options.aabb ? options.aabb.clone() : new AABB();
    this.data = [];
    this.children = [];
  }

  reset() {
    this.children.length = this.data.length = 0;
  }
  /**
   * Insert data into this node
   * @method insert
   * @param  {AABB} aabb
   * @param  {object} elementData
   * @return {boolean} True if successful, otherwise false
   */


  insert(aabb, elementData, level = 0) {
    const nodeData = this.data; // Ignore objects that do not belong in this node

    if (!this.aabb.contains(aabb)) {
      return false; // object cannot be added
    }

    const children = this.children;
    const maxDepth = this.maxDepth || this.root.maxDepth;

    if (level < maxDepth) {
      // Subdivide if there are no children yet
      let subdivided = false;

      if (!children.length) {
        this.subdivide();
        subdivided = true;
      } // add to whichever node will accept it


      for (let i = 0; i !== 8; i++) {
        if (children[i].insert(aabb, elementData, level + 1)) {
          return true;
        }
      }

      if (subdivided) {
        // No children accepted! Might as well just remove em since they contain none
        children.length = 0;
      }
    } // Too deep, or children didnt want it. add it in current node


    nodeData.push(elementData);
    return true;
  }
  /**
   * Create 8 equally sized children nodes and put them in the .children array.
   * @method subdivide
   */


  subdivide() {
    const aabb = this.aabb;
    const l = aabb.lowerBound;
    const u = aabb.upperBound;
    const children = this.children;
    children.push(new OctreeNode({
      aabb: new AABB({
        lowerBound: new Vec3(0, 0, 0)
      })
    }), new OctreeNode({
      aabb: new AABB({
        lowerBound: new Vec3(1, 0, 0)
      })
    }), new OctreeNode({
      aabb: new AABB({
        lowerBound: new Vec3(1, 1, 0)
      })
    }), new OctreeNode({
      aabb: new AABB({
        lowerBound: new Vec3(1, 1, 1)
      })
    }), new OctreeNode({
      aabb: new AABB({
        lowerBound: new Vec3(0, 1, 1)
      })
    }), new OctreeNode({
      aabb: new AABB({
        lowerBound: new Vec3(0, 0, 1)
      })
    }), new OctreeNode({
      aabb: new AABB({
        lowerBound: new Vec3(1, 0, 1)
      })
    }), new OctreeNode({
      aabb: new AABB({
        lowerBound: new Vec3(0, 1, 0)
      })
    }));
    u.vsub(l, halfDiagonal);
    halfDiagonal.scale(0.5, halfDiagonal);
    const root = this.root || this;

    for (let i = 0; i !== 8; i++) {
      const child = children[i]; // Set current node as root

      child.root = root; // Compute bounds

      const lowerBound = child.aabb.lowerBound;
      lowerBound.x *= halfDiagonal.x;
      lowerBound.y *= halfDiagonal.y;
      lowerBound.z *= halfDiagonal.z;
      lowerBound.vadd(l, lowerBound); // Upper bound is always lower bound + halfDiagonal

      lowerBound.vadd(halfDiagonal, child.aabb.upperBound);
    }
  }
  /**
   * Get all data, potentially within an AABB
   * @method aabbQuery
   * @param  {AABB} aabb
   * @param  {array} result
   * @return {array} The "result" object
   */


  aabbQuery(aabb, result) {
    const nodeData = this.data; // abort if the range does not intersect this node
    // if (!this.aabb.overlaps(aabb)){
    //     return result;
    // }
    // Add objects at this level
    // Array.prototype.push.apply(result, nodeData);
    // Add child data
    // @todo unwrap recursion into a queue / loop, that's faster in JS

    const children = this.children; // for (let i = 0, N = this.children.length; i !== N; i++) {
    //     children[i].aabbQuery(aabb, result);
    // }

    const queue = [this];

    while (queue.length) {
      const node = queue.pop();

      if (node.aabb.overlaps(aabb)) {
        Array.prototype.push.apply(result, node.data);
      }

      Array.prototype.push.apply(queue, node.children);
    }

    return result;
  }
  /**
   * Get all data, potentially intersected by a ray.
   * @method rayQuery
   * @param  {Ray} ray
   * @param  {Transform} treeTransform
   * @param  {array} result
   * @return {array} The "result" object
   */


  rayQuery(ray, treeTransform, result) {
    // Use aabb query for now.
    // @todo implement real ray query which needs less lookups
    ray.getAABB(tmpAABB$1);
    tmpAABB$1.toLocalFrame(treeTransform, tmpAABB$1);
    this.aabbQuery(tmpAABB$1, result);
    return result;
  }
  /**
   * @method removeEmptyNodes
   */


  removeEmptyNodes() {
    for (let i = this.children.length - 1; i >= 0; i--) {
      this.children[i].removeEmptyNodes();

      if (!this.children[i].children.length && !this.children[i].data.length) {
        this.children.splice(i, 1);
      }
    }
  }

}
/**
 * @class Octree
 * @param {AABB} aabb The total AABB of the tree
 * @param {object} [options]
 * @param {number} [options.maxDepth=8] Maximum subdivision depth
 * @extends OctreeNode
 */


class Octree extends OctreeNode {
  // Maximum subdivision depth
  constructor(aabb, options = {}) {
    super({
      root: null,
      aabb
    });
    this.maxDepth = typeof options.maxDepth !== 'undefined' ? options.maxDepth : 8;
  }

}
const halfDiagonal = new Vec3();
const tmpAABB$1 = new AABB();

/**
 * @class Trimesh
 * @constructor
 * @param {array} vertices
 * @param {array} indices
 * @extends Shape
 * @example
 *     // How to make a mesh with a single triangle
 *     const vertices = [
 *         0, 0, 0, // vertex 0
 *         1, 0, 0, // vertex 1
 *         0, 1, 0  // vertex 2
 *     ];
 *     const indices = [
 *         0, 1, 2  // triangle 0
 *     ];
 *     const trimeshShape = new Trimesh(vertices, indices);
 */
class Trimesh extends Shape {
  // Array of integers, indicating which vertices each triangle consists of. The length of this array is thus 3 times the number of triangles.
  // The normals data.
  // The local AABB of the mesh.
  // References to vertex pairs, making up all unique edges in the trimesh.
  // Local scaling of the mesh. Use .setScale() to set it.
  // The indexed triangles. Use .updateTree() to update it.
  constructor(vertices, indices) {
    super({
      type: Shape.types.TRIMESH
    });
    this.vertices = new Float32Array(vertices);
    this.indices = new Int16Array(indices);
    this.normals = new Float32Array(indices.length);
    this.aabb = new AABB();
    this.edges = null;
    this.scale = new Vec3(1, 1, 1);
    this.tree = new Octree();
    this.updateEdges();
    this.updateNormals();
    this.updateAABB();
    this.updateBoundingSphereRadius();
    this.updateTree();
  }
  /**
   * @method updateTree
   */


  updateTree() {
    const tree = this.tree;
    tree.reset();
    tree.aabb.copy(this.aabb);
    const scale = this.scale; // The local mesh AABB is scaled, but the octree AABB should be unscaled

    tree.aabb.lowerBound.x *= 1 / scale.x;
    tree.aabb.lowerBound.y *= 1 / scale.y;
    tree.aabb.lowerBound.z *= 1 / scale.z;
    tree.aabb.upperBound.x *= 1 / scale.x;
    tree.aabb.upperBound.y *= 1 / scale.y;
    tree.aabb.upperBound.z *= 1 / scale.z; // Insert all triangles

    const triangleAABB = new AABB();
    const a = new Vec3();
    const b = new Vec3();
    const c = new Vec3();
    const points = [a, b, c];

    for (let i = 0; i < this.indices.length / 3; i++) {
      //this.getTriangleVertices(i, a, b, c);
      // Get unscaled triangle verts
      const i3 = i * 3;

      this._getUnscaledVertex(this.indices[i3], a);

      this._getUnscaledVertex(this.indices[i3 + 1], b);

      this._getUnscaledVertex(this.indices[i3 + 2], c);

      triangleAABB.setFromPoints(points);
      tree.insert(triangleAABB, i);
    }

    tree.removeEmptyNodes();
  }
  /**
   * Get triangles in a local AABB from the trimesh.
   * @method getTrianglesInAABB
   * @param  {AABB} aabb
   * @param  {array} result An array of integers, referencing the queried triangles.
   */


  getTrianglesInAABB(aabb, result) {
    unscaledAABB.copy(aabb); // Scale it to local

    const scale = this.scale;
    const isx = scale.x;
    const isy = scale.y;
    const isz = scale.z;
    const l = unscaledAABB.lowerBound;
    const u = unscaledAABB.upperBound;
    l.x /= isx;
    l.y /= isy;
    l.z /= isz;
    u.x /= isx;
    u.y /= isy;
    u.z /= isz;
    return this.tree.aabbQuery(unscaledAABB, result);
  }
  /**
   * @method setScale
   * @param {Vec3} scale
   */


  setScale(scale) {
    const wasUniform = this.scale.x === this.scale.y && this.scale.y === this.scale.z;
    const isUniform = scale.x === scale.y && scale.y === scale.z;

    if (!(wasUniform && isUniform)) {
      // Non-uniform scaling. Need to update normals.
      this.updateNormals();
    }

    this.scale.copy(scale);
    this.updateAABB();
    this.updateBoundingSphereRadius();
  }
  /**
   * Compute the normals of the faces. Will save in the .normals array.
   * @method updateNormals
   */


  updateNormals() {
    const n = computeNormals_n; // Generate normals

    const normals = this.normals;

    for (let i = 0; i < this.indices.length / 3; i++) {
      const i3 = i * 3;
      const a = this.indices[i3];
      const b = this.indices[i3 + 1];
      const c = this.indices[i3 + 2];
      this.getVertex(a, va);
      this.getVertex(b, vb);
      this.getVertex(c, vc);
      Trimesh.computeNormal(vb, va, vc, n);
      normals[i3] = n.x;
      normals[i3 + 1] = n.y;
      normals[i3 + 2] = n.z;
    }
  }
  /**
   * Update the .edges property
   * @method updateEdges
   */


  updateEdges() {
    const edges = {};

    const add = (a, b) => {
      const key = a < b ? a + "_" + b : b + "_" + a;
      edges[key] = true;
    };

    for (let i = 0; i < this.indices.length / 3; i++) {
      const i3 = i * 3;
      const a = this.indices[i3];
      const b = this.indices[i3 + 1];
      const c = this.indices[i3 + 2];
      add(a, b);
      add(b, c);
      add(c, a);
    }

    const keys = Object.keys(edges);
    this.edges = new Int16Array(keys.length * 2);

    for (let i = 0; i < keys.length; i++) {
      const indices = keys[i].split('_');
      this.edges[2 * i] = parseInt(indices[0], 10);
      this.edges[2 * i + 1] = parseInt(indices[1], 10);
    }
  }
  /**
   * Get an edge vertex
   * @method getEdgeVertex
   * @param  {number} edgeIndex
   * @param  {number} firstOrSecond 0 or 1, depending on which one of the vertices you need.
   * @param  {Vec3} vertexStore Where to store the result
   */


  getEdgeVertex(edgeIndex, firstOrSecond, vertexStore) {
    const vertexIndex = this.edges[edgeIndex * 2 + (firstOrSecond ? 1 : 0)];
    this.getVertex(vertexIndex, vertexStore);
  }
  /**
   * Get a vector along an edge.
   * @method getEdgeVector
   * @param  {number} edgeIndex
   * @param  {Vec3} vectorStore
   */


  getEdgeVector(edgeIndex, vectorStore) {
    const va = getEdgeVector_va;
    const vb = getEdgeVector_vb;
    this.getEdgeVertex(edgeIndex, 0, va);
    this.getEdgeVertex(edgeIndex, 1, vb);
    vb.vsub(va, vectorStore);
  }
  /**
   * Get vertex i.
   * @method getVertex
   * @param  {number} i
   * @param  {Vec3} out
   * @return {Vec3} The "out" vector object
   */


  getVertex(i, out) {
    const scale = this.scale;

    this._getUnscaledVertex(i, out);

    out.x *= scale.x;
    out.y *= scale.y;
    out.z *= scale.z;
    return out;
  }
  /**
   * Get raw vertex i
   * @private
   * @method _getUnscaledVertex
   * @param  {number} i
   * @param  {Vec3} out
   * @return {Vec3} The "out" vector object
   */


  _getUnscaledVertex(i, out) {
    const i3 = i * 3;
    const vertices = this.vertices;
    return out.set(vertices[i3], vertices[i3 + 1], vertices[i3 + 2]);
  }
  /**
   * Get a vertex from the trimesh,transformed by the given position and quaternion.
   * @method getWorldVertex
   * @param  {number} i
   * @param  {Vec3} pos
   * @param  {Quaternion} quat
   * @param  {Vec3} out
   * @return {Vec3} The "out" vector object
   */


  getWorldVertex(i, pos, quat, out) {
    this.getVertex(i, out);
    Transform.pointToWorldFrame(pos, quat, out, out);
    return out;
  }
  /**
   * Get the three vertices for triangle i.
   * @method getTriangleVertices
   * @param  {number} i
   * @param  {Vec3} a
   * @param  {Vec3} b
   * @param  {Vec3} c
   */


  getTriangleVertices(i, a, b, c) {
    const i3 = i * 3;
    this.getVertex(this.indices[i3], a);
    this.getVertex(this.indices[i3 + 1], b);
    this.getVertex(this.indices[i3 + 2], c);
  }
  /**
   * Compute the normal of triangle i.
   * @method getNormal
   * @param  {Number} i
   * @param  {Vec3} target
   * @return {Vec3} The "target" vector object
   */


  getNormal(i, target) {
    const i3 = i * 3;
    return target.set(this.normals[i3], this.normals[i3 + 1], this.normals[i3 + 2]);
  }
  /**
   * @method calculateLocalInertia
   * @param  {Number} mass
   * @param  {Vec3} target
   * @return {Vec3} The "target" vector object
   */


  calculateLocalInertia(mass, target) {
    // Approximate with box inertia
    // Exact inertia calculation is overkill, but see http://geometrictools.com/Documentation/PolyhedralMassProperties.pdf for the correct way to do it
    this.computeLocalAABB(cli_aabb);
    const x = cli_aabb.upperBound.x - cli_aabb.lowerBound.x;
    const y = cli_aabb.upperBound.y - cli_aabb.lowerBound.y;
    const z = cli_aabb.upperBound.z - cli_aabb.lowerBound.z;
    return target.set(1.0 / 12.0 * mass * (2 * y * 2 * y + 2 * z * 2 * z), 1.0 / 12.0 * mass * (2 * x * 2 * x + 2 * z * 2 * z), 1.0 / 12.0 * mass * (2 * y * 2 * y + 2 * x * 2 * x));
  }
  /**
   * Compute the local AABB for the trimesh
   * @method computeLocalAABB
   * @param  {AABB} aabb
   */


  computeLocalAABB(aabb) {
    const l = aabb.lowerBound;
    const u = aabb.upperBound;
    const n = this.vertices.length;
    const vertices = this.vertices;
    const v = computeLocalAABB_worldVert;
    this.getVertex(0, v);
    l.copy(v);
    u.copy(v);

    for (let i = 0; i !== n; i++) {
      this.getVertex(i, v);

      if (v.x < l.x) {
        l.x = v.x;
      } else if (v.x > u.x) {
        u.x = v.x;
      }

      if (v.y < l.y) {
        l.y = v.y;
      } else if (v.y > u.y) {
        u.y = v.y;
      }

      if (v.z < l.z) {
        l.z = v.z;
      } else if (v.z > u.z) {
        u.z = v.z;
      }
    }
  }
  /**
   * Update the .aabb property
   * @method updateAABB
   */


  updateAABB() {
    this.computeLocalAABB(this.aabb);
  }
  /**
   * Will update the .boundingSphereRadius property
   * @method updateBoundingSphereRadius
   */


  updateBoundingSphereRadius() {
    // Assume points are distributed with local (0,0,0) as center
    let max2 = 0;
    const vertices = this.vertices;
    const v = new Vec3();

    for (let i = 0, N = vertices.length / 3; i !== N; i++) {
      this.getVertex(i, v);
      const norm2 = v.lengthSquared();

      if (norm2 > max2) {
        max2 = norm2;
      }
    }

    this.boundingSphereRadius = Math.sqrt(max2);
  }
  /**
   * @method calculateWorldAABB
   * @param {Vec3}        pos
   * @param {Quaternion}  quat
   * @param {Vec3}        min
   * @param {Vec3}        max
   */


  calculateWorldAABB(pos, quat, min, max) {
    /*
        const n = this.vertices.length / 3,
            verts = this.vertices;
        const minx,miny,minz,maxx,maxy,maxz;
         const v = tempWorldVertex;
        for(let i=0; i<n; i++){
            this.getVertex(i, v);
            quat.vmult(v, v);
            pos.vadd(v, v);
            if (v.x < minx || minx===undefined){
                minx = v.x;
            } else if(v.x > maxx || maxx===undefined){
                maxx = v.x;
            }
             if (v.y < miny || miny===undefined){
                miny = v.y;
            } else if(v.y > maxy || maxy===undefined){
                maxy = v.y;
            }
             if (v.z < minz || minz===undefined){
                minz = v.z;
            } else if(v.z > maxz || maxz===undefined){
                maxz = v.z;
            }
        }
        min.set(minx,miny,minz);
        max.set(maxx,maxy,maxz);
        */
    // Faster approximation using local AABB
    const frame = calculateWorldAABB_frame;
    const result = calculateWorldAABB_aabb;
    frame.position = pos;
    frame.quaternion = quat;
    this.aabb.toWorldFrame(frame, result);
    min.copy(result.lowerBound);
    max.copy(result.upperBound);
  }
  /**
   * Get approximate volume
   * @method volume
   * @return {Number}
   */


  volume() {
    return 4.0 * Math.PI * this.boundingSphereRadius / 3.0;
  }

}
const computeNormals_n = new Vec3();
const unscaledAABB = new AABB();
const getEdgeVector_va = new Vec3();
const getEdgeVector_vb = new Vec3();
/**
 * Get face normal given 3 vertices
 * @static
 * @method computeNormal
 * @param {Vec3} va
 * @param {Vec3} vb
 * @param {Vec3} vc
 * @param {Vec3} target
 */

const cb = new Vec3();
const ab = new Vec3();

Trimesh.computeNormal = (va, vb, vc, target) => {
  vb.vsub(va, ab);
  vc.vsub(vb, cb);
  cb.cross(ab, target);

  if (!target.isZero()) {
    target.normalize();
  }
};

const va = new Vec3();
const vb = new Vec3();
const vc = new Vec3();
const cli_aabb = new AABB();
const computeLocalAABB_worldVert = new Vec3();
const calculateWorldAABB_frame = new Transform();
const calculateWorldAABB_aabb = new AABB();
/**
 * Create a Trimesh instance, shaped as a torus.
 * @static
 * @method createTorus
 * @param  {number} [radius=1]
 * @param  {number} [tube=0.5]
 * @param  {number} [radialSegments=8]
 * @param  {number} [tubularSegments=6]
 * @param  {number} [arc=6.283185307179586]
 * @return {Trimesh} A torus
 */

Trimesh.createTorus = (radius = 1, tube = 0.5, radialSegments = 8, tubularSegments = 6, arc = Math.PI * 2) => {
  const vertices = [];
  const indices = [];

  for (let j = 0; j <= radialSegments; j++) {
    for (let i = 0; i <= tubularSegments; i++) {
      const u = i / tubularSegments * arc;
      const v = j / radialSegments * Math.PI * 2;
      const x = (radius + tube * Math.cos(v)) * Math.cos(u);
      const y = (radius + tube * Math.cos(v)) * Math.sin(u);
      const z = tube * Math.sin(v);
      vertices.push(x, y, z);
    }
  }

  for (let j = 1; j <= radialSegments; j++) {
    for (let i = 1; i <= tubularSegments; i++) {
      const a = (tubularSegments + 1) * j + i - 1;
      const b = (tubularSegments + 1) * (j - 1) + i - 1;
      const c = (tubularSegments + 1) * (j - 1) + i;
      const d = (tubularSegments + 1) * j + i;
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  return new Trimesh(vertices, indices);
};

/**
 * Constraint equation solver base class.
 * @class Solver
 * @constructor
 * @author schteppe / https://github.com/schteppe
 */
class Solver {
  // All equations to be solved
  constructor() {
    this.equations = [];
  }
  /**
   * Should be implemented in subclasses!
   * @method solve
   * @param  {Number} dt
   * @param  {World} world
   * @return {Number} number of iterations performed
   */


  solve(dt, world) {
    return (// Should return the number of iterations done!
      0
    );
  }
  /**
   * Add an equation
   * @method addEquation
   * @param {Equation} eq
   */


  addEquation(eq) {
    if (eq.enabled) {
      this.equations.push(eq);
    }
  }
  /**
   * Remove an equation
   * @method removeEquation
   * @param {Equation} eq
   */


  removeEquation(eq) {
    const eqs = this.equations;
    const i = eqs.indexOf(eq);

    if (i !== -1) {
      eqs.splice(i, 1);
    }
  }
  /**
   * Add all equations
   * @method removeAllEquations
   */


  removeAllEquations() {
    this.equations.length = 0;
  }

}

/**
 * Constraint equation Gauss-Seidel solver.
 * @class GSSolver
 * @constructor
 * @todo The spook parameters should be specified for each constraint, not globally.
 * @author schteppe / https://github.com/schteppe
 * @see https://www8.cs.umu.se/kurser/5DV058/VT09/lectures/spooknotes.pdf
 * @extends Solver
 */
class GSSolver extends Solver {
  // The number of solver iterations determines quality of the constraints in the world. The more iterations, the more correct simulation. More iterations need more computations though. If you have a large gravity force in your world, you will need more iterations.
  // When tolerance is reached, the system is assumed to be converged.
  constructor() {
    super();
    this.iterations = 10;
    this.tolerance = 1e-7;
  }
  /**
   * Solve
   * @method solve
   * @param  {Number} dt
   * @param  {World} world
   * @return {Number} number of iterations performed
   */


  solve(dt, world) {
    let iter = 0;
    const maxIter = this.iterations;
    const tolSquared = this.tolerance * this.tolerance;
    const equations = this.equations;
    const Neq = equations.length;
    const bodies = world.bodies;
    const Nbodies = bodies.length;
    const h = dt;
    let B;
    let invC;
    let deltalambda;
    let deltalambdaTot;
    let GWlambda;
    let lambdaj; // Update solve mass

    if (Neq !== 0) {
      for (let i = 0; i !== Nbodies; i++) {
        bodies[i].updateSolveMassProperties();
      }
    } // Things that does not change during iteration can be computed once


    const invCs = GSSolver_solve_invCs;
    const Bs = GSSolver_solve_Bs;
    const lambda = GSSolver_solve_lambda;
    invCs.length = Neq;
    Bs.length = Neq;
    lambda.length = Neq;

    for (let i = 0; i !== Neq; i++) {
      const c = equations[i];
      lambda[i] = 0.0;
      Bs[i] = c.computeB(h);
      invCs[i] = 1.0 / c.computeC();
    }

    if (Neq !== 0) {
      // Reset vlambda
      for (let i = 0; i !== Nbodies; i++) {
        const b = bodies[i];
        const vlambda = b.vlambda;
        const wlambda = b.wlambda;
        vlambda.set(0, 0, 0);
        wlambda.set(0, 0, 0);
      } // Iterate over equations


      for (iter = 0; iter !== maxIter; iter++) {
        // Accumulate the total error for each iteration.
        deltalambdaTot = 0.0;

        for (let j = 0; j !== Neq; j++) {
          const c = equations[j]; // Compute iteration

          B = Bs[j];
          invC = invCs[j];
          lambdaj = lambda[j];
          GWlambda = c.computeGWlambda();
          deltalambda = invC * (B - GWlambda - c.eps * lambdaj); // Clamp if we are not within the min/max interval

          if (lambdaj + deltalambda < c.minForce) {
            deltalambda = c.minForce - lambdaj;
          } else if (lambdaj + deltalambda > c.maxForce) {
            deltalambda = c.maxForce - lambdaj;
          }

          lambda[j] += deltalambda;
          deltalambdaTot += deltalambda > 0.0 ? deltalambda : -deltalambda; // abs(deltalambda)

          c.addToWlambda(deltalambda);
        } // If the total error is small enough - stop iterate


        if (deltalambdaTot * deltalambdaTot < tolSquared) {
          break;
        }
      } // Add result to velocity


      for (let i = 0; i !== Nbodies; i++) {
        const b = bodies[i];
        const v = b.velocity;
        const w = b.angularVelocity;
        b.vlambda.vmul(b.linearFactor, b.vlambda);
        v.vadd(b.vlambda, v);
        b.wlambda.vmul(b.angularFactor, b.wlambda);
        w.vadd(b.wlambda, w);
      } // Set the .multiplier property of each equation


      let l = equations.length;
      const invDt = 1 / h;

      while (l--) {
        equations[l].multiplier = lambda[l] * invDt;
      }
    }

    return iter;
  }

}
const GSSolver_solve_lambda = []; // Just temporary number holders that we want to reuse each solve.

const GSSolver_solve_invCs = [];
const GSSolver_solve_Bs = [];

/**
 * Splits the equations into islands and solves them independently. Can improve performance.
 * @class SplitSolver
 * @constructor
 * @extends Solver
 * @param {Solver} subsolver
 */
class SplitSolver extends Solver {
  // The number of solver iterations determines quality of the constraints in the world. The more iterations, the more correct simulation. More iterations need more computations though. If you have a large gravity force in your world, you will need more iterations.
  // When tolerance is reached, the system is assumed to be converged.
  constructor(subsolver) {
    super();
    this.iterations = 10;
    this.tolerance = 1e-7;
    this.subsolver = subsolver;
    this.nodes = [];
    this.nodePool = []; // Create needed nodes, reuse if possible

    while (this.nodePool.length < 128) {
      this.nodePool.push(this.createNode());
    }
  }

  createNode() {
    return {
      body: null,
      children: [],
      eqs: [],
      visited: false
    };
  }
  /**
   * Solve the subsystems
   * @method solve
   * @param  {Number} dt
   * @param  {World} world
   * @return {Number} number of iterations performed
   */


  solve(dt, world) {
    const nodes = SplitSolver_solve_nodes;
    const nodePool = this.nodePool;
    const bodies = world.bodies;
    const equations = this.equations;
    const Neq = equations.length;
    const Nbodies = bodies.length;
    const subsolver = this.subsolver; // Create needed nodes, reuse if possible

    while (nodePool.length < Nbodies) {
      nodePool.push(this.createNode());
    }

    nodes.length = Nbodies;

    for (let i = 0; i < Nbodies; i++) {
      nodes[i] = nodePool[i];
    } // Reset node values


    for (let i = 0; i !== Nbodies; i++) {
      const node = nodes[i];
      node.body = bodies[i];
      node.children.length = 0;
      node.eqs.length = 0;
      node.visited = false;
    }

    for (let k = 0; k !== Neq; k++) {
      const eq = equations[k];
      const i = bodies.indexOf(eq.bi);
      const j = bodies.indexOf(eq.bj);
      const ni = nodes[i];
      const nj = nodes[j];
      ni.children.push(nj);
      ni.eqs.push(eq);
      nj.children.push(ni);
      nj.eqs.push(eq);
    }

    let child;
    let n = 0;
    let eqs = SplitSolver_solve_eqs;
    subsolver.tolerance = this.tolerance;
    subsolver.iterations = this.iterations;
    const dummyWorld = SplitSolver_solve_dummyWorld;

    while (child = getUnvisitedNode(nodes)) {
      eqs.length = 0;
      dummyWorld.bodies.length = 0;
      bfs(child, visitFunc, dummyWorld.bodies, eqs);
      const Neqs = eqs.length;
      eqs = eqs.sort(sortById);

      for (let i = 0; i !== Neqs; i++) {
        subsolver.addEquation(eqs[i]);
      }

      const iter = subsolver.solve(dt, dummyWorld);
      subsolver.removeAllEquations();
      n++;
    }

    return n;
  }

} // Returns the number of subsystems

const SplitSolver_solve_nodes = []; // All allocated node objects

const SplitSolver_solve_eqs = []; // Temp array

const SplitSolver_solve_dummyWorld = {
  bodies: []
}; // Temp object

const STATIC = Body.STATIC;

function getUnvisitedNode(nodes) {
  const Nnodes = nodes.length;

  for (let i = 0; i !== Nnodes; i++) {
    const node = nodes[i];

    if (!node.visited && !(node.body.type & STATIC)) {
      return node;
    }
  }

  return false;
}

const queue = [];

function bfs(root, visitFunc, bds, eqs) {
  queue.push(root);
  root.visited = true;
  visitFunc(root, bds, eqs);

  while (queue.length) {
    const node = queue.pop(); // Loop over unvisited child nodes

    let child;

    while (child = getUnvisitedNode(node.children)) {
      child.visited = true;
      visitFunc(child, bds, eqs);
      queue.push(child);
    }
  }
}

function visitFunc(node, bds, eqs) {
  bds.push(node.body);
  const Neqs = node.eqs.length;

  for (let i = 0; i !== Neqs; i++) {
    const eq = node.eqs[i];

    if (!eqs.includes(eq)) {
      eqs.push(eq);
    }
  }
}

function sortById(a, b) {
  return b.id - a.id;
}

/**
 * For pooling objects that can be reused.
 * @class Pool
 * @constructor
 */
class Pool {
  constructor() {
    this.objects = [];
    this.type = Object;
  }
  /**
   * Release an object after use
   * @method release
   * @param {Object} obj
   */


  release(...args) {
    const Nargs = args.length;

    for (let i = 0; i !== Nargs; i++) {
      this.objects.push(args[i]);
    }

    return this;
  }
  /**
   * Get an object
   * @method get
   * @return {mixed}
   */


  get() {
    if (this.objects.length === 0) {
      return this.constructObject();
    } else {
      return this.objects.pop();
    }
  }
  /**
   * Construct an object. Should be implemented in each subclass.
   * @method constructObject
   * @return {mixed}
   */


  constructObject() {
    throw new Error('constructObject() not implemented in this Pool subclass yet!');
  }
  /**
   * @method resize
   * @param {number} size
   * @return {Pool} Self, for chaining
   */


  resize(size) {
    const objects = this.objects;

    while (objects.length > size) {
      objects.pop();
    }

    while (objects.length < size) {
      objects.push(this.constructObject());
    }

    return this;
  }

}

/**
 * @class Vec3Pool
 * @constructor
 * @extends Pool
 */

class Vec3Pool extends Pool {
  constructor() {
    super();
    this.type = Vec3;
  }
  /**
   * Construct a vector
   * @method constructObject
   * @return {Vec3}
   */


  constructObject() {
    return new Vec3();
  }

}

const COLLISION_TYPES = {
  sphereSphere: Shape.types.SPHERE,
  spherePlane: Shape.types.SPHERE | Shape.types.PLANE,
  boxBox: Shape.types.BOX | Shape.types.BOX,
  sphereBox: Shape.types.SPHERE | Shape.types.BOX,
  planeBox: Shape.types.PLANE | Shape.types.BOX,
  convexConvex: Shape.types.CONVEXPOLYHEDRON,
  sphereConvex: Shape.types.SPHERE | Shape.types.CONVEXPOLYHEDRON,
  planeConvex: Shape.types.PLANE | Shape.types.CONVEXPOLYHEDRON,
  boxConvex: Shape.types.BOX | Shape.types.CONVEXPOLYHEDRON,
  sphereHeightfield: Shape.types.SPHERE | Shape.types.HEIGHTFIELD,
  boxHeightfield: Shape.types.BOX | Shape.types.HEIGHTFIELD,
  convexHeightfield: Shape.types.CONVEXPOLYHEDRON | Shape.types.HEIGHTFIELD,
  sphereParticle: Shape.types.PARTICLE | Shape.types.SPHERE,
  planeParticle: Shape.types.PLANE | Shape.types.PARTICLE,
  boxParticle: Shape.types.BOX | Shape.types.PARTICLE,
  convexParticle: Shape.types.PARTICLE | Shape.types.CONVEXPOLYHEDRON,
  sphereTrimesh: Shape.types.SPHERE | Shape.types.TRIMESH,
  planeTrimesh: Shape.types.PLANE | Shape.types.TRIMESH
};

/**
 * Helper class for the World. Generates ContactEquations.
 * @class Narrowphase
 * @constructor
 * @todo Sphere-ConvexPolyhedron contacts
 * @todo Contact reduction
 * @todo should move methods to prototype
 */
class Narrowphase {
  // Internal storage of pooled contact points.
  // Pooled vectors.
  constructor(world) {
    this.contactPointPool = [];
    this.frictionEquationPool = [];
    this.result = [];
    this.frictionResult = [];
    this.v3pool = new Vec3Pool();
    this.world = world;
    this.currentContactMaterial = world.defaultContactMaterial;
    this.enableFrictionReduction = false;
  }
  /**
   * Make a contact object, by using the internal pool or creating a new one.
   * @method createContactEquation
   * @param {Body} bi
   * @param {Body} bj
   * @param {Shape} si
   * @param {Shape} sj
   * @param {Shape} overrideShapeA
   * @param {Shape} overrideShapeB
   * @return {ContactEquation}
   */


  createContactEquation(bi, bj, si, sj, overrideShapeA, overrideShapeB) {
    let c;

    if (this.contactPointPool.length) {
      c = this.contactPointPool.pop();
      c.bi = bi;
      c.bj = bj;
    } else {
      c = new ContactEquation(bi, bj);
    }

    c.enabled = bi.collisionResponse && bj.collisionResponse && si.collisionResponse && sj.collisionResponse;
    const cm = this.currentContactMaterial;
    c.restitution = cm.restitution;
    c.setSpookParams(cm.contactEquationStiffness, cm.contactEquationRelaxation, this.world.dt);
    const matA = si.material || bi.material;
    const matB = sj.material || bj.material;

    if (matA && matB && matA.restitution >= 0 && matB.restitution >= 0) {
      c.restitution = matA.restitution * matB.restitution;
    }

    c.si = overrideShapeA || si;
    c.sj = overrideShapeB || sj;
    return c;
  }

  createFrictionEquationsFromContact(contactEquation, outArray) {
    const bodyA = contactEquation.bi;
    const bodyB = contactEquation.bj;
    const shapeA = contactEquation.si;
    const shapeB = contactEquation.sj;
    const world = this.world;
    const cm = this.currentContactMaterial; // If friction or restitution were specified in the material, use them

    let friction = cm.friction;
    const matA = shapeA.material || bodyA.material;
    const matB = shapeB.material || bodyB.material;

    if (matA && matB && matA.friction >= 0 && matB.friction >= 0) {
      friction = matA.friction * matB.friction;
    }

    if (friction > 0) {
      // Create 2 tangent equations
      const mug = friction * world.gravity.length();
      let reducedMass = bodyA.invMass + bodyB.invMass;

      if (reducedMass > 0) {
        reducedMass = 1 / reducedMass;
      }

      const pool = this.frictionEquationPool;
      const c1 = pool.length ? pool.pop() : new FrictionEquation(bodyA, bodyB, mug * reducedMass);
      const c2 = pool.length ? pool.pop() : new FrictionEquation(bodyA, bodyB, mug * reducedMass);
      c1.bi = c2.bi = bodyA;
      c1.bj = c2.bj = bodyB;
      c1.minForce = c2.minForce = -mug * reducedMass;
      c1.maxForce = c2.maxForce = mug * reducedMass; // Copy over the relative vectors

      c1.ri.copy(contactEquation.ri);
      c1.rj.copy(contactEquation.rj);
      c2.ri.copy(contactEquation.ri);
      c2.rj.copy(contactEquation.rj); // Construct tangents

      contactEquation.ni.tangents(c1.t, c2.t); // Set spook params

      c1.setSpookParams(cm.frictionEquationStiffness, cm.frictionEquationRelaxation, world.dt);
      c2.setSpookParams(cm.frictionEquationStiffness, cm.frictionEquationRelaxation, world.dt);
      c1.enabled = c2.enabled = contactEquation.enabled;
      outArray.push(c1, c2);
      return true;
    }

    return false;
  } // Take the average N latest contact point on the plane.


  createFrictionFromAverage(numContacts) {
    // The last contactEquation
    let c = this.result[this.result.length - 1]; // Create the result: two "average" friction equations

    if (!this.createFrictionEquationsFromContact(c, this.frictionResult) || numContacts === 1) {
      return;
    }

    const f1 = this.frictionResult[this.frictionResult.length - 2];
    const f2 = this.frictionResult[this.frictionResult.length - 1];
    averageNormal.setZero();
    averageContactPointA.setZero();
    averageContactPointB.setZero();
    const bodyA = c.bi;
    const bodyB = c.bj;

    for (let i = 0; i !== numContacts; i++) {
      c = this.result[this.result.length - 1 - i];

      if (c.bi !== bodyA) {
        averageNormal.vadd(c.ni, averageNormal);
        averageContactPointA.vadd(c.ri, averageContactPointA);
        averageContactPointB.vadd(c.rj, averageContactPointB);
      } else {
        averageNormal.vsub(c.ni, averageNormal);
        averageContactPointA.vadd(c.rj, averageContactPointA);
        averageContactPointB.vadd(c.ri, averageContactPointB);
      }
    }

    const invNumContacts = 1 / numContacts;
    averageContactPointA.scale(invNumContacts, f1.ri);
    averageContactPointB.scale(invNumContacts, f1.rj);
    f2.ri.copy(f1.ri); // Should be the same

    f2.rj.copy(f1.rj);
    averageNormal.normalize();
    averageNormal.tangents(f1.t, f2.t); // return eq;
  }
  /**
   * Generate all contacts between a list of body pairs
   * @method getContacts
   * @param {array} p1 Array of body indices
   * @param {array} p2 Array of body indices
   * @param {World} world
   * @param {array} result Array to store generated contacts
   * @param {array} oldcontacts Optional. Array of reusable contact objects
   */


  getContacts(p1, p2, world, result, oldcontacts, frictionResult, frictionPool) {
    // Save old contact objects
    this.contactPointPool = oldcontacts;
    this.frictionEquationPool = frictionPool;
    this.result = result;
    this.frictionResult = frictionResult;
    const qi = tmpQuat1;
    const qj = tmpQuat2;
    const xi = tmpVec1$2;
    const xj = tmpVec2$2;

    for (let k = 0, N = p1.length; k !== N; k++) {
      // Get current collision bodies
      const bi = p1[k];
      const bj = p2[k]; // Get contact material

      let bodyContactMaterial = null;

      if (bi.material && bj.material) {
        bodyContactMaterial = world.getContactMaterial(bi.material, bj.material) || null;
      }

      const justTest = bi.type & Body.KINEMATIC && bj.type & Body.STATIC || bi.type & Body.STATIC && bj.type & Body.KINEMATIC || bi.type & Body.KINEMATIC && bj.type & Body.KINEMATIC;

      for (let i = 0; i < bi.shapes.length; i++) {
        bi.quaternion.mult(bi.shapeOrientations[i], qi);
        bi.quaternion.vmult(bi.shapeOffsets[i], xi);
        xi.vadd(bi.position, xi);
        const si = bi.shapes[i];

        for (let j = 0; j < bj.shapes.length; j++) {
          // Compute world transform of shapes
          bj.quaternion.mult(bj.shapeOrientations[j], qj);
          bj.quaternion.vmult(bj.shapeOffsets[j], xj);
          xj.vadd(bj.position, xj);
          const sj = bj.shapes[j];

          if (!(si.collisionFilterMask & sj.collisionFilterGroup && sj.collisionFilterMask & si.collisionFilterGroup)) {
            continue;
          }

          if (xi.distanceTo(xj) > si.boundingSphereRadius + sj.boundingSphereRadius) {
            continue;
          } // Get collision material


          let shapeContactMaterial = null;

          if (si.material && sj.material) {
            shapeContactMaterial = world.getContactMaterial(si.material, sj.material) || null;
          }

          this.currentContactMaterial = shapeContactMaterial || bodyContactMaterial || world.defaultContactMaterial; // Get contacts

          const resolverIndex = si.type | sj.type;
          const resolver = this[resolverIndex];

          if (resolver) {
            let retval = false; // TO DO: investigate why sphereParticle and convexParticle
            // resolvers expect si and sj shapes to be in reverse order
            // (i.e. larger integer value type first instead of smaller first)

            if (si.type < sj.type) {
              retval = resolver.call(this, si, sj, xi, xj, qi, qj, bi, bj, si, sj, justTest);
            } else {
              retval = resolver.call(this, sj, si, xj, xi, qj, qi, bj, bi, si, sj, justTest);
            }

            if (retval && justTest) {
              // Register overlap
              world.shapeOverlapKeeper.set(si.id, sj.id);
              world.bodyOverlapKeeper.set(bi.id, bj.id);
            }
          }
        }
      }
    }
  }

  sphereSphere(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
    if (justTest) {
      return xi.distanceSquared(xj) < (si.radius + sj.radius) ** 2;
    } // We will have only one contact in this case


    const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj); // Contact normal

    xj.vsub(xi, r.ni);
    r.ni.normalize(); // Contact point locations

    r.ri.copy(r.ni);
    r.rj.copy(r.ni);
    r.ri.scale(si.radius, r.ri);
    r.rj.scale(-sj.radius, r.rj);
    r.ri.vadd(xi, r.ri);
    r.ri.vsub(bi.position, r.ri);
    r.rj.vadd(xj, r.rj);
    r.rj.vsub(bj.position, r.rj);
    this.result.push(r);
    this.createFrictionEquationsFromContact(r, this.frictionResult);
  }

  spherePlane(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
    // We will have one contact in this case
    const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj); // Contact normal

    r.ni.set(0, 0, 1);
    qj.vmult(r.ni, r.ni);
    r.ni.negate(r.ni); // body i is the sphere, flip normal

    r.ni.normalize(); // Needed?
    // Vector from sphere center to contact point

    r.ni.scale(si.radius, r.ri); // Project down sphere on plane

    xi.vsub(xj, point_on_plane_to_sphere);
    r.ni.scale(r.ni.dot(point_on_plane_to_sphere), plane_to_sphere_ortho);
    point_on_plane_to_sphere.vsub(plane_to_sphere_ortho, r.rj); // The sphere position projected to plane

    if (-point_on_plane_to_sphere.dot(r.ni) <= si.radius) {
      if (justTest) {
        return true;
      } // Make it relative to the body


      const ri = r.ri;
      const rj = r.rj;
      ri.vadd(xi, ri);
      ri.vsub(bi.position, ri);
      rj.vadd(xj, rj);
      rj.vsub(bj.position, rj);
      this.result.push(r);
      this.createFrictionEquationsFromContact(r, this.frictionResult);
    }
  }

  boxBox(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
    si.convexPolyhedronRepresentation.material = si.material;
    sj.convexPolyhedronRepresentation.material = sj.material;
    si.convexPolyhedronRepresentation.collisionResponse = si.collisionResponse;
    sj.convexPolyhedronRepresentation.collisionResponse = sj.collisionResponse;
    return this.convexConvex(si.convexPolyhedronRepresentation, sj.convexPolyhedronRepresentation, xi, xj, qi, qj, bi, bj, si, sj, justTest);
  }

  sphereBox(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
    const v3pool = this.v3pool; // we refer to the box as body j

    const sides = sphereBox_sides;
    xi.vsub(xj, box_to_sphere);
    sj.getSideNormals(sides, qj);
    const R = si.radius;

    let found = false; // Store the resulting side penetration info

    const side_ns = sphereBox_side_ns;
    const side_ns1 = sphereBox_side_ns1;
    const side_ns2 = sphereBox_side_ns2;
    let side_h = null;
    let side_penetrations = 0;
    let side_dot1 = 0;
    let side_dot2 = 0;
    let side_distance = null;

    for (let idx = 0, nsides = sides.length; idx !== nsides && found === false; idx++) {
      // Get the plane side normal (ns)
      const ns = sphereBox_ns;
      ns.copy(sides[idx]);
      const h = ns.length();
      ns.normalize(); // The normal/distance dot product tells which side of the plane we are

      const dot = box_to_sphere.dot(ns);

      if (dot < h + R && dot > 0) {
        // Intersects plane. Now check the other two dimensions
        const ns1 = sphereBox_ns1;
        const ns2 = sphereBox_ns2;
        ns1.copy(sides[(idx + 1) % 3]);
        ns2.copy(sides[(idx + 2) % 3]);
        const h1 = ns1.length();
        const h2 = ns2.length();
        ns1.normalize();
        ns2.normalize();
        const dot1 = box_to_sphere.dot(ns1);
        const dot2 = box_to_sphere.dot(ns2);

        if (dot1 < h1 && dot1 > -h1 && dot2 < h2 && dot2 > -h2) {
          const dist = Math.abs(dot - h - R);

          if (side_distance === null || dist < side_distance) {
            side_distance = dist;
            side_dot1 = dot1;
            side_dot2 = dot2;
            side_h = h;
            side_ns.copy(ns);
            side_ns1.copy(ns1);
            side_ns2.copy(ns2);
            side_penetrations++;

            if (justTest) {
              return true;
            }
          }
        }
      }
    }

    if (side_penetrations) {
      found = true;
      const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
      side_ns.scale(-R, r.ri); // Sphere r

      r.ni.copy(side_ns);
      r.ni.negate(r.ni); // Normal should be out of sphere

      side_ns.scale(side_h, side_ns);
      side_ns1.scale(side_dot1, side_ns1);
      side_ns.vadd(side_ns1, side_ns);
      side_ns2.scale(side_dot2, side_ns2);
      side_ns.vadd(side_ns2, r.rj); // Make relative to bodies

      r.ri.vadd(xi, r.ri);
      r.ri.vsub(bi.position, r.ri);
      r.rj.vadd(xj, r.rj);
      r.rj.vsub(bj.position, r.rj);
      this.result.push(r);
      this.createFrictionEquationsFromContact(r, this.frictionResult);
    } // Check corners


    let rj = v3pool.get();
    const sphere_to_corner = sphereBox_sphere_to_corner;

    for (let j = 0; j !== 2 && !found; j++) {
      for (let k = 0; k !== 2 && !found; k++) {
        for (let l = 0; l !== 2 && !found; l++) {
          rj.set(0, 0, 0);

          if (j) {
            rj.vadd(sides[0], rj);
          } else {
            rj.vsub(sides[0], rj);
          }

          if (k) {
            rj.vadd(sides[1], rj);
          } else {
            rj.vsub(sides[1], rj);
          }

          if (l) {
            rj.vadd(sides[2], rj);
          } else {
            rj.vsub(sides[2], rj);
          } // World position of corner


          xj.vadd(rj, sphere_to_corner);
          sphere_to_corner.vsub(xi, sphere_to_corner);

          if (sphere_to_corner.lengthSquared() < R * R) {
            if (justTest) {
              return true;
            }

            found = true;
            const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
            r.ri.copy(sphere_to_corner);
            r.ri.normalize();
            r.ni.copy(r.ri);
            r.ri.scale(R, r.ri);
            r.rj.copy(rj); // Make relative to bodies

            r.ri.vadd(xi, r.ri);
            r.ri.vsub(bi.position, r.ri);
            r.rj.vadd(xj, r.rj);
            r.rj.vsub(bj.position, r.rj);
            this.result.push(r);
            this.createFrictionEquationsFromContact(r, this.frictionResult);
          }
        }
      }
    }

    v3pool.release(rj);
    rj = null; // Check edges

    const edgeTangent = v3pool.get();
    const edgeCenter = v3pool.get();
    const r = v3pool.get(); // r = edge center to sphere center

    const orthogonal = v3pool.get();
    const dist = v3pool.get();
    const Nsides = sides.length;

    for (let j = 0; j !== Nsides && !found; j++) {
      for (let k = 0; k !== Nsides && !found; k++) {
        if (j % 3 !== k % 3) {
          // Get edge tangent
          sides[k].cross(sides[j], edgeTangent);
          edgeTangent.normalize();
          sides[j].vadd(sides[k], edgeCenter);
          r.copy(xi);
          r.vsub(edgeCenter, r);
          r.vsub(xj, r);
          const orthonorm = r.dot(edgeTangent); // distance from edge center to sphere center in the tangent direction

          edgeTangent.scale(orthonorm, orthogonal); // Vector from edge center to sphere center in the tangent direction
          // Find the third side orthogonal to this one

          let l = 0;

          while (l === j % 3 || l === k % 3) {
            l++;
          } // vec from edge center to sphere projected to the plane orthogonal to the edge tangent


          dist.copy(xi);
          dist.vsub(orthogonal, dist);
          dist.vsub(edgeCenter, dist);
          dist.vsub(xj, dist); // Distances in tangent direction and distance in the plane orthogonal to it

          const tdist = Math.abs(orthonorm);
          const ndist = dist.length();

          if (tdist < sides[l].length() && ndist < R) {
            if (justTest) {
              return true;
            }

            found = true;
            const res = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
            edgeCenter.vadd(orthogonal, res.rj); // box rj

            res.rj.copy(res.rj);
            dist.negate(res.ni);
            res.ni.normalize();
            res.ri.copy(res.rj);
            res.ri.vadd(xj, res.ri);
            res.ri.vsub(xi, res.ri);
            res.ri.normalize();
            res.ri.scale(R, res.ri); // Make relative to bodies

            res.ri.vadd(xi, res.ri);
            res.ri.vsub(bi.position, res.ri);
            res.rj.vadd(xj, res.rj);
            res.rj.vsub(bj.position, res.rj);
            this.result.push(res);
            this.createFrictionEquationsFromContact(res, this.frictionResult);
          }
        }
      }
    }

    v3pool.release(edgeTangent, edgeCenter, r, orthogonal, dist);
  }

  planeBox(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
    sj.convexPolyhedronRepresentation.material = sj.material;
    sj.convexPolyhedronRepresentation.collisionResponse = sj.collisionResponse;
    sj.convexPolyhedronRepresentation.id = sj.id;
    return this.planeConvex(si, sj.convexPolyhedronRepresentation, xi, xj, qi, qj, bi, bj, si, sj, justTest);
  }

  convexConvex(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest, faceListA, faceListB) {
    const sepAxis = convexConvex_sepAxis;

    if (xi.distanceTo(xj) > si.boundingSphereRadius + sj.boundingSphereRadius) {
      return;
    }

    if (si.findSeparatingAxis(sj, xi, qi, xj, qj, sepAxis, faceListA, faceListB)) {
      const res = [];
      const q = convexConvex_q;
      si.clipAgainstHull(xi, qi, sj, xj, qj, sepAxis, -100, 100, res);
      let numContacts = 0;

      for (let j = 0; j !== res.length; j++) {
        if (justTest) {
          return true;
        }

        const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
        const ri = r.ri;
        const rj = r.rj;
        sepAxis.negate(r.ni);
        res[j].normal.negate(q);
        q.scale(res[j].depth, q);
        res[j].point.vadd(q, ri);
        rj.copy(res[j].point); // Contact points are in world coordinates. Transform back to relative

        ri.vsub(xi, ri);
        rj.vsub(xj, rj); // Make relative to bodies

        ri.vadd(xi, ri);
        ri.vsub(bi.position, ri);
        rj.vadd(xj, rj);
        rj.vsub(bj.position, rj);
        this.result.push(r);
        numContacts++;

        if (!this.enableFrictionReduction) {
          this.createFrictionEquationsFromContact(r, this.frictionResult);
        }
      }

      if (this.enableFrictionReduction && numContacts) {
        this.createFrictionFromAverage(numContacts);
      }
    }
  }

  sphereConvex(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
    const v3pool = this.v3pool;
    xi.vsub(xj, convex_to_sphere);
    const normals = sj.faceNormals;
    const faces = sj.faces;
    const verts = sj.vertices;
    const R = si.radius;
    //     return;
    // }

    let found = false; // Check corners

    for (let i = 0; i !== verts.length; i++) {
      const v = verts[i]; // World position of corner

      const worldCorner = sphereConvex_worldCorner;
      qj.vmult(v, worldCorner);
      xj.vadd(worldCorner, worldCorner);
      const sphere_to_corner = sphereConvex_sphereToCorner;
      worldCorner.vsub(xi, sphere_to_corner);

      if (sphere_to_corner.lengthSquared() < R * R) {
        if (justTest) {
          return true;
        }

        found = true;
        const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
        r.ri.copy(sphere_to_corner);
        r.ri.normalize();
        r.ni.copy(r.ri);
        r.ri.scale(R, r.ri);
        worldCorner.vsub(xj, r.rj); // Should be relative to the body.

        r.ri.vadd(xi, r.ri);
        r.ri.vsub(bi.position, r.ri); // Should be relative to the body.

        r.rj.vadd(xj, r.rj);
        r.rj.vsub(bj.position, r.rj);
        this.result.push(r);
        this.createFrictionEquationsFromContact(r, this.frictionResult);
        return;
      }
    } // Check side (plane) intersections


    for (let i = 0, nfaces = faces.length; i !== nfaces && found === false; i++) {
      const normal = normals[i];
      const face = faces[i]; // Get world-transformed normal of the face

      const worldNormal = sphereConvex_worldNormal;
      qj.vmult(normal, worldNormal); // Get a world vertex from the face

      const worldPoint = sphereConvex_worldPoint;
      qj.vmult(verts[face[0]], worldPoint);
      worldPoint.vadd(xj, worldPoint); // Get a point on the sphere, closest to the face normal

      const worldSpherePointClosestToPlane = sphereConvex_worldSpherePointClosestToPlane;
      worldNormal.scale(-R, worldSpherePointClosestToPlane);
      xi.vadd(worldSpherePointClosestToPlane, worldSpherePointClosestToPlane); // Vector from a face point to the closest point on the sphere

      const penetrationVec = sphereConvex_penetrationVec;
      worldSpherePointClosestToPlane.vsub(worldPoint, penetrationVec); // The penetration. Negative value means overlap.

      const penetration = penetrationVec.dot(worldNormal);
      const worldPointToSphere = sphereConvex_sphereToWorldPoint;
      xi.vsub(worldPoint, worldPointToSphere);

      if (penetration < 0 && worldPointToSphere.dot(worldNormal) > 0) {
        // Intersects plane. Now check if the sphere is inside the face polygon
        const faceVerts = []; // Face vertices, in world coords

        for (let j = 0, Nverts = face.length; j !== Nverts; j++) {
          const worldVertex = v3pool.get();
          qj.vmult(verts[face[j]], worldVertex);
          xj.vadd(worldVertex, worldVertex);
          faceVerts.push(worldVertex);
        }

        if (pointInPolygon(faceVerts, worldNormal, xi)) {
          // Is the sphere center in the face polygon?
          if (justTest) {
            return true;
          }

          found = true;
          const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
          worldNormal.scale(-R, r.ri); // Contact offset, from sphere center to contact

          worldNormal.negate(r.ni); // Normal pointing out of sphere

          const penetrationVec2 = v3pool.get();
          worldNormal.scale(-penetration, penetrationVec2);
          const penetrationSpherePoint = v3pool.get();
          worldNormal.scale(-R, penetrationSpherePoint); //xi.vsub(xj).vadd(penetrationSpherePoint).vadd(penetrationVec2 , r.rj);

          xi.vsub(xj, r.rj);
          r.rj.vadd(penetrationSpherePoint, r.rj);
          r.rj.vadd(penetrationVec2, r.rj); // Should be relative to the body.

          r.rj.vadd(xj, r.rj);
          r.rj.vsub(bj.position, r.rj); // Should be relative to the body.

          r.ri.vadd(xi, r.ri);
          r.ri.vsub(bi.position, r.ri);
          v3pool.release(penetrationVec2);
          v3pool.release(penetrationSpherePoint);
          this.result.push(r);
          this.createFrictionEquationsFromContact(r, this.frictionResult); // Release world vertices

          for (let j = 0, Nfaceverts = faceVerts.length; j !== Nfaceverts; j++) {
            v3pool.release(faceVerts[j]);
          }

          return; // We only expect *one* face contact
        } else {
          // Edge?
          for (let j = 0; j !== face.length; j++) {
            // Get two world transformed vertices
            const v1 = v3pool.get();
            const v2 = v3pool.get();
            qj.vmult(verts[face[(j + 1) % face.length]], v1);
            qj.vmult(verts[face[(j + 2) % face.length]], v2);
            xj.vadd(v1, v1);
            xj.vadd(v2, v2); // Construct edge vector

            const edge = sphereConvex_edge;
            v2.vsub(v1, edge); // Construct the same vector, but normalized

            const edgeUnit = sphereConvex_edgeUnit;
            edge.unit(edgeUnit); // p is xi projected onto the edge

            const p = v3pool.get();
            const v1_to_xi = v3pool.get();
            xi.vsub(v1, v1_to_xi);
            const dot = v1_to_xi.dot(edgeUnit);
            edgeUnit.scale(dot, p);
            p.vadd(v1, p); // Compute a vector from p to the center of the sphere

            const xi_to_p = v3pool.get();
            p.vsub(xi, xi_to_p); // Collision if the edge-sphere distance is less than the radius
            // AND if p is in between v1 and v2

            if (dot > 0 && dot * dot < edge.lengthSquared() && xi_to_p.lengthSquared() < R * R) {
              // Collision if the edge-sphere distance is less than the radius
              // Edge contact!
              if (justTest) {
                return true;
              }

              const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
              p.vsub(xj, r.rj);
              p.vsub(xi, r.ni);
              r.ni.normalize();
              r.ni.scale(R, r.ri); // Should be relative to the body.

              r.rj.vadd(xj, r.rj);
              r.rj.vsub(bj.position, r.rj); // Should be relative to the body.

              r.ri.vadd(xi, r.ri);
              r.ri.vsub(bi.position, r.ri);
              this.result.push(r);
              this.createFrictionEquationsFromContact(r, this.frictionResult); // Release world vertices

              for (let j = 0, Nfaceverts = faceVerts.length; j !== Nfaceverts; j++) {
                v3pool.release(faceVerts[j]);
              }

              v3pool.release(v1);
              v3pool.release(v2);
              v3pool.release(p);
              v3pool.release(xi_to_p);
              v3pool.release(v1_to_xi);
              return;
            }

            v3pool.release(v1);
            v3pool.release(v2);
            v3pool.release(p);
            v3pool.release(xi_to_p);
            v3pool.release(v1_to_xi);
          }
        } // Release world vertices


        for (let j = 0, Nfaceverts = faceVerts.length; j !== Nfaceverts; j++) {
          v3pool.release(faceVerts[j]);
        }
      }
    }
  }

  planeConvex(planeShape, convexShape, planePosition, convexPosition, planeQuat, convexQuat, planeBody, convexBody, si, sj, justTest) {
    // Simply return the points behind the plane.
    const worldVertex = planeConvex_v;
    const worldNormal = planeConvex_normal;
    worldNormal.set(0, 0, 1);
    planeQuat.vmult(worldNormal, worldNormal); // Turn normal according to plane orientation

    let numContacts = 0;
    const relpos = planeConvex_relpos;

    for (let i = 0; i !== convexShape.vertices.length; i++) {
      // Get world convex vertex
      worldVertex.copy(convexShape.vertices[i]);
      convexQuat.vmult(worldVertex, worldVertex);
      convexPosition.vadd(worldVertex, worldVertex);
      worldVertex.vsub(planePosition, relpos);
      const dot = worldNormal.dot(relpos);

      if (dot <= 0.0) {
        if (justTest) {
          return true;
        }

        const r = this.createContactEquation(planeBody, convexBody, planeShape, convexShape, si, sj); // Get vertex position projected on plane

        const projected = planeConvex_projected;
        worldNormal.scale(worldNormal.dot(relpos), projected);
        worldVertex.vsub(projected, projected);
        projected.vsub(planePosition, r.ri); // From plane to vertex projected on plane

        r.ni.copy(worldNormal); // Contact normal is the plane normal out from plane
        // rj is now just the vector from the convex center to the vertex

        worldVertex.vsub(convexPosition, r.rj); // Make it relative to the body

        r.ri.vadd(planePosition, r.ri);
        r.ri.vsub(planeBody.position, r.ri);
        r.rj.vadd(convexPosition, r.rj);
        r.rj.vsub(convexBody.position, r.rj);
        this.result.push(r);
        numContacts++;

        if (!this.enableFrictionReduction) {
          this.createFrictionEquationsFromContact(r, this.frictionResult);
        }
      }
    }

    if (this.enableFrictionReduction && numContacts) {
      this.createFrictionFromAverage(numContacts);
    }
  }

  boxConvex(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
    si.convexPolyhedronRepresentation.material = si.material;
    si.convexPolyhedronRepresentation.collisionResponse = si.collisionResponse;
    return this.convexConvex(si.convexPolyhedronRepresentation, sj, xi, xj, qi, qj, bi, bj, si, sj, justTest);
  }

  sphereHeightfield(sphereShape, hfShape, spherePos, hfPos, sphereQuat, hfQuat, sphereBody, hfBody, rsi, rsj, justTest) {
    const data = hfShape.data;
    const radius = sphereShape.radius;
    const w = hfShape.elementSize;
    const worldPillarOffset = sphereHeightfield_tmp2; // Get sphere position to heightfield local!

    const localSpherePos = sphereHeightfield_tmp1;
    Transform.pointToLocalFrame(hfPos, hfQuat, spherePos, localSpherePos); // Get the index of the data points to test against

    let iMinX = Math.floor((localSpherePos.x - radius) / w) - 1;
    let iMaxX = Math.ceil((localSpherePos.x + radius) / w) + 1;
    let iMinY = Math.floor((localSpherePos.y - radius) / w) - 1;
    let iMaxY = Math.ceil((localSpherePos.y + radius) / w) + 1; // Bail out if we are out of the terrain

    if (iMaxX < 0 || iMaxY < 0 || iMinX > data.length || iMinY > data[0].length) {
      return;
    } // Clamp index to edges


    if (iMinX < 0) {
      iMinX = 0;
    }

    if (iMaxX < 0) {
      iMaxX = 0;
    }

    if (iMinY < 0) {
      iMinY = 0;
    }

    if (iMaxY < 0) {
      iMaxY = 0;
    }

    if (iMinX >= data.length) {
      iMinX = data.length - 1;
    }

    if (iMaxX >= data.length) {
      iMaxX = data.length - 1;
    }

    if (iMaxY >= data[0].length) {
      iMaxY = data[0].length - 1;
    }

    if (iMinY >= data[0].length) {
      iMinY = data[0].length - 1;
    }

    const minMax = [];
    hfShape.getRectMinMax(iMinX, iMinY, iMaxX, iMaxY, minMax);
    const min = minMax[0];
    const max = minMax[1]; // Bail out if we can't touch the bounding height box

    if (localSpherePos.z - radius > max || localSpherePos.z + radius < min) {
      return;
    }

    const result = this.result;

    for (let i = iMinX; i < iMaxX; i++) {
      for (let j = iMinY; j < iMaxY; j++) {
        const numContactsBefore = result.length;
        let intersecting = false; // Lower triangle

        hfShape.getConvexTrianglePillar(i, j, false);
        Transform.pointToWorldFrame(hfPos, hfQuat, hfShape.pillarOffset, worldPillarOffset);

        if (spherePos.distanceTo(worldPillarOffset) < hfShape.pillarConvex.boundingSphereRadius + sphereShape.boundingSphereRadius) {
          intersecting = this.sphereConvex(sphereShape, hfShape.pillarConvex, spherePos, worldPillarOffset, sphereQuat, hfQuat, sphereBody, hfBody, sphereShape, hfShape, justTest);
        }

        if (justTest && intersecting) {
          return true;
        } // Upper triangle


        hfShape.getConvexTrianglePillar(i, j, true);
        Transform.pointToWorldFrame(hfPos, hfQuat, hfShape.pillarOffset, worldPillarOffset);

        if (spherePos.distanceTo(worldPillarOffset) < hfShape.pillarConvex.boundingSphereRadius + sphereShape.boundingSphereRadius) {
          intersecting = this.sphereConvex(sphereShape, hfShape.pillarConvex, spherePos, worldPillarOffset, sphereQuat, hfQuat, sphereBody, hfBody, sphereShape, hfShape, justTest);
        }

        if (justTest && intersecting) {
          return true;
        }

        const numContacts = result.length - numContactsBefore;

        if (numContacts > 2) {
          return;
        }
        /*
          // Skip all but 1
          for (let k = 0; k < numContacts - 1; k++) {
              result.pop();
          }
        */

      }
    }
  }

  boxHeightfield(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
    si.convexPolyhedronRepresentation.material = si.material;
    si.convexPolyhedronRepresentation.collisionResponse = si.collisionResponse;
    return this.convexHeightfield(si.convexPolyhedronRepresentation, sj, xi, xj, qi, qj, bi, bj, si, sj, justTest);
  }

  convexHeightfield(convexShape, hfShape, convexPos, hfPos, convexQuat, hfQuat, convexBody, hfBody, rsi, rsj, justTest) {
    const data = hfShape.data;
    const w = hfShape.elementSize;
    const radius = convexShape.boundingSphereRadius;
    const worldPillarOffset = convexHeightfield_tmp2;
    const faceList = convexHeightfield_faceList; // Get sphere position to heightfield local!

    const localConvexPos = convexHeightfield_tmp1;
    Transform.pointToLocalFrame(hfPos, hfQuat, convexPos, localConvexPos); // Get the index of the data points to test against

    let iMinX = Math.floor((localConvexPos.x - radius) / w) - 1;
    let iMaxX = Math.ceil((localConvexPos.x + radius) / w) + 1;
    let iMinY = Math.floor((localConvexPos.y - radius) / w) - 1;
    let iMaxY = Math.ceil((localConvexPos.y + radius) / w) + 1; // Bail out if we are out of the terrain

    if (iMaxX < 0 || iMaxY < 0 || iMinX > data.length || iMinY > data[0].length) {
      return;
    } // Clamp index to edges


    if (iMinX < 0) {
      iMinX = 0;
    }

    if (iMaxX < 0) {
      iMaxX = 0;
    }

    if (iMinY < 0) {
      iMinY = 0;
    }

    if (iMaxY < 0) {
      iMaxY = 0;
    }

    if (iMinX >= data.length) {
      iMinX = data.length - 1;
    }

    if (iMaxX >= data.length) {
      iMaxX = data.length - 1;
    }

    if (iMaxY >= data[0].length) {
      iMaxY = data[0].length - 1;
    }

    if (iMinY >= data[0].length) {
      iMinY = data[0].length - 1;
    }

    const minMax = [];
    hfShape.getRectMinMax(iMinX, iMinY, iMaxX, iMaxY, minMax);
    const min = minMax[0];
    const max = minMax[1]; // Bail out if we're cant touch the bounding height box

    if (localConvexPos.z - radius > max || localConvexPos.z + radius < min) {
      return;
    }

    for (let i = iMinX; i < iMaxX; i++) {
      for (let j = iMinY; j < iMaxY; j++) {
        let intersecting = false; // Lower triangle

        hfShape.getConvexTrianglePillar(i, j, false);
        Transform.pointToWorldFrame(hfPos, hfQuat, hfShape.pillarOffset, worldPillarOffset);

        if (convexPos.distanceTo(worldPillarOffset) < hfShape.pillarConvex.boundingSphereRadius + convexShape.boundingSphereRadius) {
          intersecting = this.convexConvex(convexShape, hfShape.pillarConvex, convexPos, worldPillarOffset, convexQuat, hfQuat, convexBody, hfBody, null, null, justTest, faceList, null);
        }

        if (justTest && intersecting) {
          return true;
        } // Upper triangle


        hfShape.getConvexTrianglePillar(i, j, true);
        Transform.pointToWorldFrame(hfPos, hfQuat, hfShape.pillarOffset, worldPillarOffset);

        if (convexPos.distanceTo(worldPillarOffset) < hfShape.pillarConvex.boundingSphereRadius + convexShape.boundingSphereRadius) {
          intersecting = this.convexConvex(convexShape, hfShape.pillarConvex, convexPos, worldPillarOffset, convexQuat, hfQuat, convexBody, hfBody, null, null, justTest, faceList, null);
        }

        if (justTest && intersecting) {
          return true;
        }
      }
    }
  }

  sphereParticle(sj, si, xj, xi, qj, qi, bj, bi, rsi, rsj, justTest) {
    // The normal is the unit vector from sphere center to particle center
    const normal = particleSphere_normal;
    normal.set(0, 0, 1);
    xi.vsub(xj, normal);
    const lengthSquared = normal.lengthSquared();

    if (lengthSquared <= sj.radius * sj.radius) {
      if (justTest) {
        return true;
      }

      const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
      normal.normalize();
      r.rj.copy(normal);
      r.rj.scale(sj.radius, r.rj);
      r.ni.copy(normal); // Contact normal

      r.ni.negate(r.ni);
      r.ri.set(0, 0, 0); // Center of particle

      this.result.push(r);
      this.createFrictionEquationsFromContact(r, this.frictionResult);
    }
  }

  planeParticle(sj, si, xj, xi, qj, qi, bj, bi, rsi, rsj, justTest) {
    const normal = particlePlane_normal;
    normal.set(0, 0, 1);
    bj.quaternion.vmult(normal, normal); // Turn normal according to plane orientation

    const relpos = particlePlane_relpos;
    xi.vsub(bj.position, relpos);
    const dot = normal.dot(relpos);

    if (dot <= 0.0) {
      if (justTest) {
        return true;
      }

      const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
      r.ni.copy(normal); // Contact normal is the plane normal

      r.ni.negate(r.ni);
      r.ri.set(0, 0, 0); // Center of particle
      // Get particle position projected on plane

      const projected = particlePlane_projected;
      normal.scale(normal.dot(xi), projected);
      xi.vsub(projected, projected); //projected.vadd(bj.position,projected);
      // rj is now the projected world position minus plane position

      r.rj.copy(projected);
      this.result.push(r);
      this.createFrictionEquationsFromContact(r, this.frictionResult);
    }
  }

  boxParticle(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
    si.convexPolyhedronRepresentation.material = si.material;
    si.convexPolyhedronRepresentation.collisionResponse = si.collisionResponse;
    return this.convexParticle(si.convexPolyhedronRepresentation, sj, xi, xj, qi, qj, bi, bj, si, sj, justTest);
  }

  convexParticle(sj, si, xj, xi, qj, qi, bj, bi, rsi, rsj, justTest) {
    let penetratedFaceIndex = -1;
    const penetratedFaceNormal = convexParticle_penetratedFaceNormal;
    const worldPenetrationVec = convexParticle_worldPenetrationVec;
    let minPenetration = null;

    const local = convexParticle_local;
    local.copy(xi);
    local.vsub(xj, local); // Convert position to relative the convex origin

    qj.conjugate(cqj);
    cqj.vmult(local, local);

    if (sj.pointIsInside(local)) {
      if (sj.worldVerticesNeedsUpdate) {
        sj.computeWorldVertices(xj, qj);
      }

      if (sj.worldFaceNormalsNeedsUpdate) {
        sj.computeWorldFaceNormals(qj);
      } // For each world polygon in the polyhedra


      for (let i = 0, nfaces = sj.faces.length; i !== nfaces; i++) {
        // Construct world face vertices
        const verts = [sj.worldVertices[sj.faces[i][0]]];
        const normal = sj.worldFaceNormals[i]; // Check how much the particle penetrates the polygon plane.

        xi.vsub(verts[0], convexParticle_vertexToParticle);
        const penetration = -normal.dot(convexParticle_vertexToParticle);

        if (minPenetration === null || Math.abs(penetration) < Math.abs(minPenetration)) {
          if (justTest) {
            return true;
          }

          minPenetration = penetration;
          penetratedFaceIndex = i;
          penetratedFaceNormal.copy(normal);
        }
      }

      if (penetratedFaceIndex !== -1) {
        // Setup contact
        const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
        penetratedFaceNormal.scale(minPenetration, worldPenetrationVec); // rj is the particle position projected to the face

        worldPenetrationVec.vadd(xi, worldPenetrationVec);
        worldPenetrationVec.vsub(xj, worldPenetrationVec);
        r.rj.copy(worldPenetrationVec); //const projectedToFace = xi.vsub(xj).vadd(worldPenetrationVec);
        //projectedToFace.copy(r.rj);
        //qj.vmult(r.rj,r.rj);

        penetratedFaceNormal.negate(r.ni); // Contact normal

        r.ri.set(0, 0, 0); // Center of particle

        const ri = r.ri;
        const rj = r.rj; // Make relative to bodies

        ri.vadd(xi, ri);
        ri.vsub(bi.position, ri);
        rj.vadd(xj, rj);
        rj.vsub(bj.position, rj);
        this.result.push(r);
        this.createFrictionEquationsFromContact(r, this.frictionResult);
      } else {
        console.warn('Point found inside convex, but did not find penetrating face!');
      }
    }
  }

  sphereTrimesh(sphereShape, trimeshShape, spherePos, trimeshPos, sphereQuat, trimeshQuat, sphereBody, trimeshBody, rsi, rsj, justTest) {
    const edgeVertexA = sphereTrimesh_edgeVertexA;
    const edgeVertexB = sphereTrimesh_edgeVertexB;
    const edgeVector = sphereTrimesh_edgeVector;
    const edgeVectorUnit = sphereTrimesh_edgeVectorUnit;
    const localSpherePos = sphereTrimesh_localSpherePos;
    const tmp = sphereTrimesh_tmp;
    const localSphereAABB = sphereTrimesh_localSphereAABB;
    const v2 = sphereTrimesh_v2;
    const relpos = sphereTrimesh_relpos;
    const triangles = sphereTrimesh_triangles; // Convert sphere position to local in the trimesh

    Transform.pointToLocalFrame(trimeshPos, trimeshQuat, spherePos, localSpherePos); // Get the aabb of the sphere locally in the trimesh

    const sphereRadius = sphereShape.radius;
    localSphereAABB.lowerBound.set(localSpherePos.x - sphereRadius, localSpherePos.y - sphereRadius, localSpherePos.z - sphereRadius);
    localSphereAABB.upperBound.set(localSpherePos.x + sphereRadius, localSpherePos.y + sphereRadius, localSpherePos.z + sphereRadius);
    trimeshShape.getTrianglesInAABB(localSphereAABB, triangles); //for (let i = 0; i < trimeshShape.indices.length / 3; i++) triangles.push(i); // All
    // Vertices

    const v = sphereTrimesh_v;
    const radiusSquared = sphereShape.radius * sphereShape.radius;

    for (let i = 0; i < triangles.length; i++) {
      for (let j = 0; j < 3; j++) {
        trimeshShape.getVertex(trimeshShape.indices[triangles[i] * 3 + j], v); // Check vertex overlap in sphere

        v.vsub(localSpherePos, relpos);

        if (relpos.lengthSquared() <= radiusSquared) {
          // Safe up
          v2.copy(v);
          Transform.pointToWorldFrame(trimeshPos, trimeshQuat, v2, v);
          v.vsub(spherePos, relpos);

          if (justTest) {
            return true;
          }

          let r = this.createContactEquation(sphereBody, trimeshBody, sphereShape, trimeshShape, rsi, rsj);
          r.ni.copy(relpos);
          r.ni.normalize(); // ri is the vector from sphere center to the sphere surface

          r.ri.copy(r.ni);
          r.ri.scale(sphereShape.radius, r.ri);
          r.ri.vadd(spherePos, r.ri);
          r.ri.vsub(sphereBody.position, r.ri);
          r.rj.copy(v);
          r.rj.vsub(trimeshBody.position, r.rj); // Store result

          this.result.push(r);
          this.createFrictionEquationsFromContact(r, this.frictionResult);
        }
      }
    } // Check all edges


    for (let i = 0; i < triangles.length; i++) {
      for (let j = 0; j < 3; j++) {
        trimeshShape.getVertex(trimeshShape.indices[triangles[i] * 3 + j], edgeVertexA);
        trimeshShape.getVertex(trimeshShape.indices[triangles[i] * 3 + (j + 1) % 3], edgeVertexB);
        edgeVertexB.vsub(edgeVertexA, edgeVector); // Project sphere position to the edge

        localSpherePos.vsub(edgeVertexB, tmp);
        const positionAlongEdgeB = tmp.dot(edgeVector);
        localSpherePos.vsub(edgeVertexA, tmp);
        let positionAlongEdgeA = tmp.dot(edgeVector);

        if (positionAlongEdgeA > 0 && positionAlongEdgeB < 0) {
          // Now check the orthogonal distance from edge to sphere center
          localSpherePos.vsub(edgeVertexA, tmp);
          edgeVectorUnit.copy(edgeVector);
          edgeVectorUnit.normalize();
          positionAlongEdgeA = tmp.dot(edgeVectorUnit);
          edgeVectorUnit.scale(positionAlongEdgeA, tmp);
          tmp.vadd(edgeVertexA, tmp); // tmp is now the sphere center position projected to the edge, defined locally in the trimesh frame

          const dist = tmp.distanceTo(localSpherePos);

          if (dist < sphereShape.radius) {
            if (justTest) {
              return true;
            }

            const r = this.createContactEquation(sphereBody, trimeshBody, sphereShape, trimeshShape, rsi, rsj);
            tmp.vsub(localSpherePos, r.ni);
            r.ni.normalize();
            r.ni.scale(sphereShape.radius, r.ri);
            r.ri.vadd(spherePos, r.ri);
            r.ri.vsub(sphereBody.position, r.ri);
            Transform.pointToWorldFrame(trimeshPos, trimeshQuat, tmp, tmp);
            tmp.vsub(trimeshBody.position, r.rj);
            Transform.vectorToWorldFrame(trimeshQuat, r.ni, r.ni);
            Transform.vectorToWorldFrame(trimeshQuat, r.ri, r.ri);
            this.result.push(r);
            this.createFrictionEquationsFromContact(r, this.frictionResult);
          }
        }
      }
    } // Triangle faces


    const va = sphereTrimesh_va;
    const vb = sphereTrimesh_vb;
    const vc = sphereTrimesh_vc;
    const normal = sphereTrimesh_normal;

    for (let i = 0, N = triangles.length; i !== N; i++) {
      trimeshShape.getTriangleVertices(triangles[i], va, vb, vc);
      trimeshShape.getNormal(triangles[i], normal);
      localSpherePos.vsub(va, tmp);
      let dist = tmp.dot(normal);
      normal.scale(dist, tmp);
      localSpherePos.vsub(tmp, tmp); // tmp is now the sphere position projected to the triangle plane

      dist = tmp.distanceTo(localSpherePos);

      if (Ray.pointInTriangle(tmp, va, vb, vc) && dist < sphereShape.radius) {
        if (justTest) {
          return true;
        }

        let r = this.createContactEquation(sphereBody, trimeshBody, sphereShape, trimeshShape, rsi, rsj);
        tmp.vsub(localSpherePos, r.ni);
        r.ni.normalize();
        r.ni.scale(sphereShape.radius, r.ri);
        r.ri.vadd(spherePos, r.ri);
        r.ri.vsub(sphereBody.position, r.ri);
        Transform.pointToWorldFrame(trimeshPos, trimeshQuat, tmp, tmp);
        tmp.vsub(trimeshBody.position, r.rj);
        Transform.vectorToWorldFrame(trimeshQuat, r.ni, r.ni);
        Transform.vectorToWorldFrame(trimeshQuat, r.ri, r.ri);
        this.result.push(r);
        this.createFrictionEquationsFromContact(r, this.frictionResult);
      }
    }

    triangles.length = 0;
  }

  planeTrimesh(planeShape, trimeshShape, planePos, trimeshPos, planeQuat, trimeshQuat, planeBody, trimeshBody, rsi, rsj, justTest) {
    // Make contacts!
    const v = new Vec3();
    const normal = planeTrimesh_normal;
    normal.set(0, 0, 1);
    planeQuat.vmult(normal, normal); // Turn normal according to plane

    for (let i = 0; i < trimeshShape.vertices.length / 3; i++) {
      // Get world vertex from trimesh
      trimeshShape.getVertex(i, v); // Safe up

      const v2 = new Vec3();
      v2.copy(v);
      Transform.pointToWorldFrame(trimeshPos, trimeshQuat, v2, v); // Check plane side

      const relpos = planeTrimesh_relpos;
      v.vsub(planePos, relpos);
      const dot = normal.dot(relpos);

      if (dot <= 0.0) {
        if (justTest) {
          return true;
        }

        const r = this.createContactEquation(planeBody, trimeshBody, planeShape, trimeshShape, rsi, rsj);
        r.ni.copy(normal); // Contact normal is the plane normal
        // Get vertex position projected on plane

        const projected = planeTrimesh_projected;
        normal.scale(relpos.dot(normal), projected);
        v.vsub(projected, projected); // ri is the projected world position minus plane position

        r.ri.copy(projected);
        r.ri.vsub(planeBody.position, r.ri);
        r.rj.copy(v);
        r.rj.vsub(trimeshBody.position, r.rj); // Store result

        this.result.push(r);
        this.createFrictionEquationsFromContact(r, this.frictionResult);
      }
    }
  } // convexTrimesh(
  //   si: ConvexPolyhedron, sj: Trimesh, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion,
  //   bi: Body, bj: Body, rsi?: Shape | null, rsj?: Shape | null,
  //   faceListA?: number[] | null, faceListB?: number[] | null,
  // ) {
  //   const sepAxis = convexConvex_sepAxis;
  //   if(xi.distanceTo(xj) > si.boundingSphereRadius + sj.boundingSphereRadius){
  //       return;
  //   }
  //   // Construct a temp hull for each triangle
  //   const hullB = new ConvexPolyhedron();
  //   hullB.faces = [[0,1,2]];
  //   const va = new Vec3();
  //   const vb = new Vec3();
  //   const vc = new Vec3();
  //   hullB.vertices = [
  //       va,
  //       vb,
  //       vc
  //   ];
  //   for (let i = 0; i < sj.indices.length / 3; i++) {
  //       const triangleNormal = new Vec3();
  //       sj.getNormal(i, triangleNormal);
  //       hullB.faceNormals = [triangleNormal];
  //       sj.getTriangleVertices(i, va, vb, vc);
  //       let d = si.testSepAxis(triangleNormal, hullB, xi, qi, xj, qj);
  //       if(!d){
  //           triangleNormal.scale(-1, triangleNormal);
  //           d = si.testSepAxis(triangleNormal, hullB, xi, qi, xj, qj);
  //           if(!d){
  //               continue;
  //           }
  //       }
  //       const res: ConvexPolyhedronContactPoint[] = [];
  //       const q = convexConvex_q;
  //       si.clipAgainstHull(xi,qi,hullB,xj,qj,triangleNormal,-100,100,res);
  //       for(let j = 0; j !== res.length; j++){
  //           const r = this.createContactEquation(bi,bj,si,sj,rsi,rsj),
  //               ri = r.ri,
  //               rj = r.rj;
  //           r.ni.copy(triangleNormal);
  //           r.ni.negate(r.ni);
  //           res[j].normal.negate(q);
  //           q.mult(res[j].depth, q);
  //           res[j].point.vadd(q, ri);
  //           rj.copy(res[j].point);
  //           // Contact points are in world coordinates. Transform back to relative
  //           ri.vsub(xi,ri);
  //           rj.vsub(xj,rj);
  //           // Make relative to bodies
  //           ri.vadd(xi, ri);
  //           ri.vsub(bi.position, ri);
  //           rj.vadd(xj, rj);
  //           rj.vsub(bj.position, rj);
  //           result.push(r);
  //       }
  //   }
  // }


}
const averageNormal = new Vec3();
const averageContactPointA = new Vec3();
const averageContactPointB = new Vec3();
const tmpVec1$2 = new Vec3();
const tmpVec2$2 = new Vec3();
const tmpQuat1 = new Quaternion();
const tmpQuat2 = new Quaternion();

Narrowphase.prototype[COLLISION_TYPES.boxBox] = Narrowphase.prototype.boxBox;
Narrowphase.prototype[COLLISION_TYPES.boxConvex] = Narrowphase.prototype.boxConvex;
Narrowphase.prototype[COLLISION_TYPES.boxParticle] = Narrowphase.prototype.boxParticle;
Narrowphase.prototype[COLLISION_TYPES.sphereSphere] = Narrowphase.prototype.sphereSphere;
const planeTrimesh_normal = new Vec3();
const planeTrimesh_relpos = new Vec3();
const planeTrimesh_projected = new Vec3();
Narrowphase.prototype[COLLISION_TYPES.planeTrimesh] = Narrowphase.prototype.planeTrimesh;
const sphereTrimesh_normal = new Vec3();
const sphereTrimesh_relpos = new Vec3();
const sphereTrimesh_v = new Vec3();
const sphereTrimesh_v2 = new Vec3();
const sphereTrimesh_edgeVertexA = new Vec3();
const sphereTrimesh_edgeVertexB = new Vec3();
const sphereTrimesh_edgeVector = new Vec3();
const sphereTrimesh_edgeVectorUnit = new Vec3();
const sphereTrimesh_localSpherePos = new Vec3();
const sphereTrimesh_tmp = new Vec3();
const sphereTrimesh_va = new Vec3();
const sphereTrimesh_vb = new Vec3();
const sphereTrimesh_vc = new Vec3();
const sphereTrimesh_localSphereAABB = new AABB();
const sphereTrimesh_triangles = [];
Narrowphase.prototype[COLLISION_TYPES.sphereTrimesh] = Narrowphase.prototype.sphereTrimesh;
const point_on_plane_to_sphere = new Vec3();
const plane_to_sphere_ortho = new Vec3();
Narrowphase.prototype[COLLISION_TYPES.spherePlane] = Narrowphase.prototype.spherePlane; // See http://bulletphysics.com/Bullet/BulletFull/SphereTriangleDetector_8cpp_source.html

const pointInPolygon_edge = new Vec3();
const pointInPolygon_edge_x_normal = new Vec3();
const pointInPolygon_vtp = new Vec3();

function pointInPolygon(verts, normal, p) {
  let positiveResult = null;
  const N = verts.length;

  for (let i = 0; i !== N; i++) {
    const v = verts[i]; // Get edge to the next vertex

    const edge = pointInPolygon_edge;
    verts[(i + 1) % N].vsub(v, edge); // Get cross product between polygon normal and the edge

    const edge_x_normal = pointInPolygon_edge_x_normal; //const edge_x_normal = new Vec3();

    edge.cross(normal, edge_x_normal); // Get vector between point and current vertex

    const vertex_to_p = pointInPolygon_vtp;
    p.vsub(v, vertex_to_p); // This dot product determines which side of the edge the point is

    const r = edge_x_normal.dot(vertex_to_p); // If all such dot products have same sign, we are inside the polygon.

    if (positiveResult === null || r > 0 && positiveResult === true || r <= 0 && positiveResult === false) {
      if (positiveResult === null) {
        positiveResult = r > 0;
      }

      continue;
    } else {
      return false; // Encountered some other sign. Exit.
    }
  } // If we got here, all dot products were of the same sign.


  return true;
}

const box_to_sphere = new Vec3();
const sphereBox_ns = new Vec3();
const sphereBox_ns1 = new Vec3();
const sphereBox_ns2 = new Vec3();
const sphereBox_sides = [new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3()];
const sphereBox_sphere_to_corner = new Vec3();
const sphereBox_side_ns = new Vec3();
const sphereBox_side_ns1 = new Vec3();
const sphereBox_side_ns2 = new Vec3();
Narrowphase.prototype[COLLISION_TYPES.sphereBox] = Narrowphase.prototype.sphereBox;
const convex_to_sphere = new Vec3();
const sphereConvex_edge = new Vec3();
const sphereConvex_edgeUnit = new Vec3();
const sphereConvex_sphereToCorner = new Vec3();
const sphereConvex_worldCorner = new Vec3();
const sphereConvex_worldNormal = new Vec3();
const sphereConvex_worldPoint = new Vec3();
const sphereConvex_worldSpherePointClosestToPlane = new Vec3();
const sphereConvex_penetrationVec = new Vec3();
const sphereConvex_sphereToWorldPoint = new Vec3();
Narrowphase.prototype[COLLISION_TYPES.sphereConvex] = Narrowphase.prototype.sphereConvex;
Narrowphase.prototype[COLLISION_TYPES.planeBox] = Narrowphase.prototype.planeBox;
const planeConvex_v = new Vec3();
const planeConvex_normal = new Vec3();
const planeConvex_relpos = new Vec3();
const planeConvex_projected = new Vec3();
Narrowphase.prototype[COLLISION_TYPES.planeConvex] = Narrowphase.prototype.planeConvex;
const convexConvex_sepAxis = new Vec3();
const convexConvex_q = new Vec3();
Narrowphase.prototype[COLLISION_TYPES.convexConvex] = Narrowphase.prototype.convexConvex; // Narrowphase.prototype[COLLISION_TYPES.convexTrimesh] = Narrowphase.prototype.convexTrimesh

const particlePlane_normal = new Vec3();
const particlePlane_relpos = new Vec3();
const particlePlane_projected = new Vec3();
Narrowphase.prototype[COLLISION_TYPES.planeParticle] = Narrowphase.prototype.planeParticle;
const particleSphere_normal = new Vec3();
Narrowphase.prototype[COLLISION_TYPES.sphereParticle] = Narrowphase.prototype.sphereParticle; // WIP

const cqj = new Quaternion();
const convexParticle_local = new Vec3();
const convexParticle_penetratedFaceNormal = new Vec3();
const convexParticle_vertexToParticle = new Vec3();
const convexParticle_worldPenetrationVec = new Vec3();
Narrowphase.prototype[COLLISION_TYPES.convexParticle] = Narrowphase.prototype.convexParticle;
Narrowphase.prototype[COLLISION_TYPES.boxHeightfield] = Narrowphase.prototype.boxHeightfield;
const convexHeightfield_tmp1 = new Vec3();
const convexHeightfield_tmp2 = new Vec3();
const convexHeightfield_faceList = [0];
Narrowphase.prototype[COLLISION_TYPES.convexHeightfield] = Narrowphase.prototype.convexHeightfield;
const sphereHeightfield_tmp1 = new Vec3();
const sphereHeightfield_tmp2 = new Vec3();
Narrowphase.prototype[COLLISION_TYPES.sphereHeightfield] = Narrowphase.prototype.sphereHeightfield;

/**
 * @class OverlapKeeper
 * @constructor
 */
class OverlapKeeper {
  constructor() {
    this.current = [];
    this.previous = [];
  }

  getKey(i, j) {
    if (j < i) {
      const temp = j;
      j = i;
      i = temp;
    }

    return i << 16 | j;
  }
  /**
   * @method set
   * @param {Number} i
   * @param {Number} j
   */


  set(i, j) {
    // Insertion sort. This way the diff will have linear complexity.
    const key = this.getKey(i, j);
    const current = this.current;
    let index = 0;

    while (key > current[index]) {
      index++;
    }

    if (key === current[index]) {
      return; // Pair was already added
    }

    for (let j = current.length - 1; j >= index; j--) {
      current[j + 1] = current[j];
    }

    current[index] = key;
  }
  /**
   * @method tick
   */


  tick() {
    const tmp = this.current;
    this.current = this.previous;
    this.previous = tmp;
    this.current.length = 0;
  }
  /**
   * @method getDiff
   * @param  {array} additions
   * @param  {array} removals
   */


  getDiff(additions, removals) {
    const a = this.current;
    const b = this.previous;
    const al = a.length;
    const bl = b.length;
    let j = 0;

    for (let i = 0; i < al; i++) {
      let found = false;
      const keyA = a[i];

      while (keyA > b[j]) {
        j++;
      }

      found = keyA === b[j];

      if (!found) {
        unpackAndPush(additions, keyA);
      }
    }

    j = 0;

    for (let i = 0; i < bl; i++) {
      let found = false;
      const keyB = b[i];

      while (keyB > a[j]) {
        j++;
      }

      found = a[j] === keyB;

      if (!found) {
        unpackAndPush(removals, keyB);
      }
    }
  }

}

function unpackAndPush(array, key) {
  array.push((key & 0xffff0000) >> 16, key & 0x0000ffff);
}

/**
 * @class TupleDictionary
 * @constructor
 */
class TupleDictionary {
  constructor() {
    this.data = {
      keys: []
    };
  }
  /**
   * @method get
   * @param  {Number} i
   * @param  {Number} j
   * @return {Object}
   */


  get(i, j) {
    if (i > j) {
      // swap
      const temp = j;
      j = i;
      i = temp;
    }

    return this.data[i + "-" + j];
  }
  /**
   * @method set
   * @param  {Number} i
   * @param  {Number} j
   * @param {Object} value
   */


  set(i, j, value) {
    if (i > j) {
      const temp = j;
      j = i;
      i = temp;
    }

    const key = i + "-" + j; // Check if key already exists

    if (!this.get(i, j)) {
      this.data.keys.push(key);
    }

    this.data[key] = value;
  }
  /**
   * @method reset
   */


  reset() {
    const data = this.data;
    const keys = data.keys;

    while (keys.length > 0) {
      const key = keys.pop();
      delete data[key];
    }
  }

}

/**
 * The physics world
 * @class World
 * @constructor
 * @extends EventTarget
 * @param {object} [options]
 * @param {Vec3} [options.gravity]
 * @param {boolean} [options.allowSleep]
 * @param {Broadphase} [options.broadphase]
 * @param {Solver} [options.solver]
 * @param {boolean} [options.quatNormalizeFast]
 * @param {number} [options.quatNormalizeSkip]
 */
class World extends EventTarget {
  // Currently / last used timestep. Is set to -1 if not available. This value is updated before each internal step, which means that it is "fresh" inside event callbacks.
  // Makes bodies go to sleep when they've been inactive.
  // All the current contacts (instances of ContactEquation) in the world.
  // How often to normalize quaternions. Set to 0 for every step, 1 for every second etc.. A larger value increases performance. If bodies tend to explode, set to a smaller value (zero to be sure nothing can go wrong).
  // Set to true to use fast quaternion normalization. It is often enough accurate to use. If bodies tend to explode, set to false.
  // The wall-clock time since simulation start.
  // Number of timesteps taken since start.
  // Default and last timestep sizes.
  // The broadphase algorithm to use. Default is NaiveBroadphase.
  // All bodies in this world
  // True if any bodies are not sleeping, false if every body is sleeping.
  // The solver algorithm to use. Default is GSSolver.
  // CollisionMatrix from the previous step.
  // All added materials.
  // Used to look up a ContactMaterial given two instances of Material.
  // This contact material is used if no suitable contactmaterial is found for a contact.
  // Time accumulator for interpolation. See http://gafferongames.com/game-physics/fix-your-timestep/
  // Dispatched after a body has been added to the world.
  // Dispatched after a body has been removed from the world.
  constructor(options = {}) {
    super();
    this.dt = -1;
    this.allowSleep = !!options.allowSleep;
    this.contacts = [];
    this.frictionEquations = [];
    this.quatNormalizeSkip = options.quatNormalizeSkip !== undefined ? options.quatNormalizeSkip : 0;
    this.quatNormalizeFast = options.quatNormalizeFast !== undefined ? options.quatNormalizeFast : false;
    this.time = 0.0;
    this.stepnumber = 0;
    this.default_dt = 1 / 60;
    this.nextId = 0;
    this.gravity = new Vec3();

    if (options.gravity) {
      this.gravity.copy(options.gravity);
    }

    this.broadphase = options.broadphase !== undefined ? options.broadphase : new NaiveBroadphase();
    this.bodies = [];
    this.hasActiveBodies = false;
    this.solver = options.solver !== undefined ? options.solver : new GSSolver();
    this.constraints = [];
    this.narrowphase = new Narrowphase(this);
    this.collisionMatrix = new ArrayCollisionMatrix();
    this.collisionMatrixPrevious = new ArrayCollisionMatrix();
    this.bodyOverlapKeeper = new OverlapKeeper();
    this.shapeOverlapKeeper = new OverlapKeeper();
    this.materials = [];
    this.contactmaterials = [];
    this.contactMaterialTable = new TupleDictionary();
    this.defaultMaterial = new Material('default');
    this.defaultContactMaterial = new ContactMaterial(this.defaultMaterial, this.defaultMaterial, {
      friction: 0.3,
      restitution: 0.0
    });
    this.doProfiling = false;
    this.profile = {
      solve: 0,
      makeContactConstraints: 0,
      broadphase: 0,
      integrate: 0,
      narrowphase: 0
    };
    this.accumulator = 0;
    this.subsystems = [];
    this.addBodyEvent = {
      type: 'addBody',
      body: null
    };
    this.removeBodyEvent = {
      type: 'removeBody',
      body: null
    };
    this.idToBodyMap = {};
    this.broadphase.setWorld(this);
  }
  /**
   * Get the contact material between materials m1 and m2
   * @method getContactMaterial
   * @param {Material} m1
   * @param {Material} m2
   * @return {ContactMaterial} The contact material if it was found.
   */


  getContactMaterial(m1, m2) {
    return this.contactMaterialTable.get(m1.id, m2.id);
  }
  /**
   * Get number of objects in the world.
   * @method numObjects
   * @return {Number}
   * @deprecated
   */


  numObjects() {
    return this.bodies.length;
  }
  /**
   * Store old collision state info
   * @method collisionMatrixTick
   */


  collisionMatrixTick() {
    const temp = this.collisionMatrixPrevious;
    this.collisionMatrixPrevious = this.collisionMatrix;
    this.collisionMatrix = temp;
    this.collisionMatrix.reset();
    this.bodyOverlapKeeper.tick();
    this.shapeOverlapKeeper.tick();
  }
  /**
   * Add a constraint to the simulation.
   * @method addConstraint
   * @param {Constraint} c
   */


  addConstraint(c) {
    this.constraints.push(c);
  }
  /**
   * Removes a constraint
   * @method removeConstraint
   * @param {Constraint} c
   */


  removeConstraint(c) {
    const idx = this.constraints.indexOf(c);

    if (idx !== -1) {
      this.constraints.splice(idx, 1);
    }
  }
  /**
   * Raycast test
   * @method rayTest
   * @param {Vec3} from
   * @param {Vec3} to
   * @param {RaycastResult} result
   * @deprecated Use .raycastAll, .raycastClosest or .raycastAny instead.
   */


  rayTest(from, to, result) {
    if (result instanceof RaycastResult) {
      // Do raycastClosest
      this.raycastClosest(from, to, {
        skipBackfaces: true
      }, result);
    } else {
      // Do raycastAll
      this.raycastAll(from, to, {
        skipBackfaces: true
      }, result);
    }
  }
  /**
   * Ray cast against all bodies. The provided callback will be executed for each hit with a RaycastResult as single argument.
   * @method raycastAll
   * @param  {Vec3} from
   * @param  {Vec3} to
   * @param  {Object} options
   * @param  {number} [options.collisionFilterMask=-1]
   * @param  {number} [options.collisionFilterGroup=-1]
   * @param  {boolean} [options.skipBackfaces=false]
   * @param  {boolean} [options.checkCollisionResponse=true]
   * @param  {Function} callback
   * @return {boolean} True if any body was hit.
   */


  raycastAll(from, to, options = {}, callback) {
    options.mode = Ray.ALL;
    options.from = from;
    options.to = to;
    options.callback = callback;
    return tmpRay$1.intersectWorld(this, options);
  }
  /**
   * Ray cast, and stop at the first result. Note that the order is random - but the method is fast.
   * @method raycastAny
   * @param  {Vec3} from
   * @param  {Vec3} to
   * @param  {Object} options
   * @param  {number} [options.collisionFilterMask=-1]
   * @param  {number} [options.collisionFilterGroup=-1]
   * @param  {boolean} [options.skipBackfaces=false]
   * @param  {boolean} [options.checkCollisionResponse=true]
   * @param  {RaycastResult} result
   * @return {boolean} True if any body was hit.
   */


  raycastAny(from, to, options = {}, result) {
    options.mode = Ray.ANY;
    options.from = from;
    options.to = to;
    options.result = result;
    return tmpRay$1.intersectWorld(this, options);
  }
  /**
   * Ray cast, and return information of the closest hit.
   * @method raycastClosest
   * @param  {Vec3} from
   * @param  {Vec3} to
   * @param  {Object} options
   * @param  {number} [options.collisionFilterMask=-1]
   * @param  {number} [options.collisionFilterGroup=-1]
   * @param  {boolean} [options.skipBackfaces=false]
   * @param  {boolean} [options.checkCollisionResponse=true]
   * @param  {RaycastResult} result
   * @return {boolean} True if any body was hit.
   */


  raycastClosest(from, to, options = {}, result) {
    options.mode = Ray.CLOSEST;
    options.from = from;
    options.to = to;
    options.result = result;
    return tmpRay$1.intersectWorld(this, options);
  }
  /**
   * Add a rigid body to the simulation.
   * @method add
   * @param {Body} body
   * @todo If the simulation has not yet started, why recrete and copy arrays for each body? Accumulate in dynamic arrays in this case.
   * @todo Adding an array of bodies should be possible. This would save some loops too
   */


  addBody(body) {
    if (this.bodies.includes(body)) {
      return;
    }

    body.index = this.bodies.length;
    this.bodies.push(body);
    body.world = this;
    body.initPosition.copy(body.position);
    body.initVelocity.copy(body.velocity);
    body.timeLastSleepy = this.time;

    if (body instanceof Body) {
      body.initAngularVelocity.copy(body.angularVelocity);
      body.initQuaternion.copy(body.quaternion);
    }

    this.collisionMatrix.setNumObjects(this.bodies.length);
    this.addBodyEvent.body = body;
    this.idToBodyMap[body.id] = body;
    this.dispatchEvent(this.addBodyEvent);
  }
  /**
   * Remove a rigid body from the simulation.
   * @method remove
   * @param {Body} body
   */


  removeBody(body) {
    body.world = null;
    const n = this.bodies.length - 1;
    const bodies = this.bodies;
    const idx = bodies.indexOf(body);

    if (idx !== -1) {
      bodies.splice(idx, 1); // Todo: should use a garbage free method
      // Recompute index

      for (let i = 0; i !== bodies.length; i++) {
        bodies[i].index = i;
      }

      this.collisionMatrix.setNumObjects(n);
      this.removeBodyEvent.body = body;
      delete this.idToBodyMap[body.id];
      this.dispatchEvent(this.removeBodyEvent);
    }
  }

  getBodyById(id) {
    return this.idToBodyMap[id];
  } // TODO Make a faster map


  getShapeById(id) {
    const bodies = this.bodies;

    for (let i = 0, bl = bodies.length; i < bl; i++) {
      const shapes = bodies[i].shapes;

      for (let j = 0, sl = shapes.length; j < sl; j++) {
        const shape = shapes[j];

        if (shape.id === id) {
          return shape;
        }
      }
    }
  }
  /**
   * Adds a material to the World.
   * @method addMaterial
   * @param {Material} m
   * @todo Necessary?
   */


  addMaterial(m) {
    this.materials.push(m);
  }
  /**
   * Adds a contact material to the World
   * @method addContactMaterial
   * @param {ContactMaterial} cmat
   */


  addContactMaterial(cmat) {
    // Add contact material
    this.contactmaterials.push(cmat); // Add current contact material to the material table

    this.contactMaterialTable.set(cmat.materials[0].id, cmat.materials[1].id, cmat);
  }
  /**
   * Step the physics world forward in time.
   *
   * There are two modes. The simple mode is fixed timestepping without interpolation. In this case you only use the first argument. The second case uses interpolation. In that you also provide the time since the function was last used, as well as the maximum fixed timesteps to take.
   *
   * @method step
   * @param {Number} dt                       The fixed time step size to use.
   * @param {Number} [timeSinceLastCalled]    The time elapsed since the function was last called.
   * @param {Number} [maxSubSteps=10]         Maximum number of fixed steps to take per function call.
   *
   * @example
   *     // fixed timestepping without interpolation
   *     world.step(1/60);
   *
   * @see http://bulletphysics.org/mediawiki-1.5.8/index.php/Stepping_The_World
   */


  step(dt, timeSinceLastCalled = 0, maxSubSteps = 10) {
    if (timeSinceLastCalled === 0) {
      // Fixed, simple stepping
      this.internalStep(dt); // Increment time

      this.time += dt;
    } else {
      this.accumulator += timeSinceLastCalled;
      let substeps = 0;

      while (this.accumulator >= dt && substeps < maxSubSteps) {
        // Do fixed steps to catch up
        this.internalStep(dt);
        this.accumulator -= dt;
        substeps++;
      }

      const t = this.accumulator % dt / dt;

      for (let j = 0; j !== this.bodies.length; j++) {
        const b = this.bodies[j];
        b.previousPosition.lerp(b.position, t, b.interpolatedPosition);
        b.previousQuaternion.slerp(b.quaternion, t, b.interpolatedQuaternion);
        b.previousQuaternion.normalize();
      }

      this.time += timeSinceLastCalled;
    }
  }

  internalStep(dt) {
    this.dt = dt;
    const contacts = this.contacts;
    const p1 = World_step_p1;
    const p2 = World_step_p2;
    const N = this.numObjects();
    const bodies = this.bodies;
    const solver = this.solver;
    const gravity = this.gravity;
    const doProfiling = this.doProfiling;
    const profile = this.profile;
    const DYNAMIC = Body.DYNAMIC;
    let profilingStart = -Infinity;
    const constraints = this.constraints;
    const frictionEquationPool = World_step_frictionEquationPool;
    const gnorm = gravity.length();
    const gx = gravity.x;
    const gy = gravity.y;
    const gz = gravity.z;
    let i = 0;

    if (doProfiling) {
      profilingStart = performance.now();
    } // Add gravity to all objects


    for (i = 0; i !== N; i++) {
      const bi = bodies[i];

      if (bi.type === DYNAMIC) {
        // Only for dynamic bodies
        const f = bi.force;
        const m = bi.mass;
        f.x += m * gx;
        f.y += m * gy;
        f.z += m * gz;
      }
    } // Update subsystems


    for (let i = 0, Nsubsystems = this.subsystems.length; i !== Nsubsystems; i++) {
      this.subsystems[i].update();
    } // Collision detection


    if (doProfiling) {
      profilingStart = performance.now();
    }

    p1.length = 0; // Clean up pair arrays from last step

    p2.length = 0;
    this.broadphase.collisionPairs(this, p1, p2);

    if (doProfiling) {
      profile.broadphase = performance.now() - profilingStart;
    } // Remove constrained pairs with collideConnected == false


    let Nconstraints = constraints.length;

    for (i = 0; i !== Nconstraints; i++) {
      const c = constraints[i];

      if (!c.collideConnected) {
        for (let j = p1.length - 1; j >= 0; j -= 1) {
          if (c.bodyA === p1[j] && c.bodyB === p2[j] || c.bodyB === p1[j] && c.bodyA === p2[j]) {
            p1.splice(j, 1);
            p2.splice(j, 1);
          }
        }
      }
    }

    this.collisionMatrixTick(); // Generate contacts

    if (doProfiling) {
      profilingStart = performance.now();
    }

    const oldcontacts = World_step_oldContacts;
    const NoldContacts = contacts.length;

    for (i = 0; i !== NoldContacts; i++) {
      oldcontacts.push(contacts[i]);
    }

    contacts.length = 0; // Transfer FrictionEquation from current list to the pool for reuse

    const NoldFrictionEquations = this.frictionEquations.length;

    for (i = 0; i !== NoldFrictionEquations; i++) {
      frictionEquationPool.push(this.frictionEquations[i]);
    }

    this.frictionEquations.length = 0;
    this.narrowphase.getContacts(p1, p2, this, contacts, oldcontacts, // To be reused
    this.frictionEquations, frictionEquationPool);

    if (doProfiling) {
      profile.narrowphase = performance.now() - profilingStart;
    } // Loop over all collisions


    if (doProfiling) {
      profilingStart = performance.now();
    } // Add all friction eqs


    for (i = 0; i < this.frictionEquations.length; i++) {
      solver.addEquation(this.frictionEquations[i]);
    }

    const ncontacts = contacts.length;

    for (let k = 0; k !== ncontacts; k++) {
      // Current contact
      const c = contacts[k]; // Get current collision indeces

      const bi = c.bi;
      const bj = c.bj;
      const si = c.si;
      const sj = c.sj; // Get collision properties

      let cm;

      if (bi.material && bj.material) {
        cm = this.getContactMaterial(bi.material, bj.material) || this.defaultContactMaterial;
      } else {
        cm = this.defaultContactMaterial;
      } // c.enabled = bi.collisionResponse && bj.collisionResponse && si.collisionResponse && sj.collisionResponse;


      let mu = cm.friction; // c.restitution = cm.restitution;
      // If friction or restitution were specified in the material, use them

      if (bi.material && bj.material) {
        if (bi.material.friction >= 0 && bj.material.friction >= 0) {
          mu = bi.material.friction * bj.material.friction;
        }

        if (bi.material.restitution >= 0 && bj.material.restitution >= 0) {
          c.restitution = bi.material.restitution * bj.material.restitution;
        }
      } // c.setSpookParams(
      //           cm.contactEquationStiffness,
      //           cm.contactEquationRelaxation,
      //           dt
      //       );


      solver.addEquation(c); // // Add friction constraint equation
      // if(mu > 0){
      // 	// Create 2 tangent equations
      // 	const mug = mu * gnorm;
      // 	const reducedMass = (bi.invMass + bj.invMass);
      // 	if(reducedMass > 0){
      // 		reducedMass = 1/reducedMass;
      // 	}
      // 	const pool = frictionEquationPool;
      // 	const c1 = pool.length ? pool.pop() : new FrictionEquation(bi,bj,mug*reducedMass);
      // 	const c2 = pool.length ? pool.pop() : new FrictionEquation(bi,bj,mug*reducedMass);
      // 	this.frictionEquations.push(c1, c2);
      // 	c1.bi = c2.bi = bi;
      // 	c1.bj = c2.bj = bj;
      // 	c1.minForce = c2.minForce = -mug*reducedMass;
      // 	c1.maxForce = c2.maxForce = mug*reducedMass;
      // 	// Copy over the relative vectors
      // 	c1.ri.copy(c.ri);
      // 	c1.rj.copy(c.rj);
      // 	c2.ri.copy(c.ri);
      // 	c2.rj.copy(c.rj);
      // 	// Construct tangents
      // 	c.ni.tangents(c1.t, c2.t);
      //           // Set spook params
      //           c1.setSpookParams(cm.frictionEquationStiffness, cm.frictionEquationRelaxation, dt);
      //           c2.setSpookParams(cm.frictionEquationStiffness, cm.frictionEquationRelaxation, dt);
      //           c1.enabled = c2.enabled = c.enabled;
      // 	// Add equations to solver
      // 	solver.addEquation(c1);
      // 	solver.addEquation(c2);
      // }

      if (bi.allowSleep && bi.type === Body.DYNAMIC && bi.sleepState === Body.SLEEPING && bj.sleepState === Body.AWAKE && bj.type !== Body.STATIC) {
        const speedSquaredB = bj.velocity.lengthSquared() + bj.angularVelocity.lengthSquared();
        const speedLimitSquaredB = bj.sleepSpeedLimit ** 2;

        if (speedSquaredB >= speedLimitSquaredB * 2) {
          bi.wakeUpAfterNarrowphase = true;
        }
      }

      if (bj.allowSleep && bj.type === Body.DYNAMIC && bj.sleepState === Body.SLEEPING && bi.sleepState === Body.AWAKE && bi.type !== Body.STATIC) {
        const speedSquaredA = bi.velocity.lengthSquared() + bi.angularVelocity.lengthSquared();
        const speedLimitSquaredA = bi.sleepSpeedLimit ** 2;

        if (speedSquaredA >= speedLimitSquaredA * 2) {
          bj.wakeUpAfterNarrowphase = true;
        }
      } // Now we know that i and j are in contact. Set collision matrix state


      this.collisionMatrix.set(bi, bj, true);

      if (!this.collisionMatrixPrevious.get(bi, bj)) {
        // First contact!
        // We reuse the collideEvent object, otherwise we will end up creating new objects for each new contact, even if there's no event listener attached.
        World_step_collideEvent.body = bj;
        World_step_collideEvent.contact = c;
        bi.dispatchEvent(World_step_collideEvent);
        World_step_collideEvent.body = bi;
        bj.dispatchEvent(World_step_collideEvent);
      }

      this.bodyOverlapKeeper.set(bi.id, bj.id);
      this.shapeOverlapKeeper.set(si.id, sj.id);
    }

    this.emitContactEvents();

    if (doProfiling) {
      profile.makeContactConstraints = performance.now() - profilingStart;
      profilingStart = performance.now();
    } // Wake up bodies


    for (i = 0; i !== N; i++) {
      const bi = bodies[i];

      if (bi.wakeUpAfterNarrowphase) {
        bi.wakeUp();
        bi.wakeUpAfterNarrowphase = false;
      }
    } // Add user-added constraints


    Nconstraints = constraints.length;

    for (i = 0; i !== Nconstraints; i++) {
      const c = constraints[i];
      c.update();

      for (let j = 0, Neq = c.equations.length; j !== Neq; j++) {
        const eq = c.equations[j];
        solver.addEquation(eq);
      }
    } // Solve the constrained system


    solver.solve(dt, this);

    if (doProfiling) {
      profile.solve = performance.now() - profilingStart;
    } // Remove all contacts from solver


    solver.removeAllEquations(); // Apply damping, see http://code.google.com/p/bullet/issues/detail?id=74 for details

    const pow = Math.pow;

    for (i = 0; i !== N; i++) {
      const bi = bodies[i];

      if (bi.type & DYNAMIC) {
        // Only for dynamic bodies
        const ld = pow(1.0 - bi.linearDamping, dt);
        const v = bi.velocity;
        v.scale(ld, v);
        const av = bi.angularVelocity;

        if (av) {
          const ad = pow(1.0 - bi.angularDamping, dt);
          av.scale(ad, av);
        }
      }
    }

    this.dispatchEvent(World_step_preStepEvent); // Invoke pre-step callbacks

    for (i = 0; i !== N; i++) {
      const bi = bodies[i];

      if (bi.preStep) {
        bi.preStep.call(bi);
      }
    } // Leap frog
    // vnew = v + h*f/m
    // xnew = x + h*vnew


    if (doProfiling) {
      profilingStart = performance.now();
    }

    const stepnumber = this.stepnumber;
    const quatNormalize = stepnumber % (this.quatNormalizeSkip + 1) === 0;
    const quatNormalizeFast = this.quatNormalizeFast;

    for (i = 0; i !== N; i++) {
      bodies[i].integrate(dt, quatNormalize, quatNormalizeFast);
    }

    this.clearForces();
    this.broadphase.dirty = true;

    if (doProfiling) {
      profile.integrate = performance.now() - profilingStart;
    } // Update world time


    this.time += dt;
    this.stepnumber += 1;
    this.dispatchEvent(World_step_postStepEvent); // Invoke post-step callbacks

    for (i = 0; i !== N; i++) {
      const bi = bodies[i];
      const postStep = bi.postStep;

      if (postStep) {
        postStep.call(bi);
      }
    } // Sleeping update


    let hasActiveBodies = true;

    if (this.allowSleep) {
      hasActiveBodies = false;

      for (i = 0; i !== N; i++) {
        const bi = bodies[i];
        bi.sleepTick(this.time);

        if (bi.sleepState !== Body.SLEEPING) {
          hasActiveBodies = true;
        }
      }
    }

    this.hasActiveBodies = hasActiveBodies;
  }
  /**
   * Sets all body forces in the world to zero.
   * @method clearForces
   */


  clearForces() {
    const bodies = this.bodies;
    const N = bodies.length;

    for (let i = 0; i !== N; i++) {
      const b = bodies[i];
      const force = b.force;
      const tau = b.torque;
      b.force.set(0, 0, 0);
      b.torque.set(0, 0, 0);
    }
  }

} // Temp stuff

const tmpAABB1 = new AABB();
const tmpRay$1 = new Ray(); // performance.now()

let performance = {};

if (typeof window !== 'undefined') {
  performance = window.performance;
} else {
  performance = require('perf_hooks').performance;
}

if (!performance.now) {
  let nowOffset = Date.now();

  if (performance.timing && performance.timing.navigationStart) {
    nowOffset = performance.timing.navigationStart;
  }

  performance.now = () => Date.now() - nowOffset;
}
// Reusable event objects to save memory.

const World_step_postStepEvent = {
  type: 'postStep'
}; // Dispatched before the world steps forward in time.

const World_step_preStepEvent = {
  type: 'preStep'
};
const World_step_collideEvent = {
  type: Body.COLLIDE_EVENT_NAME,
  body: null,
  contact: null
}; // Pools for unused objects

const World_step_oldContacts = [];
const World_step_frictionEquationPool = []; // Reusable arrays for collision pairs

const World_step_p1 = [];
const World_step_p2 = [];

World.prototype.emitContactEvents = (() => {
  const additions = [];
  const removals = [];
  const beginContactEvent = {
    type: 'beginContact',
    bodyA: null,
    bodyB: null
  };
  const endContactEvent = {
    type: 'endContact',
    bodyA: null,
    bodyB: null
  };
  const beginShapeContactEvent = {
    type: 'beginShapeContact',
    bodyA: null,
    bodyB: null,
    shapeA: null,
    shapeB: null
  };
  const endShapeContactEvent = {
    type: 'endShapeContact',
    bodyA: null,
    bodyB: null,
    shapeA: null,
    shapeB: null
  };
  return function () {
    const hasBeginContact = this.hasAnyEventListener('beginContact');
    const hasEndContact = this.hasAnyEventListener('endContact');

    if (hasBeginContact || hasEndContact) {
      this.bodyOverlapKeeper.getDiff(additions, removals);
    }

    if (hasBeginContact) {
      for (let i = 0, l = additions.length; i < l; i += 2) {
        beginContactEvent.bodyA = this.getBodyById(additions[i]);
        beginContactEvent.bodyB = this.getBodyById(additions[i + 1]);
        this.dispatchEvent(beginContactEvent);
      }

      beginContactEvent.bodyA = beginContactEvent.bodyB = null;
    }

    if (hasEndContact) {
      for (let i = 0, l = removals.length; i < l; i += 2) {
        endContactEvent.bodyA = this.getBodyById(removals[i]);
        endContactEvent.bodyB = this.getBodyById(removals[i + 1]);
        this.dispatchEvent(endContactEvent);
      }

      endContactEvent.bodyA = endContactEvent.bodyB = null;
    }

    additions.length = removals.length = 0;
    const hasBeginShapeContact = this.hasAnyEventListener('beginShapeContact');
    const hasEndShapeContact = this.hasAnyEventListener('endShapeContact');

    if (hasBeginShapeContact || hasEndShapeContact) {
      this.shapeOverlapKeeper.getDiff(additions, removals);
    }

    if (hasBeginShapeContact) {
      for (let i = 0, l = additions.length; i < l; i += 2) {
        const shapeA = this.getShapeById(additions[i]);
        const shapeB = this.getShapeById(additions[i + 1]);
        beginShapeContactEvent.shapeA = shapeA;
        beginShapeContactEvent.shapeB = shapeB;
        beginShapeContactEvent.bodyA = shapeA.body;
        beginShapeContactEvent.bodyB = shapeB.body;
        this.dispatchEvent(beginShapeContactEvent);
      }

      beginShapeContactEvent.bodyA = beginShapeContactEvent.bodyB = beginShapeContactEvent.shapeA = beginShapeContactEvent.shapeB = null;
    }

    if (hasEndShapeContact) {
      for (let i = 0, l = removals.length; i < l; i += 2) {
        const shapeA = this.getShapeById(removals[i]);
        const shapeB = this.getShapeById(removals[i + 1]);
        endShapeContactEvent.shapeA = shapeA;
        endShapeContactEvent.shapeB = shapeB;
        endShapeContactEvent.bodyA = shapeA.body;
        endShapeContactEvent.bodyB = shapeB.body;
        this.dispatchEvent(endShapeContactEvent);
      }

      endShapeContactEvent.bodyA = endShapeContactEvent.bodyB = endShapeContactEvent.shapeA = endShapeContactEvent.shapeB = null;
    }
  };
})();

export { AABB, ArrayCollisionMatrix, BODY_SLEEP_STATES, BODY_TYPES, Body, Box, Broadphase, COLLISION_TYPES, ConeTwistConstraint, Constraint, ContactEquation, ContactMaterial, ConvexPolyhedron, Cylinder, DistanceConstraint, Equation, EventTarget, FrictionEquation, GSSolver, GridBroadphase, Heightfield, HingeConstraint, JacobianElement, LockConstraint, Mat3, Material, NaiveBroadphase, Narrowphase, ObjectCollisionMatrix, Particle, Plane, PointToPointConstraint, Pool, Quaternion, RAY_MODES, Ray, RaycastResult, RaycastVehicle, RigidVehicle, RotationalEquation, RotationalMotorEquation, SAPBroadphase, SHAPE_TYPES, SPHSystem, Shape, Solver, Sphere, SplitSolver, Spring, Transform, Trimesh, Vec3, Vec3Pool, World };
