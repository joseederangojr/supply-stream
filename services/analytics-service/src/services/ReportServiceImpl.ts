import { injectable, inject } from "inversify"
import type { ReportService } from "../domain/services/ReportService"
import type { ReportRepository } from "../domain/repositories/ReportRepository"
import type { Report, CreateReportDto } from "../domain/models/Report"
import { logger } from "../utils/logger"

@injectable()
export class ReportServiceImpl implements ReportService {
  constructor(
    @inject("ReportRepository") private reportRepository: ReportRepository
  ) {}

  async createReport(dto: CreateReportDto): Promise<Report> {
    try {
      const report = await this.reportRepository.create(dto)

      // Start the report generation process asynchronously
      this.generateReport(report.id).catch((error) => {
        logger.error("Error generating report", {
          error: error instanceof Error ? error.message : "Unknown error",
          reportId: report.id,
        })
      })

      return report
    } catch (error) {
      logger.error("Error creating report", {
        error: error instanceof Error ? error.message : "Unknown error",
        dto,
      })
      throw error
    }
  }

  async getReportById(id: string): Promise<Report | null> {
    try {
      return await this.reportRepository.findById(id)
    } catch (error) {
      logger.error("Error getting report by ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        id,
      })
      throw error
    }
  }

  async getReportsByUserId(userId: string, page?: number, limit?: number): Promise<Report[]> {
    try {
      return await this.reportRepository.findByUserId(userId, { page, limit })
    } catch (error) {
      logger.error("Error getting reports by user ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      })
      throw error
    }
  }

  async getReportsByOrganizationId(organizationId: string, page?: number, limit?: number): Promise<Report[]> {
    try {
      return await this.reportRepository.findByOrganizationId(organizationId, { page, limit })
    } catch (error) {
      logger.error("Error getting reports by organization ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
      })
      throw error
    }
  }

  async generateReport(id: string): Promise<boolean> {
    try {
      // Update status to PROCESSING
      await this.reportRepository.updateStatus(id, "PROCESSING")

      // Get the report
      const report = await this.reportRepository.findById(id)

      if (!report) {
        logger.error("Report not found", { id })
        return false
      }

      // Generate the report based on type and format
      try {
        const url = await this.generateReportContent(report)

        // Update status to COMPLETED
        await this.reportRepository.updateStatus(id, "COMPLETED", url)

        return true
      } catch (error) {
        // Update status to FAILED
        await this.reportRepository.updateStatus(
          id,
          "FAILED",
          undefined,
          error instanceof Error ? error.message : "Unknown error",
        )

        logger.error("Error generating report content", {
          error: error instanceof Error ? error.message : "Unknown error",
          reportId: id,
        })

        return false
      }
    } catch (error) {
      logger.error("Error generating report", {
        error: error instanceof Error ? error.message : "Unknown error",
        id,
      })
      throw error
    }
  }

  async deleteReport(id: string): Promise<boolean> {
    try {
      return await this.reportRepository.delete(id)
    } catch (error) {
      logger.error("Error deleting report", {
        error: error instanceof Error ? error.message : "Unknown error",
        id,
      })
      throw error
    }
  }

  private async generateReportContent(report: Report): Promise<string> {
    // In a real implementation, this would generate the report content
    // and upload it to a storage service like Azure Blob Storage

    // For now, we'll just simulate the process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Return a mock URL
    return `https://storage.example.com/reports/${report.id}.${report.format.toLowerCase()}`
  }
}
