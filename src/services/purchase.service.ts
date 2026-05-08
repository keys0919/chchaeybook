import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';
import { supabase } from './supabase';

const RC_IOS_KEY = process.env.EXPO_PUBLIC_RC_IOS_KEY ?? '';
const RC_ANDROID_KEY = process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? '';

export async function initPurchases(userId: string): Promise<void> {
  try {
    const apiKey = Platform.OS === 'ios' ? RC_IOS_KEY : RC_ANDROID_KEY;
    if (!apiKey) return;
    Purchases.configure({ apiKey, appUserID: userId });
  } catch {}
}

export async function isPremium(): Promise<boolean> {
  try {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active['premium'] !== undefined;
  } catch {
    return false;
  }
}

export async function getMonthlyPrice(): Promise<string | null> {
  try {
    const offerings = await Purchases.getOfferings();
    const pkg =
      offerings.current?.monthly ??
      offerings.current?.availablePackages[0] ??
      null;
    return pkg?.product.priceString ?? null;
  } catch {
    return null;
  }
}

export async function purchasePremium(): Promise<boolean> {
  try {
    const offerings = await Purchases.getOfferings();
    const pkg =
      offerings.current?.monthly ??
      offerings.current?.availablePackages[0] ??
      null;
    if (!pkg) return false;
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch {
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const info = await Purchases.restorePurchases();
    return info.entitlements.active['premium'] !== undefined;
  } catch {
    return false;
  }
}

export async function syncSubscriptionToSupabase(
  userId: string,
  paid: boolean
): Promise<void> {
  try {
    await supabase
      .from('parent_profiles')
      .update({ subscription_status: paid ? 'paid' : 'free' })
      .eq('parent_id', userId);
  } catch {}
}
