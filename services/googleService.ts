export class GoogleService {
  private static ACCESS_TOKEN: string | null = null;

  static getClientId() {
    return localStorage.getItem('GOOGLE_CLIENT_ID');
  }

  static async login() {
    const clientId = this.getClientId();
    if (!clientId) throw new Error("GOOGLE_CLIENT_ID_MISSING");

    return new Promise((resolve, reject) => {
      // Ensure Google Identity Services is loaded
      if (!(window as any).google) {
        reject(new Error("GOOGLE_SDK_NOT_LOADED"));
        return;
      }

      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.events.readonly',
        // Critical: Google checks the origin of the current page.
        // If redirect_uri_mismatch persists, the user MUST add the current URL to Google Cloud Console.
        callback: (response: any) => {
          if (response.error) {
            console.error("Google Auth Response Error:", response);
            reject(response);
          }
          this.ACCESS_TOKEN = response.access_token;
          resolve(response.access_token);
        },
      });
      client.requestAccessToken();
    });
  }

  static async fetchEmails() {
    if (!this.ACCESS_TOKEN) return [];
    try {
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=is:unread', {
        headers: { Authorization: `Bearer ${this.ACCESS_TOKEN}` }
      });
      if (!res.ok) throw new Error("GMAIL_API_ERROR");
      const { messages = [] } = await res.json();
      
      const emailDetails = await Promise.all(messages.map(async (msg: any) => {
        const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
          headers: { Authorization: `Bearer ${this.ACCESS_TOKEN}` }
        });
        const data = await detailRes.json();
        const headers = data.payload.headers;
        return {
          id: data.id,
          from: headers.find((h: any) => h.name === 'From')?.value || 'Unknown',
          subject: headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject',
          snippet: data.snippet,
          date: headers.find((h: any) => h.name === 'Date')?.value || '',
          isImportant: data.labelIds?.includes('IMPORTANT') || false
        };
      }));
      return emailDetails;
    } catch (e) {
      console.error("Gmail fetch error", e);
      return [];
    }
  }

  static async fetchEvents() {
    if (!this.ACCESS_TOKEN) return [];
    try {
      const now = new Date().toISOString();
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&maxResults=10&singleEvents=true&orderBy=startTime`, {
        headers: { Authorization: `Bearer ${this.ACCESS_TOKEN}` }
      });
      if (!res.ok) throw new Error("CALENDAR_API_ERROR");
      const data = await res.json();
      return (data.items || []).map((item: any) => ({
        id: item.id,
        summary: item.summary,
        start: item.start.dateTime || item.start.date,
        end: item.end.dateTime || item.end.date,
        location: item.location || 'Virtual Location'
      }));
    } catch (e) {
      console.error("Calendar fetch error", e);
      return [];
    }
  }
}