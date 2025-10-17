// Temporary debug script to check bundle matching
// Run with: node debug-bundles.js

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugBundles() {
  // Get all active subscriptions
  const { data: subs, error } = await supabase
    .from('subscriptions')
    .select(`
      id,
      cost,
      billing_cycle,
      services (name)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('\n=== YOUR ACTIVE SUBSCRIPTIONS ===')
  console.log(`Total: ${subs.length}\n`)

  const ottServices = [
    'Netflix', 'Disney+ Hotstar', 'Amazon Prime Video', 'Zee5', 'SonyLIV',
    'Apple TV+', 'JioCinema', 'JioSaavn', 'Voot', 'Eros Now'
  ]

  subs.forEach((sub, i) => {
    const serviceName = sub.services?.name || 'Custom'
    const isOTT = ottServices.some(ott =>
      serviceName.toLowerCase().includes(ott.toLowerCase())
    )
    console.log(`${i + 1}. ${serviceName} - ₹${sub.cost}/${sub.billing_cycle} ${isOTT ? '✓ OTT' : '✗ Not OTT'}`)
  })

  const ottCount = subs.filter(sub => {
    const serviceName = sub.services?.name || 'Custom'
    return ottServices.some(ott =>
      serviceName.toLowerCase().includes(ott.toLowerCase())
    )
  }).length

  console.log(`\n=== BUNDLE REQUIREMENTS ===`)
  console.log(`✓ Need at least 2 active subscriptions: ${subs.length >= 2 ? 'YES' : 'NO'}`)
  console.log(`✓ Need at least 2 OTT services: ${ottCount >= 2 ? 'YES' : `NO (only ${ottCount})`}`)
  console.log(`✓ Bundle must save ₹100+/month`)

  if (ottCount < 2) {
    console.log(`\n⚠️  You need to add at least ${2 - ottCount} more OTT service(s) to see bundle recommendations`)
    console.log('\nRecognized OTT services:')
    ottServices.forEach(s => console.log(`  - ${s}`))
  }
}

debugBundles().then(() => process.exit(0))
