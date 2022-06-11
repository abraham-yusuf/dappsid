import supabase from '@/lib/supabase'

export default async function addDomain(req, res) {
  const { domain, siteId } = req.query

  const response = await fetch(
    `https://api.vercel.com/v8/projects/${process.env.VERCEL_PROJECT_ID}/domains?teamId=${process.env.VERCEL_TEAM_ID}`,
    {
      body: `{\n  "name": "${domain}"\n}`,
      headers: {
        Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    }
  )

  const data = await response.json()

  if (data.error?.code == 'forbidden') {
    res.status(403).end() // domain is already owned by another team but you can request delegation to access it
  } else if (data.error?.code == 'domain_taken') {
    res.status(409).end() // domain is already being used by a different project
  } else {
    await supabase
      .from('sites')
      .update({ customDomain: domain })
      .match({ id: siteId })
    res.status(200).end()
  }
}
