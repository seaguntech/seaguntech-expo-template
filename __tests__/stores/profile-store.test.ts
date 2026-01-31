// @ts-nocheck
import {
  selectAvatarUrl,
  selectDisplayName,
  selectEmail,
  selectInitials,
  selectIsPremium,
  selectLocale,
  useProfileStore,
} from '@/shared/stores/profile-store'

describe('Profile Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useProfileStore.setState({
      displayName: null,
      avatarUrl: null,
      email: null,
      isPremium: false,
      locale: 'en',
    })
  })

  describe('initial state', () => {
    it('has correct default values', () => {
      const state = useProfileStore.getState()
      expect(state.displayName).toBeNull()
      expect(state.avatarUrl).toBeNull()
      expect(state.email).toBeNull()
      expect(state.isPremium).toBe(false)
      expect(state.locale).toBe('en')
    })
  })

  describe('setters', () => {
    it('setDisplayName updates display name', () => {
      useProfileStore.getState().setDisplayName('John Doe')
      expect(useProfileStore.getState().displayName).toBe('John Doe')
    })

    it('setAvatarUrl updates avatar URL', () => {
      const avatarUrl = 'https://example.com/avatar.jpg'
      useProfileStore.getState().setAvatarUrl(avatarUrl)
      expect(useProfileStore.getState().avatarUrl).toBe(avatarUrl)
    })

    it('setEmail updates email', () => {
      useProfileStore.getState().setEmail('john@example.com')
      expect(useProfileStore.getState().email).toBe('john@example.com')
    })

    it('setIsPremium updates premium status', () => {
      useProfileStore.getState().setIsPremium(true)
      expect(useProfileStore.getState().isPremium).toBe(true)
    })

    it('setLocale updates locale', () => {
      useProfileStore.getState().setLocale('es')
      expect(useProfileStore.getState().locale).toBe('es')
    })
  })

  describe('hydrate', () => {
    it('hydrates partial state', () => {
      useProfileStore.getState().hydrate({
        displayName: 'Jane Doe',
        email: 'jane@example.com',
      })

      const state = useProfileStore.getState()
      expect(state.displayName).toBe('Jane Doe')
      expect(state.email).toBe('jane@example.com')
      expect(state.isPremium).toBe(false) // unchanged
    })

    it('hydrates full state', () => {
      useProfileStore.getState().hydrate({
        displayName: 'Full User',
        avatarUrl: 'https://example.com/full.jpg',
        email: 'full@example.com',
        isPremium: true,
        locale: 'fr',
      })

      const state = useProfileStore.getState()
      expect(state.displayName).toBe('Full User')
      expect(state.avatarUrl).toBe('https://example.com/full.jpg')
      expect(state.email).toBe('full@example.com')
      expect(state.isPremium).toBe(true)
      expect(state.locale).toBe('fr')
    })
  })

  describe('clearProfile', () => {
    it('resets all state to defaults', () => {
      // Set some values first
      useProfileStore.getState().hydrate({
        displayName: 'To Be Cleared',
        avatarUrl: 'https://example.com/clear.jpg',
        email: 'clear@example.com',
        isPremium: true,
        locale: 'de',
      })

      // Clear
      useProfileStore.getState().clearProfile()

      // Verify reset
      const state = useProfileStore.getState()
      expect(state.displayName).toBeNull()
      expect(state.avatarUrl).toBeNull()
      expect(state.email).toBeNull()
      expect(state.isPremium).toBe(false)
      expect(state.locale).toBe('en')
    })
  })

  describe('selectors', () => {
    beforeEach(() => {
      useProfileStore.setState({
        displayName: 'Test User',
        avatarUrl: 'https://example.com/test.jpg',
        email: 'test@example.com',
        isPremium: true,
        locale: 'es',
      })
    })

    it('selectDisplayName returns display name', () => {
      expect(selectDisplayName(useProfileStore.getState())).toBe('Test User')
    })

    it('selectAvatarUrl returns avatar URL', () => {
      expect(selectAvatarUrl(useProfileStore.getState())).toBe('https://example.com/test.jpg')
    })

    it('selectEmail returns email', () => {
      expect(selectEmail(useProfileStore.getState())).toBe('test@example.com')
    })

    it('selectIsPremium returns premium status', () => {
      expect(selectIsPremium(useProfileStore.getState())).toBe(true)
    })

    it('selectLocale returns locale', () => {
      expect(selectLocale(useProfileStore.getState())).toBe('es')
    })
  })

  describe('selectInitials', () => {
    it('returns initials for two-word name', () => {
      useProfileStore.setState({ displayName: 'John Doe' })
      expect(selectInitials(useProfileStore.getState())).toBe('JD')
    })

    it('returns initials for single-word name', () => {
      useProfileStore.setState({ displayName: 'John' })
      expect(selectInitials(useProfileStore.getState())).toBe('J')
    })

    it('returns initials for three-word name (max 2 chars)', () => {
      useProfileStore.setState({ displayName: 'John Michael Doe' })
      expect(selectInitials(useProfileStore.getState())).toBe('JM')
    })

    it('returns ? for null display name', () => {
      useProfileStore.setState({ displayName: null })
      expect(selectInitials(useProfileStore.getState())).toBe('?')
    })

    it('returns uppercase initials', () => {
      useProfileStore.setState({ displayName: 'jane doe' })
      expect(selectInitials(useProfileStore.getState())).toBe('JD')
    })
  })
})
