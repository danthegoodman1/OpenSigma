export const types = [
  "balance_transactions",
  "charges",
  "customers",
  "disputes",
  "events",
  "files",
  "file_links",
  "mandates",
  "payment_intents",
  "setup_intents",
  "setup_attempts",
  "payouts",
  "refunds"
  , "payment_methods"
  , "products"
  , "prices"
  , "coupons"
  , "promotion_codes"
  , "tax_codes"
  , "tax_rates"
  , "shipping_rates"
  , "checkout/sessions"
  , "payment_links"
  , "credit_notes"
  , "billing_portal/configurations"
  , "invoices"
  , "invoiceitems"
  , "plans"
  , "quotes"
  , "subscriptions"
  , "subscription_items"
  , "subscription_schedules"
  , "test_helpers/test_clocks"
  , "accounts"
  , "application_fees"
  , "country_specs"
  , "toptups"
  , "transfers"
  , "apps/secrets"
  , "radar/early_fraud_warnings"
  , "reviews"
  , "radar/value_lists"
  , "radar/value_list_items"
  , "issuing/authorizations"
  , "issuing/cardholders"
  , "issuing/cards"
  , "issuing/disputes"
  , "issuing/funding_instructions"
  , "issuing/transactions"
  , "terminal/locations"
  , "terminal/readers"
  , "terminal/hardware_orders"
  , "terminal/hardware_products"
  , "terminal/hardware_skus"
  , "terminal/hardware_shipping_methods"
  , "terminal/configurations"
  , "sigma/scheduled_query_runs" // https://i.kym-cdn.com/entries/icons/mobile/000/033/487/rick.jpg
  , "reporting/report_runs"
  , "reporting/report_types"
  , "financial_connections/accounts"
  , "financial_connections/transactions"
  , "identity/verification_sessions"
  , "identity/verification_reports"
  , "webhook_endpoints" // https://i.kym-cdn.com/entries/icons/mobile/000/033/487/rick.jpg
] as const // ts magic, tells ts to infer the most narrow type

export type StripeTypes = typeof types[number] // more ts magic to make this a union type
