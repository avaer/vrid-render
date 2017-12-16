/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */

module.exports = {};

(function() {
    'use strict';

    function q(b) {
        throw b;
    }
    var t = void 0,
        u = !0,
        aa = this;

    function A(b, a) {
        var c = b.split("."),
            d = aa;
        !(c[0] in d) && d.execScript && d.execScript("var " + c[0]);
        for (var e; c.length && (e = c.shift());) !c.length && a !== t ? d[e] = a : d = d[e] ? d[e] : d[e] = {}
    };
    var B = "undefined" !== typeof Uint8Array && "undefined" !== typeof Uint16Array && "undefined" !== typeof Uint32Array && "undefined" !== typeof DataView;

    function F(b, a) {
        this.index = "number" === typeof a ? a : 0;
        this.m = 0;
        this.buffer = b instanceof(B ? Uint8Array : Array) ? b : new(B ? Uint8Array : Array)(32768);
        2 * this.buffer.length <= this.index && q(Error("invalid index"));
        this.buffer.length <= this.index && this.f()
    }
    F.prototype.f = function() {
        var b = this.buffer,
            a, c = b.length,
            d = new(B ? Uint8Array : Array)(c << 1);
        if (B) d.set(b);
        else
            for (a = 0; a < c; ++a) d[a] = b[a];
        return this.buffer = d
    };
    F.prototype.d = function(b, a, c) {
        var d = this.buffer,
            e = this.index,
            f = this.m,
            g = d[e],
            k;
        c && 1 < a && (b = 8 < a ? (H[b & 255] << 24 | H[b >>> 8 & 255] << 16 | H[b >>> 16 & 255] << 8 | H[b >>> 24 & 255]) >> 32 - a : H[b] >> 8 - a);
        if (8 > a + f) g = g << a | b, f += a;
        else
            for (k = 0; k < a; ++k) g = g << 1 | b >> a - k - 1 & 1, 8 === ++f && (f = 0, d[e++] = H[g], g = 0, e === d.length && (d = this.f()));
        d[e] = g;
        this.buffer = d;
        this.m = f;
        this.index = e
    };
    F.prototype.finish = function() {
        var b = this.buffer,
            a = this.index,
            c;
        0 < this.m && (b[a] <<= 8 - this.m, b[a] = H[b[a]], a++);
        B ? c = b.subarray(0, a) : (b.length = a, c = b);
        return c
    };
    var ba = new(B ? Uint8Array : Array)(256),
        ca;
    for (ca = 0; 256 > ca; ++ca) {
        for (var K = ca, da = K, ea = 7, K = K >>> 1; K; K >>>= 1) da <<= 1, da |= K & 1, --ea;
        ba[ca] = (da << ea & 255) >>> 0
    }
    var H = ba;

    function ja(b, a, c) {
        var d, e = "number" === typeof a ? a : a = 0,
            f = "number" === typeof c ? c : b.length;
        d = -1;
        for (e = f & 7; e--; ++a) d = d >>> 8 ^ O[(d ^ b[a]) & 255];
        for (e = f >> 3; e--; a += 8) d = d >>> 8 ^ O[(d ^ b[a]) & 255], d = d >>> 8 ^ O[(d ^ b[a + 1]) & 255], d = d >>> 8 ^ O[(d ^ b[a + 2]) & 255], d = d >>> 8 ^ O[(d ^ b[a + 3]) & 255], d = d >>> 8 ^ O[(d ^ b[a + 4]) & 255], d = d >>> 8 ^ O[(d ^ b[a + 5]) & 255], d = d >>> 8 ^ O[(d ^ b[a + 6]) & 255], d = d >>> 8 ^ O[(d ^ b[a + 7]) & 255];
        return (d ^ 4294967295) >>> 0
    }
    var ka = [0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615, 3915621685, 2657392035, 249268274, 2044508324, 3772115230, 2547177864, 162941995, 2125561021, 3887607047, 2428444049, 498536548, 1789927666, 4089016648, 2227061214, 450548861, 1843258603, 4107580753, 2211677639, 325883990, 1684777152, 4251122042, 2321926636, 335633487, 1661365465, 4195302755, 2366115317, 997073096, 1281953886, 3579855332, 2724688242, 1006888145, 1258607687, 3524101629, 2768942443, 901097722, 1119000684, 3686517206, 2898065728, 853044451, 1172266101, 3705015759,
            2882616665, 651767980, 1373503546, 3369554304, 3218104598, 565507253, 1454621731, 3485111705, 3099436303, 671266974, 1594198024, 3322730930, 2970347812, 795835527, 1483230225, 3244367275, 3060149565, 1994146192, 31158534, 2563907772, 4023717930, 1907459465, 112637215, 2680153253, 3904427059, 2013776290, 251722036, 2517215374, 3775830040, 2137656763, 141376813, 2439277719, 3865271297, 1802195444, 476864866, 2238001368, 4066508878, 1812370925, 453092731, 2181625025, 4111451223, 1706088902, 314042704, 2344532202, 4240017532, 1658658271, 366619977,
            2362670323, 4224994405, 1303535960, 984961486, 2747007092, 3569037538, 1256170817, 1037604311, 2765210733, 3554079995, 1131014506, 879679996, 2909243462, 3663771856, 1141124467, 855842277, 2852801631, 3708648649, 1342533948, 654459306, 3188396048, 3373015174, 1466479909, 544179635, 3110523913, 3462522015, 1591671054, 702138776, 2966460450, 3352799412, 1504918807, 783551873, 3082640443, 3233442989, 3988292384, 2596254646, 62317068, 1957810842, 3939845945, 2647816111, 81470997, 1943803523, 3814918930, 2489596804, 225274430, 2053790376, 3826175755,
            2466906013, 167816743, 2097651377, 4027552580, 2265490386, 503444072, 1762050814, 4150417245, 2154129355, 426522225, 1852507879, 4275313526, 2312317920, 282753626, 1742555852, 4189708143, 2394877945, 397917763, 1622183637, 3604390888, 2714866558, 953729732, 1340076626, 3518719985, 2797360999, 1068828381, 1219638859, 3624741850, 2936675148, 906185462, 1090812512, 3747672003, 2825379669, 829329135, 1181335161, 3412177804, 3160834842, 628085408, 1382605366, 3423369109, 3138078467, 570562233, 1426400815, 3317316542, 2998733608, 733239954, 1555261956,
            3268935591, 3050360625, 752459403, 1541320221, 2607071920, 3965973030, 1969922972, 40735498, 2617837225, 3943577151, 1913087877, 83908371, 2512341634, 3803740692, 2075208622, 213261112, 2463272603, 3855990285, 2094854071, 198958881, 2262029012, 4057260610, 1759359992, 534414190, 2176718541, 4139329115, 1873836001, 414664567, 2282248934, 4279200368, 1711684554, 285281116, 2405801727, 4167216745, 1634467795, 376229701, 2685067896, 3608007406, 1308918612, 956543938, 2808555105, 3495958263, 1231636301, 1047427035, 2932959818, 3654703836, 1088359270,
            936918E3, 2847714899, 3736837829, 1202900863, 817233897, 3183342108, 3401237130, 1404277552, 615818150, 3134207493, 3453421203, 1423857449, 601450431, 3009837614, 3294710456, 1567103746, 711928724, 3020668471, 3272380065, 1510334235, 755167117
        ],
        O = B ? new Uint32Array(ka) : ka;

    function P() {}
    P.prototype.getName = function() {
        return this.name
    };
    P.prototype.getData = function() {
        return this.data
    };
    P.prototype.Y = function() {
        return this.Z
    };
    A("GunzipMember", P);
    A("GunzipMember.prototype.getName", P.prototype.getName);
    A("GunzipMember.prototype.getData", P.prototype.getData);
    A("GunzipMember.prototype.getMtime", P.prototype.Y);

    function la(b) {
        this.buffer = new(B ? Uint16Array : Array)(2 * b);
        this.length = 0
    }
    la.prototype.getParent = function(b) {
        return 2 * ((b - 2) / 4 | 0)
    };
    la.prototype.push = function(b, a) {
        var c, d, e = this.buffer,
            f;
        c = this.length;
        e[this.length++] = a;
        for (e[this.length++] = b; 0 < c;)
            if (d = this.getParent(c), e[c] > e[d]) f = e[c], e[c] = e[d], e[d] = f, f = e[c + 1], e[c + 1] = e[d + 1], e[d + 1] = f, c = d;
            else break;
        return this.length
    };
    la.prototype.pop = function() {
        var b, a, c = this.buffer,
            d, e, f;
        a = c[0];
        b = c[1];
        this.length -= 2;
        c[0] = c[this.length];
        c[1] = c[this.length + 1];
        for (f = 0;;) {
            e = 2 * f + 2;
            if (e >= this.length) break;
            e + 2 < this.length && c[e + 2] > c[e] && (e += 2);
            if (c[e] > c[f]) d = c[f], c[f] = c[e], c[e] = d, d = c[f + 1], c[f + 1] = c[e + 1], c[e + 1] = d;
            else break;
            f = e
        }
        return {
            index: b,
            value: a,
            length: this.length
        }
    };

    function ma(b) {
        var a = b.length,
            c = 0,
            d = Number.POSITIVE_INFINITY,
            e, f, g, k, h, l, s, p, m, n;
        for (p = 0; p < a; ++p) b[p] > c && (c = b[p]), b[p] < d && (d = b[p]);
        e = 1 << c;
        f = new(B ? Uint32Array : Array)(e);
        g = 1;
        k = 0;
        for (h = 2; g <= c;) {
            for (p = 0; p < a; ++p)
                if (b[p] === g) {
                    l = 0;
                    s = k;
                    for (m = 0; m < g; ++m) l = l << 1 | s & 1, s >>= 1;
                    n = g << 16 | p;
                    for (m = l; m < e; m += h) f[m] = n;
                    ++k
                }++g;
            k <<= 1;
            h <<= 1
        }
        return [f, c, d]
    };

    function na(b, a) {
        this.k = qa;
        this.I = 0;
        this.input = B && b instanceof Array ? new Uint8Array(b) : b;
        this.b = 0;
        a && (a.lazy && (this.I = a.lazy), "number" === typeof a.compressionType && (this.k = a.compressionType), a.outputBuffer && (this.a = B && a.outputBuffer instanceof Array ? new Uint8Array(a.outputBuffer) : a.outputBuffer), "number" === typeof a.outputIndex && (this.b = a.outputIndex));
        this.a || (this.a = new(B ? Uint8Array : Array)(32768))
    }
    var qa = 2,
        ra = {
            NONE: 0,
            v: 1,
            o: qa,
            ba: 3
        },
        sa = [],
        S;
    for (S = 0; 288 > S; S++) switch (u) {
        case 143 >= S:
            sa.push([S + 48, 8]);
            break;
        case 255 >= S:
            sa.push([S - 144 + 400, 9]);
            break;
        case 279 >= S:
            sa.push([S - 256 + 0, 7]);
            break;
        case 287 >= S:
            sa.push([S - 280 + 192, 8]);
            break;
        default:
            q("invalid literal: " + S)
    }
    na.prototype.g = function() {
        var b, a, c, d, e = this.input;
        switch (this.k) {
            case 0:
                c = 0;
                for (d = e.length; c < d;) {
                    a = B ? e.subarray(c, c + 65535) : e.slice(c, c + 65535);
                    c += a.length;
                    var f = a,
                        g = c === d,
                        k = t,
                        h = t,
                        l = t,
                        s = t,
                        p = t,
                        m = this.a,
                        n = this.b;
                    if (B) {
                        for (m = new Uint8Array(this.a.buffer); m.length <= n + f.length + 5;) m = new Uint8Array(m.length << 1);
                        m.set(this.a)
                    }
                    k = g ? 1 : 0;
                    m[n++] = k | 0;
                    h = f.length;
                    l = ~h + 65536 & 65535;
                    m[n++] = h & 255;
                    m[n++] = h >>> 8 & 255;
                    m[n++] = l & 255;
                    m[n++] = l >>> 8 & 255;
                    if (B) m.set(f, n), n += f.length, m = m.subarray(0, n);
                    else {
                        s = 0;
                        for (p = f.length; s < p; ++s) m[n++] =
                            f[s];
                        m.length = n
                    }
                    this.b = n;
                    this.a = m
                }
                break;
            case 1:
                var r = new F(B ? new Uint8Array(this.a.buffer) : this.a, this.b);
                r.d(1, 1, u);
                r.d(1, 2, u);
                var v = ta(this, e),
                    x, Q, y;
                x = 0;
                for (Q = v.length; x < Q; x++)
                    if (y = v[x], F.prototype.d.apply(r, sa[y]), 256 < y) r.d(v[++x], v[++x], u), r.d(v[++x], 5), r.d(v[++x], v[++x], u);
                    else if (256 === y) break;
                this.a = r.finish();
                this.b = this.a.length;
                break;
            case qa:
                var E = new F(B ? new Uint8Array(this.a.buffer) : this.a, this.b),
                    Ka, R, X, Y, Z, pb = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
                    fa, La, ga, Ma, oa, wa = Array(19),
                    Na, $, pa, C, Oa;
                Ka = qa;
                E.d(1, 1, u);
                E.d(Ka, 2, u);
                R = ta(this, e);
                fa = ua(this.W, 15);
                La = va(fa);
                ga = ua(this.V, 7);
                Ma = va(ga);
                for (X = 286; 257 < X && 0 === fa[X - 1]; X--);
                for (Y = 30; 1 < Y && 0 === ga[Y - 1]; Y--);
                var Pa = X,
                    Qa = Y,
                    J = new(B ? Uint32Array : Array)(Pa + Qa),
                    w, L, z, ha, I = new(B ? Uint32Array : Array)(316),
                    G, D, M = new(B ? Uint8Array : Array)(19);
                for (w = L = 0; w < Pa; w++) J[L++] = fa[w];
                for (w = 0; w < Qa; w++) J[L++] = ga[w];
                if (!B) {
                    w = 0;
                    for (ha = M.length; w < ha; ++w) M[w] = 0
                }
                w = G = 0;
                for (ha = J.length; w < ha; w += L) {
                    for (L = 1; w + L < ha && J[w + L] === J[w]; ++L);
                    z = L;
                    if (0 === J[w])
                        if (3 > z)
                            for (; 0 <
                                z--;) I[G++] = 0, M[0]++;
                        else
                            for (; 0 < z;) D = 138 > z ? z : 138, D > z - 3 && D < z && (D = z - 3), 10 >= D ? (I[G++] = 17, I[G++] = D - 3, M[17]++) : (I[G++] = 18, I[G++] = D - 11, M[18]++), z -= D;
                    else if (I[G++] = J[w], M[J[w]]++, z--, 3 > z)
                        for (; 0 < z--;) I[G++] = J[w], M[J[w]]++;
                    else
                        for (; 0 < z;) D = 6 > z ? z : 6, D > z - 3 && D < z && (D = z - 3), I[G++] = 16, I[G++] = D - 3, M[16]++, z -= D
                }
                b = B ? I.subarray(0, G) : I.slice(0, G);
                oa = ua(M, 7);
                for (C = 0; 19 > C; C++) wa[C] = oa[pb[C]];
                for (Z = 19; 4 < Z && 0 === wa[Z - 1]; Z--);
                Na = va(oa);
                E.d(X - 257, 5, u);
                E.d(Y - 1, 5, u);
                E.d(Z - 4, 4, u);
                for (C = 0; C < Z; C++) E.d(wa[C], 3, u);
                C = 0;
                for (Oa = b.length; C <
                    Oa; C++)
                    if ($ = b[C], E.d(Na[$], oa[$], u), 16 <= $) {
                        C++;
                        switch ($) {
                            case 16:
                                pa = 2;
                                break;
                            case 17:
                                pa = 3;
                                break;
                            case 18:
                                pa = 7;
                                break;
                            default:
                                q("invalid code: " + $)
                        }
                        E.d(b[C], pa, u)
                    }
                var Ra = [La, fa],
                    Sa = [Ma, ga],
                    N, Ta, ia, za, Ua, Va, Wa, Xa;
                Ua = Ra[0];
                Va = Ra[1];
                Wa = Sa[0];
                Xa = Sa[1];
                N = 0;
                for (Ta = R.length; N < Ta; ++N)
                    if (ia = R[N], E.d(Ua[ia], Va[ia], u), 256 < ia) E.d(R[++N], R[++N], u), za = R[++N], E.d(Wa[za], Xa[za], u), E.d(R[++N], R[++N], u);
                    else if (256 === ia) break;
                this.a = E.finish();
                this.b = this.a.length;
                break;
            default:
                q("invalid compression type")
        }
        return this.a
    };

    function xa(b, a) {
        this.length = b;
        this.Q = a
    }
    var ya = function() {
            function b(a) {
                switch (u) {
                    case 3 === a:
                        return [257, a - 3, 0];
                    case 4 === a:
                        return [258, a - 4, 0];
                    case 5 === a:
                        return [259, a - 5, 0];
                    case 6 === a:
                        return [260, a - 6, 0];
                    case 7 === a:
                        return [261, a - 7, 0];
                    case 8 === a:
                        return [262, a - 8, 0];
                    case 9 === a:
                        return [263, a - 9, 0];
                    case 10 === a:
                        return [264, a - 10, 0];
                    case 12 >= a:
                        return [265, a - 11, 1];
                    case 14 >= a:
                        return [266, a - 13, 1];
                    case 16 >= a:
                        return [267, a - 15, 1];
                    case 18 >= a:
                        return [268, a - 17, 1];
                    case 22 >= a:
                        return [269, a - 19, 2];
                    case 26 >= a:
                        return [270, a - 23, 2];
                    case 30 >= a:
                        return [271, a - 27, 2];
                    case 34 >= a:
                        return [272,
                            a - 31, 2
                        ];
                    case 42 >= a:
                        return [273, a - 35, 3];
                    case 50 >= a:
                        return [274, a - 43, 3];
                    case 58 >= a:
                        return [275, a - 51, 3];
                    case 66 >= a:
                        return [276, a - 59, 3];
                    case 82 >= a:
                        return [277, a - 67, 4];
                    case 98 >= a:
                        return [278, a - 83, 4];
                    case 114 >= a:
                        return [279, a - 99, 4];
                    case 130 >= a:
                        return [280, a - 115, 4];
                    case 162 >= a:
                        return [281, a - 131, 5];
                    case 194 >= a:
                        return [282, a - 163, 5];
                    case 226 >= a:
                        return [283, a - 195, 5];
                    case 257 >= a:
                        return [284, a - 227, 5];
                    case 258 === a:
                        return [285, a - 258, 0];
                    default:
                        q("invalid length: " + a)
                }
            }
            var a = [],
                c, d;
            for (c = 3; 258 >= c; c++) d = b(c), a[c] = d[2] << 24 | d[1] <<
                16 | d[0];
            return a
        }(),
        Aa = B ? new Uint32Array(ya) : ya;

    function ta(b, a) {
        function c(a, c) {
            var b = a.Q,
                d = [],
                e = 0,
                f;
            f = Aa[a.length];
            d[e++] = f & 65535;
            d[e++] = f >> 16 & 255;
            d[e++] = f >> 24;
            var g;
            switch (u) {
                case 1 === b:
                    g = [0, b - 1, 0];
                    break;
                case 2 === b:
                    g = [1, b - 2, 0];
                    break;
                case 3 === b:
                    g = [2, b - 3, 0];
                    break;
                case 4 === b:
                    g = [3, b - 4, 0];
                    break;
                case 6 >= b:
                    g = [4, b - 5, 1];
                    break;
                case 8 >= b:
                    g = [5, b - 7, 1];
                    break;
                case 12 >= b:
                    g = [6, b - 9, 2];
                    break;
                case 16 >= b:
                    g = [7, b - 13, 2];
                    break;
                case 24 >= b:
                    g = [8, b - 17, 3];
                    break;
                case 32 >= b:
                    g = [9, b - 25, 3];
                    break;
                case 48 >= b:
                    g = [10, b - 33, 4];
                    break;
                case 64 >= b:
                    g = [11, b - 49, 4];
                    break;
                case 96 >= b:
                    g = [12, b -
                        65, 5
                    ];
                    break;
                case 128 >= b:
                    g = [13, b - 97, 5];
                    break;
                case 192 >= b:
                    g = [14, b - 129, 6];
                    break;
                case 256 >= b:
                    g = [15, b - 193, 6];
                    break;
                case 384 >= b:
                    g = [16, b - 257, 7];
                    break;
                case 512 >= b:
                    g = [17, b - 385, 7];
                    break;
                case 768 >= b:
                    g = [18, b - 513, 8];
                    break;
                case 1024 >= b:
                    g = [19, b - 769, 8];
                    break;
                case 1536 >= b:
                    g = [20, b - 1025, 9];
                    break;
                case 2048 >= b:
                    g = [21, b - 1537, 9];
                    break;
                case 3072 >= b:
                    g = [22, b - 2049, 10];
                    break;
                case 4096 >= b:
                    g = [23, b - 3073, 10];
                    break;
                case 6144 >= b:
                    g = [24, b - 4097, 11];
                    break;
                case 8192 >= b:
                    g = [25, b - 6145, 11];
                    break;
                case 12288 >= b:
                    g = [26, b - 8193, 12];
                    break;
                case 16384 >=
                b:
                    g = [27, b - 12289, 12];
                    break;
                case 24576 >= b:
                    g = [28, b - 16385, 13];
                    break;
                case 32768 >= b:
                    g = [29, b - 24577, 13];
                    break;
                default:
                    q("invalid distance")
            }
            f = g;
            d[e++] = f[0];
            d[e++] = f[1];
            d[e++] = f[2];
            var h, k;
            h = 0;
            for (k = d.length; h < k; ++h) m[n++] = d[h];
            v[d[0]]++;
            x[d[3]]++;
            r = a.length + c - 1;
            p = null
        }
        var d, e, f, g, k, h = {},
            l, s, p, m = B ? new Uint16Array(2 * a.length) : [],
            n = 0,
            r = 0,
            v = new(B ? Uint32Array : Array)(286),
            x = new(B ? Uint32Array : Array)(30),
            Q = b.I,
            y;
        if (!B) {
            for (f = 0; 285 >= f;) v[f++] = 0;
            for (f = 0; 29 >= f;) x[f++] = 0
        }
        v[256] = 1;
        d = 0;
        for (e = a.length; d < e; ++d) {
            f = k = 0;
            for (g = 3; f < g && d + f !== e; ++f) k = k << 8 | a[d + f];
            h[k] === t && (h[k] = []);
            l = h[k];
            if (!(0 < r--)) {
                for (; 0 < l.length && 32768 < d - l[0];) l.shift();
                if (d + 3 >= e) {
                    p && c(p, -1);
                    f = 0;
                    for (g = e - d; f < g; ++f) y = a[d + f], m[n++] = y, ++v[y];
                    break
                }
                0 < l.length ? (s = Ba(a, d, l), p ? p.length < s.length ? (y = a[d - 1], m[n++] = y, ++v[y], c(s, 0)) : c(p, -1) : s.length < Q ? p = s : c(s, 0)) : p ? c(p, -1) : (y = a[d], m[n++] = y, ++v[y])
            }
            l.push(d)
        }
        m[n++] = 256;
        v[256]++;
        b.W = v;
        b.V = x;
        return B ? m.subarray(0, n) : m
    }

    function Ba(b, a, c) {
        var d, e, f = 0,
            g, k, h, l, s = b.length;
        k = 0;
        l = c.length;
        a: for (; k < l; k++) {
            d = c[l - k - 1];
            g = 3;
            if (3 < f) {
                for (h = f; 3 < h; h--)
                    if (b[d + h - 1] !== b[a + h - 1]) continue a;
                g = f
            }
            for (; 258 > g && a + g < s && b[d + g] === b[a + g];) ++g;
            g > f && (e = d, f = g);
            if (258 === g) break
        }
        return new xa(f, a - e)
    }

    function ua(b, a) {
        var c = b.length,
            d = new la(572),
            e = new(B ? Uint8Array : Array)(c),
            f, g, k, h, l;
        if (!B)
            for (h = 0; h < c; h++) e[h] = 0;
        for (h = 0; h < c; ++h) 0 < b[h] && d.push(h, b[h]);
        f = Array(d.length / 2);
        g = new(B ? Uint32Array : Array)(d.length / 2);
        if (1 === f.length) return e[d.pop().index] = 1, e;
        h = 0;
        for (l = d.length / 2; h < l; ++h) f[h] = d.pop(), g[h] = f[h].value;
        k = Ca(g, g.length, a);
        h = 0;
        for (l = f.length; h < l; ++h) e[f[h].index] = k[h];
        return e
    }

    function Ca(b, a, c) {
        function d(b) {
            var c = h[b][l[b]];
            c === a ? (d(b + 1), d(b + 1)) : --g[c];
            ++l[b]
        }
        var e = new(B ? Uint16Array : Array)(c),
            f = new(B ? Uint8Array : Array)(c),
            g = new(B ? Uint8Array : Array)(a),
            k = Array(c),
            h = Array(c),
            l = Array(c),
            s = (1 << c) - a,
            p = 1 << c - 1,
            m, n, r, v, x;
        e[c - 1] = a;
        for (n = 0; n < c; ++n) s < p ? f[n] = 0 : (f[n] = 1, s -= p), s <<= 1, e[c - 2 - n] = (e[c - 1 - n] / 2 | 0) + a;
        e[0] = f[0];
        k[0] = Array(e[0]);
        h[0] = Array(e[0]);
        for (n = 1; n < c; ++n) e[n] > 2 * e[n - 1] + f[n] && (e[n] = 2 * e[n - 1] + f[n]), k[n] = Array(e[n]), h[n] = Array(e[n]);
        for (m = 0; m < a; ++m) g[m] = c;
        for (r = 0; r < e[c - 1]; ++r) k[c -
            1][r] = b[r], h[c - 1][r] = r;
        for (m = 0; m < c; ++m) l[m] = 0;
        1 === f[c - 1] && (--g[0], ++l[c - 1]);
        for (n = c - 2; 0 <= n; --n) {
            v = m = 0;
            x = l[n + 1];
            for (r = 0; r < e[n]; r++) v = k[n + 1][x] + k[n + 1][x + 1], v > b[m] ? (k[n][r] = v, h[n][r] = a, x += 2) : (k[n][r] = b[m], h[n][r] = m, ++m);
            l[n] = 0;
            1 === f[n] && d(n)
        }
        return g
    }

    function va(b) {
        var a = new(B ? Uint16Array : Array)(b.length),
            c = [],
            d = [],
            e = 0,
            f, g, k, h;
        f = 0;
        for (g = b.length; f < g; f++) c[b[f]] = (c[b[f]] | 0) + 1;
        f = 1;
        for (g = 16; f <= g; f++) d[f] = e, e += c[f] | 0, e <<= 1;
        f = 0;
        for (g = b.length; f < g; f++) {
            e = d[b[f]];
            d[b[f]] += 1;
            k = a[f] = 0;
            for (h = b[f]; k < h; k++) a[f] = a[f] << 1 | e & 1, e >>>= 1
        }
        return a
    };

    function Da(b, a) {
        this.input = b;
        this.b = this.c = 0;
        this.i = {};
        a && (a.flags && (this.i = a.flags), "string" === typeof a.filename && (this.filename = a.filename), "string" === typeof a.comment && (this.A = a.comment), a.deflateOptions && (this.l = a.deflateOptions));
        this.l || (this.l = {})
    }
    Da.prototype.g = function() {
        var b, a, c, d, e, f, g, k, h = new(B ? Uint8Array : Array)(32768),
            l = 0,
            s = this.input,
            p = this.c,
            m = this.filename,
            n = this.A;
        h[l++] = 31;
        h[l++] = 139;
        h[l++] = 8;
        b = 0;
        this.i.fname && (b |= Ea);
        this.i.fcomment && (b |= Fa);
        this.i.fhcrc && (b |= Ga);
        h[l++] = b;
        a = (Date.now ? Date.now() : +new Date) / 1E3 | 0;
        h[l++] = a & 255;
        h[l++] = a >>> 8 & 255;
        h[l++] = a >>> 16 & 255;
        h[l++] = a >>> 24 & 255;
        h[l++] = 0;
        h[l++] = Ha;
        if (this.i.fname !== t) {
            g = 0;
            for (k = m.length; g < k; ++g) f = m.charCodeAt(g), 255 < f && (h[l++] = f >>> 8 & 255), h[l++] = f & 255;
            h[l++] = 0
        }
        if (this.i.comment) {
            g =
                0;
            for (k = n.length; g < k; ++g) f = n.charCodeAt(g), 255 < f && (h[l++] = f >>> 8 & 255), h[l++] = f & 255;
            h[l++] = 0
        }
        this.i.fhcrc && (c = ja(h, 0, l) & 65535, h[l++] = c & 255, h[l++] = c >>> 8 & 255);
        this.l.outputBuffer = h;
        this.l.outputIndex = l;
        e = new na(s, this.l);
        h = e.g();
        l = e.b;
        B && (l + 8 > h.buffer.byteLength ? (this.a = new Uint8Array(l + 8), this.a.set(new Uint8Array(h.buffer)), h = this.a) : h = new Uint8Array(h.buffer));
        d = ja(s, t, t);
        h[l++] = d & 255;
        h[l++] = d >>> 8 & 255;
        h[l++] = d >>> 16 & 255;
        h[l++] = d >>> 24 & 255;
        k = s.length;
        h[l++] = k & 255;
        h[l++] = k >>> 8 & 255;
        h[l++] = k >>> 16 & 255;
        h[l++] =
            k >>> 24 & 255;
        this.c = p;
        B && l < h.length && (this.a = h = h.subarray(0, l));
        return h
    };
    var Ha = 255,
        Ga = 2,
        Ea = 8,
        Fa = 16;
    A("Gzip", Da);
    A("Gzip.prototype.compress", Da.prototype.g);

    function T(b, a) {
        this.p = [];
        this.q = 32768;
        this.e = this.j = this.c = this.u = 0;
        this.input = B ? new Uint8Array(b) : b;
        this.w = !1;
        this.r = Ia;
        this.M = !1;
        if (a || !(a = {})) a.index && (this.c = a.index), a.bufferSize && (this.q = a.bufferSize), a.bufferType && (this.r = a.bufferType), a.resize && (this.M = a.resize);
        switch (this.r) {
            case Ja:
                this.b = 32768;
                this.a = new(B ? Uint8Array : Array)(32768 + this.q + 258);
                break;
            case Ia:
                this.b = 0;
                this.a = new(B ? Uint8Array : Array)(this.q);
                this.f = this.U;
                this.B = this.R;
                this.s = this.T;
                break;
            default:
                q(Error("invalid inflate mode"))
        }
    }
    var Ja = 0,
        Ia = 1,
        Ya = {
            O: Ja,
            N: Ia
        };
    T.prototype.h = function() {
        for (; !this.w;) {
            var b = U(this, 3);
            b & 1 && (this.w = u);
            b >>>= 1;
            switch (b) {
                case 0:
                    var a = this.input,
                        c = this.c,
                        d = this.a,
                        e = this.b,
                        f = a.length,
                        g = t,
                        k = t,
                        h = d.length,
                        l = t;
                    this.e = this.j = 0;
                    c + 1 >= f && q(Error("invalid uncompressed block header: LEN"));
                    g = a[c++] | a[c++] << 8;
                    c + 1 >= f && q(Error("invalid uncompressed block header: NLEN"));
                    k = a[c++] | a[c++] << 8;
                    g === ~k && q(Error("invalid uncompressed block header: length verify"));
                    c + g > a.length && q(Error("input buffer is broken"));
                    switch (this.r) {
                        case Ja:
                            for (; e + g > d.length;) {
                                l =
                                    h - e;
                                g -= l;
                                if (B) d.set(a.subarray(c, c + l), e), e += l, c += l;
                                else
                                    for (; l--;) d[e++] = a[c++];
                                this.b = e;
                                d = this.f();
                                e = this.b
                            }
                            break;
                        case Ia:
                            for (; e + g > d.length;) d = this.f({
                                F: 2
                            });
                            break;
                        default:
                            q(Error("invalid inflate mode"))
                    }
                    if (B) d.set(a.subarray(c, c + g), e), e += g, c += g;
                    else
                        for (; g--;) d[e++] = a[c++];
                    this.c = c;
                    this.b = e;
                    this.a = d;
                    break;
                case 1:
                    this.s(Za, $a);
                    break;
                case 2:
                    ab(this);
                    break;
                default:
                    q(Error("unknown BTYPE: " + b))
            }
        }
        return this.B()
    };
    var bb = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
        cb = B ? new Uint16Array(bb) : bb,
        db = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 258, 258],
        eb = B ? new Uint16Array(db) : db,
        fb = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0],
        gb = B ? new Uint8Array(fb) : fb,
        hb = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577],
        ib = B ? new Uint16Array(hb) : hb,
        jb = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10,
            10, 11, 11, 12, 12, 13, 13
        ],
        kb = B ? new Uint8Array(jb) : jb,
        lb = new(B ? Uint8Array : Array)(288),
        V, mb;
    V = 0;
    for (mb = lb.length; V < mb; ++V) lb[V] = 143 >= V ? 8 : 255 >= V ? 9 : 279 >= V ? 7 : 8;
    var Za = ma(lb),
        nb = new(B ? Uint8Array : Array)(30),
        ob, qb;
    ob = 0;
    for (qb = nb.length; ob < qb; ++ob) nb[ob] = 5;
    var $a = ma(nb);

    function U(b, a) {
        for (var c = b.j, d = b.e, e = b.input, f = b.c, g = e.length, k; d < a;) f >= g && q(Error("input buffer is broken")), c |= e[f++] << d, d += 8;
        k = c & (1 << a) - 1;
        b.j = c >>> a;
        b.e = d - a;
        b.c = f;
        return k
    }

    function rb(b, a) {
        for (var c = b.j, d = b.e, e = b.input, f = b.c, g = e.length, k = a[0], h = a[1], l, s; d < h && !(f >= g);) c |= e[f++] << d, d += 8;
        l = k[c & (1 << h) - 1];
        s = l >>> 16;
        b.j = c >> s;
        b.e = d - s;
        b.c = f;
        return l & 65535
    }

    function ab(b) {
        function a(a, b, c) {
            var d, e = this.J,
                f, g;
            for (g = 0; g < a;) switch (d = rb(this, b), d) {
                case 16:
                    for (f = 3 + U(this, 2); f--;) c[g++] = e;
                    break;
                case 17:
                    for (f = 3 + U(this, 3); f--;) c[g++] = 0;
                    e = 0;
                    break;
                case 18:
                    for (f = 11 + U(this, 7); f--;) c[g++] = 0;
                    e = 0;
                    break;
                default:
                    e = c[g++] = d
            }
            this.J = e;
            return c
        }
        var c = U(b, 5) + 257,
            d = U(b, 5) + 1,
            e = U(b, 4) + 4,
            f = new(B ? Uint8Array : Array)(cb.length),
            g, k, h, l;
        for (l = 0; l < e; ++l) f[cb[l]] = U(b, 3);
        if (!B) {
            l = e;
            for (e = f.length; l < e; ++l) f[cb[l]] = 0
        }
        g = ma(f);
        k = new(B ? Uint8Array : Array)(c);
        h = new(B ? Uint8Array : Array)(d);
        b.J = 0;
        b.s(ma(a.call(b, c, g, k)), ma(a.call(b, d, g, h)))
    }
    T.prototype.s = function(b, a) {
        var c = this.a,
            d = this.b;
        this.C = b;
        for (var e = c.length - 258, f, g, k, h; 256 !== (f = rb(this, b));)
            if (256 > f) d >= e && (this.b = d, c = this.f(), d = this.b), c[d++] = f;
            else {
                g = f - 257;
                h = eb[g];
                0 < gb[g] && (h += U(this, gb[g]));
                f = rb(this, a);
                k = ib[f];
                0 < kb[f] && (k += U(this, kb[f]));
                d >= e && (this.b = d, c = this.f(), d = this.b);
                for (; h--;) c[d] = c[d++ - k]
            }
        for (; 8 <= this.e;) this.e -= 8, this.c--;
        this.b = d
    };
    T.prototype.T = function(b, a) {
        var c = this.a,
            d = this.b;
        this.C = b;
        for (var e = c.length, f, g, k, h; 256 !== (f = rb(this, b));)
            if (256 > f) d >= e && (c = this.f(), e = c.length), c[d++] = f;
            else {
                g = f - 257;
                h = eb[g];
                0 < gb[g] && (h += U(this, gb[g]));
                f = rb(this, a);
                k = ib[f];
                0 < kb[f] && (k += U(this, kb[f]));
                d + h > e && (c = this.f(), e = c.length);
                for (; h--;) c[d] = c[d++ - k]
            }
        for (; 8 <= this.e;) this.e -= 8, this.c--;
        this.b = d
    };
    T.prototype.f = function() {
        var b = new(B ? Uint8Array : Array)(this.b - 32768),
            a = this.b - 32768,
            c, d, e = this.a;
        if (B) b.set(e.subarray(32768, b.length));
        else {
            c = 0;
            for (d = b.length; c < d; ++c) b[c] = e[c + 32768]
        }
        this.p.push(b);
        this.u += b.length;
        if (B) e.set(e.subarray(a, a + 32768));
        else
            for (c = 0; 32768 > c; ++c) e[c] = e[a + c];
        this.b = 32768;
        return e
    };
    T.prototype.U = function(b) {
        var a, c = this.input.length / this.c + 1 | 0,
            d, e, f, g = this.input,
            k = this.a;
        b && ("number" === typeof b.F && (c = b.F), "number" === typeof b.P && (c += b.P));
        2 > c ? (d = (g.length - this.c) / this.C[2], f = 258 * (d / 2) | 0, e = f < k.length ? k.length + f : k.length << 1) : e = k.length * c;
        B ? (a = new Uint8Array(e), a.set(k)) : a = k;
        return this.a = a
    };
    T.prototype.B = function() {
        var b = 0,
            a = this.a,
            c = this.p,
            d, e = new(B ? Uint8Array : Array)(this.u + (this.b - 32768)),
            f, g, k, h;
        if (0 === c.length) return B ? this.a.subarray(32768, this.b) : this.a.slice(32768, this.b);
        f = 0;
        for (g = c.length; f < g; ++f) {
            d = c[f];
            k = 0;
            for (h = d.length; k < h; ++k) e[b++] = d[k]
        }
        f = 32768;
        for (g = this.b; f < g; ++f) e[b++] = a[f];
        this.p = [];
        return this.buffer = e
    };
    T.prototype.R = function() {
        var b, a = this.b;
        B ? this.M ? (b = new Uint8Array(a), b.set(this.a.subarray(0, a))) : b = this.a.subarray(0, a) : (this.a.length > a && (this.a.length = a), b = this.a);
        return this.buffer = b
    };

    function sb(b) {
        this.input = b;
        this.c = 0;
        this.t = [];
        this.D = !1
    }
    sb.prototype.X = function() {
        this.D || this.h();
        return this.t.slice()
    };
    sb.prototype.h = function() {
        for (var b = this.input.length; this.c < b;) {
            var a = new P,
                c = t,
                d = t,
                e = t,
                f = t,
                g = t,
                k = t,
                h = t,
                l = t,
                s = t,
                p = this.input,
                m = this.c;
            a.G = p[m++];
            a.H = p[m++];
            (31 !== a.G || 139 !== a.H) && q(Error("invalid file signature:" + a.G + "," + a.H));
            a.z = p[m++];
            switch (a.z) {
                case 8:
                    break;
                default:
                    q(Error("unknown compression method: " + a.z))
            }
            a.n = p[m++];
            l = p[m++] | p[m++] << 8 | p[m++] << 16 | p[m++] << 24;
            a.Z = new Date(1E3 * l);
            a.fa = p[m++];
            a.ea = p[m++];
            0 < (a.n & 4) && (a.aa = p[m++] | p[m++] << 8, m += a.aa);
            if (0 < (a.n & Ea)) {
                h = [];
                for (k = 0; 0 < (g = p[m++]);) h[k++] =
                    String.fromCharCode(g);
                a.name = h.join("")
            }
            if (0 < (a.n & Fa)) {
                h = [];
                for (k = 0; 0 < (g = p[m++]);) h[k++] = String.fromCharCode(g);
                a.A = h.join("")
            }
            0 < (a.n & Ga) && (a.S = ja(p, 0, m) & 65535, a.S !== (p[m++] | p[m++] << 8) && q(Error("invalid header crc16")));
            c = p[p.length - 4] | p[p.length - 3] << 8 | p[p.length - 2] << 16 | p[p.length - 1] << 24;
            p.length - m - 4 - 4 < 512 * c && (f = c);
            d = new T(p, {
                index: m,
                bufferSize: f
            });
            a.data = e = d.h();
            m = d.c;
            a.ca = s = (p[m++] | p[m++] << 8 | p[m++] << 16 | p[m++] << 24) >>> 0;
            ja(e, t, t) !== s && q(Error("invalid CRC-32 checksum: 0x" + ja(e, t, t).toString(16) +
                " / 0x" + s.toString(16)));
            a.da = c = (p[m++] | p[m++] << 8 | p[m++] << 16 | p[m++] << 24) >>> 0;
            (e.length & 4294967295) !== c && q(Error("invalid input size: " + (e.length & 4294967295) + " / " + c));
            this.t.push(a);
            this.c = m
        }
        this.D = u;
        var n = this.t,
            r, v, x = 0,
            Q = 0,
            y;
        r = 0;
        for (v = n.length; r < v; ++r) Q += n[r].data.length;
        if (B) {
            y = new Uint8Array(Q);
            for (r = 0; r < v; ++r) y.set(n[r].data, x), x += n[r].data.length
        } else {
            y = [];
            for (r = 0; r < v; ++r) y[r] = n[r].data;
            y = Array.prototype.concat.apply([], y)
        }
        return y
    };
    A("Gunzip", sb);
    A("Gunzip.prototype.decompress", sb.prototype.h);
    A("Gunzip.prototype.getMembers", sb.prototype.X);

    function tb(b) {
        if ("string" === typeof b) {
            var a = b.split(""),
                c, d;
            c = 0;
            for (d = a.length; c < d; c++) a[c] = (a[c].charCodeAt(0) & 255) >>> 0;
            b = a
        }
        for (var e = 1, f = 0, g = b.length, k, h = 0; 0 < g;) {
            k = 1024 < g ? 1024 : g;
            g -= k;
            do e += b[h++], f += e; while (--k);
            e %= 65521;
            f %= 65521
        }
        return (f << 16 | e) >>> 0
    };

    function ub(b, a) {
        var c, d;
        this.input = b;
        this.c = 0;
        if (a || !(a = {})) a.index && (this.c = a.index), a.verify && (this.$ = a.verify);
        c = b[this.c++];
        d = b[this.c++];
        switch (c & 15) {
            case vb:
                this.method = vb;
                break;
            default:
                q(Error("unsupported compression method"))
        }
        0 !== ((c << 8) + d) % 31 && q(Error("invalid fcheck flag:" + ((c << 8) + d) % 31));
        d & 32 && q(Error("fdict flag is not supported"));
        this.L = new T(b, {
            index: this.c,
            bufferSize: a.bufferSize,
            bufferType: a.bufferType,
            resize: a.resize
        })
    }
    ub.prototype.h = function() {
        var b = this.input,
            a, c;
        a = this.L.h();
        this.c = this.L.c;
        this.$ && (c = (b[this.c++] << 24 | b[this.c++] << 16 | b[this.c++] << 8 | b[this.c++]) >>> 0, c !== tb(a) && q(Error("invalid adler-32 checksum")));
        return a
    };
    var vb = 8;

    function wb(b, a) {
        this.input = b;
        this.a = new(B ? Uint8Array : Array)(32768);
        this.k = W.o;
        var c = {},
            d;
        if ((a || !(a = {})) && "number" === typeof a.compressionType) this.k = a.compressionType;
        for (d in a) c[d] = a[d];
        c.outputBuffer = this.a;
        this.K = new na(this.input, c)
    }
    var W = ra;
    wb.prototype.g = function() {
        var b, a, c, d, e, f, g, k = 0;
        g = this.a;
        b = vb;
        switch (b) {
            case vb:
                a = Math.LOG2E * Math.log(32768) - 8;
                break;
            default:
                q(Error("invalid compression method"))
        }
        c = a << 4 | b;
        g[k++] = c;
        switch (b) {
            case vb:
                switch (this.k) {
                    case W.NONE:
                        e = 0;
                        break;
                    case W.v:
                        e = 1;
                        break;
                    case W.o:
                        e = 2;
                        break;
                    default:
                        q(Error("unsupported compression type"))
                }
                break;
            default:
                q(Error("invalid compression method"))
        }
        d = e << 6 | 0;
        g[k++] = d | 31 - (256 * c + d) % 31;
        f = tb(this.input);
        this.K.b = k;
        g = this.K.g();
        k = g.length;
        B && (g = new Uint8Array(g.buffer), g.length <=
            k + 4 && (this.a = new Uint8Array(g.length + 4), this.a.set(g), g = this.a), g = g.subarray(0, k + 4));
        g[k++] = f >> 24 & 255;
        g[k++] = f >> 16 & 255;
        g[k++] = f >> 8 & 255;
        g[k++] = f & 255;
        return g
    };

    function xb(b, a) {
        var c, d, e, f;
        if (Object.keys) c = Object.keys(a);
        else
            for (d in c = [], e = 0, a) c[e++] = d;
        e = 0;
        for (f = c.length; e < f; ++e) d = c[e], A(b + "." + d, a[d])
    };
    A("Inflate", ub);
    A("Inflate.prototype.decompress", ub.prototype.h);
    xb("Inflate.BufferType", {
        ADAPTIVE: Ya.N,
        BLOCK: Ya.O
    });
    A("Deflate", wb);
    A("Deflate.compress", function(b, a) {
        return (new wb(b, a)).g()
    });
    A("Deflate.prototype.compress", wb.prototype.g);
    xb("Deflate.CompressionType", {
        NONE: W.NONE,
        FIXED: W.v,
        DYNAMIC: W.o
    });
}).call(module.exports); //@ sourceMappingURL=zlib_and_gzip.min.js.map
