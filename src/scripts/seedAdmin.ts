import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/auth";

async function seedAdmin() {
  try {
    const adminEmail = "admin@admin.com";

    // check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      // throw new Error("Admin user already exists!");
      console.log("Admin user already exists!");
      return;
    }

    // create user through better auth api
    const admin = await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: "admin123",
        name: "Admin",
      },
    });

    // set both role to ADMIN and emailVerified to true
    if (admin?.user) {
      await prisma.user.update({
        where: { id: admin.user.id },
        data: {
          role: UserRole.ADMIN,
          emailVerified: true,
        },
      });
      console.log("✅ Admin user created, verified, and role assigned!");
    }
  } catch (error) {
    console.error("❌ Failed to seed admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
