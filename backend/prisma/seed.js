import { PrismaClient, Role, AssetStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding AssetFlow database...");

    // Clean existing data
    await prisma.transferRequest.deleteMany();
    await prisma.allocation.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.assetCategory.deleteMany();
    await prisma.user.deleteMany();
    await prisma.department.deleteMany();

    // -----------------------
    // Departments
    // -----------------------
    const it = await prisma.department.create({
        data: {
            name: "IT"
        }
    });

    const hr = await prisma.department.create({
        data: {
            name: "Human Resources"
        }
    });

    const finance = await prisma.department.create({
        data: {
            name: "Finance"
        }
    });

    // -----------------------
    // Password
    // -----------------------
    const password = await bcrypt.hash("Password@123", 10);

    // -----------------------
    // Users
    // -----------------------
    const admin = await prisma.user.create({
        data: {
            name: "Admin User",
            email: "admin@assetflow.com",
            password,
            role: Role.ADMIN,
            departmentId: it.id
        }
    });

    const manager = await prisma.user.create({
        data: {
            name: "Priya Sharma",
            email: "manager@assetflow.com",
            password,
            role: Role.ASSET_MANAGER,
            departmentId: it.id
        }
    });

    const employee = await prisma.user.create({
        data: {
            name: "Raj Kumar",
            email: "employee@assetflow.com",
            password,
            role: Role.EMPLOYEE,
            departmentId: hr.id
        }
    });

    // -----------------------
    // Categories
    // -----------------------
    const laptop = await prisma.assetCategory.create({
        data: {
            name: "Laptop"
        }
    });

    const projector = await prisma.assetCategory.create({
        data: {
            name: "Projector"
        }
    });

    // -----------------------
    // Assets
    // -----------------------
    const dell = await prisma.asset.create({
        data: {
            assetTag: "AF-0001",
            name: "Dell Latitude 7440",
            categoryId: laptop.id,
            serialNumber: "DL123456",
            acquisitionCost: 85000,
            location: "IT Room",
            status: AssetStatus.AVAILABLE
        }
    });

    await prisma.asset.create({
        data: {
            assetTag: "AF-0002",
            name: "Epson Projector",
            categoryId: projector.id,
            serialNumber: "EP87654",
            acquisitionCost: 45000,
            location: "Conference Hall",
            isBookable: true,
            status: AssetStatus.AVAILABLE
        }
    });

    // -----------------------
    // Allocation
    // -----------------------
    await prisma.allocation.create({
        data: {
            assetId: dell.id,
            allocatedToUserId: employee.id,
            isActive: true
        }
    });

    await prisma.asset.update({
        where: {
            id: dell.id
        },
        data: {
            status: AssetStatus.ALLOCATED
        }
    });

    console.log("✅ Database seeded successfully!");
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });