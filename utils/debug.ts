/**
 * Debug utilities for BuildPK
 * Helps identify and diagnose runtime issues
 */

export function logAppInfo() {
  console.group('🏗️ BuildPK Application Info');
  console.log('Environment:', import.meta.env.MODE);
  console.log('Base URL:', import.meta.env.BASE_URL);
  console.log('React Version:', import('react').then(r => console.log('React loaded successfully')).catch(() => 'Failed to load'));
  console.groupEnd();
}

export function checkModuleLoading() {
  const checks = {
    react: false,
    reactDom: false,
    lucideReact: false,
    sonner: false,
  };

  try {
    import('react').then(() => {
      checks.react = true;
      console.log('✅ React module loaded');
    });
  } catch (e) {
    console.error('❌ React module failed:', e);
  }

  try {
    import('react-dom').then(() => {
      checks.reactDom = true;
      console.log('✅ React DOM module loaded');
    });
  } catch (e) {
    console.error('❌ React DOM module failed:', e);
  }

  return checks;
}

// Auto-run on import in development
if (import.meta.env.DEV) {
  logAppInfo();
}

export default {
  logAppInfo,
  checkModuleLoading,
};
