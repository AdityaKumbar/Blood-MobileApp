# Smart Blood & Oxygen Bank Mobile App

Production-ready React Native mobile app scaffold using Expo + TypeScript.

## 1. Create Project (from scratch)

```bash
npx create-expo-app@latest smart-blood-oxygen-bank-mobile --template blank-typescript
cd smart-blood-oxygen-bank-mobile
```

## 2. Install Dependencies

```bash
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated expo-constants
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install @reduxjs/toolkit react-redux axios socket.io-client zod @react-native-async-storage/async-storage
npm install nativewind tailwindcss
npm install -D babel-preset-expo eslint eslint-config-expo prettier eslint-config-prettier prettier-plugin-tailwindcss
```

## 3. Run App

```bash
npm run start
```

## 4. Environment Variables

Create `.env` from `.env.example`:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:5000
```

## 5. Project Structure

```text
src/
├── api/                 # axios client + API modules
├── assets/              # images/icons/splash
├── components/          # reusable UI components
├── constants/           # app constants (roles, keys, endpoints, env)
├── hooks/               # custom hooks
├── navigation/          # root/auth/app navigators
├── redux/               # store + slices + typed hooks
├── screens/             # auth/app feature screens
├── services/            # cross-cutting services
├── socket/              # socket.io setup
├── theme/               # colors, spacing, radius, typography
├── types/               # shared TS types
├── utils/               # helpers/storage/error handling
└── validations/         # zod schemas
```

## 6. Quality Scripts

```bash
npm run typecheck
npm run lint
npm run lint:fix
npm run format
npm run format:check
```
