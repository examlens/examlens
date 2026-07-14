// setCors.ts
import { Storage } from "@google-cloud/storage";

async function run() {
  const storage = new Storage({
    projectId: process.env.FIREBASE_PROJECT_ID,
    credentials: {
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
  });

  const bucketName = process.env.FIREBASE_STORAGE_BUCKET as string;

  await storage.bucket(bucketName).setCorsConfiguration([
    {
      origin: [
        "https://examlens8.vercel.app",
        "http://localhost:3000",
        "*",
      ],
      method: ["PUT", "GET", "HEAD", "OPTIONS"],
      responseHeader: ["Content-Type", "x-goog-resumable"],
      maxAgeSeconds: 3600,
    },
  ]);

  console.log(`CORS updated for bucket: ${bucketName}`);
}

run().catch((err) => {
  console.error("Failed to set CORS:", err);
  process.exit(1);
});