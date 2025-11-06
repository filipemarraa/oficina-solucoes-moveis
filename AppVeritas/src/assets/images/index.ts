// Centralized image exports. Place your real image files in the same folder with the names documented in README.md
//
// IMPORTANT: static `require(...)` calls fail at bundle time when the target file doesn't exist.
// To make the app resilient while you add the real image files, we export `null` placeholders
// for the onboarding images. Once you add the files, update the lines below to use
// `require('./onboarding-1.jpg')` etc or re-run `npx react-native start --reset-cache`.

// If the image files exist in this folder, require them so Metro bundles them.
// These require(...) calls are static so they must match the actual filenames.
const images = {
  logo: require('./logo.png'),
  onboarding1: require('./onboarding-1.jpg'),
  onboarding2: require('./onboarding-2.jpg'),
  onboarding3: require('./onboarding-3.jpg'),
};

export default images;
