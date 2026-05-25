// Three.js math types reimplemented in pure Rust.
// Elements arrays are column-major, matching Three.js conventions.

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum RotationOrder {
    XYZ = 0,
    YXZ = 1,
    ZXY = 2,
    ZYX = 3,
    YZX = 4,
    XZY = 5,
}

impl RotationOrder {
    pub fn from_u8(v: u8) -> Self {
        match v {
            0 => RotationOrder::XYZ,
            1 => RotationOrder::YXZ,
            2 => RotationOrder::ZXY,
            3 => RotationOrder::ZYX,
            4 => RotationOrder::YZX,
            5 => RotationOrder::XZY,
            _ => RotationOrder::XYZ,
        }
    }
}

// ---------------------------------------------------------------------------
// Vector3
// ---------------------------------------------------------------------------
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Vector3 {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

impl Vector3 {
    pub fn new(x: f32, y: f32, z: f32) -> Self {
        Vector3 { x, y, z }
    }

    pub fn set(&mut self, x: f32, y: f32, z: f32) -> &mut Self {
        self.x = x;
        self.y = y;
        self.z = z;
        self
    }

    pub fn add(&mut self, v: &Vector3) -> &mut Self {
        self.x += v.x;
        self.y += v.y;
        self.z += v.z;
        self
    }

    pub fn sub(&mut self, v: &Vector3) -> &mut Self {
        self.x -= v.x;
        self.y -= v.y;
        self.z -= v.z;
        self
    }

    pub fn multiply_scalar(&mut self, scalar: f32) -> &mut Self {
        self.x *= scalar;
        self.y *= scalar;
        self.z *= scalar;
        self
    }

    /// Apply a Matrix4 to this vector (with implicit w=1, perspective divide).
    pub fn apply_matrix4(&mut self, m: &Matrix4) -> &mut Self {
        let x = self.x;
        let y = self.y;
        let z = self.z;
        let e = &m.elements;

        let w = 1.0 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

        self.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
        self.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
        self.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
        self
    }

    pub fn length(&self) -> f32 {
        (self.x * self.x + self.y * self.y + self.z * self.z).sqrt()
    }

    pub fn to_array(&self) -> [f32; 3] {
        [self.x, self.y, self.z]
    }
}

// ---------------------------------------------------------------------------
// Euler
// ---------------------------------------------------------------------------
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Euler {
    pub x: f32,
    pub y: f32,
    pub z: f32,
    pub order: RotationOrder,
}

impl Euler {
    pub fn new(x: f32, y: f32, z: f32, order: RotationOrder) -> Self {
        Euler { x, y, z, order }
    }

    pub fn set(&mut self, x: f32, y: f32, z: f32, order: RotationOrder) -> &mut Self {
        self.x = x;
        self.y = y;
        self.z = z;
        self.order = order;
        self
    }
}

// ---------------------------------------------------------------------------
// Quaternion
// ---------------------------------------------------------------------------
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Quaternion {
    pub x: f32,
    pub y: f32,
    pub z: f32,
    pub w: f32,
}

impl Quaternion {
    pub fn new(x: f32, y: f32, z: f32, w: f32) -> Self {
        Quaternion { x, y, z, w }
    }

    pub fn identity() -> Self {
        Quaternion { x: 0.0, y: 0.0, z: 0.0, w: 1.0 }
    }

    pub fn set_from_euler(&mut self, euler: &Euler) -> &mut Self {
        let x = euler.x;
        let y = euler.y;
        let z = euler.z;
        let order = euler.order;

        let c1 = (x / 2.0).cos();
        let c2 = (y / 2.0).cos();
        let c3 = (z / 2.0).cos();
        let s1 = (x / 2.0).sin();
        let s2 = (y / 2.0).sin();
        let s3 = (z / 2.0).sin();

        match order {
            RotationOrder::XYZ => {
                self.x = s1 * c2 * c3 + c1 * s2 * s3;
                self.y = c1 * s2 * c3 - s1 * c2 * s3;
                self.z = c1 * c2 * s3 + s1 * s2 * c3;
                self.w = c1 * c2 * c3 - s1 * s2 * s3;
            }
            RotationOrder::YXZ => {
                self.x = s1 * c2 * c3 + c1 * s2 * s3;
                self.y = c1 * s2 * c3 - s1 * c2 * s3;
                self.z = c1 * c2 * s3 - s1 * s2 * c3;
                self.w = c1 * c2 * c3 + s1 * s2 * s3;
            }
            RotationOrder::ZXY => {
                self.x = s1 * c2 * c3 - c1 * s2 * s3;
                self.y = c1 * s2 * c3 + s1 * c2 * s3;
                self.z = c1 * c2 * s3 + s1 * s2 * c3;
                self.w = c1 * c2 * c3 - s1 * s2 * s3;
            }
            RotationOrder::ZYX => {
                self.x = s1 * c2 * c3 - c1 * s2 * s3;
                self.y = c1 * s2 * c3 + s1 * c2 * s3;
                self.z = c1 * c2 * s3 - s1 * s2 * c3;
                self.w = c1 * c2 * c3 + s1 * s2 * s3;
            }
            RotationOrder::YZX => {
                self.x = s1 * c2 * c3 + c1 * s2 * s3;
                self.y = c1 * s2 * c3 + s1 * c2 * s3;
                self.z = c1 * c2 * s3 - s1 * s2 * c3;
                self.w = c1 * c2 * c3 - s1 * s2 * s3;
            }
            RotationOrder::XZY => {
                self.x = s1 * c2 * c3 - c1 * s2 * s3;
                self.y = c1 * s2 * c3 - s1 * c2 * s3;
                self.z = c1 * c2 * s3 + s1 * s2 * c3;
                self.w = c1 * c2 * c3 + s1 * s2 * s3;
            }
        }
        self
    }

    /// Extract quaternion from a pure rotation matrix (upper-left 3x3 of a Matrix4).
    pub fn set_from_rotation_matrix(&mut self, m: &Matrix4) -> &mut Self {
        let te = &m.elements;

        let m11 = te[0];
        let m12 = te[4];
        let m13 = te[8];
        let m21 = te[1];
        let m22 = te[5];
        let m23 = te[9];
        let m31 = te[2];
        let m32 = te[6];
        let m33 = te[10];

        let trace = m11 + m22 + m33;

        if trace > 0.0 {
            let s = 0.5 / (trace + 1.0).sqrt();
            self.w = 0.25 / s;
            self.x = (m32 - m23) * s;
            self.y = (m13 - m31) * s;
            self.z = (m21 - m12) * s;
        } else if m11 > m22 && m11 > m33 {
            let s = 2.0 * (1.0 + m11 - m22 - m33).sqrt();
            self.w = (m32 - m23) / s;
            self.x = 0.25 * s;
            self.y = (m12 + m21) / s;
            self.z = (m13 + m31) / s;
        } else if m22 > m33 {
            let s = 2.0 * (1.0 + m22 - m11 - m33).sqrt();
            self.w = (m13 - m31) / s;
            self.x = (m12 + m21) / s;
            self.y = 0.25 * s;
            self.z = (m23 + m32) / s;
        } else {
            let s = 2.0 * (1.0 + m33 - m11 - m22).sqrt();
            self.w = (m21 - m12) / s;
            self.x = (m13 + m31) / s;
            self.y = (m23 + m32) / s;
            self.z = 0.25 * s;
        }
        self
    }

    pub fn multiply_quaternions(&mut self, a: &Quaternion, b: &Quaternion) -> &mut Self {
        let qax = a.x;
        let qay = a.y;
        let qaz = a.z;
        let qaw = a.w;
        let qbx = b.x;
        let qby = b.y;
        let qbz = b.z;
        let qbw = b.w;

        self.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
        self.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
        self.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
        self.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
        self
    }
}

// ---------------------------------------------------------------------------
// Matrix4
// ---------------------------------------------------------------------------
/// Column-major 4x4 matrix. elements[0..15] matches Three.js Matrix4.elements.
#[derive(Debug, Clone)]
pub struct Matrix4 {
    pub elements: [f32; 16],
}

impl Matrix4 {
    pub fn new() -> Self {
        Matrix4::identity()
    }

    pub fn identity() -> Self {
        let mut e = [0.0f32; 16];
        e[0] = 1.0;
        e[5] = 1.0;
        e[10] = 1.0;
        e[15] = 1.0;
        Matrix4 { elements: e }
    }

    pub fn copy(&mut self, m: &Matrix4) -> &mut Self {
        self.elements.copy_from_slice(&m.elements);
        self
    }

    /// Compose a transformation matrix from position, quaternion rotation, and scale.
    /// This is equivalent to: T * R * S
    pub fn compose(&mut self, position: &Vector3, quaternion: &Quaternion, scale: &Vector3) -> &mut Self {
        let te = &mut self.elements;

        let x = quaternion.x;
        let y = quaternion.y;
        let z = quaternion.z;
        let w = quaternion.w;
        let x2 = x + x;
        let y2 = y + y;
        let z2 = z + z;
        let xx = x * x2;
        let xy = x * y2;
        let xz = x * z2;
        let yy = y * y2;
        let yz = y * z2;
        let zz = z * z2;
        let wx = w * x2;
        let wy = w * y2;
        let wz = w * z2;

        let sx = scale.x;
        let sy = scale.y;
        let sz = scale.z;

        te[0] = (1.0 - (yy + zz)) * sx;
        te[1] = (xy + wz) * sx;
        te[2] = (xz - wy) * sx;
        te[3] = 0.0;

        te[4] = (xy - wz) * sy;
        te[5] = (1.0 - (xx + zz)) * sy;
        te[6] = (yz + wx) * sy;
        te[7] = 0.0;

        te[8] = (xz + wy) * sz;
        te[9] = (yz - wx) * sz;
        te[10] = (1.0 - (xx + yy)) * sz;
        te[11] = 0.0;

        te[12] = position.x;
        te[13] = position.y;
        te[14] = position.z;
        te[15] = 1.0;

        self
    }

    /// Decompose this matrix into position, quaternion rotation, and scale.
    pub fn decompose(&self, position: &mut Vector3, quaternion: &mut Quaternion, scale: &mut Vector3) {
        let te = &self.elements;

        position.x = te[12];
        position.y = te[13];
        position.z = te[14];

        // Extract scale from column vectors
        let sx = Vector3::new(te[0], te[1], te[2]).length();
        let sy = Vector3::new(te[4], te[5], te[6]).length();
        let sz = Vector3::new(te[8], te[9], te[10]).length();

        // Handle negative determinant
        let det = self.determinant();
        let sx_final = if det < 0.0 { -sx } else { sx };

        // Build a pure rotation matrix by removing scale
        let inv_sx = 1.0 / sx_final;
        let inv_sy = 1.0 / sy;
        let inv_sz = 1.0 / sz;

        let rot_mat = Matrix4 {
            elements: [
                te[0] * inv_sx,
                te[1] * inv_sx,
                te[2] * inv_sx,
                0.0,
                te[4] * inv_sy,
                te[5] * inv_sy,
                te[6] * inv_sy,
                0.0,
                te[8] * inv_sz,
                te[9] * inv_sz,
                te[10] * inv_sz,
                0.0,
                0.0,
                0.0,
                0.0,
                1.0,
            ],
        };

        quaternion.set_from_rotation_matrix(&rot_mat);

        scale.x = sx_final;
        scale.y = sy;
        scale.z = sz;
    }

    /// Compute determinant of this matrix.
    pub fn determinant(&self) -> f32 {
        let te = &self.elements;

        let n11 = te[0];
        let n12 = te[4];
        let n13 = te[8];
        let n14 = te[12];
        let n21 = te[1];
        let n22 = te[5];
        let n23 = te[9];
        let n24 = te[13];
        let n31 = te[2];
        let n32 = te[6];
        let n33 = te[10];
        let n34 = te[14];
        let n41 = te[3];
        let n42 = te[7];
        let n43 = te[11];
        let n44 = te[15];

        let t11 = n23 * n34 - n24 * n33;
        let t12 = n22 * n34 - n24 * n32;
        let t13 = n22 * n33 - n23 * n32;
        let t21 = n21 * n34 - n24 * n31;
        let t22 = n21 * n33 - n23 * n31;
        let t23 = n21 * n32 - n22 * n31;

        n11 * (n42 * t11 - n43 * t12 + n44 * t13)
            - n12 * (n41 * t11 - n43 * t21 + n44 * t22)
            + n13 * (n41 * t12 - n42 * t21 + n44 * t23)
            - n14 * (n41 * t13 - n42 * t22 + n43 * t23)
    }

    /// this = a * b  (post-multiply, matching Three.js Matrix4.multiplyMatrices)
    pub fn multiply_matrices(a: &Matrix4, b: &Matrix4) -> Matrix4 {
        let ae = &a.elements;
        let be = &b.elements;

        let a11 = ae[0]; let a12 = ae[4]; let a13 = ae[8]; let a14 = ae[12];
        let a21 = ae[1]; let a22 = ae[5]; let a23 = ae[9]; let a24 = ae[13];
        let a31 = ae[2]; let a32 = ae[6]; let a33 = ae[10]; let a34 = ae[14];
        let a41 = ae[3]; let a42 = ae[7]; let a43 = ae[11]; let a44 = ae[15];

        let b11 = be[0]; let b12 = be[4]; let b13 = be[8]; let b14 = be[12];
        let b21 = be[1]; let b22 = be[5]; let b23 = be[9]; let b24 = be[13];
        let b31 = be[2]; let b32 = be[6]; let b33 = be[10]; let b34 = be[14];
        let b41 = be[3]; let b42 = be[7]; let b43 = be[11]; let b44 = be[15];

        let mut te = [0.0f32; 16];

        te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

        te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

        te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

        te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

        Matrix4 { elements: te }
    }

    pub fn to_array(&self) -> [f32; 16] {
        self.elements
    }

    pub fn inverse(&self) -> Matrix4 {
        let m = &self.elements;
        let mut te = [0.0f32; 16];
        te[0] = m[5]*m[10]*m[15] - m[5]*m[11]*m[14] - m[9]*m[6]*m[15] + m[9]*m[7]*m[14] + m[13]*m[6]*m[11] - m[13]*m[7]*m[10];
        te[4] = -m[4]*m[10]*m[15] + m[4]*m[11]*m[14] + m[8]*m[6]*m[15] - m[8]*m[7]*m[14] - m[12]*m[6]*m[11] + m[12]*m[7]*m[10];
        te[8] = m[4]*m[9]*m[15] - m[4]*m[11]*m[13] - m[8]*m[5]*m[15] + m[8]*m[7]*m[13] + m[12]*m[5]*m[11] - m[12]*m[7]*m[9];
        te[12] = -m[4]*m[9]*m[14] + m[4]*m[10]*m[13] + m[8]*m[5]*m[14] - m[8]*m[6]*m[13] - m[12]*m[5]*m[10] + m[12]*m[6]*m[9];
        te[1] = -m[1]*m[10]*m[15] + m[1]*m[11]*m[14] + m[9]*m[2]*m[15] - m[9]*m[3]*m[14] - m[13]*m[2]*m[11] + m[13]*m[3]*m[10];
        te[5] = m[0]*m[10]*m[15] - m[0]*m[11]*m[14] - m[8]*m[2]*m[15] + m[8]*m[3]*m[14] + m[12]*m[2]*m[11] - m[12]*m[3]*m[10];
        te[9] = -m[0]*m[9]*m[15] + m[0]*m[11]*m[13] + m[8]*m[1]*m[15] - m[8]*m[3]*m[13] - m[12]*m[1]*m[11] + m[12]*m[3]*m[9];
        te[13] = m[0]*m[9]*m[14] - m[0]*m[10]*m[13] - m[8]*m[1]*m[14] + m[8]*m[2]*m[13] + m[12]*m[1]*m[10] - m[12]*m[2]*m[9];
        te[2] = m[1]*m[6]*m[15] - m[1]*m[7]*m[14] - m[5]*m[2]*m[15] + m[5]*m[3]*m[14] + m[13]*m[2]*m[7] - m[13]*m[3]*m[6];
        te[6] = -m[0]*m[6]*m[15] + m[0]*m[7]*m[14] + m[4]*m[2]*m[15] - m[4]*m[3]*m[14] - m[12]*m[2]*m[7] + m[12]*m[3]*m[6];
        te[10] = m[0]*m[5]*m[15] - m[0]*m[7]*m[13] - m[4]*m[1]*m[15] + m[4]*m[3]*m[13] + m[12]*m[1]*m[7] - m[12]*m[3]*m[5];
        te[14] = -m[0]*m[5]*m[14] + m[0]*m[6]*m[13] + m[4]*m[1]*m[14] - m[4]*m[2]*m[13] - m[12]*m[1]*m[6] + m[12]*m[2]*m[5];
        te[3] = -m[1]*m[6]*m[11] + m[1]*m[7]*m[10] + m[5]*m[2]*m[11] - m[5]*m[3]*m[10] - m[9]*m[2]*m[7] + m[9]*m[3]*m[6];
        te[7] = m[0]*m[6]*m[11] - m[0]*m[7]*m[10] - m[4]*m[2]*m[11] + m[4]*m[3]*m[10] + m[8]*m[2]*m[7] - m[8]*m[3]*m[6];
        te[11] = -m[0]*m[5]*m[11] + m[0]*m[7]*m[9] + m[4]*m[1]*m[11] - m[4]*m[3]*m[9] - m[8]*m[1]*m[7] + m[8]*m[3]*m[5];
        te[15] = m[0]*m[5]*m[10] - m[0]*m[6]*m[9] - m[4]*m[1]*m[10] + m[4]*m[2]*m[9] + m[8]*m[1]*m[6] - m[8]*m[2]*m[5];
        let det = m[0]*te[0] + m[1]*te[4] + m[2]*te[8] + m[3]*te[12];
        if det.abs() < 1e-10 { return Matrix4::identity(); }
        let inv_det = 1.0 / det;
        for v in te.iter_mut() { *v *= inv_det; }
        Matrix4 { elements: te }
    }

    pub fn perspective(fov_y: f32, aspect: f32, near: f32, far: f32) -> Matrix4 {
        let f = 1.0 / (fov_y / 2.0).tan();
        let nf = 1.0 / (near - far);
        let mut m = Matrix4::identity();
        m.elements[0] = f / aspect;
        m.elements[5] = f;
        m.elements[10] = (far + near) * nf;
        m.elements[11] = -1.0;
        m.elements[14] = 2.0 * far * near * nf;
        m.elements[15] = 0.0;
        m
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vector3_new() {
        let v = Vector3::new(1.0, 2.0, 3.0);
        assert_eq!(v.x, 1.0);
        assert_eq!(v.y, 2.0);
        assert_eq!(v.z, 3.0);
    }

    #[test]
    fn test_vector3_add() {
        let mut a = Vector3::new(1.0, 2.0, 3.0);
        let b = Vector3::new(4.0, 5.0, 6.0);
        a.add(&b);
        assert_eq!(a.x, 5.0);
        assert_eq!(a.y, 7.0);
        assert_eq!(a.z, 9.0);
    }

    #[test]
    fn test_vector3_sub() {
        let mut a = Vector3::new(5.0, 5.0, 5.0);
        let b = Vector3::new(2.0, 3.0, 4.0);
        a.sub(&b);
        assert_eq!(a.x, 3.0);
        assert_eq!(a.y, 2.0);
        assert_eq!(a.z, 1.0);
    }

    #[test]
    fn test_vector3_multiply_scalar() {
        let mut v = Vector3::new(1.0, 2.0, 3.0);
        v.multiply_scalar(2.0);
        assert_eq!(v.x, 2.0);
        assert_eq!(v.y, 4.0);
        assert_eq!(v.z, 6.0);
    }

    #[test]
    fn test_vector3_apply_matrix4_identity() {
        let mut v = Vector3::new(1.0, 2.0, 3.0);
        let m = Matrix4::identity();
        v.apply_matrix4(&m);
        assert_eq!(v.x, 1.0);
        assert_eq!(v.y, 2.0);
        assert_eq!(v.z, 3.0);
    }

    #[test]
    fn test_vector3_apply_matrix4_translation() {
        let mut v = Vector3::new(1.0, 2.0, 3.0);
        let mut m = Matrix4::identity();
        m.elements[12] = 10.0;
        m.elements[13] = 20.0;
        m.elements[14] = 30.0;
        v.apply_matrix4(&m);
        assert_eq!(v.x, 11.0);
        assert_eq!(v.y, 22.0);
        assert_eq!(v.z, 33.0);
    }

    #[test]
    fn test_vector3_to_array() {
        let v = Vector3::new(1.0, 2.0, 3.0);
        assert_eq!(v.to_array(), [1.0, 2.0, 3.0]);
    }

    #[test]
    fn test_euler_new() {
        let e = Euler::new(0.1, 0.2, 0.3, RotationOrder::YXZ);
        assert!((e.x - 0.1).abs() < 1e-6);
        assert!((e.y - 0.2).abs() < 1e-6);
        assert!((e.z - 0.3).abs() < 1e-6);
        assert_eq!(e.order, RotationOrder::YXZ);
    }

    #[test]
    fn test_quaternion_identity() {
        let q = Quaternion::identity();
        assert_eq!(q.x, 0.0);
        assert_eq!(q.y, 0.0);
        assert_eq!(q.z, 0.0);
        assert_eq!(q.w, 1.0);
    }

    #[test]
    fn test_quaternion_set_from_euler_no_rotation() {
        let mut q = Quaternion::identity();
        let e = Euler::new(0.0, 0.0, 0.0, RotationOrder::XYZ);
        q.set_from_euler(&e);
        assert!((q.x - 0.0).abs() < 1e-6);
        assert!((q.y - 0.0).abs() < 1e-6);
        assert!((q.z - 0.0).abs() < 1e-6);
        assert!((q.w - 1.0).abs() < 1e-6);
    }

    #[test]
    fn test_quaternion_set_from_euler_xyz() {
        // 90 degrees around X
        let mut q = Quaternion::identity();
        let e = Euler::new(std::f32::consts::PI / 2.0, 0.0, 0.0, RotationOrder::XYZ);
        q.set_from_euler(&e);
        let expected = std::f32::consts::FRAC_1_SQRT_2; // sin(45°) = cos(45°) = √2/2
        assert!((q.x - expected).abs() < 1e-6);
        assert!((q.y - 0.0).abs() < 1e-6);
        assert!((q.z - 0.0).abs() < 1e-6);
        assert!((q.w - expected).abs() < 1e-6);
    }

    #[test]
    fn test_matrix4_identity() {
        let m = Matrix4::identity();
        for i in 0..16 {
            if i == 0 || i == 5 || i == 10 || i == 15 {
                assert_eq!(m.elements[i], 1.0);
            } else {
                assert_eq!(m.elements[i], 0.0);
            }
        }
    }

    #[test]
    fn test_matrix4_compose_translation_only() {
        let mut m = Matrix4::identity();
        let pos = Vector3::new(1.0, 2.0, 3.0);
        let q = Quaternion::identity();
        let s = Vector3::new(1.0, 1.0, 1.0);
        m.compose(&pos, &q, &s);
        assert_eq!(m.elements[12], 1.0);
        assert_eq!(m.elements[13], 2.0);
        assert_eq!(m.elements[14], 3.0);
        assert_eq!(m.elements[15], 1.0);
    }

    #[test]
    fn test_matrix4_compose_scale_only() {
        let mut m = Matrix4::identity();
        let pos = Vector3::new(0.0, 0.0, 0.0);
        let q = Quaternion::identity();
        let s = Vector3::new(2.0, 3.0, 4.0);
        m.compose(&pos, &q, &s);
        assert_eq!(m.elements[0], 2.0);
        assert_eq!(m.elements[5], 3.0);
        assert_eq!(m.elements[10], 4.0);
    }

    #[test]
    fn test_matrix4_compose_roundtrip() {
        let pos = Vector3::new(10.0, 20.0, 30.0);
        let mut q = Quaternion::identity();
        let euler = Euler::new(0.5, 0.3, 0.1, RotationOrder::YXZ);
        q.set_from_euler(&euler);
        let scale = Vector3::new(2.0, 1.5, 3.0);

        let mut m = Matrix4::identity();
        m.compose(&pos, &q, &scale);

        let mut d_pos = Vector3::new(0.0, 0.0, 0.0);
        let mut d_q = Quaternion::identity();
        let mut d_s = Vector3::new(0.0, 0.0, 0.0);
        m.decompose(&mut d_pos, &mut d_q, &mut d_s);

        assert!((d_pos.x - pos.x).abs() < 1e-5, "pos x mismatch: {} vs {}", d_pos.x, pos.x);
        assert!((d_pos.y - pos.y).abs() < 1e-5, "pos y mismatch");
        assert!((d_pos.z - pos.z).abs() < 1e-5, "pos z mismatch");
        assert!((d_s.x - scale.x).abs() < 1e-5, "scale x mismatch");
        assert!((d_s.y - scale.y).abs() < 1e-5, "scale y mismatch");
        assert!((d_s.z - scale.z).abs() < 1e-5, "scale z mismatch");
        assert!((d_q.x - q.x).abs() < 1e-5, "q.x mismatch: {} vs {}", d_q.x, q.x);
        assert!((d_q.y - q.y).abs() < 1e-5, "q.y mismatch");
        assert!((d_q.z - q.z).abs() < 1e-5, "q.z mismatch");
        assert!((d_q.w - q.w).abs() < 1e-5, "q.w mismatch");
    }

    #[test]
    fn test_matrix4_multiply_matrices_translation() {
        // T(1,2,3) * T(4,5,6) = T(5,7,9)
        let mut ta = Matrix4::identity();
        let mut tb = Matrix4::identity();
        ta.compose(&Vector3::new(1.0, 2.0, 3.0), &Quaternion::identity(), &Vector3::new(1.0, 1.0, 1.0));
        tb.compose(&Vector3::new(4.0, 5.0, 6.0), &Quaternion::identity(), &Vector3::new(1.0, 1.0, 1.0));

        let result = Matrix4::multiply_matrices(&ta, &tb);
        assert!((result.elements[12] - 5.0).abs() < 1e-6);
        assert!((result.elements[13] - 7.0).abs() < 1e-6);
        assert!((result.elements[14] - 9.0).abs() < 1e-6);
    }

    #[test]
    fn test_euler_all_orders_no_rotation() {
        let orders = [
            RotationOrder::XYZ,
            RotationOrder::YXZ,
            RotationOrder::ZXY,
            RotationOrder::ZYX,
            RotationOrder::YZX,
            RotationOrder::XZY,
        ];
        for &order in &orders {
            let mut q = Quaternion::identity();
            let e = Euler::new(0.0, 0.0, 0.0, order);
            q.set_from_euler(&e);
            assert!((q.x - 0.0).abs() < 1e-6, "order {:?}: x non-zero", order);
            assert!((q.y - 0.0).abs() < 1e-6, "order {:?}: y non-zero", order);
            assert!((q.z - 0.0).abs() < 1e-6, "order {:?}: z non-zero", order);
            assert!((q.w - 1.0).abs() < 1e-6, "order {:?}: w != 1", order);
        }
    }

    #[test]
    fn test_matrix4_multiply_identity() {
        let pos = Vector3::new(5.0, 10.0, 15.0);
        let q = Quaternion::identity();
        let s = Vector3::new(2.0, 2.0, 2.0);
        let mut m = Matrix4::identity();
        m.compose(&pos, &q, &s);

        let id = Matrix4::identity();
        let result = Matrix4::multiply_matrices(&m, &id);

        for i in 0..16 {
            assert!((result.elements[i] - m.elements[i]).abs() < 1e-6, "element {} mismatch", i);
        }
    }

    #[test]
    fn test_vector3_apply_matrix4_scale() {
        let mut v = Vector3::new(2.0, 3.0, 4.0);
        let mut m = Matrix4::identity();
        m.elements[0] = 2.0;
        m.elements[5] = 3.0;
        m.elements[10] = 4.0;
        v.apply_matrix4(&m);
        assert_eq!(v.x, 4.0);
        assert_eq!(v.y, 9.0);
        assert_eq!(v.z, 16.0);
    }

    #[test]
    fn test_quaternion_multiply_identity() {
        let mut q = Quaternion::identity();
        let e = Euler::new(0.5, 0.0, 0.0, RotationOrder::XYZ);
        q.set_from_euler(&e);
        let id = Quaternion::identity();
        let mut result = Quaternion::identity();
        result.multiply_quaternions(&q, &id);
        assert!((result.x - q.x).abs() < 1e-6);
        assert!((result.y - q.y).abs() < 1e-6);
        assert!((result.z - q.z).abs() < 1e-6);
        assert!((result.w - q.w).abs() < 1e-6);
    }
}
