<template>
  <Layout>
    <div class="hero">
      <div class="hero-body">
        <div class="container has-text-centered">
          <h3 class="title is-family-secondary">
            Your Account
          </h3>
          <div
            v-if="!customer || $apollo.loading"
            class="lds-ring">
            <div /><div /><div /><div />
          </div>
        </div>
      </div>
    </div>
    <div class="columns">
      <div class="column is-half">
        <h4 class="subtitle is-family-secondary">
          Order history
        </h4>
        <div v-if="customer">
          <p v-if="!orders.length">
            You have no orders.
          </p>
          <table
            v-else
            class="table is-fullwidth">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Total Items</th>
                <th>Total Price</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="order in orders"
                :key="order.id">
                <th>{{ order.name }}</th>
                <th>{{ order.lineItems.edges.length }}</th>
                <th>{{ formatCurrency(order.totalPrice) }}</th>
                <th>
                  <a
                    :href="order.statusUrl"
                    target="_blank"
                    rel="noreferrer">
                    View Order
                  </a>
                </th>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="column is-half">
        <h4 class="subtitle is-family-secondary">
          {{ displayName }}
        </h4>
        <p>{{ customer.email }}</p>
        <br>
        <div v-if="customer.defaultAddress">
          <p
            v-for="(line, i) in customer.defaultAddress.formatted"
            :key="i">
            {{ line }}
          </p>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
import gql from 'graphql-tag'
export default {
  name: 'Account',
  computed: {
    displayName () { return this.customer.firstName ? `${this.customer.firstName} ${this.customer.lastName}` : this.customer.displayName },
    orders () { return this.customer.orders.edges.map(({ node }) => node) }
  },
  methods: {
    formatCurrency ({ currencyCode, amount }) {
      return new Intl.NumberFormat('en-GB', { style: 'currency', currency: currencyCode }).format(amount)
    }
  },
  apollo: {
    customer: {
      query: gql`query customerOrders ($accessToken: String!) {
        customer (customerAccessToken: $accessToken) {
          displayName
          firstName
          lastName
          email
          defaultAddress {
            address1
            address2
            city
            country
            zip
            formatted(withName: true)
          }
          orders (first: 10) {
            edges {
              node {
                id
                name
                statusUrl
                lineItems (first: 100) {
                  edges {
                    node {
                      title
                      quantity
                    }
                  }
                }
                totalPrice: totalPriceV2 {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }`,
      skip () {
        // Skip query if we have no token - i.e at build time
        return !this.$store.getters.isAuthenticated
      },
      variables () {
        const accessToken = this.$store.getters.accessToken
        return { accessToken }
      }
    }
  }
}
</script>
