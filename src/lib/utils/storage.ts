// src/lib/utils/storage.ts
// Secure storage utility functions

interface StorageOptions {
  encrypt?: boolean
  expiration?: number // in milliseconds
  prefix?: string
}

interface StoredData<T> {
  value: T
  encrypted: boolean
  expires?: number
  created: number
}

export class SecureStorage {
  private static defaultPrefix = 'asvalue_'
  private static encryptionKey: string | null = null

  // Initialize encryption key (should be called once per session)
  public static initializeEncryption(key?: string): void {
    if (key) {
      this.encryptionKey = key
    } else {
      // Generate a session-based encryption key
      this.encryptionKey = this.generateSessionKey()
    }
  }

  // Store data with optional encryption and expiration
  public static setItem<T>(
    key: string,
    value: T,
    options: StorageOptions = {}
  ): boolean {
    try {
      const {
        encrypt = false,
        expiration,
        prefix = this.defaultPrefix,
      } = options

      const fullKey = `${prefix}${key}`
      const now = Date.now()

      const storedData: StoredData<T> = {
        value: encrypt ? (this.encrypt(JSON.stringify(value)) as T) : value,
        encrypted: encrypt,
        expires: expiration ? now + expiration : undefined,
        created: now,
      }

      localStorage.setItem(fullKey, JSON.stringify(storedData))
      return true
    } catch (error) {
      console.error('SecureStorage setItem failed:', error)
      return false
    }
  }

  // Retrieve data with automatic decryption and expiration check
  public static getItem<T>(
    key: string,
    options: StorageOptions = {}
  ): T | null {
    try {
      const { prefix = this.defaultPrefix } = options
      const fullKey = `${prefix}${key}`
      const item = localStorage.getItem(fullKey)

      if (!item) {
        return null
      }

      const storedData: StoredData<T> = JSON.parse(item)
      const now = Date.now()

      // Check expiration
      if (storedData.expires && now > storedData.expires) {
        this.removeItem(key, options)
        return null
      }

      // Decrypt if needed
      if (storedData.encrypted) {
        if (!this.encryptionKey) {
          console.warn('Encryption key not available for decryption')
          return null
        }
        const decryptedValue = this.decrypt(storedData.value as string)
        return decryptedValue ? JSON.parse(decryptedValue) : null
      }

      return storedData.value
    } catch (error) {
      console.error('SecureStorage getItem failed:', error)
      return null
    }
  }

  // Remove item from storage
  public static removeItem(key: string, options: StorageOptions = {}): boolean {
    try {
      const { prefix = this.defaultPrefix } = options
      const fullKey = `${prefix}${key}`
      localStorage.removeItem(fullKey)
      return true
    } catch (error) {
      console.error('SecureStorage removeItem failed:', error)
      return false
    }
  }

