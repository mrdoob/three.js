/**
 * @author WestLangley
 * @author thezwap 
 */

THREE.MathUtils = {
    setQuaternionFromProperEuler: function (q, a, b, c, order) {

        var cos = Math.cos;
        var sin = Math.sin;

        var c1 = cos(a / 2);
        var c2 = cos(b / 2);
        var c3 = cos(c / 2);

        var s1 = sin(a / 2);
        var s2 = sin(b / 2);
        var s3 = sin(c / 2);

        var c13 = cos((a + c) / 2);
        var s13 = sin((a + c) / 2);

        var c1_3 = cos((a - c) / 2);
        var s1_3 = sin((a - c) / 2);

        var c3_1 = cos((c - a) / 2);
        var s3_1 = sin((c - a) / 2);

        var qx = 0;
        var qy = 0;
        var qz = 0;
        var qw = 0;

        if (order === 'XYX') {

            qx = c2 * s13;
            qy = s2 * c1_3;
            qz = s2 * s1_3;
            qw = c2 * c13;

        } else if (order === 'YZY') {

            qx = s2 * s1_3;
            qy = c2 * s13;
            qz = s2 * c1_3;
            qw = c2 * c13;

        } else if (order === 'ZXZ') {

            qx = s2 * c1_3;
            qy = s2 * s1_3;
            qz = c2 * s13;
            qw = c2 * c13;

        } else if (order === 'XZX') {

            qx = c2 * s13;
            qy = s2 * s3_1;
            qz = s2 * c3_1;
            qw = c2 * c13;

        } else if (order === 'YXY') {

            qx = s2 * c3_1;
            qy = c2 * s13;
            qz = s2 * s3_1;
            qw = c2 * c13;

        } else if (order === 'ZYZ') {

            qx = s2 * s3_1;
            qy = s2 * c3_1;
            qz = c2 * s13;
            qw = c2 * c13;

        }

        else {

            console.warn('THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order.');

        }

        q.set( qx, qy, qz, qw);

    }
}