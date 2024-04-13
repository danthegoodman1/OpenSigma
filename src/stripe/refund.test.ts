import Stripe from "stripe"
import { test } from "vitest"

test("refund charge", async () => {
  const stripe = new Stripe(process.env.STRIPE_KEY!, {
    apiVersion: "2022-11-15",
  })

  try {
    await stripe.refunds.create({
      charge: "ch_3OrpBECyQAg6NyoS0caFEowW", // canceled
    })
  } catch (error) {
    console.log(error.message)
    // This PaymentIntent (pi_3OrpBECyQAg6NyoS07fH88Yd) does not have a successful charge to refund.
  }

  try {
    await stripe.refunds.create({
      charge: "ch_3Orq2rCyQAg6NyoS1JVuj7VR", // refunded
    })
  } catch (error) {
    console.log(error.message)
    // Charge ch_3Orq2rCyQAg6NyoS1JVuj7VR has already been refunded.
  }

  try {
    await stripe.refunds.create({
      charge: "ch_3Orp6PCyQAg6NyoS0aLknMyX", // disputed (this actually worked the first time)
    })
  } catch (error) {
    console.log(error.message)
    // Charge ch_3Orp6PCyQAg6NyoS0aLknMyX has been charged back; cannot issue a refund.
  }
})
