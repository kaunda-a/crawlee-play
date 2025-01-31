import axios from 'axios';
import { execSync } from 'child_process';

export class BrowserVersionManager {
  private versions: Record<string, string[]> = {
    chromium: [],
    firefox: [],
    webkit: []
  };

  async getExecutablePath(browserType: string): Promise<string> {
    const versions = await this.getAvailableVersions();
    const latestVersion = versions[browserType][0];
    return `path/to/browser/${browserType}/${latestVersion}/executable`;
  }

  async getCurrentVersion(browserType: string): Promise<string> {
    const versions = await this.getAvailableVersions();
    return versions[browserType][0];
  }

  async updateBrowsers() {
    const latestVersions = await this.getLatestBrowserVersions();
    await this.updatePlaywright(latestVersions);
    this.updateVersionLists(latestVersions);
  }

  async getAvailableVersions(): Promise<Record<string, string[]>> {
    if (this.versions.chromium.length === 0) {
      await this.updateBrowsers();
    }
    return this.versions;
  }

  private async getLatestBrowserVersions(): Promise<Record<string, string>> {
    const chromeVersion = await this.getLatestChromeVersion();
    const firefoxVersion = await this.getLatestFirefoxVersion();
    const webkitVersion = await this.getLatestWebKitVersion();

    return {
      chromium: chromeVersion,
      firefox: firefoxVersion,
      webkit: webkitVersion
    };
  }

  private async getLatestChromeVersion(): Promise<string> {
    const response = await axios.get('https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Windows&num=1');
    const data = response.data;
    return data[0].version;
  }

  private async getLatestFirefoxVersion(): Promise<string> {
    const response = await axios.get('https://product-details.mozilla.org/1.0/firefox_versions.json');
    return response.data.LATEST_FIREFOX_VERSION;
  }

  private async getLatestWebKitVersion(): Promise<string> {
    const response = await axios.get('https://webkit.org/status/');
    const match = response.data.match(/WebKit Nightly Build (\d+\.\d+)/);
    return match ? match[1] : 'latest';
  }

  private async updatePlaywright(versions: Record<string, string>) {
    execSync(`npx playwright install --with-deps chromium@${versions.chromium} firefox@${versions.firefox} webkit@${versions.webkit}`);
  }

  private updateVersionLists(latestVersions: Record<string, string>) {
    for (const [browser, version] of Object.entries(latestVersions)) {
      if (!this.versions[browser].includes(version)) {
        this.versions[browser].unshift(version);
        this.versions[browser] = this.versions[browser].slice(0, 5); // Keep only the 5 most recent versions
      }
    }
  }
}
