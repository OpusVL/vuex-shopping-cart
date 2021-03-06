import Vue from "vue";
import Vuex from "vuex";
import * as types from "./mutation-types";
const version = 1;
import App from "../App.vue";
Vue.use(Vuex);

const debug = process.env.NODE_ENV !== "production";

// initial state
const state = {
  version: "",
  added: [],
  all: [],
  filteredProducts: [],
  categShown: true,
  selectedCategory: null
};

// getters
const getters = {
  allProducts: state => state.all, // would need action/mutation if data fetched async
  getNumberOfProducts: state => (state.all ? state.all.length : 0),
  cartProducts: state => {
    return state.added.map(
      ({ id, quantity, name, price, image, description }) => {
        const product = state.all.find(p => p.id === id);
        return {
          name: product.product,
          price: product.price,
          image: product.image,
          description: product.description,
          id: product.id,
          quantity
        };
      }
    );
  },
  categShown: state => state.categShown,
  filteredLinks: state => category =>
    state.all.filter(item => {
      return item.category === category}),
  filteredSubcateg: state => subcateg =>
    state.filteredProducts.filter(ele => {
      return ele.subcateg === subcateg}),
}
// actions
const actions = {
  updateNav({ commit }, value) {
    commit("updateNav", value);
  },
  showCateg({ commit }) {
    commit("showCateg");
  },
  hideCateg({ commit }) {
    commit("categHide");
  },
  changeCateg({ commit }) {
    commit("categShown", value);
    console.log(value);
  },
  addToCart({ commit }, product) {
    commit(types.ADD_TO_CART, {
      id: product.id
    });
  },
  fetchProducts({ commit }) {
    fetch("http://localhost:3000/products")
      .then(res => res.json())
      .then(data => {
        commit("FETCH_PRODUCTS", data);
      })
      .catch(error => {
        console.log(error.statusText);
      });
  },
  increaseItem({ commit }, product) {
    commit(types.INCREASE_ITEM, {
      id: product.id
    });
  },
  decreaseItem({ commit }, product) {
    commit(types.DECREASE_ITEM, {
      id: product.id
    });
  },
  resetStore({ commit }, store) {
    commit("resetStore", store);
    commit("initialiseStore", store);
  },
  removeItem({ commit }, product) {
    commit(types.REMOVE_ITEM, {
      id: product.id
    });
  },
  filterProducts({commit}, value) {
    commit('filterProd', value)
  }
};

// mutations
const mutations = {
  [types.REMOVE_ITEM](state, { id }) {
    const record = state.added
      .map(function(item) {
        return item.id;
      })
      .indexOf(id);
    state.added.splice(record, 1);
  },
  [types.ADD_TO_CART](state, { id }) {
    const record = state.added.find(p => p.id === id);
    if (!record) {
      state.added.push({
        id,
        quantity: 1,
        name: state.all.find(p => p.id === id).product,
        price: state.all.find(p => p.id === id).price
      });
    } else {
      record.quantity++;
    }
  },
  [types.FETCH_PRODUCTS](state, all) {
    state.all = all;
  },
  [types.INCREASE_ITEM](state, { id }) {
    const record = state.added.find(p => p.id === id);
    record.quantity++;
  },
  [types.DECREASE_ITEM](state, { id }) {
    const record = state.added.find(p => p.id === id);
    record.quantity--;
    if (record.quantity < 0) {
      record.quantity = 0;
    }
  },
  // this is to set the localstorage version of the app versioning but .... we can clear it only if the cart is paid - all cache will be deleted )
  resetStore({ commit }, store) {
    state.version++;
    state.added = [];
  },
  initialiseStore(state) {
    // Check if the store exists
    if (localStorage.getItem("store")) {
      let store = JSON.parse(localStorage.getItem("store"));
      if (store.version == version) {
        this.replaceState(Object.assign(state, store));
      } else {
        state.version = version;
      }
    }
  },
  categHide(state) {
    state.categShown = false;
  },
  showCateg(state) {
    state.categShown = true;
  },
  updateNav(state, value) {
    state.selectedCategory = value;
  },
  filterProd(state, value) {
    state.filteredProducts = state.all.filter( item => {
      return item.category === value})
  }
};

// one store for entire application
export default new Vuex.Store({
  state,
  strict: debug,
  getters,
  actions,
  mutations
});
