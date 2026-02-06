// @ts-nocheck
import { DeepLinks } from '@/config/linking'
import { NAVIGATION_CONFIG, ROUTES } from '@/constants/navigation'

describe('Navigation auth mapping', () => {
  it('exposes auth callback and set-password routes', () => {
    expect(ROUTES.AUTH.CALLBACK).toBe('/(auth)/callback')
    expect(ROUTES.AUTH.SET_PASSWORD).toBe('/(auth)/set-password')
  })

  it('maps auth callback screens in navigation config', () => {
    const authScreens = NAVIGATION_CONFIG.screens['(auth)'].screens

    expect(authScreens.callback).toBe('callback')
    expect(authScreens.confirm).toBe('confirm')
    expect(authScreens['set-password']).toBe('set-password')
  })

  it('builds deep links for callback screens', () => {
    expect(DeepLinks.authCallback()).toBe('seaguntechexpotemplate://callback')
    expect(DeepLinks.authConfirm()).toBe('seaguntechexpotemplate://confirm')
    expect(DeepLinks.setPassword()).toBe('seaguntechexpotemplate://set-password')
  })
})
