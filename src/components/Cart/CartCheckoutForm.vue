<template>
  <form @submit.prevent="checkout">
    <div class="field is-grouped is-grouped-right">
      <div class="field has-addons">
        <div class="control">
          <label
            for="email"
            class="label">
            <input
              id="email"
              v-model="email"
              class="input"
              type="email"
              placeholder="Your email address"
              required>
          </label>
        </div>
        <div class="control">
          <button
            :class="{'is-loading': isLoading}"
            type="submit"
            class="button is-primary">
            Checkout
          </button>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
export default {
  props: {
    email: {
      type: String,
      default: ''
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    checkout () {
      this.$emit('checkout')
    }
  }
}
</script>
