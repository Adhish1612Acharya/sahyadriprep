import { ENV } from "@/config/env";
import { google } from "googleapis";

/**
 * Configure OAuth2 for personal Gmail accounts to use the 15GB user quota.
 * This replaces the Service Account method which has 0GB limit for personal accounts.
 */
const oauth2Client = new google.auth.OAuth2(
  ENV.GOOGLE_CLIENT_ID,
  ENV.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: ENV.GOOGLE_REFRESH_TOKEN,
});

export const drive = google.drive({ version: "v3", auth: oauth2Client });

export default drive;
