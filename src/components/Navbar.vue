<template>
  <nav
    class="navbar container is-spaced"
    role="navigation"
    aria-label="main navigation">
    <div class="navbar-brand">
      <g-link
        to="/"
        class="navbar-item">
        <g-image
          src="../favicon.png"
          width="28"
          height="28"
          alt="Gridsome Logo" />
      </g-link>

      <a
        role="button"
        aria-label="Open Navbar"
        class="navbar-burger burger">
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </a>
    </div>

    <div class="navbar-menu">
      <div class="navbar-start">
        <g-link
          to="/"
          class="navbar-item">
          Home
        </g-link>
        <g-link
          to="/collections"
          class="navbar-item">
          Collections
        </g-link>
        <g-link
          to="/"
          class="navbar-item">
          Contact
        </g-link>
        <g-link
          to="/"
          class="navbar-item">
          About
        </g-link>
      </div>

      <div class="navbar-end">
        <div
          class="navbar-item has-dropdown"
          :class="{'is-active': searchResults.length}">
          <div class="control navbar-item">
            <label for="search">
              <input
                id="search"
                v-model="searchTerm"
                aria-label="Search"
                class="input is-small"
                type="text"
                placeholder="Search">
            </label>
          </div>
          <div class="navbar-dropdown">
            <g-link
              v-for="result in searchResults"
              :key="result.id"
              :to="result.path"
              class="navbar-item">
              {{ result.title }}
            </g-link>
            <hr class="navbar-divider">
            <div class="navbar-item">
              View more results
            </div>
          </div>
        </div>
        <div
          v-if="isAuthenticated"
          class="navbar-item has-dropdown is-hoverable">
          <p class="navbar-item">
            Account
          </p>
          <div class="navbar-dropdown has-text-centered">
            <g-link
              to="/account"
              class="navbar-item">
              Your Orders
            </g-link>
            <hr class="navbar-divider">
            <button
              class="button is-white"
              @click="logout"
              @keyup.enter="logout">
              Logout
            </button>
          </div>
        </div>
        <g-link
          v-if="!isAuthenticated"
          to="/login"
          class="navbar-item">
          Login
        </g-link>
        <g-link
          to="/cart"
          class="navbar-item">
          Cart - {{ cart.length }} Item{{ cart.length !== 1 ? 's' : '' }}
        </g-link>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  data: () => ({
    searchTerm: ''
  }),
  computed: {
    isAuthenticated () { return this.$store.getters.isAuthenticated },
    cart () { return this.$store.state.cart },
    searchResults () {
      if (!this.$search) return []
      const searchTerm = this.searchTerm
      if (searchTerm.length < 3) return []
      return this.$search.search({ query: searchTerm, limit: 5, suggest: true })
    }
  },
  watch: {
    $route (to, from) {
      this.searchTerm = ''
    }
  },
  methods: {
    async logout () {
      await this.$store.dispatch('logout')
      this.$router.push('/')
    }
  }
}
</script>
