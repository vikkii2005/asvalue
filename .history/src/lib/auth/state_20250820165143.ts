import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function generateState(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function storeState(state: string, codeVerifier: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  const { error } = await supabase
    .from('oauth_states')
    .insert({
      state_value: state,
      code_verifier: codeVerifier,
      expires_at: expiresAt.toISOString(),
      used: false,
    })

  if (error) {
    console.error('Failed to store OAuth state:', error)
    throw new Error('Failed to store OAuth state')
  }
}

export async function validateState(state: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('oauth_states')
    .select('code_verifier')
    .eq('state_value', state)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !data) {
    console.error('Invalid OAuth state:', error?.message)
    return null
  }

  // Mark state as used
  await supabase
    .from('oauth_states')
    .update({ used: true })
    .eq('state_value', state)

  return data.code_verifier
}