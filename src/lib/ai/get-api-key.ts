import prisma from '@/lib/db'

/**
 * Returns the Anthropic API key.
 * Priority: DB Setting > ANTHROPIC_API_KEY env var
 */
export async function getApiKey(): Promise<string> {
  // Try DB first (allows runtime key updates without restart)
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'ANTHROPIC_API_KEY' },
    })
    if (setting?.value) return setting.value
  } catch { /* DB not available, fall through */ }

  // Fallback to env
  const envKey = process.env.ANTHROPIC_API_KEY
  if (envKey) return envKey

  throw new Error('ANTHROPIC_API_KEY tanımlı değil. Ayarlar sayfasından ekleyin.')
}
