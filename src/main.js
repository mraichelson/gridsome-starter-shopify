// This is the main.js file. Import global CSS and scripts here.
// The Client API can be used here. Learn more: gridsome.org/docs/client-api

// Layouts
import DefaultLayout from '~/layouts/Default.vue'

// Plugins
import Cookies from 'js-cookie'
import currency from 'currency.js'
import Notifications from 'vue-notification/dist/ssr.js'
import VueApollo from 'vue-apollo'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'

// Dependencies
import ApolloClient from 'apollo-boost'
import fetch from 'isomorphic-fetch'

// Styles
import '~/styles/main.scss'
import 'typeface-karla'
import 'typeface-prata'

export default function (Vue, { appOptions, isClient, router }) {
  // Set default layout as a global component
  Vue.component('Layout', DefaultLayout)
  // Import global plugins
  Vue.use(Vuex)
  Vue.use(VueApollo)
  Vue.use(Notifications)

  // Create Apollo client
  const apolloClient = new ApolloClient({
    fetch,
    uri: `https://${process.env.GRIDSOME_SHOPIFY_STOREFRONT}.myshopify.com/api/2019-07/graphql.json`,
    headers: {
      'X-Shopify-Storefront-Access-Token': process.env.GRIDSOME_SHOPIFY_STOREFRONT_TOKEN
    }
  })

  // Add client to vue-apollo provider
  const apolloProvider = new VueApollo({
    defaultClient: apolloClient
  })

  // Add provider to vue app
  appOptions.apolloProvider = apolloProvider

  // Create Vuex store
  const store = new Vuex.Store({
    state: {
      cart: [],
      token: null
    },
    mutations: {
      updateCart: (state, cart) => { state.cart = cart },
      setToken: (state, token) => { state.token = token }
    },
    actions: {
      addToCart: ({ state, commit }, newItem) => {
        const cart = state.cart
        const itemExists = cart.find(item => item.variantId === newItem.variantId)

        if (itemExists) itemExists.qty += newItem.qty
        else cart.push(newItem)

        commit('updateCart', cart)
      },
      removeFromCart: ({ state, commit }, itemId) => {
        const cart = state.cart
        const updatedCart = cart.filter(item => item.variantId !== itemId)

        commit('updateCart', updatedCart)
      },
      setToken: ({ commit }, token) => {
        commit('setToken', token)
      }
    },
    getters: {
      isAuthenticated: ({ token }) => !!token,
      accessToken: ({ token }) => token.accessToken,
      cartTotal: ({ cart }) => cart.reduce((total, item) => total.add(currency(item.price.amount).multiply(item.qty)), currency(0, { formatWithSymbol: true, symbol: '£' }))
    }
  })

  appOptions.store = store

  if (isClient) {
    // Tokens
    new VuexPersistence({
      restoreState: key => Cookies.getJSON(key),
      saveState: (key, { token }) => {
        const expires = new Date(token.expiresAt)
        Cookies.set(key, { token }, { expires })
      },
      modules: ['token'],
      filter: mutation => mutation.type === 'setToken'
    }).plugin(store)

    // Cart
    new VuexPersistence({
      storage: window.localStorage,
      modules: ['cart'],
      filter: mutation => mutation.type === 'updateCart'
    }).plugin(store)
  }

  if (isClient) {
    router.beforeEach((to, from, next) => {
      const tokenExists = store.getters.isAuthenticated
      if (to.path.includes('/account') && !tokenExists) next('/login')
      else if (to.path.includes('/login') && tokenExists) next('/')
      else next()
    })
  }
}
