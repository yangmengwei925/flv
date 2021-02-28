import Http from "./lib/http";
const install = (Vue, opts) => {
  if (!Vue.prototype.$http) {
    const http = new Http(Vue, opts || {}).get();
    Vue.http = http;
    Object.defineProperty(Vue.prototype, "$http", {
      get() {
        return http;
      }
    });
  }
};

export default { install };
