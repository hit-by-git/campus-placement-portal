import { analyticsRepository } from "../repositories/analytics.repository";
import { toCsv } from "../utils/csv";

export const analyticsService = {
  async overview() {
    const [totalStudents, placedStudents, packageStats] = await Promise.all([
      analyticsRepository.countStudents(),
      analyticsRepository.countPlacedStudents(),
      analyticsRepository.acceptedOfferPackageStats(),
    ]);

    const placementPercentage = totalStudents === 0 ? 0 : (placedStudents / totalStudents) * 100;

    return {
      totalStudents,
      placedStudents,
      placementPercentage: Math.round(placementPercentage * 100) / 100,
      averagePackageLPA: packageStats._avg.packageLPA ?? 0,
      highestPackageLPA: packageStats._max.packageLPA ?? 0,
    };
  },

  async applicationsPerCompany() {
    const companies = await analyticsRepository.applicationsPerCompany();
    return companies
      .map((c) => ({
        companyId: c.id,
        companyName: c.name,
        applicationCount: c.drives.reduce((sum, d) => sum + d._count.applications, 0),
      }))
      .sort((a, b) => b.applicationCount - a.applicationCount);
  },

  skillDistribution: () => analyticsRepository.skillDistribution(),

  async exportStudentsCsv() {
    const students = await analyticsRepository.listStudentsForExport();
    return toCsv(students, [
      { header: "Name", value: (s) => s.fullName },
      { header: "Email", value: (s) => s.user.email },
      { header: "Branch", value: (s) => s.branch },
      { header: "Degree", value: (s) => s.degree },
      { header: "CGPA", value: (s) => s.cgpa },
      { header: "Graduation Year", value: (s) => s.graduationYear },
      { header: "Active Backlogs", value: (s) => s.activeBacklogs },
      { header: "Resume URL", value: (s) => s.resumeUrl },
    ]);
  },

  async exportPlacementsCsv() {
    const offers = await analyticsRepository.listPlacementsForExport();
    return toCsv(offers, [
      { header: "Student Name", value: (o) => o.application.student.fullName },
      { header: "Email", value: (o) => o.application.student.user.email },
      { header: "Company", value: (o) => o.application.drive.company.name },
      { header: "Drive", value: (o) => o.application.drive.title },
      { header: "Package (LPA)", value: (o) => o.packageLPA },
      { header: "Offer Status", value: (o) => o.status },
      { header: "Issued At", value: (o) => o.issuedAt.toISOString() },
    ]);
  },
};