  // Clear all items with the specified prefix
  public static clear(prefix = this.defaultPrefix): boolean {
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key))
      return true
    } catch (error) {
      console.error('SecureStorage clear failed:', error)
      return false
    }
  }

  // Check if an item exists and is not expired
  public static hasItem(key: string, options: StorageOptions = {}): boolean {
    return this.getItem(key, options) !== null
  }

  // Get all keys with the specified prefix
  public static getKeys(prefix = this.defaultPrefix): string[] {
    const keys: string[] = []
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(prefix)) {
          keys.push(key.substring(prefix.length))
        }
      }
    } catch (error) {
      console.error('SecureStorage getKeys failed:', error)
    }
    return keys
  }

  // Clean up expired items
  public static cleanupExpired(prefix = this.defaultPrefix): number {
    let cleaned = 0
    try {
      const now = Date.now()
      const keysToCheck: string[] = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(prefix)) {
          keysToCheck.push(key)
        }
      }

      keysToCheck.forEach(fullKey => {
        try {
          const item = localStorage.getItem(fullKey)
          if (item) {
            const storedData: StoredData<unknown> = JSON.parse(item)
            if (storedData.expires && now > storedData.expires) {
              localStorage.removeItem(fullKey)
              cleaned++
            }
          }
        } catch {
          // Remove corrupted items
          localStorage.removeItem(fullKey)
          cleaned++
        }
      })
    } catch (error) {
      console.error('SecureStorage cleanupExpired failed:', error)
    }
    return cleaned
  }

  // Get storage usage information
  public static getStorageInfo(prefix = this.defaultPrefix): {
    itemCount: number
    totalSize: number
    expiredCount: number
  } {
    let itemCount = 0
    let totalSize = 0
    let expiredCount = 0
    const now = Date.now()

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(prefix)) {
          itemCount++
          const item = localStorage.getItem(key)
          if (item) {
            totalSize += item.length
            try {
              const storedData: StoredData<unknown> = JSON.parse(item)
              if (storedData.expires && now > storedData.expires) {
                expiredCount++
              }
            } catch {
              // Count corrupted items as expired
              expiredCount++
            }
          }
        }
      }
    } catch (error) {
      console.error('SecureStorage getStorageInfo failed:', error)
    }

    return { itemCount, totalSize, expiredCount }
  }

  // Simple XOR-based encryption (for demonstration - use proper encryption in production)
  private static encrypt(text: string): string {
    if (!this.encryptionKey) return text

    let encrypted = ''
    for (let i = 0; i < text.length; i++) {
      const keyChar = this.encryptionKey.charCodeAt(
        i % this.encryptionKey.length
      )
      const textChar = text.charCodeAt(i)
      encrypted += String.fromCharCode(textChar ^ keyChar)
    }
    return btoa(encrypted)
  }

  // Simple XOR-based decryption
  private static decrypt(encryptedText: string): string | null {
    if (!this.encryptionKey) return null

    try {
      const encrypted = atob(encryptedText)
      let decrypted = ''
      for (let i = 0; i < encrypted.length; i++) {
        const keyChar = this.encryptionKey.charCodeAt(
          i % this.encryptionKey.length
        )
        const encryptedChar = encrypted.charCodeAt(i)
        decrypted += String.fromCharCode(encryptedChar ^ keyChar)
      }
      return decrypted
    } catch {
      return null
    }
  }

  // Generate a session-based encryption key
  private static generateSessionKey(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join(
      ''
    )
  }
}

// Session storage wrapper with similar API
export class SecureSessionStorage {
  private static defaultPrefix = 'asvalue_session_'

  public static setItem<T>(
    key: string,
    value: T,
    options: Omit<StorageOptions, 'expiration'> = {}
  ): boolean {
    try {
      const { prefix = this.defaultPrefix } = options
      const fullKey = `${prefix}${key}`
      sessionStorage.setItem(fullKey, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('SecureSessionStorage setItem failed:', error)
      return false
    }
  }

  public static getItem<T>(
    key: string,
    options: Omit<StorageOptions, 'expiration'> = {}
  ): T | null {
    try {
      const { prefix = this.defaultPrefix } = options
      const fullKey = `${prefix}${key}`
      const item = sessionStorage.getItem(fullKey)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('SecureSessionStorage getItem failed:', error)
      return null
    }
  }

  public static removeItem(
    key: string,
    options: Omit<StorageOptions, 'expiration'> = {}
  ): boolean {
    try {
      const { prefix = this.defaultPrefix } = options
      const fullKey = `${prefix}${key}`
      sessionStorage.removeItem(fullKey)
      return true
    } catch (error) {
      console.error('SecureSessionStorage removeItem failed:', error)
      return false
    }
  }

  public static clear(prefix = this.defaultPrefix): boolean {
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach(key => sessionStorage.removeItem(key))
      return true
    } catch (error) {
      console.error('SecureSessionStorage clear failed:', error)
      return false
    }
  }
}

// Convenience exports
export const setSecureItem = <T>(
  key: string,
  value: T,
  options?: StorageOptions
) => SecureStorage.setItem(key, value, options)

export const getSecureItem = <T>(key: string, options?: StorageOptions) =>
  SecureStorage.getItem<T>(key, options)

export const removeSecureItem = (key: string, options?: StorageOptions) =>
  SecureStorage.removeItem(key, options)

export const clearSecureStorage = (prefix?: string) =>
  SecureStorage.clear(prefix)

export const hasSecureItem = (key: string, options?: StorageOptions) =>
  SecureStorage.hasItem(key, options)
