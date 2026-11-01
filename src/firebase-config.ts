// The web app's Firebase settings (Firebase console → Project settings → Your apps → Web).
// These values are public by design: access is controlled by firestore.rules, not by hiding them.
export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  appId: '',
};

/** True once the settings above are filled in. */
export const firebaseReady = (): boolean => !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
