var H = Object.defineProperty;
var V = (a, i, n) => i in a ? H(a, i, { enumerable: !0, configurable: !0, writable: !0, value: n }) : a[i] = n;
var p = (a, i, n) => V(a, typeof i != "symbol" ? i + "" : i, n);
function K(a) {
  return a && a.__esModule && Object.prototype.hasOwnProperty.call(a, "default") ? a.default : a;
}
var u = {}, b, A;
function E() {
  return A || (A = 1, b = {
    SDBMLower: function(i) {
      i = i.toLowerCase();
      let n = 0;
      for (let t = 0; t < i.length; t++)
        n = i.charCodeAt(t) + (n << 6) + (n << 16) - n;
      return n >>> 0;
    }
  }), b;
}
var v, D;
function $() {
  if (D) return v;
  D = 1;
  const i = class i {
    constructor(t = Date.now()) {
      this.SeedArray = new Array(56).fill(0);
      let e = i.MSEED - Math.abs(t === -2147483648 ? i.MBIG : t);
      this.SeedArray[55] = e;
      let s = 1;
      for (let r = 1; r < 55; r++) {
        let o = 21 * r % 55;
        this.SeedArray[o] = s, s = e - s, s < 0 && (s += i.MBIG), e = this.SeedArray[o];
      }
      for (let r = 1; r < 5; r++)
        for (let o = 1; o < 56; o++)
          this.SeedArray[o] -= this.SeedArray[1 + (o + 30) % 55], this.SeedArray[o] < 0 && (this.SeedArray[o] += i.MBIG);
      this.inext = 0, this.inextp = 21;
    }
    internalSample() {
      let t = this.inext, e = this.inextp;
      t = (t + 1) % 56, e = (e + 1) % 56;
      let s = this.SeedArray[t] - this.SeedArray[e];
      return s < 0 && (s += i.MBIG), this.SeedArray[t] = s, this.inext = t, this.inextp = e, s;
    }
    sample() {
      return this.internalSample() * (1 / i.MBIG);
    }
    getSampleForLargeRange() {
      let t = this.internalSample();
      return this.internalSample() % 2 === 0 && (t = -t), (t + 2147483646) / 4294967293;
    }
    // Adjusted to ensure maxValue is used properly
    next(t, e) {
      if (arguments.length === 0)
        return this.internalSample();
      if (arguments.length === 1)
        return Math.floor(this.sample() * t);
      let s = e - t;
      return s <= i.MBIG ? Math.floor(this.sample() * s) + t : Math.floor(this.getSampleForLargeRange() * s) + t;
    }
    nextDouble() {
      return this.sample();
    }
    nextBytes(t) {
      if (!t || !Array.isArray(t))
        throw new Error("Invalid buffer provided.");
      for (let e = 0; e < t.length; e++)
        t[e] = this.internalSample() % 256;
    }
  };
  p(i, "MBIG", 2147483647), p(i, "MSEED", 161803398), p(i, "MZ", 0);
  let a = i;
  return v = a, v;
}
var w, B;
function z() {
  if (B) return w;
  B = 1;
  const a = E(), n = class n {
    // Static Invalid tag
    constructor(e) {
      typeof e == "string" ? (this.name = e, this.hash = a.SDBMLower(e)) : typeof e == "number" ? (this.name = "", this.hash = e) : e instanceof n ? (this.name = e.name, this.hash = e.hash) : (this.name = "", this.hash = 0);
    }
    // Properties
    get Name() {
      return this.name;
    }
    set Name(e) {
      this.name = e, this.hash = a.SDBMLower(this.name);
    }
    get isValid() {
      return this.hash !== 0;
    }
    // Methods
    clear() {
      this.name = null, this.hash = 0;
    }
    getHash() {
      return this.hash;
    }
    // Equals and comparison
    equals(e) {
      return e instanceof n && this.hash === e.hash;
    }
    compareTo(e) {
      return this.hash - e.hash;
    }
    toString() {
      return this.name || this.hash.toString(16);
    }
    // Static methods
    static arrayToString(e) {
      return e.map((s) => s.toString()).join(",");
    }
    // Operators
    static equals(e, s) {
      return e.hash === s.hash;
    }
    static notEquals(e, s) {
      return e.hash !== s.hash;
    }
    // Serialization hooks (placeholders for similar functionality)
    onBeforeSerialize() {
    }
    onAfterDeserialize() {
      this.name ? this.Name = this.name : this.name = "";
    }
  };
  p(n, "Invalid", new n(0));
  let i = n;
  return w = i, w;
}
var y, C;
function x() {
  if (C) return y;
  C = 1;
  const a = z();
  class i {
    constructor(...t) {
      if (this.tags = [], t.length === 1 && t[0] instanceof i)
        this.tags = [...t[0].tags];
      else if (t.length === 1 && Array.isArray(t[0]))
        this.tags = t[0].map((e) => new a(e));
      else if (t.length === 1 && typeof t[0] == "string")
        this.tags = [new a(t[0])];
      else
        for (const e of t)
          e instanceof i ? this.tags.push(...e.tags) : typeof e == "string" && this.tags.push(new a(e));
    }
    // Properties
    get count() {
      return this.tags.length;
    }
    get isReadOnly() {
      return !1;
    }
    // Methods
    add(t) {
      this.contains(t) || this.tags.push(t);
    }
    union(t) {
      for (const e of t.tags)
        this.contains(e) || this.tags.push(e);
    }
    clear() {
      this.tags = [];
    }
    contains(t) {
      return this.tags.some((e) => e.equals(t));
    }
    containsAll(t) {
      return t.tags.every((e) => this.contains(e));
    }
    containsOne(t) {
      return t.tags.some((e) => this.contains(e));
    }
    remove(t) {
      const e = this.tags.findIndex((s) => s.equals(t));
      return e !== -1 ? (this.tags.splice(e, 1), !0) : !1;
    }
    removeSet(t) {
      for (const e of t.tags)
        this.remove(e);
    }
    isSubsetOf(t) {
      return this.tags.every((e) => t.contains(e));
    }
    intersects(t) {
      return this.tags.some((e) => t.contains(e));
    }
    toString() {
      return this.tags.map((t) => t.name).join(", ");
    }
    getTagDescription() {
      return this.tags.map((t) => TagDescriptions.getDescription(t.toString())).join(", ");
    }
    // Simulating iterator
    *[Symbol.iterator]() {
      for (const t of this.tags)
        yield t;
    }
  }
  return y = i, y;
}
var I, k;
function N() {
  if (k) return I;
  k = 1;
  const a = x();
  class i {
    constructor(t) {
      this.name = t.name || "", this.description = t.description || "", this.colorHex = t.colorHex || "", this.icon = t.icon || "", this.forbiddenDLCIds = t.forbiddenDLCIds || [], this.exclusiveWith = t.exclusiveWith || [], this.exclusiveWithTags = t.exclusiveWithTags || [], this.traitTags = t.traitTags || [], this.globalFeatureMods = t.globalFeatureMods || {}, this.removeWorldTemplateRulesById = t.removeWorldTemplateRulesById || [], this.elementBandModifiers = t.elementBandModifiers || [], this.filePath = t.filePath || "", this.traitTagsSet = null;
    }
    // Getter for TraitTagsSet
    get TraitTagsSet() {
      return this.traitTagsSet === null && (this.traitTagsSet = new a(this.traitTags)), this.traitTagsSet;
    }
    // Method to validate WorldTrait
    isValid(t, e = !1) {
      let s = 0, r = 0;
      for (const o in this.globalFeatureMods)
        s += this.globalFeatureMods[o], r += Math.floor(t.worldTraitScale * this.globalFeatureMods[o]);
      return Object.keys(this.globalFeatureMods).length <= 0 || r !== 0 ? !0 : (e && console.warn(`Trait '${this.filePath}' cannot be applied to world '${t.name}' due to globalFeatureMods and worldTraitScale resulting in no features being generated.`), !1);
    }
  }
  return I = i, I;
}
var M, F;
function U() {
  if (F) return M;
  F = 1;
  const a = $(), i = x(), n = N();
  return M = {
    IsInSpacedOutMode: !0,
    SpacedOutId: "EXPANSION1_ID",
    BaseGameId: "",
    worldTraits: {},
    worlds: {},
    clusters: {},
    initData(e) {
      for (const [s, r] of Object.entries(e.vanilla.worlds))
        this.worlds[s] = { ...r, id: s };
      for (const [s, r] of Object.entries(e.vanilla.traits))
        r.forbiddenDLCIds && r.forbiddenDLCIds.includes(this.IsInSpacedOutMode ? this.SpacedOutId : this.BaseGameId) || (this.worldTraits[s] = { ...r, filePath: s });
      for (const [s, r] of Object.entries(e.vanilla.clusters))
        this.clusters[s] = { ...r, id: s };
      if (this.IsInSpacedOutMode) {
        for (const [s, r] of Object.entries(e.SpacedOut.worlds))
          this.worlds[s] = { ...r, id: s };
        for (const [s, r] of Object.entries(e.SpacedOut.traits))
          r.forbiddenDLCIds && r.forbiddenDLCIds.includes(this.IsInSpacedOutMode ? this.SpacedOutId : this.BaseGameId) || (this.worldTraits[s] = { ...r, filePath: s });
        for (const [s, r] of Object.entries(e.SpacedOut.clusters))
          this.clusters[s] = { ...r, id: s };
      }
      for (const [s, r] of Object.entries(e.FrostyPlanet.worlds))
        this.worlds[s] = { ...r, id: s };
      for (const [s, r] of Object.entries(e.FrostyPlanet.traits))
        r.forbiddenDLCIds.includes(this.IsInSpacedOutMode ? this.SpacedOutId : this.BaseGameId) || (this.worldTraits[s] = { ...r, filePath: s });
      for (const [s, r] of Object.entries(e.FrostyPlanet.clusters))
        this.clusters[s] = { ...r, id: s };
      console.log(`Worlds initialized, ${Object.keys(this.worlds).length} entries`), console.log(`Traits initialized, ${Object.keys(this.worldTraits).length} entries`), console.log(`Clusters initialized, ${Object.keys(this.clusters).length} entries`);
    },
    getRandomWorld() {
      const e = Object.values(this.worlds);
      return e[Math.floor(Math.random() * e.length)];
    },
    getWorld(e) {
      return this.worlds[e];
    },
    getCluster(e) {
      return this.clusters[e];
    },
    getRandomTraits(e, s) {
      if (!s)
        throw new Error("World is required");
      if (s.disableWorldTraits)
        return console.log("Traits disabled"), [];
      if (!s.worldTraitRules)
        return console.log("no rules"), [];
      if (e === 0)
        return console.log("seed is 0"), [];
      const r = new a(e), o = [...Object.values(this.worldTraits).map((l) => new n(l))], d = [], R = new i();
      for (const l of s.worldTraitRules) {
        if (l.specificTraits)
          for (const h of l.specificTraits)
            this.worldTraits[h] ? d.push(this.worldTraits[h]) : console.log(`World traits ${h} doesn't exist, skipping.`);
        let g = [...o];
        const W = l.requiredTags ? new i(l.requiredTags) : null, j = l.forbiddenTags ? new i(l.forbiddenTags) : null;
        g = g.filter((h) => {
          const c = !W || h.TraitTagsSet.containsAll(W), T = !j || !h.TraitTagsSet.containsOne(j), f = !l.forbiddenTraits || !l.forbiddenTraits.includes(h.filePath);
          return c && T && f && h.isValid(s, !0);
        });
        const S = r.next(l.min, Math.max(l.min, l.max + 1)), m = d.length;
        for (; d.length < m + S && g.length > 0; ) {
          const h = r.next(g.length), c = g[h];
          let T = !1;
          if (!c) {
            console.log("Uh oh");
            continue;
          }
          for (const f of c.exclusiveWith)
            if (d.find((J) => J.filePath === f)) {
              T = !0;
              break;
            }
          for (const f of c.exclusiveWithTags)
            if (R.contains(f)) {
              T = !0;
              break;
            }
          if (!T) {
            d.push(c), g.splice(h, 1), o.splice(o.indexOf(c), 1);
            for (const f of c.exclusiveWithTags)
              R.add(f);
          }
        }
        d.length !== m + S && console.log(`TraitRule on ${s.name} tried to generate ${S} but only generated ${d.length - m}`);
      }
      return d.map((l) => l.filePath);
    }
  }, M;
}
var q, L;
function X() {
  if (L) return q;
  L = 1;
  class a {
    constructor(n = 0, t = 0) {
      this.min = n, this.max = t, this.requiredTags = null, this.specificTraits = null, this.forbiddenTags = null, this.forbiddenTraits = null;
    }
    // Setters for lists if needed (or use array methods directly)
    setRequiredTags(n) {
      this.requiredTags = n;
    }
    setSpecificTraits(n) {
      this.specificTraits = n;
    }
    setForbiddenTags(n) {
      this.forbiddenTags = n;
    }
    setForbiddenTraits(n) {
      this.forbiddenTraits = n;
    }
    validate() {
      this.specificTraits && (console.assert(
        !this.requiredTags,
        "TraitRule using specificTraits does not support requiredTags"
      ), console.assert(
        !this.forbiddenTags,
        "TraitRule using specificTraits does not support forbiddenTags"
      ), console.assert(
        !this.forbiddenTraits,
        "TraitRule using specificTraits does not support forbiddenTraits"
      ));
    }
  }
  return q = a, q;
}
var P;
function Z() {
  return P || (P = 1, u.Hash = E(), u.KRandom = $(), u.SettingsCache = U(), u.Tag = z(), u.TagSet = x(), u.TraitRule = X(), u.WorldTrait = N()), u;
}
var O, G;
function Q() {
  return G || (G = 1, O = Z()), O;
}
var Y = Q();
const ee = /* @__PURE__ */ K(Y);
export {
  ee as default
};
