import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import productsReducer from './slices/productsSlice';
import categoriesReducer from './slices/categoriesSlice';
import wishlistReducer from './slices/wishlistSlice';
import cartReducer from './slices/cartSlice';
import adminReducer from './slices/adminSlice';
import vendorsReducer from './slices/vendorsSlice';
import ordersReducer from './slices/ordersSlice';
import inboxReducer from './slices/inboxSlice';
import addressesReducer from './slices/addressesSlice';
import vendorfollowsReducer from './slices/vendorFollowsSlice';
import notificationsReducer from './slices/notificationsSlice';

const authPersistConfig = {
  key: 'auth',
  storage,
  version: 1,
  whitelist: ['user', 'isAuthenticated', 'firebaseUser'],
  blacklist: ['loading', 'error', 'initialLoading', 'verification'],
};

const cartPersistConfig = {
  key: 'cart',
  storage,
  whitelist: ['items'], 
  blacklist: ['loading', 'error'], 
};

const wishlistPersistConfig = {
  key: 'wishlist',
  storage,
  whitelist: ['items'],
  blacklist: ['loading', 'error'],
};

// Create persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);
const persistedWishlistReducer = persistReducer(wishlistPersistConfig, wishlistReducer);

// Combine all reducers
const rootReducer = combineReducers({
  auth: persistedAuthReducer, 
  cart: persistedCartReducer, 
  wishlist: persistedWishlistReducer, 
  users: usersReducer,
  products: productsReducer,
  categories: categoriesReducer,
  admin: adminReducer,
  vendors: vendorsReducer,
  orders: ordersReducer,
  notifications: notificationsReducer,
  inbox: inboxReducer,
  addresses: addressesReducer,
  vendorFollows: vendorfollowsReducer,
});

// Create store with middleware configuration
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          'products/uploadMedia',
        ],
        
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        
        ignoredPaths: [
          'products.detectedChanges',
          'auth.firebaseUser',
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const purgePersist = async () => {
  await persistor.purge();
  console.log('✅ Persisted state purged');
};