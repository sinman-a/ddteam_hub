import * as azdev from "azure-devops-node-api";
import { db } from "@/lib/db";
import { azureSettings } from "@/lib/schema";
import { decrypt } from "@/lib/crypto";

export async function getAzureClient() {
  const settings = await db.select().from(azureSettings).limit(1);
  if (!settings[0]) throw new Error("Azure DevOps not configured");

  const pat = decrypt(settings[0].patEncrypted);
  const orgUrl = `https://dev.azure.com/${settings[0].org}`;
  const authHandler = azdev.getPersonalAccessTokenHandler(pat);
  const client = new azdev.WebApi(orgUrl, authHandler);

  return { client, settings: settings[0] };
}
