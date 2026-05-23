import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const memoryStore = new Map<string, string>();

async function isSecureStoreAvailable() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export const secureStoreAdapter = {
  getItem: async (key: string) => {
    if (await isSecureStoreAvailable()) {
      return SecureStore.getItemAsync(key);
    }
    return AsyncStorage.getItem(key) ?? memoryStore.get(key) ?? null;
  },
  setItem: async (key: string, value: string) => {
    memoryStore.set(key, value);
    if (await isSecureStoreAvailable()) {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY
      });
      return;
    }
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    memoryStore.delete(key);
    if (await isSecureStoreAvailable()) {
      await SecureStore.deleteItemAsync(key);
      return;
    }
    await AsyncStorage.removeItem(key);
  }
};
