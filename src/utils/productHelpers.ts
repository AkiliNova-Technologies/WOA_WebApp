// src/utils/productHelpers.ts

/**
 * Seller type from Redux slice (matches API response)
 */
export interface Seller {
  id: string;
  firstName: string;
  lastName: string;
  businessName?: string;
}

/**
 * Legacy Vendor type (kept for backward compatibility)
 */
export interface Vendor {
  id?: string;
  name: string;
  businessName?: string;
}

/**
 * Normalized vendor type expected by ProductCard
 */
export type NormalizedVendor = string | { 
  name: string; 
  businessName?: string;
};

/**
 * Normalizes seller/vendor data to match ProductCard's expected type
 * Handles the Seller type from Redux (firstName, lastName, businessName)
 * 
 * The Product type already has vendorName and sellerName shortcuts added by enrichProduct,
 * but this function provides flexible normalization for various use cases.
 * 
 * @param seller - Can be a string, Seller object, Vendor object, or undefined
 * @returns Normalized vendor data or undefined
 */
export const normalizeVendor = (
  seller: string | Seller | Vendor | undefined
): NormalizedVendor | undefined => {
  // Handle undefined/null
  if (!seller) return undefined;
  
  // If it's already a string, return as-is
  if (typeof seller === 'string') return seller;
  
  // If it's a Seller object (has firstName and lastName)
  if ('firstName' in seller && 'lastName' in seller) {
    const fullName = `${seller.firstName} ${seller.lastName}`.trim();
    return {
      name: fullName,
      businessName: seller.businessName
    };
  }
  
  // If it's a legacy Vendor object (has name)
  if ('name' in seller) {
    return {
      name: seller.name,
      businessName: seller.businessName
    };
  }
  
  return undefined;
};

/**
 * Gets vendor display name from various vendor/seller formats
 * Prioritizes businessName if available, otherwise uses full name
 * 
 * Note: The Product type from enrichProduct already has vendorName field,
 * so you can use product.vendorName directly in most cases.
 * 
 * @param seller - Can be a string, Seller object, Vendor object, or undefined
 * @returns Display name for the vendor/seller
 */
export const getVendorName = (
  seller: string | Seller | Vendor | undefined
): string => {
  if (!seller) return 'Unknown Vendor';
  
  if (typeof seller === 'string') return seller;
  
  // If it's a Seller object
  if ('firstName' in seller && 'lastName' in seller) {
    // Prefer businessName if available
    if (seller.businessName) return seller.businessName;
    return `${seller.firstName} ${seller.lastName}`.trim() || 'Unknown Vendor';
  }
  
  // If it's a legacy Vendor object
  if ('name' in seller) {
    return seller.businessName || seller.name || 'Unknown Vendor';
  }
  
  return 'Unknown Vendor';
};

/**
 * Gets the seller's full name (firstName + lastName)
 * 
 * Note: The Product type from enrichProduct already has sellerName field,
 * so you can use product.sellerName directly in most cases.
 * 
 * @param seller - Seller object or undefined
 * @returns Full name of the seller
 */
export const getSellerFullName = (seller: Seller | undefined): string => {
  if (!seller) return 'Unknown Seller';
  return `${seller.firstName} ${seller.lastName}`.trim() || 'Unknown Seller';
};

/**
 * Gets the seller's business name or full name as fallback
 * 
 * Note: The Product type from enrichProduct already has vendorName field,
 * which prioritizes businessName over full name.
 * 
 * @param seller - Seller object or undefined
 * @returns Business name or full name
 */
export const getSellerDisplayName = (seller: Seller | undefined): string => {
  if (!seller) return 'Unknown Seller';
  return seller.businessName || getSellerFullName(seller);
};


export const getProductImageUrl = (images: any[] | undefined): string => {
  if (!images || images.length === 0) return '';
  
  const firstImage = images[0];
  
  // If it's a string, return it directly
  if (typeof firstImage === 'string') {
    return firstImage;
  }
  
  // If it's an object with url property, return the url
  if (firstImage && typeof firstImage === 'object' && 'url' in firstImage) {
    return firstImage.url || '';
  }
  
  return '';
};