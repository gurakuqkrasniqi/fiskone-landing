// The web app's Firebase settings (Firebase console → Project settings → Your apps → Web).
// These values are public by design: access is controlled by firestore.rules, not by hiding them.
export const firebaseConfig = {
  apiKey: 'AIzaSyC1rLM35KzKvKxtqOvnnlpwPR7lpM0zMqE',
  authDomain: 'fiskone-landing.firebaseapp.com',
  projectId: 'fiskone-landing',
  appId: '1:600152837202:web:946b600cbefaf7fc5aa38b',
};

/** True once the settings above are filled in. */
export const firebaseReady = (): boolean => !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
