// hooks/useRedux.ts
import { useReduxAuth } from './useReduxAuth';
import { useReduxUsers } from './useReduxUsers';
import { useReduxProducts } from './useReduxProducts';
import { useReduxCategories } from './useReduxCategories';
import { useReduxWishlist } from './useReduxWishlists';
import { useReduxCart } from './useReduxCart';
import { useReduxAdmin } from './useReduxAdmin';

export function useRedux() {
  const auth = useReduxAuth();
  const users = useReduxUsers();
  const products = useReduxProducts();
  const categories = useReduxCategories();
  const wishlist = useReduxWishlist();
  const cart = useReduxCart();
  const admin = useReduxAdmin();

  return {
    auth,
    users,
    products,
    categories,
    wishlist,
    cart,
    admin,
  };
}

// Also export individual hooks for selective imports
export {
  useReduxAuth,
  useReduxUsers,
  useReduxProducts,
  useReduxCategories,
  useReduxWishlist,
  useReduxCart,
  useReduxAdmin,
};