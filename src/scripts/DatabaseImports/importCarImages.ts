import "dotenv/config";
import fs from "fs";
import path from "path";
import { adminBucket } from "@/Firebase/firebaseAdmin";
import { PUBLIC_DIR, logConfig } from "./Cars/seedConfig";

function* walk(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.isFile()) yield full;
  }
}

const forceFlag = process.argv.includes("--force");

(async function main(): Promise<void> {
  console.log("📷 Seeding car images to Firebase Storage");
  if (forceFlag) console.log("⚡ Force mode enabled — re-uploading all files");
  logConfig(adminBucket.name);

  const root = path.join(PUBLIC_DIR, "images", "cars");
  if (!fs.existsSync(root)) {
    console.error("❌ No images/cars directory under public/");
    process.exit(1);
  }

  // Build a set of all local .webp paths so we can check if a .jpg
  // has been superseded
  const localWebpPaths = new Set<string>();
  for (const filePath of walk(root)) {
    if (filePath.endsWith(".webp")) {
      const rel = path.relative(PUBLIC_DIR, filePath).replace(/\\/g, "/");
      localWebpPaths.add(rel);
    }
  }

  let uploaded = 0;
  let skipped = 0;
  let deleted = 0;
  let reuploadedSmaller = 0;

  // ── NEW: Remote cleanup pass ──────────────────────────────────────────
  // Scan Firebase Storage for .jpg files under images/cars/ that have a
  // corresponding .webp already in Firebase — delete the .jpg since it
  // has been superseded. This handles the case where .jpg was deleted
  // locally but still exists in Firebase Storage.
  console.log("🔍 Scanning Firebase Storage for superseded .jpg files...");
  const [remoteFiles] = await adminBucket.getFiles({ prefix: "images/cars/" });

  // Build a set of all remote .webp paths for quick lookup
  const remoteWebpPaths = new Set<string>();
  for (const file of remoteFiles) {
    if (file.name.endsWith(".webp")) {
      remoteWebpPaths.add(file.name);
    }
  }

  // Delete any remote .jpg that has a corresponding remote .webp
  for (const file of remoteFiles) {
    if (file.name.endsWith(".jpg") || file.name.endsWith(".jpeg")) {
      const webpName = file.name.replace(/\.jpe?g$/i, ".webp");
      if (remoteWebpPaths.has(webpName)) {
        await file.delete();
        console.log(`🗑️  Deleted superseded remote ${file.name}`);
        deleted++;
      }
    }
  }
  // ── END remote cleanup pass ───────────────────────────────────────────

  for (const filePath of walk(root)) {
    const rel = path.relative(PUBLIC_DIR, filePath).replace(/\\/g, "/");
    const dest = rel;

    // If this is a local .jpg with a local .webp counterpart, delete
    // the .jpg from Firebase if still there and skip uploading
    if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
      const webpRel = rel.replace(/\.jpe?g$/i, ".webp");
      if (localWebpPaths.has(webpRel)) {
        const oldRef = adminBucket.file(dest);
        const [exists] = await oldRef.exists();
        if (exists) {
          await oldRef.delete();
          console.log(`🗑️  Deleted superseded local ${dest}`);
          deleted++;
        }
        continue;
      }
    }

    const fileRef = adminBucket.file(dest);
    const [exists] = await fileRef.exists();

    if (exists && !forceFlag) {
      // Check if local file is smaller than what's in Firebase Storage
      // If so, re-upload to replace the bloated version
      const localSize = fs.statSync(filePath).size;
      const [metadata] = await fileRef.getMetadata();
      const remoteSize = Number(metadata.size ?? 0);

      if (localSize < remoteSize) {
        await fileRef.delete();
        await adminBucket.upload(filePath, { destination: dest });
        console.log(
          `♻️  Re-uploaded smaller ${dest} (${remoteSize} → ${localSize} bytes)`
        );
        reuploadedSmaller++;
      } else {
        skipped++;
      }
      continue;
    }

    // Force mode or file doesn't exist — upload it
    if (exists && forceFlag) {
      await fileRef.delete();
    }

    await adminBucket.upload(filePath, { destination: dest });
    console.log(`📤 Uploaded ${dest}`);
    uploaded++;
  }

  console.log(
    `✅ Done. Uploaded: ${uploaded}, re-uploaded smaller: ${reuploadedSmaller}, skipped: ${skipped}, deleted old .jpg: ${deleted}`
  );
  process.exit(0);
})().catch((err) => {
  console.error("❌ importCarImages failed:", err);
  process.exit(1);
});