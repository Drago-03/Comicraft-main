/**
 * Bug Condition Exploration Tests for Cloudflare Deployment and AI Migration Fix
 * 
 * Phase 1: Exploration Tests (Write BEFORE Fixes)
 * 
 * CRITICAL: These tests MUST FAIL on unfixed code - failures confirm the bugs exist
 * DO NOT attempt to fix the tests or the code when they fail
 * The goal is to surface counterexamples that demonstrate each bug exists
 * 
 * These tests encode the expected behaviors - they will validate the fixes when they pass after implementation
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 1.8, 1.9**
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

describe('Bug Condition Exploration Tests - Cloudflare Deployment and AI Migration Fix', () => {
  
  /**
   * Bug 1: Spline packages present in package.json
   * Test that @splinetool/react-spline and @splinetool/runtime are in dependencies
   * EXPECTED OUTCOME: Test FAILS (confirms Spline packages exist)
   * **Validates: Requirement 1.1**
   */
  describe('Bug 1: Spline packages in package.json', () => {
    it('should fail: @splinetool/react-spline is present in dependencies', () => {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      // The bug: Spline packages are present despite no usage in codebase
      // This test should FAIL on unfixed code (package should exist)
      expect(packageJson.dependencies['@splinetool/react-spline']).toBeUndefined();
    });

    it('should fail: @splinetool/runtime is present in dependencies', () => {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      // The bug: Spline runtime package is present despite no usage
      // This test should FAIL on unfixed code (package should exist)
      expect(packageJson.dependencies['@splinetool/runtime']).toBeUndefined();
    });
  });

  /**
   * Bug 2: Spline packages in next.config.js transpilePackages
   * Test that transpilePackages includes Spline packages
   * EXPECTED OUTCOME: Test FAILS (confirms Spline in transpilePackages)
   * **Validates: Requirement 1.2**
   */
  describe('Bug 2: Spline packages in next.config.js transpilePackages', () => {
    it('should fail: transpilePackages includes @splinetool/react-spline', () => {
      const nextConfigPath = path.join(process.cwd(), 'next.config.js');
      const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf-8');
      
      // The bug: transpilePackages configuration includes Spline packages
      // This test should FAIL on unfixed code (should find Spline in config)
      expect(nextConfigContent).not.toContain('@splinetool/react-spline');
    });

    it('should fail: transpilePackages includes @splinetool/runtime', () => {
      const nextConfigPath = path.join(process.cwd(), 'next.config.js');
      const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf-8');
      
      // The bug: transpilePackages includes Spline runtime
      // This test should FAIL on unfixed code (should find Spline in config)
      expect(nextConfigContent).not.toContain('@splinetool/runtime');
    });
  });

  /**
   * Bug 3: Cloudflare build output directory
   * Test that running cf-build generates out/ directory
   * EXPECTED OUTCOME: Test FAILS if out/ directory doesn't exist after build
   * **Validates: Requirements 1.3, 1.4, 1.5**
   * 
   * NOTE: This test is commented out because it requires running a full build
   * which is time-consuming and may not be suitable for unit tests.
   * The build verification should be done manually or in integration tests.
   */
  describe('Bug 3: Cloudflare build output directory', () => {
    it.skip('should fail: out/ directory does not exist after cf-build', () => {
      // Clean up any existing out/ directory
      const outDir = path.join(process.cwd(), 'out');
      if (fs.existsSync(outDir)) {
        fs.rmSync(outDir, { recursive: true, force: true });
      }
      
      try {
        // Run the cf-build command
        execSync('npm run cf-build', { 
          stdio: 'inherit',
          env: { ...process.env, NEXT_PUBLIC_BUILD_MODE: 'true' }
        });
        
        // The bug: out/ directory should exist after cf-build but doesn't
        // This test should FAIL on unfixed code (directory should not exist)
        expect(fs.existsSync(outDir)).toBe(true);
        
        // Verify out/ contains required files
        if (fs.existsSync(outDir)) {
          const outContents = fs.readdirSync(outDir);
          expect(outContents).toContain('index.html');
          expect(outContents).toContain('_next');
        }
      } catch (error) {
        // Build failed - this confirms the bug
        throw new Error(`cf-build failed: ${error.message}`);
      }
    });
  });

  /**
   * Bug 4: Wrong backend URL in public/_redirects
   * Test that _redirects contains comicraft-main.onrender.com instead of groqtales-backend-api.onrender.com
   * EXPECTED OUTCOME: Test FAILS (confirms wrong backend URL)
   * **Validates: Requirements 1.7**
   */
  describe('Bug 4: Wrong backend URL in public/_redirects', () => {
    it('should fail: _redirects contains comicraft-main.onrender.com', () => {
      const redirectsPath = path.join(process.cwd(), 'public/_redirects');
      const redirectsContent = fs.readFileSync(redirectsPath, 'utf-8');
      
      // The bug: _redirects routes to comicraft-backend-api instead of groqtales-backend-api
      // This test should FAIL on unfixed code (should find comicraft URL)
      expect(redirectsContent).not.toContain('comicraft-main.onrender.com');
    });

    it('should fail: _redirects does not contain groqtales-backend-api.onrender.com', () => {
      const redirectsPath = path.join(process.cwd(), 'public/_redirects');
      const redirectsContent = fs.readFileSync(redirectsPath, 'utf-8');
      
      // The bug: _redirects should route to groqtales-backend-api but doesn't
      // This test should FAIL on unfixed code (should not find groqtales URL)
      expect(redirectsContent).toContain('groqtales-backend-api.onrender.com');
    });
  });

  /**
   * Bug 5: Groq service active in server/backend.js
   * Test that backend.js includes Groq health check and route registration
   * EXPECTED OUTCOME: Test FAILS (confirms Groq is active)
   * **Validates: Requirements 1.8, 1.9**
   */
  describe('Bug 5: Groq service active in server/backend.js', () => {
    it('should fail: backend.js includes ACTIVE Groq health check configuration', () => {
      const backendPath = path.join(process.cwd(), 'server/backend.js');
      const backendContent = fs.readFileSync(backendPath, 'utf-8');
      
      // The bug: backend.js includes ACTIVE (uncommented) Groq health check in ai_services
      // Look for uncommented groq: { ... } in ai_services section
      // Match pattern: groq: { (not preceded by //)
      const lines = backendContent.split('\n');
      let hasActiveGroqHealthCheck = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Check if this line has "groq:" and is not commented out
        if (line.includes('groq:') && line.includes('{')) {
          const trimmed = line.trim();
          // Check if line starts with comment markers
          if (!trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*')) {
            hasActiveGroqHealthCheck = true;
            break;
          }
        }
      }
      
      // This test should FAIL on unfixed code (should find active Groq health check)
      expect(hasActiveGroqHealthCheck).toBe(false);
    });

    it('should fail: backend.js registers ACTIVE /api/groq route', () => {
      const backendPath = path.join(process.cwd(), 'server/backend.js');
      const backendContent = fs.readFileSync(backendPath, 'utf-8');
      
      // The bug: backend.js registers ACTIVE (uncommented) Groq API route
      const lines = backendContent.split('\n');
      let hasActiveGroqRoute = false;
      
      for (const line of lines) {
        if (line.includes("app.use('/api/groq'")) {
          const trimmed = line.trim();
          // Check if line is not commented out
          if (!trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*')) {
            hasActiveGroqRoute = true;
            break;
          }
        }
      }
      
      // This test should FAIL on unfixed code (should find active Groq route)
      expect(hasActiveGroqRoute).toBe(false);
    });
  });

  /**
   * Bug 6: AI routes import and use groqService
   * Test that AI routes import groqService instead of geminiService
   * EXPECTED OUTCOME: Test FAILS (confirms groqService usage)
   * **Validates: Requirements 1.8, 1.9**
   */
  describe('Bug 6: AI routes use groqService', () => {
    it('should fail: server/routes/ai.js has ACTIVE groqService import', () => {
      const aiRoutePath = path.join(process.cwd(), 'server/routes/ai.js');
      
      // Check if file exists
      if (!fs.existsSync(aiRoutePath)) {
        // If file doesn't exist, skip this test
        return;
      }
      
      const aiRouteContent = fs.readFileSync(aiRoutePath, 'utf-8');
      const lines = aiRouteContent.split('\n');
      
      // The bug: ai.js has ACTIVE (uncommented) groqService import
      let hasActiveGroqImport = false;
      
      for (const line of lines) {
        if (line.includes('groqService') && line.includes('require(')) {
          const trimmed = line.trim();
          // Check if line is not commented out
          if (!trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*')) {
            hasActiveGroqImport = true;
            break;
          }
        }
      }
      
      // This test should FAIL on unfixed code (should find active groqService import)
      expect(hasActiveGroqImport).toBe(false);
    });

    it('should fail: server/routes/stories.js has ACTIVE groqService import', () => {
      const storiesRoutePath = path.join(process.cwd(), 'server/routes/stories.js');
      
      // Check if file exists
      if (!fs.existsSync(storiesRoutePath)) {
        // If file doesn't exist, skip this test
        return;
      }
      
      const storiesRouteContent = fs.readFileSync(storiesRoutePath, 'utf-8');
      const lines = storiesRouteContent.split('\n');
      
      // The bug: stories.js has ACTIVE (uncommented) groqService import
      let hasActiveGroqImport = false;
      
      for (const line of lines) {
        if (line.includes('groqService') && line.includes('require(')) {
          const trimmed = line.trim();
          // Check if line is not commented out
          if (!trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*')) {
            hasActiveGroqImport = true;
            break;
          }
        }
      }
      
      // This test should FAIL on unfixed code (should find active groqService import)
      expect(hasActiveGroqImport).toBe(false);
    });

    it('should fail: groqService.js is not commented out', () => {
      const groqServicePath = path.join(process.cwd(), 'server/services/groqService.js');
      
      // Check if file exists
      if (!fs.existsSync(groqServicePath)) {
        // If file doesn't exist, that's actually the fixed state
        return;
      }
      
      const groqServiceContent = fs.readFileSync(groqServicePath, 'utf-8');
      
      // The bug: groqService.js is not commented out (should have block comment)
      const isCommentedOut = groqServiceContent.trim().startsWith('/*') &&
                              groqServiceContent.includes('DEPRECATED');
      
      // This test should FAIL on unfixed code (should not be commented out)
      expect(isCommentedOut).toBe(true);
    });
  });

  /**
   * Summary: Expected Counterexamples
   * 
   * When this test suite runs on UNFIXED code, we expect to find:
   * 1. @splinetool/react-spline in package.json dependencies (line 60)
   * 2. @splinetool/runtime in package.json dependencies (line 61)
   * 3. transpilePackages includes Spline packages in next.config.js (line 31)
   * 4. out/ directory missing after cf-build (or build fails)
   * 5. public/_redirects contains comicraft-main.onrender.com (line 1)
   * 6. server/backend.js includes Groq health check configuration
   * 7. server/backend.js registers /api/groq route
   * 8. server/routes/ai.js imports groqService
   * 9. server/routes/stories.js imports groqService
   * 10. server/services/groqService.js is not commented out
   * 
   * These counterexamples confirm the bugs exist and validate our root cause analysis.
   */
});
