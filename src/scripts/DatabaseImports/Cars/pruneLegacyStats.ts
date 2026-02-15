import "dotenv/config";
import { adminDb } from "@/Firebase/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

function getArg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : undefined;
}

function parseKeys(keysArg?: string): string[] {
  if (!keysArg) return [];
  return keysArg
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// legacy flat keys to delete (your full list)
const LEGACY_STATS_KEYS = [
  "stockRank",
  "stockTopSpeed",
  "stockAcceleration",
  "stockHandling",
  "stockNitro",

  "oneStarMaxRank",
  "oneStarMaxTopSpeed",
  "oneStarMaxAcceleration",
  "oneStarMaxHandling",
  "oneStarMaxNitro",

  "twoStarMaxRank",
  "twoStarMaxTopSpeed",
  "twoStarMaxAcceleration",
  "twoStarMaxHandling",
  "twoStarMaxNitro",

  "threeStarMaxRank",
  "threeStarMaxTopSpeed",
  "threeStarMaxAcceleration",
  "threeStarMaxHandling",
  "threeStarMaxNitro",

  "fourStarMaxRank",
  "fourStarMaxTopSpeed",
  "fourStarMaxAcceleration",
  "fourStarMaxHandling",
  "fourStarMaxNitro",

  "fiveStarMaxRank",
  "fiveStarMaxTopSpeed",
  "fiveStarMaxAcceleration",
  "fiveStarMaxHandling",
  "fiveStarMaxNitro",

  "sixStarMaxRank",
  "sixStarMaxTopSpeed",
  "sixStarMaxAcceleration",
  "sixStarMaxHandling",
  "sixStarMaxNitro",

  "goldMaxRank",
  "goldTopSpeed",
  "goldAcceleration",
  "goldHandling",
  "goldNitro",
] as const;

(async function main(): Promise<void> {
  const quiet = process.env.SEED_QUIET === "1";

  const keysArg = getArg("keys") || process.env.SEED_KEYS;
  const keys = parseKeys(keysArg);

  if (!keys.length) {
    console.error("❌ Provide keys via --keys=car_key1,car_key2 (or env SEED_KEYS)");
    process.exit(1);
  }

  const batch = adminDb.batch();
  let count = 0;

  for (const k of keys) {
    const ref = adminDb.collection("cars").doc(k);
    const snap = await ref.get();

    if (!snap.exists) {
      if (!quiet) console.log(`⚠️ Not found: ${k}`);
      continue;
    }

    const data = snap.data() || {};
    const hasV2 = typeof (data as any).maxStar === "object" || typeof (data as any).stages === "object";

    if (!hasV2) {
      if (!quiet) console.log(`⏭️ Skipping ${k} (no V2 fields found like maxStar/stages)`);
      continue;
    }

    const updates: Record<string, FirebaseFirestore.FieldValue> = {};
    for (const field of LEGACY_STATS_KEYS) {
      if ((data as any)[field] !== undefined) {
        updates[field] = FieldValue.delete();
      }
    }

    if (Object.keys(updates).length === 0) {
      if (!quiet) console.log(`✅ ${k}: no legacy fields to delete`);
      continue;
    }

    batch.update(ref, updates);
    count++;
    if (!quiet) console.log(`🧹 ${k}: deleting ${Object.keys(updates).length} legacy stat field(s)`);
  }

  if (count > 0) {
    await batch.commit();
    console.log(`✅ Done. Updated ${count} doc(s).`);
  } else {
    console.log("✅ Nothing to update.");
  }

  process.exit(0);
})().catch((err) => {
  console.error("❌ Prune failed:", err);
  process.exit(1);
});