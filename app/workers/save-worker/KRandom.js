// This is an attempted replication of Kleis Random class, currently does not match.

class KRandom {
    SeedArray;
    inext;
    inextp;

    intMinValue = -2147483648;
    intMaxValue = 2147483647;


    constructor(seed) {
        this.SeedArray = new Array(56);
        let num1 = 161803398 - (seed == this.intMinValue ? this.intMaxValue : Math.abs(seed));
        this.SeedArray[55] = num1;

        let num2 = 1;
        for (let index1 = 1; index1 < 55; ++index1) {
            let index2 = 21 * index1 % 55;
            this.SeedArray[index2] = num2;
            num2 = num1 - num2;
            if (num2 < 0)
                num2 += this.intMaxValue;
            num1 = this.SeedArray[index2];
        }

        for (let index3 = 1; index3 < 5; ++index3) {
            for (let index4 = 1; index4 < 56; ++index4) {
                this.SeedArray[index4] -= this.SeedArray[1 + (index4 + 30) % 55];
                if (this.SeedArray[index4] < 0)
                    this.SeedArray[index4] += this.intMaxValue;
            }
        }

        this.inext = 0;
        this.inextp = 21;
        this.seed = 1;
    }

    InternalSample() {
        let inext = this.inext;
        let inextp = this.inextp;

        let index1;
        if ((index1 = inext + 1) >= 56)
            index1 = 1;
        
        let index2;
        if ((index2 = inextp + 1) >= 56)
            index2 = 1;

        let num = this.SeedArray[index1] - this.SeedArray[index2];
        if (num == this.intMaxValue)
            --num;

        if (num < 0)
            num += this.intMaxValue;
        
        this.SeedArray[index1] = num;
        this.inext = index1;
        this.inextp = index2;

        return num;
    }


    Sample() {
        return this.InternalSample() * 4.656612875245797e-10;
    }

    Next(minValue, maxValue) {
        let num = maxValue - minValue;
        // This in c# does some odd int to long conversion, but since JS doesnt have types. RIP
        // return num <= (long) int.MaxValue ? (int) (this.Sample() * (double) num) + minValue : (int) ((long) (this.GetSampleForLargeRange() * (double) num) + (long) minValue);
        return Math.floor(this.Sample() * num) + minValue;
        // return num <= int.MaxValue ? (int) (this.Sample() * (double) num) + minValue : (int) ((long) (this.GetSampleForLargeRange() * (double) num) + (long) minValue);
    }

    NextDouble(minValue, maxValue) {
        // return (float) (randomSource.NextDouble() * ((double) max - (double) min)) + min;
        return this.NextDouble() * (maxValue - minValue) + minValue;
    }
  
    NextDouble()
    {
        return this.Sample();
    }
}

module.exports = KRandom;