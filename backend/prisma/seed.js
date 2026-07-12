const { PrismaClient, Role, AssetStatus, BookingStatus, MaintenanceStatus } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AssetFlow enterprise database...');

  // Clean all tables in dependency order
  await prisma.auditItem.deleteMany();
  await prisma.auditCycle.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  await prisma.transferRequest.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.assetCategory.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  const password = await bcrypt.hash('Password@123', 12);

  // ─── Departments ──────────────────────────────────────────────────────────
  const [it, hr, finance, ops, sales, legal, rd] = await Promise.all([
    prisma.department.create({ data: { name: 'Information Technology' } }),
    prisma.department.create({ data: { name: 'Human Resources' } }),
    prisma.department.create({ data: { name: 'Finance & Accounts' } }),
    prisma.department.create({ data: { name: 'Operations' } }),
    prisma.department.create({ data: { name: 'Sales & Marketing' } }),
    prisma.department.create({ data: { name: 'Legal & Compliance' } }),
    prisma.department.create({ data: { name: 'Research & Development' } }),
  ]);

  // ─── Vendors ──────────────────────────────────────────────────────────────
  const [dell, hp, apple, epson, cisco, herman, toyota] = await Promise.all([
    prisma.vendor.create({ data: { name: 'Dell Technologies', contactPerson: 'Ravi Menon', email: 'ravi@dell.com', phone: '+91-9876543210', supportEmail: 'support@dell.com', website: 'https://dell.com' } }),
    prisma.vendor.create({ data: { name: 'HP India', contactPerson: 'Sunita Rao', email: 'sunita@hp.com', phone: '+91-9876543211', supportEmail: 'support@hp.com', website: 'https://hp.com' } }),
    prisma.vendor.create({ data: { name: 'Apple India', contactPerson: 'Arjun Nair', email: 'arjun@apple.com', phone: '+91-9876543212', supportEmail: 'support@apple.com', website: 'https://apple.com' } }),
    prisma.vendor.create({ data: { name: 'Epson India', contactPerson: 'Priya Iyer', email: 'priya@epson.com', phone: '+91-9876543213', supportEmail: 'support@epson.com' } }),
    prisma.vendor.create({ data: { name: 'Cisco Systems', contactPerson: 'Kiran Sharma', email: 'kiran@cisco.com', phone: '+91-9876543214', supportEmail: 'support@cisco.com' } }),
    prisma.vendor.create({ data: { name: 'Herman Miller', contactPerson: 'Deepa Pillai', email: 'deepa@hm.com', phone: '+91-9876543215' } }),
    prisma.vendor.create({ data: { name: 'Toyota Fleet', contactPerson: 'Suresh Kumar', email: 'suresh@toyota.com', phone: '+91-9876543216' } }),
  ]);

  // ─── Users ────────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({ data: { name: 'Admin User', email: 'admin@assetflow.com', password, role: Role.ADMIN, departmentId: it.id } });
  const manager = await prisma.user.create({ data: { name: 'Priya Sharma', email: 'manager@assetflow.com', password, role: Role.ASSET_MANAGER, departmentId: it.id } });
  const itHead = await prisma.user.create({ data: { name: 'Vikram Nair', email: 'vikram@assetflow.com', password, role: Role.DEPARTMENT_HEAD, departmentId: it.id } });
  const hrHead = await prisma.user.create({ data: { name: 'Ananya Krishnan', email: 'ananya@assetflow.com', password, role: Role.DEPARTMENT_HEAD, departmentId: hr.id } });
  const emp1 = await prisma.user.create({ data: { name: 'Raj Kumar', email: 'raj@assetflow.com', password, role: Role.EMPLOYEE, departmentId: hr.id } });
  const emp2 = await prisma.user.create({ data: { name: 'Sana Iyer', email: 'sana@assetflow.com', password, role: Role.EMPLOYEE, departmentId: finance.id } });
  const emp3 = await prisma.user.create({ data: { name: 'Arjun Mehta', email: 'arjun@assetflow.com', password, role: Role.EMPLOYEE, departmentId: sales.id } });
  const emp4 = await prisma.user.create({ data: { name: 'Kavya Reddy', email: 'kavya@assetflow.com', password, role: Role.EMPLOYEE, departmentId: rd.id } });
  const emp5 = await prisma.user.create({ data: { name: 'Rohan Desai', email: 'rohan@assetflow.com', password, role: Role.EMPLOYEE, departmentId: ops.id } });

  // Update department heads
  await Promise.all([
    prisma.department.update({ where: { id: it.id }, data: { headId: itHead.id } }),
    prisma.department.update({ where: { id: hr.id }, data: { headId: hrHead.id } }),
  ]);

  // ─── Categories ───────────────────────────────────────────────────────────
  const [laptopCat, desktopCat, projectorCat, vehicleCat, furnitureCat, networkCat, phoneCat, serverCat] = await Promise.all([
    prisma.assetCategory.create({ data: { name: 'Laptop', description: 'Portable computing devices' } }),
    prisma.assetCategory.create({ data: { name: 'Desktop', description: 'Workstation computers' } }),
    prisma.assetCategory.create({ data: { name: 'Projector', description: 'Presentation equipment' } }),
    prisma.assetCategory.create({ data: { name: 'Vehicle', description: 'Company fleet vehicles' } }),
    prisma.assetCategory.create({ data: { name: 'Furniture', description: 'Office furniture and fixtures' } }),
    prisma.assetCategory.create({ data: { name: 'Network Equipment', description: 'Switches, routers, access points' } }),
    prisma.assetCategory.create({ data: { name: 'Mobile Phone', description: 'Company mobile devices' } }),
    prisma.assetCategory.create({ data: { name: 'Server', description: 'On-premise server hardware' } }),
  ]);

  const now = new Date();
  const future = (days) => { const d = new Date(now); d.setDate(d.getDate() + days); return d; };
  const past = (days) => { const d = new Date(now); d.setDate(d.getDate() - days); return d; };

  // ─── Assets ───────────────────────────────────────────────────────────────
  const assets = await Promise.all([
    // Laptops
    prisma.asset.create({ data: { assetTag: 'AF-0001', name: 'Dell Latitude 7440', categoryId: laptopCat.id, serialNumber: 'DL7440-001', acquisitionDate: past(365), acquisitionCost: 85000, condition: 'Good', location: 'IT Room - Floor 2', departmentId: it.id, status: AssetStatus.ALLOCATED, warrantyExpiry: future(180), warrantyStart: past(185), vendorId: dell.id, invoiceNumber: 'INV-2024-001' } }),
    prisma.asset.create({ data: { assetTag: 'AF-0002', name: 'HP EliteBook 840 G10', categoryId: laptopCat.id, serialNumber: 'HP840-002', acquisitionDate: past(200), acquisitionCost: 92000, condition: 'New', location: 'HR Department', departmentId: hr.id, status: AssetStatus.ALLOCATED, warrantyExpiry: future(400), warrantyStart: past(200), vendorId: hp.id, invoiceNumber: 'INV-2024-002' } }),
    prisma.asset.create({ data: { assetTag: 'AF-0003', name: 'MacBook Pro 14"', categoryId: laptopCat.id, serialNumber: 'MBP14-003', acquisitionDate: past(90), acquisitionCost: 195000, condition: 'New', location: 'R&D Lab', departmentId: rd.id, status: AssetStatus.ALLOCATED, warrantyExpiry: future(640), warrantyStart: past(90), vendorId: apple.id, invoiceNumber: 'INV-2024-003' } }),
    prisma.asset.create({ data: { assetTag: 'AF-0004', name: 'Dell Latitude 5540', categoryId: laptopCat.id, serialNumber: 'DL5540-004', acquisitionDate: past(500), acquisitionCost: 72000, condition: 'Fair', location: 'Finance Dept', departmentId: finance.id, status: AssetStatus.AVAILABLE, warrantyExpiry: future(25), warrantyStart: past(340), vendorId: dell.id } }),
    prisma.asset.create({ data: { assetTag: 'AF-0005', name: 'HP ProBook 450 G9', categoryId: laptopCat.id, serialNumber: 'HP450-005', acquisitionDate: past(300), acquisitionCost: 68000, condition: 'Good', location: 'Sales Floor', departmentId: sales.id, status: AssetStatus.ALLOCATED, warrantyExpiry: future(65), warrantyStart: past(300), vendorId: hp.id } }),
    // Projectors (bookable)
    prisma.asset.create({ data: { assetTag: 'AF-0006', name: 'Epson EB-2250U', categoryId: projectorCat.id, serialNumber: 'EP2250-006', acquisitionDate: past(400), acquisitionCost: 55000, condition: 'Good', location: 'Conference Hall A', isBookable: true, status: AssetStatus.AVAILABLE, warrantyExpiry: future(5), warrantyStart: past(360), vendorId: epson.id } }),
    prisma.asset.create({ data: { assetTag: 'AF-0007', name: 'Epson PowerLite 1781W', categoryId: projectorCat.id, serialNumber: 'EP1781-007', acquisitionDate: past(180), acquisitionCost: 42000, condition: 'Good', location: 'Training Room', isBookable: true, status: AssetStatus.AVAILABLE, warrantyExpiry: future(180), warrantyStart: past(185), vendorId: epson.id } }),
    // Vehicles (bookable)
    prisma.asset.create({ data: { assetTag: 'AF-0008', name: 'Toyota Innova Crysta', categoryId: vehicleCat.id, serialNumber: 'TN-01-AB-1234', acquisitionDate: past(730), acquisitionCost: 1850000, condition: 'Good', location: 'Basement Parking', isBookable: true, status: AssetStatus.AVAILABLE, warrantyExpiry: future(365), vendorId: toyota.id } }),
    prisma.asset.create({ data: { assetTag: 'AF-0009', name: 'Toyota Fortuner', categoryId: vehicleCat.id, serialNumber: 'TN-01-CD-5678', acquisitionDate: past(400), acquisitionCost: 3200000, condition: 'Good', location: 'Basement Parking', isBookable: true, status: AssetStatus.UNDER_MAINTENANCE, warrantyExpiry: future(730), vendorId: toyota.id } }),
    // Furniture
    prisma.asset.create({ data: { assetTag: 'AF-0010', name: 'Herman Miller Aeron Chair', categoryId: furnitureCat.id, serialNumber: 'HM-AERON-010', acquisitionDate: past(600), acquisitionCost: 85000, condition: 'Good', location: 'Executive Suite', departmentId: it.id, status: AssetStatus.ALLOCATED, vendorId: herman.id } }),
    prisma.asset.create({ data: { assetTag: 'AF-0011', name: 'Standing Desk - Motorized', categoryId: furnitureCat.id, serialNumber: 'SD-MOTOR-011', acquisitionDate: past(200), acquisitionCost: 35000, condition: 'New', location: 'R&D Lab', departmentId: rd.id, status: AssetStatus.AVAILABLE } }),
    // Network
    prisma.asset.create({ data: { assetTag: 'AF-0012', name: 'Cisco Catalyst 9300 Switch', categoryId: networkCat.id, serialNumber: 'CISCO-9300-012', acquisitionDate: past(800), acquisitionCost: 280000, condition: 'Good', location: 'Server Room', departmentId: it.id, status: AssetStatus.AVAILABLE, warrantyExpiry: future(400), vendorId: cisco.id } }),
    // Phones
    prisma.asset.create({ data: { assetTag: 'AF-0013', name: 'iPhone 15 Pro', categoryId: phoneCat.id, serialNumber: 'IP15P-013', acquisitionDate: past(60), acquisitionCost: 135000, condition: 'New', location: 'IT Room', departmentId: it.id, status: AssetStatus.ALLOCATED, warrantyExpiry: future(305), vendorId: apple.id } }),
    // Server
    prisma.asset.create({ data: { assetTag: 'AF-0014', name: 'Dell PowerEdge R750', categoryId: serverCat.id, serialNumber: 'DPER750-014', acquisitionDate: past(365), acquisitionCost: 850000, condition: 'Good', location: 'Server Room', departmentId: it.id, status: AssetStatus.AVAILABLE, warrantyExpiry: future(730), vendorId: dell.id } }),
    // Retired/Disposed
    prisma.asset.create({ data: { assetTag: 'AF-0015', name: 'HP Compaq 6200 (Legacy)', categoryId: desktopCat.id, serialNumber: 'HPC6200-015', acquisitionDate: past(2000), acquisitionCost: 35000, condition: 'Poor', location: 'Storage', status: AssetStatus.RETIRED, vendorId: hp.id } }),
  ]);

  const [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15] = assets;

  // ─── Allocations ──────────────────────────────────────────────────────────
  await Promise.all([
    prisma.allocation.create({ data: { assetId: a1.id, allocatedToUserId: emp1.id, allocatedByUserId: manager.id, isActive: true, conditionAtIssue: 'Good', expectedReturnDate: future(90) } }),
    prisma.allocation.create({ data: { assetId: a2.id, allocatedToUserId: hrHead.id, allocatedByUserId: manager.id, isActive: true, conditionAtIssue: 'New', expectedReturnDate: future(180) } }),
    prisma.allocation.create({ data: { assetId: a3.id, allocatedToUserId: emp4.id, allocatedByUserId: manager.id, isActive: true, conditionAtIssue: 'New', expectedReturnDate: future(365) } }),
    prisma.allocation.create({ data: { assetId: a5.id, allocatedToUserId: emp3.id, allocatedByUserId: manager.id, isActive: true, conditionAtIssue: 'Good', expectedReturnDate: past(5) } }), // overdue
    prisma.allocation.create({ data: { assetId: a10.id, allocatedToUserId: itHead.id, allocatedByUserId: admin.id, isActive: true, conditionAtIssue: 'Good' } }),
    prisma.allocation.create({ data: { assetId: a13.id, allocatedToUserId: manager.id, allocatedByUserId: admin.id, isActive: true, conditionAtIssue: 'New', expectedReturnDate: future(300) } }),
    // Historical (returned)
    prisma.allocation.create({ data: { assetId: a1.id, allocatedToUserId: emp2.id, allocatedByUserId: manager.id, isActive: false, conditionAtIssue: 'Good', actualReturnDate: past(30), conditionNotes: 'Returned in good condition' } }),
  ]);

  // ─── Maintenance ──────────────────────────────────────────────────────────
  await Promise.all([
    prisma.maintenanceRecord.create({ data: { assetId: a9.id, scheduledDate: past(2), description: 'Annual service and oil change', priority: 'HIGH', status: MaintenanceStatus.IN_PROGRESS, vendor: 'Toyota Service Center', estimatedCost: 15000, technicianName: 'Suresh Auto', scheduledById: manager.id } }),
    prisma.maintenanceRecord.create({ data: { assetId: a6.id, scheduledDate: future(7), description: 'Lamp replacement and calibration', priority: 'MEDIUM', status: MaintenanceStatus.SCHEDULED, vendor: 'Epson Service', estimatedCost: 8000, scheduledById: manager.id } }),
    prisma.maintenanceRecord.create({ data: { assetId: a12.id, scheduledDate: past(30), description: 'Firmware upgrade and port cleaning', priority: 'LOW', status: MaintenanceStatus.COMPLETED, vendor: 'Cisco Partner', estimatedCost: 5000, actualCost: 4500, completedDate: past(28), completionNotes: 'Firmware updated to 17.9.3', scheduledById: admin.id } }),
    prisma.maintenanceRecord.create({ data: { assetId: a4.id, scheduledDate: future(3), description: 'Battery replacement and thermal paste renewal', priority: 'MEDIUM', status: MaintenanceStatus.SCHEDULED, estimatedCost: 3500, scheduledById: manager.id } }),
  ]);

  // ─── Bookings ─────────────────────────────────────────────────────────────
  const tomorrow = future(1);
  const nextWeek = future(7);
  await Promise.all([
    prisma.booking.create({ data: { assetId: a6.id, bookedById: emp1.id, startTime: new Date(tomorrow.setHours(9, 0)), endTime: new Date(tomorrow.setHours(11, 0)), purpose: 'Q3 Sales Presentation', status: BookingStatus.CONFIRMED } }),
    prisma.booking.create({ data: { assetId: a7.id, bookedById: emp3.id, startTime: new Date(nextWeek.setHours(14, 0)), endTime: new Date(nextWeek.setHours(16, 0)), purpose: 'Product Demo - Client Visit', status: BookingStatus.CONFIRMED } }),
    prisma.booking.create({ data: { assetId: a8.id, bookedById: hrHead.id, startTime: future(2), endTime: future(3), purpose: 'Airport pickup - New Joinee', status: BookingStatus.CONFIRMED } }),
    prisma.booking.create({ data: { assetId: a6.id, bookedById: emp4.id, startTime: past(5), endTime: past(4), purpose: 'R&D Review Meeting', status: BookingStatus.COMPLETED } }),
  ]);

  // ─── Transfer Requests ────────────────────────────────────────────────────
  await prisma.transferRequest.create({
    data: { assetId: a5.id, fromUserId: emp3.id, toUserId: emp2.id, requestedById: emp2.id, reason: 'Finance team needs laptop for audit work', status: 'REQUESTED' },
  });

  // ─── Audit Cycle ──────────────────────────────────────────────────────────
  const auditCycle = await prisma.auditCycle.create({
    data: { title: 'Q3 2026 IT Asset Audit', description: 'Quarterly verification of all IT department assets', startDate: past(5), endDate: future(25), departmentId: it.id, status: 'IN_PROGRESS', createdById: admin.id },
  });

  const itAssets = [a1, a3, a12, a13, a14];
  await prisma.auditItem.createMany({
    data: itAssets.map(a => ({ auditCycleId: auditCycle.id, assetId: a.id, assignedToId: itHead.id })),
    skipDuplicates: true,
  });

  // Mark some as verified
  await prisma.auditItem.updateMany({
    where: { auditCycleId: auditCycle.id, assetId: { in: [a12.id, a14.id] } },
    data: { verificationStatus: 'VERIFIED', verifiedAt: past(1), notes: 'Asset found in good condition' },
  });

  // ─── Notifications ────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: emp1.id, title: 'Asset Allocated to You', message: 'Dell Latitude 7440 (AF-0001) has been allocated to you.', type: 'ALLOCATION', entityType: 'Asset', entityId: a1.id },
      { userId: emp3.id, title: 'Overdue Return Alert', message: 'HP ProBook 450 G9 (AF-0005) was due for return 5 days ago.', type: 'OVERDUE', entityType: 'Asset', entityId: a5.id, isRead: false },
      { userId: manager.id, title: 'Warranty Expiring in 7 Days', message: 'Epson EB-2250U (AF-0006) warranty expires in 5 days.', type: 'WARRANTY_CRITICAL', entityType: 'Asset', entityId: a6.id },
      { userId: manager.id, title: 'Warranty Expiring in 30 Days', message: 'Dell Latitude 5540 (AF-0004) warranty expires in 25 days.', type: 'WARRANTY_WARNING', entityType: 'Asset', entityId: a4.id },
      { userId: admin.id, title: 'Transfer Request Pending', message: 'A transfer request for HP ProBook 450 G9 is awaiting approval.', type: 'TRANSFER', entityType: 'TransferRequest' },
      { userId: emp4.id, title: 'Asset Allocated to You', message: 'MacBook Pro 14" (AF-0003) has been allocated to you.', type: 'ALLOCATION', entityType: 'Asset', entityId: a3.id, isRead: true },
    ],
  });

  console.log('✅ AssetFlow enterprise database seeded successfully!');
  console.log('');
  console.log('📋 Demo Credentials:');
  console.log('  Admin:          admin@assetflow.com    / Password@123');
  console.log('  Asset Manager:  manager@assetflow.com  / Password@123');
  console.log('  Dept Head (IT): vikram@assetflow.com   / Password@123');
  console.log('  Dept Head (HR): ananya@assetflow.com   / Password@123');
  console.log('  Employee:       raj@assetflow.com      / Password@123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
