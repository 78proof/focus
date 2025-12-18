
import * as msal from "@azure/msal-browser";

const msalConfig = {
  auth: {
    // This is a placeholder. For a personal/work project, you'd register at portal.azure.com
    clientId: "00000000-0000-0000-0000-000000000000", 
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  }
};

const loginRequest = {
  scopes: ["User.Read", "Mail.Read", "Calendars.Read"]
};

export class OutlookService {
  private static msalInstance = new msal.PublicClientApplication(msalConfig);
  private static initialized = false;

  private static async ensureInitialized() {
    if (!this.initialized) {
      await this.msalInstance.initialize();
      this.initialized = true;
    }
  }

  static async login() {
    await this.ensureInitialized();
    try {
      const loginResponse = await this.msalInstance.loginPopup(loginRequest);
      return loginResponse.account;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  static async logout() {
    await this.ensureInitialized();
    await this.msalInstance.logoutPopup();
  }

  static async getAccessToken() {
    await this.ensureInitialized();
    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length === 0) return null;

    try {
      const response = await this.msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0]
      });
      return response.accessToken;
    } catch (error) {
      return (await this.msalInstance.acquireTokenPopup(loginRequest)).accessToken;
    }
  }

  static async fetchEmails() {
    const token = await this.getAccessToken();
    if (!token) return [];

    const response = await fetch("https://graph.microsoft.com/v1.0/me/messages?$top=10&$select=id,subject,from,bodyPreview,receivedDateTime,importance", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    
    return (data.value || []).map((m: any) => ({
      id: m.id,
      from: m.from.emailAddress.name || m.from.emailAddress.address,
      subject: m.subject,
      snippet: m.bodyPreview,
      receivedDateTime: m.receivedDateTime,
      isImportant: m.importance === "high"
    }));
  }

  static async fetchEvents() {
    const token = await this.getAccessToken();
    if (!token) return [];

    const now = new Date().toISOString();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${now}&endDateTime=${endOfDay.toISOString()}&$select=id,subject,start,end,location`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();

    return (data.value || []).map((e: any) => ({
      id: e.id,
      subject: e.subject,
      start: e.start.dateTime,
      end: e.end.dateTime,
      location: e.location.displayName
    }));
  }
}
