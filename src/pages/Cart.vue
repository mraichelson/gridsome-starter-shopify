<template>
  <Layout>
    <div class="hero">
      <div class="hero-body">
        <div class="container has-text-centered">
          <h3 class="title is-family-secondary">
            Cart
          </h3>
        </div>
      </div>
    </div>
    <div class="container cart">
      <table class="table is-fullwidth">
        <tbody>
          <tr
            v-for="item in cart"
            :key="item.variantId">
            <td width="150">
              <figure class="image is-square">
                <img
                  :src="item.image.thumbnail"
                  :alt="item.image.altText || item.title">
              </figure>
            </td>
            <td>
              <g-link
                :to="item.path"
                class="is-uppercase has-text-weight-medium">
                {{ item.productTitle }}
              </g-link>
              <p>
                <small>
                  {{ item.variantTitle !== 'Default Title' ? item.variantTitle : '' }}
                </small>
              </p>
              <p>
                <small>
                  {{ item.price }}
                </small>
              </p>
            </td>
            <td />
            <td width="300">
              <div class="field has-addons">
                <div class="control">
                  <button
                    class="button is-white"
                    @click="removeItem(item.variantId)"
                    @keyup="removeItem(item.variantId)">
                    <small>Remove</small>
                  </button>
                </div>
                <div class="control">
                  <button
                    class="button is-light"
                    @click="decreaseItemQty(item)"
                    @keyup="decreaseItemQty(item)">
                    -
                  </button>
                </div>
                <div class="control">
                  <label for="qty">
                    <input
                      :value="item.qty"
                      class="input has-text-centered"
                      type="number"
                      placeholder="Enter a quantity"
                      min="1"
                      @change="e => updateItemQty(item, e.target.valueAsNumber)">
                  </label>
                </div>
                <div class="control">
                  <button
                    class="button is-light"
                    @click="increaseItemQty(item)"
                    @keyup="increaseItemQty(item)">
                    +
                  </button>
                </div>
              </div>
            </td>
            <td width="150">
              <p class="has-text-right item-total">
                {{ item.total }}
              </p>
            </td>
          </tr>
        </tbody>
        <tfoot v-if="cart.length">
          <tr>
            <th />
            <th />
            <th />
            <th />
            <th class="has-text-right">
              <p>Cart Total: {{ cartTotal }}</p>
            </th>
          </tr>
        </tfoot>
      </table>
      <br>
      <form
        v-if="cart.length"
        @submit.prevent="checkout">
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
      <div
        v-else
        class="container has-text-centered">
        <p>To checkout, add some items to cart.</p>
        <br>
        <g-link
          to="/"
          class="button is-primary is-outlined">
          Browse
        </g-link>
      </div>
    </div>
  </Layout>
</template>

<script>
// Packages
import gql from 'graphql-tag'
export default {
  metaInfo: {
    title: 'Your Cart'
  },
  data: () => ({ email: '', isLoading: false }),
  computed: {
    cart () { return this.$store.state.cart },
    cartTotal () { return this.$store.getters.cartTotal.format() }
  },
  methods: {
    async removeItem (itemId) {
      await this.$store.dispatch('removeFromCart', itemId)
      this.$notify({
        title: 'Item removed from cart',
        type: 'primary'
      })
    },
    async decreaseItemQty (item) {
      if (item.qty === 1) return
      const qty = item.qty - 1
      await this.$store.dispatch('updateItemQty', { itemId: item.variantId, qty })
    },
    async increaseItemQty (item) {
      const qty = item.qty + 1
      await this.$store.dispatch('updateItemQty', { itemId: item.variantId, qty })
    },
    async updateItemQty (item, qty) {
      if (qty <= 0) return
      await this.$store.dispatch('updateItemQty', { itemId: item.variantId, qty })
    },
    async checkout () {
      const email = this.email
      if (!this.cart.length) return alert('No items in cart')
      const lineItems = this.cart.map(item => ({ quantity: item.qty, variantId: item.variantId }))

      const checkoutInput = { email, lineItems }

      try {
        this.isLoading = true
        const { data: { checkoutCreate } } = await this.$apollo.mutate({
          mutation: gql`mutation checkoutCreate($input: CheckoutCreateInput!) {
            checkoutCreate(input: $input) {
              checkout {
                id
                webUrl
              }
              checkoutUserErrors {
                code
                field
                message
              }
            }
          }
          `,
          variables: { input: checkoutInput }
        })
        if (checkoutCreate.checkoutUserErrors.length) throw new Error(checkoutCreate.checkoutUserErrors[ 0 ].message)

        window.location = checkoutCreate.checkout.webUrl
      } catch (error) {
        this.isLoading = false
        console.error(error)
        this.$notify({
          title: 'Whoops...',
          type: 'danger',
          message: 'Something went wrong - please try again.'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
tr {
  height: 150px;
  // display: flex;
}
</style>
