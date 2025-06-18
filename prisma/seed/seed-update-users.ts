import { prisma } from "../../src/lib/prisma";

async function main() {
  await prisma.user.updateMany({
    data: {
      isVerified: false,
      isAdmin: false,
    },
  });

  console.log("All users updated with default isVerified and isAdmin values");
}

main()
  .catch((e) => {
    console.error("Error updating users:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });