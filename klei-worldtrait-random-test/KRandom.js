class KRandom {
    static MBIG = 2147483647;
    static MSEED = 161803398;
    static MZ = 0;

    constructor(seed = Date.now()) {
        this.SeedArray = new Array(56).fill(0);
        let num = KRandom.MSEED - Math.abs(seed === -2147483648 ? KRandom.MBIG : seed);
        this.SeedArray[55] = num;
        let num2 = 1;

        for (let i = 1; i < 55; i++) {
            let num3 = (21 * i) % 55;
            this.SeedArray[num3] = num2;
            num2 = num - num2;
            if (num2 < 0) {
                num2 += KRandom.MBIG;
            }
            num = this.SeedArray[num3];
        }

        for (let j = 1; j < 5; j++) {
            for (let k = 1; k < 56; k++) {
                this.SeedArray[k] -= this.SeedArray[1 + (k + 30) % 55];
                if (this.SeedArray[k] < 0) {
                    this.SeedArray[k] += KRandom.MBIG;
                }
            }
        }

        this.inext = 0;
        this.inextp = 21;
    }

    InternalSample() {
        let num = this.inext;
        let num2 = this.inextp;

        num = (num + 1) % 56;
        num2 = (num2 + 1) % 56;

        let num3 = this.SeedArray[num] - this.SeedArray[num2];
        if (num3 < 0) {
            num3 += KRandom.MBIG;
        }

        this.SeedArray[num] = num3;
        this.inext = num;
        this.inextp = num2;

        return num3;
    }

    Sample() {
        return this.InternalSample() * (1 / KRandom.MBIG);
    }

    GetSampleForLargeRange() {
        let num = this.InternalSample();
        if (this.InternalSample() % 2 === 0) {
            num = -num;
        }
        return (num + 2147483646) / 4294967293.0;
    }

    Next(minValue, maxValue) {
        if (arguments.length === 0) {
            return this.InternalSample();
        }
        if (arguments.length === 1) {
            return Math.floor(this.Sample() * minValue);
        }

        let range = maxValue - minValue;
        if (range <= KRandom.MBIG) {
            return Math.floor(this.Sample() * range) + minValue;
        } else {
            return Math.floor(this.GetSampleForLargeRange() * range) + minValue;
        }
    }

    NextDouble() {
        return this.Sample();
    }

    NextBytes(buffer) {
        if (!buffer || !Array.isArray(buffer)) {
            throw new Error('Invalid buffer provided.');
        }

        for (let i = 0; i < buffer.length; i++) {
            buffer[i] = this.InternalSample() % 256;
        }
    }
}

module.exports = KRandom