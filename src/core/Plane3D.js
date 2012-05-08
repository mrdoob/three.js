
  /*
  Adapted from the Away3D Plane3D class by David Lenaerts
  */

  this.Plane3D = (function() {

    Plane3D.prototype.ALIGN_ANY = 0;

    Plane3D.prototype.ALIGN_XY = 1;

    Plane3D.prototype.ALIGN_YZ = 2;

    Plane3D.prototype.ALIGN_XZ = 3;

    function Plane3D(a, b, c, d) {
      this.a = a != null ? a : 0;
      this.b = b != null ? b : 0;
      this.c = c != null ? c : 0;
      this.d = d != null ? d : 0;
      this.checkAlignment();
    }

    Plane3D.prototype.checkAlignment = function() {
      this.alignment = Plane3D.prototype.ALIGN_ANY;
      if (this.a === 0 && this.b === 0) {
        this.alignment = Plane3D.prototype.ALIGN_XY_AXIS;
      }
      if (this.b === 0 && this.c === 0) {
        this.alignment = Plane3D.prototype.ALIGN_YZ_AXIS;
      }
      if (this.a === 0 && this.c === 0) {
        return this.alignment = Plane3D.prototype.ALIGN_XZ_AXIS;
      }
    };

    Plane3D.prototype.fromPoints = function(p0, p1, p2) {
      var d1x, d1y, d1z, d2x, d2y, d2z;
      d1x = p1.x - p0.x;
      d1y = p1.y - p0.y;
      d1z = p1.z - p0.z;
      d2x = p2.x - p0.x;
      d2y = p2.y - p0.y;
      d2z = p2.z - p0.z;
      this.a = d1y * d2z - d1z * d2y;
      this.b = d1z * d2x - d1x * d2z;
      this.c = d1x * d2y - d1y * d2x;
      this.d = this.a * p0.x + this.b * p0.y + this.c * p0.z;
      return this.checkAlignment();
    };

    Plane3D.prototype.fromPointAndNormal = function(point, normal) {
      this.a = normal.x;
      this.b = normal.y;
      this.c = normal.z;
      this.d = this.a * point.x + this.b * point.y + this.c * point.z;
      return this.checkAlignment();
    };

    Plane3D.prototype.distance = function(point) {
      switch (this.alignment) {
        case ALIGN_YZ_AXIS:
          return this.a * p.x - this.d;
        case ALIGN_XZ_AXIS:
          return this.b * p.y - this.d;
        case ALIGN_XY_AXIS:
          return this.c * p.z - this.d;
        default:
          return this.a * p.x + this.b * p.y + this.c * p.z - this.d;
      }
    };

    /*
      #Returns the point where the given ray and this Plane3D intersect
    */

    Plane3D.prototype.intersect = function(ray) {
      var L, Pint, S, V, t;
      L = new THREE.Vector4(this.a, this.b, this.c, this.d);
      S = new THREE.Vector4(ray.origin.x, ray.origin.y, ray.origin.z, 1);
      V = new THREE.Vector4(ray.direction.x, ray.direction.y, ray.direction.z, 0);
      if (L.dot(V) === 0) return NaN;
      t = -(L.dot(S) / L.dot(V));
      Pint = S.addSelf(V.multiplyScalar(t));
      return new THREE.Vector3(Pint.x, Pint.y, Pint.z);
    };

    return Plane3D;

  })();
