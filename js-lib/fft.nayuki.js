/*
 * Free FFT and convolution (JavaScript)
 *
 * Copyright (c) 2014 Project Nayuki
 * http://www.nayuki.io/page/free-small-fft-in-multiple-languages
 *
 * (MIT License)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * - The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 * - The Software is provided "as is", without warranty of any kind, express or
 *   implied, including but not limited to the warranties of merchantability,
 *   fitness for a particular purpose and noninfringement. In no event shall the
 *   authors or copyright holders be liable for any claim, damages or other
 *   liability, whether in an action of contract, tort or otherwise, arising from,
 *   out of or in connection with the Software or the use or other dealings in the
 *   Software.
 *
 * Slightly restructured by Chris Cannam, cannam@all-day-breakfast.com
 *
 * General cleanup and additional functions developed for Physics of Risk
 * website by Aleksejus Kononovicius.
 */

"use strict";

/*
 * Construct an object for calculating the discrete Fourier transform (DFT) of size n, where n is a power of 2.
 */
function FFTNayuki(n) {
    this.n = n;
    this.levels = -1;

    for (let i = 0; i < 32; i++) {
        if (1 << i == n) {
            this.levels = i; // Equal to log2(n)
        }
    }
    if (this.levels == -1) {
        throw "Length is not a power of 2";
    }

    this.cosTable = new Array(n / 2);
    this.sinTable = new Array(n / 2);
    for (let i = 0; i < n / 2; i++) {
        this.cosTable[i] = Math.cos((2 * Math.PI * i) / n);
        this.sinTable[i] = Math.sin((2 * Math.PI * i) / n);
    }

    /*
     * Computes the discrete Fourier transform (DFT) of the given complex vector, storing the result back into the vector.
     * The vector's length must be equal to the size n that was passed to the object constructor, and this must be a power of 2. Uses the Cooley-Tukey decimation-in-time radix-2 algorithm.
     */
    this.forward = function (real, imag) {
        let n = this.n;

        // Bit-reversed addressing permutation
        for (let i = 0; i < n; i++) {
            let j = reverseBits(i, this.levels);
            if (j > i) {
                [real[i], real[j]] = [real[j], real[i]];
                [imag[i], imag[j]] = [imag[j], imag[i]];
            }
        }

        // Cooley-Tukey decimation-in-time radix-2 FFT
        for (let size = 2; size <= n; size *= 2) {
            let halfsize = size / 2;
            let tablestep = n / size;
            for (let i = 0; i < n; i += size) {
                for (let j = i, k = 0; j < i + halfsize; j++, k += tablestep) {
                    let tpre =
                        real[j + halfsize] * this.cosTable[k] +
                        imag[j + halfsize] * this.sinTable[k];
                    let tpim =
                        -real[j + halfsize] * this.sinTable[k] +
                        imag[j + halfsize] * this.cosTable[k];
                    real[j + halfsize] = real[j] - tpre;
                    imag[j + halfsize] = imag[j] - tpim;
                    real[j] += tpre;
                    imag[j] += tpim;
                }
            }
        }

        // Returns the integer whose value is the reverse of the lowest 'bits' bits of the integer 'x'.
        function reverseBits(x, bits) {
            let y = 0;
            for (let i = 0; i < bits; i++) {
                y = (y << 1) | (x & 1);
                x >>>= 1;
            }
            return y;
        }
    };

    /*
     * Computes the inverse discrete Fourier transform (IDFT) of the given complex vector, storing the result back into the vector.
     * The vector's length must be equal to the size n that was passed to the object constructor, and this must be a power of 2. This is a wrapper function. This transform does not perform scaling, so the inverse is not a true inverse.
     */
    this.inverse = function (real, imag) {
        this.forward(imag, real);

        // normalization by 1/n
        let norm = 1 / n;
        for (let i = 0; i < n; i += 1) {
            real[i] = real[i] * norm;
            imag[i] = imag[i] * norm;
        }
    };
}

function convolution(series_a, series_b) {
    const fft = new FFTNayuki(2 * series_a.length);

    let real_a = Array(2 * series_a.length)
        .fill(null)
        .map((v, idx) => {
            if (idx < series_a.length) {
                return series_a[idx];
            }
            return 0;
        });
    let imag_a = Array(real_a.length).fill(0);
    fft.forward(real_a, imag_a);

    let real_b = Array(2 * series_b.length)
        .fill(null)
        .map((v, idx) => {
            if (idx < series_b.length) {
                return series_b[idx];
            }
            return 0;
        });
    let imag_b = Array(real_b.length).fill(0);
    fft.forward(real_b, imag_b);

    let real_mult = Array(real_a.length)
        .fill(null)
        .map((v, idx) => {
            return real_a[idx] * real_b[idx] - imag_a[idx] * imag_b[idx];
        });
    let imag_mult = Array(real_a.length)
        .fill(null)
        .map((v, idx) => {
            return real_a[idx] * imag_b[idx] + imag_a[idx] * real_b[idx];
        });
    fft.inverse(real_mult, imag_mult);

    return real_mult.slice(0, series_a.length);
}

// shorthand FFT function which assumes that series contain only real
// observables and outputs PSD
function real_psd(series) {
    const fft = new FFTNayuki(series.length);

    let real = series.slice();
    let imag = Array(real.length).fill(0);
    fft.forward(real, imag);

    let psd = Array(real.length)
        .fill(0)
        .map((v, idx) => {
            return real[idx] * real[idx] + imag[idx] * imag[idx];
        });

    return psd;
}

// convolution function which uses FFT
function convolution(series_a, series_b) {
    const fft = new FFTNayuki(2 * series_a.length);

    let real_a = Array(2 * series_a.length)
        .fill(null)
        .map((v, idx) => {
            if (idx < series_a.length) {
                return series_a[idx];
            }
            return 0;
        });
    let imag_a = Array(real_a.length).fill(0);
    fft.forward(real_a, imag_a);

    let real_b = Array(2 * series_b.length)
        .fill(null)
        .map((v, idx) => {
            if (idx < series_b.length) {
                return series_b[idx];
            }
            return 0;
        });
    let imag_b = Array(real_b.length).fill(0);
    fft.forward(real_b, imag_b);

    let real_mult = Array(real_a.length)
        .fill(null)
        .map((v, idx) => {
            return real_a[idx] * real_b[idx] - imag_a[idx] * imag_b[idx];
        });
    let imag_mult = Array(real_a.length)
        .fill(null)
        .map((v, idx) => {
            return real_a[idx] * imag_b[idx] + imag_a[idx] * real_b[idx];
        });
    fft.inverse(real_mult, imag_mult);

    return real_mult.slice(0, series_a.length);
}
