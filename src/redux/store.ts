import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import productsReducer from './slices/productsSlice';
import categoriesReducer from './slices/categoriesSlice';
import wishlistReducer from './slices/wishlistSlice';
import cartReducer from './slices/cartSlice';
import adminReducer from './slices/adminSlice';
import vendorsReducer from './slices/vendorsSlice';
import ordersReducer from  './slices/ordersSlice';
import inboxReducer from  './slices/inboxSlice';
import addressesReducer from  './slices/addressesSlice';
import vendorfollowsReducer from  './slices/vendorFollowsSlice';
import notificationsReducer from './slices/notificationsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    products: productsReducer,
    categories: categoriesReducer,
    wishlist: wishlistReducer,
    cart: cartReducer,
    admin: adminReducer,
    vendors: vendorsReducer,
    orders: ordersReducer,
    notifications: notificationsReducer,
    inbox: inboxReducer,
    addresses: addressesReducer,
    vendorFollows: vendorfollowsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['products/uploadMedia'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['products.detectedChanges'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;