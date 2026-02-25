import * as Linking from 'expo-linking'

export type SessionTokens = {
  accessToken: string | null
  refreshToken: string | null
}

export type VerificationType = 'signup' | 'recovery' | 'invite' | 'magiclink' | 'email_change'

export const toStringParam = (value: string | string[] | null | undefined): string | null => {
  if (typeof value === 'string' && value.length > 0) return value
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].length > 0) return value[0]
  return null
}

export const isVerificationType = (value: string | null): value is VerificationType => {
  return (
    value === 'signup' ||
    value === 'recovery' ||
    value === 'invite' ||
    value === 'magiclink' ||
    value === 'email_change'
  )
}

export const extractSessionTokens = (
  accessTokenParam: string | null,
  refreshTokenParam: string | null,
  rawUrl: string | null,
): SessionTokens => {
  if (accessTokenParam && refreshTokenParam) {
    return { accessToken: accessTokenParam, refreshToken: refreshTokenParam }
  }

  if (!rawUrl || !rawUrl.includes('#')) {
    return { accessToken: null, refreshToken: null }
  }

  const hashParams = rawUrl.split('#')[1]
  const parsedHash = new URLSearchParams(hashParams)
  return {
    accessToken: parsedHash.get('access_token'),
    refreshToken: parsedHash.get('refresh_token'),
  }
}

export const extractVerificationType = (
  typeParam: string | null,
  rawUrl: string | null,
): string | null => {
  if (typeParam) return typeParam
  if (!rawUrl) return null

  const parsedUrl = Linking.parse(rawUrl)
  const queryType = toStringParam(parsedUrl.queryParams?.type)
  if (queryType) return queryType

  const hashParams = rawUrl.split('#')[1]
  if (!hashParams) return null
  return new URLSearchParams(hashParams).get('type')
}
