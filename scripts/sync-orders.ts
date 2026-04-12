import { syncOrdersFromRetailCrm } from "@/lib/sync-orders";

async function main() {
  const result = await syncOrdersFromRetailCrm();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
