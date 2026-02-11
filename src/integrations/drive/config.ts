import { ENV } from "@/config";
import { google } from "googleapis";

const credentials = JSON.parse(ENV.GOOGLE_SERVICE_ACCOUNT_JSON);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

export const drive = google.drive({ version: "v3", auth });

export default drive;
