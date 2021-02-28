import Storage from "vue-ls";

const install = Vue => {
  const options = {
    namespace: "HYZ__", // key prefix
    name: "ls", // name variable Vue.[ls] or this.[$ls],
    storage: "local" // storage name session, local, memory
  };

  Vue.use(Storage, options);
};

export default { install };
