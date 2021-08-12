export const SFCJS = Object.freeze({
  modules: {},
  define(name, deps, fn) {
    this.modules[name] = {
      name,
      deps,
      fn,
    }
  },
  setup() {

  },
})
