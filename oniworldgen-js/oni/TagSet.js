const Tag = require("./Tag.js");

class TagSet {
  constructor(...args) {
    this.tags = [];

    if (args.length === 1 && args[0] instanceof TagSet) {
      this.tags = [...args[0].tags];
    } else if (args.length === 1 && Array.isArray(args[0])) {
      this.tags = args[0].map((tag) => new Tag(tag));
    } else if (args.length === 1 && typeof args[0] === "string") {
      this.tags = [new Tag(args[0])];
    } else {
      for (const arg of args) {
        if (arg instanceof TagSet) {
          this.tags.push(...arg.tags);
        } else if (typeof arg === "string") {
          this.tags.push(new Tag(arg));
        }
      }
    }
  }

  // Properties
  get count() {
    return this.tags.length;
  }

  get isReadOnly() {
    return false;
  }

  // Methods
  add(tag) {
    if (!this.contains(tag)) {
      this.tags.push(tag);
    }
  }

  union(otherTagSet) {
    for (const tag of otherTagSet.tags) {
      if (!this.contains(tag)) {
        this.tags.push(tag);
      }
    }
  }

  clear() {
    this.tags = [];
  }

  contains(tag) {
    return this.tags.some((t) => t.equals(tag));
  }

  containsAll(otherTagSet) {
    return otherTagSet.tags.every((tag) => this.contains(tag));
  }

  containsOne(otherTagSet) {
    return otherTagSet.tags.some((tag) => this.contains(tag));
  }

  remove(tag) {
    const index = this.tags.findIndex((t) => t.equals(tag));
    if (index !== -1) {
      this.tags.splice(index, 1);
      return true;
    }
    return false;
  }

  removeSet(otherTagSet) {
    for (const tag of otherTagSet.tags) {
      this.remove(tag);
    }
  }

  isSubsetOf(otherTagSet) {
    return this.tags.every((tag) => otherTagSet.contains(tag));
  }

  intersects(otherTagSet) {
    return this.tags.some((tag) => otherTagSet.contains(tag));
  }

  toString() {
    return this.tags.map((tag) => tag.name).join(", ");
  }

  getTagDescription() {
    return this.tags
      .map((tag) => TagDescriptions.getDescription(tag.toString()))
      .join(", ");
  }

  // Simulating iterator
  *[Symbol.iterator]() {
    for (const tag of this.tags) {
      yield tag;
    }
  }
}

module.exports = TagSet;
