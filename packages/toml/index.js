const { TomlDocument: TomlDocumentInner } = require("./pkg/covector_toml");

function proxyPropGet(target, prop) {
  const propTarget = target.get(prop);

  if (!propTarget) return undefined;

  return new Proxy(propTarget, {
    get(t, innerProp) {
      const ret = Reflect.get(...arguments);
      return ret ? ret : proxyPropGet(target, prop + "." + innerProp);
    },
    set(t, innerProp, newValue) {
      return target.set(prop + "." + innerProp, newValue);
    },
  });
}

class TomlDocument {
  inner;

  constructor(toml) {
    this.inner = new TomlDocumentInner(toml);

    return new Proxy(this, {
      get(target, prop) {
        const ret = Reflect.get(...arguments);
        return ret ? ret : proxyPropGet(target, prop);
      },
    });
  }

  static parse(toml) {
    return new TomlDocument(toml);
  }

  static stringify(toml) {
    if (toml instanceof TomlDocument) {
      return toml.toString();
    } else {
      return new TomlDocument(toml).toString();
    }
  }

  set(key, value) {
    return this.inner.set(key, value);
  }

  get(key) {
    return this.inner.get(key);
  }

  toString() {
    return this.inner.toString();
  }

  toObject() {
    return this.inner.toObject();
  }
}

module.exports = { TomlDocument };
