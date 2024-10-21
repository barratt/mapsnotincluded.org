const Hash = {
  SDBMLower: function (str) {
    str = str.toLowerCase(); // Convert the string to lowercase
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = char + (hash << 6) + (hash << 16) - hash; // SDBM hash formula
    }

    // Return as an unsigned 32-bit integer (this mimics the behavior of many hash functions)
    return hash >>> 0; // Force to unsigned 32-bit integer
  },
};

module.exports = Hash;

// Example usage:
//   const hashValue = Hash.SDBMLower("ExampleString");
//   console.log(hashValue); // Output the hash value
