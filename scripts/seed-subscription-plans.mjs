import {createClient} from '@sanity/client'

const projectId = process.env.SANITY_PROJECT_ID ?? '7cmm88by'
const dataset = process.env.SANITY_DATASET ?? 'production'
const apiVersion = process.env.SANITY_API_VERSION ?? '2024-07-18'
const token = process.env.SANITY_TOKEN

if (!token) {
  console.error('Missing SANITY_TOKEN environment variable')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
})

const plans = [
  {
    _id: 'subscriptionPlan.basic',
    _type: 'subscriptionPlan',
    planId: 'basic',
    name: 'VIP Basic',
    description: '7-day VIP pack',
    pointsCost: 300,
    durationDays: 7,
    isActive: true,
  },
  {
    _id: 'subscriptionPlan.premium',
    _type: 'subscriptionPlan',
    planId: 'premium',
    name: 'VIP Premium',
    description: '30-day VIP pack',
    pointsCost: 1200,
    durationDays: 30,
    isActive: true,
  },
]

async function main() {
  for (const plan of plans) {
    await client.createOrReplace(plan)
    console.log(`Upserted ${plan.planId}`)
  }
}

main().catch(error => {
  console.error('Failed to upsert subscription plans', error)
  process.exit(1)
})
