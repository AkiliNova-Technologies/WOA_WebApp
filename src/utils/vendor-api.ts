import api from '@/utils/api';
import type { VendorProfile } from '@/redux/slices/vendorsSlice';

// Function to fetch vendor by user ID without Redux
export const fetchVendorByUserId = async (userId: string): Promise<VendorProfile | null> => {
  try {
    const response = await api.get(`/api/v1/vendor/${userId}`);
    return response.data;
  } catch (error) {
    console.warn(`Failed to fetch vendor for user ${userId}:`, error);
    return null;
  }
};

// Function to fetch vendor details for multiple users
export const fetchVendorsForUsers = async (userIds: string[]): Promise<Record<string, VendorProfile | null>> => {
  const results: Record<string, VendorProfile | null> = {};
  
  // Use Promise.all to fetch in parallel (or limited concurrency)
  const promises = userIds.map(async (userId) => {
    try {
      const vendor = await fetchVendorByUserId(userId);
      return { userId, vendor };
    } catch (error) {
      console.warn(`Failed to fetch vendor for user ${userId}:`, error);
      return { userId, vendor: null };
    }
  });
  
  const vendorResults = await Promise.all(promises);
  
  vendorResults.forEach(({ userId, vendor }) => {
    results[userId] = vendor;
  });
  
  return results;
};