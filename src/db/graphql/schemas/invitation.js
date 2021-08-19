const { gql } = require('apollo-server-express')

const invitationSchema = gql`
  type Query {
    getInvitation(token: String!): Invitation
    getInvitations(page: Int, limit: Int, sortBy: String, sortDirection: String, includeNonApproved: Boolean): Invitations
  }

  input socialLinksInput {
    twitter: String
    linkedin: String
    website: String
    additionalLink: String
  }

  input fellowApplicationInput {
    title: String!
    organization: String!
    bio: String!
    socialLinks: socialLinksInput
    applyForColumn: Boolean!
    samplePosts: [String]!
  }

  enum invitationTypes {
    REGULAR
    PAID
    FELLOW
  }

  type Mutation {
    requestInvitation(
      firstName: String!
      lastName: String!
      email: String!
      expertise: String!
      note: String
      verificationLink: String
      special: Boolean
      fellow: fellowApplicationInput
      type: invitationTypes
    ): Invitation
    approveInvitation(email: String!): Invitation
    acceptInvitation(token: String!): DefaultPayload
    payForApproval(paymentMethod: StripePaymentMethod!, email: String!): Approval
    applyForFellowship(email: String!, fellow: fellowApplicationInput!, additionalExpertise: String): DefaultPayload
    inviteUserToColumn(firstName: String!, lastName: String!, email: String!, expertise: String!, columnSlug: String!): DefaultPayload
  }

  input StripeCard {
    last4: String
    exp_month: Int
    exp_year: Int
    brand: String
  }

  input StripeBillingDetails {
    name: String
  }

  input StripePaymentMethod {
    id: String!
    card: StripeCard
    billing_details: StripeBillingDetails
  }

  type StripeSubscriptionItemData {
    id: String
    object: String
    created: DateTime
    currency: String
  }

  type StripeSubscriptionItem {
    object: String
    data: StripeSubscriptionItemData
  }

  type StripePaymentIntent {
    id: String
    object: String
    amount: Int
    amount_capturable: Int
    amount_received: Int
    application_fee_amount: Int
    cancelled_at: DateTime
    cancellation_reason: String
    capture_method: String
    client_secret: String
    confirmationMethod: String
    created: DateTime
    currency: String
    livemode: Boolean
    payment_method_types: [String]
    status: String
    setup_future_usage: String
  }

  type StripeInvoice {
    id: String
    object: String
    account_country: String
    account_name: String
    amount_due: Int
    amount_paid: Int
    amount_remaining: Int
    application_fee_amount: Int
    attempt_count: Int
    payment_intent: StripePaymentIntent
    livemode: Boolean
    paid: Boolean
    period_end: DateTime
    period_start: DateTime
    status: String
    total: Int
    subtotal: Int
  }

  type StripeSubscription {
    id: String
    object: String
    application_fee_percent: Int
    billing_cycle_anchor: DateTime
    collection_method: String
    created: DateTime
    current_period_end: DateTime
    current_period_start: DateTime
    customer: String
    default_payment_method: String
    items: [StripeSubscriptionItem]
    latest_invoice: StripeInvoice
    livemode: Boolean
    start_date: DateTime
    status: String
  }

  type Approval {
    subscription: StripeSubscription
    token: String
  }

  type Invitations {
    list: [Invitation]
    count: Int!
  }

  type Invitation {
    firstName: String
    lastName: String
    email: String
    token: String
    state: String
    special: Boolean
    type: String
    expertises: [Expertise]
  }
`

module.exports = invitationSchema
