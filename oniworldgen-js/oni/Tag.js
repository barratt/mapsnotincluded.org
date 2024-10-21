const Hash = require("./Hash");

class Tag {
  static Invalid = new Tag(0); // Static Invalid tag

  constructor(nameOrHash) {
    if (typeof nameOrHash === "string") {
      this.name = nameOrHash;
      this.hash = Hash.SDBMLower(nameOrHash); // Assuming Hash.SDBMLower is a valid hashing function
    } else if (typeof nameOrHash === "number") {
      this.name = "";
      this.hash = nameOrHash;
    } else if (nameOrHash instanceof Tag) {
      this.name = nameOrHash.name;
      this.hash = nameOrHash.hash;
    } else {
      this.name = "";
      this.hash = 0;
    }
  }

  // Properties
  get Name() {
    return this.name;
  }

  set Name(value) {
    this.name = value; // JavaScript doesn't have string interning like C#, so we just set the value directly
    this.hash = Hash.SDBMLower(this.name);
  }

  get isValid() {
    return this.hash !== 0;
  }

  // Methods
  clear() {
    this.name = null;
    this.hash = 0;
  }

  getHash() {
    return this.hash;
  }

  // Equals and comparison
  equals(other) {
    return other instanceof Tag && this.hash === other.hash;
  }

  compareTo(other) {
    return this.hash - other.hash;
  }

  toString() {
    return this.name || this.hash.toString(16); // Hex string if name is not present
  }

  // Static methods
  static arrayToString(tags) {
    return tags.map((tag) => tag.toString()).join(",");
  }

  // Operators
  static equals(a, b) {
    return a.hash === b.hash;
  }

  static notEquals(a, b) {
    return a.hash !== b.hash;
  }

  // Serialization hooks (placeholders for similar functionality)
  onBeforeSerialize() {
    // Add serialization logic here if needed
  }

  onAfterDeserialize() {
    if (this.name) {
      this.Name = this.name; // Recalculate hash after deserialization
    } else {
      this.name = "";
    }
  }
}
module.exports = Tag