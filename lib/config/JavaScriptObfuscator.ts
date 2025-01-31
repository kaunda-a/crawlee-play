import { minify } from 'terser'; // Use Terser for minification

export class JavaScriptObfuscator {
  async obfuscate(code: string): Promise<string> {
    const minified = await minify(code);
    if (!minified.code) {
      throw new Error('Minification failed');
    }
    return minified.code; // Return the minified code
  }
}