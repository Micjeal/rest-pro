import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export interface ExportData {
  dailyData: any[]
  statusData: any[]
  categoryData: any[]
  paymentData: any[]
  summary: {
    totalRevenue: number
    totalTransactions: number
    averageTransaction: number
    dateRange: string
    restaurant: string
  }
}

export class ReportExporter {
  static async exportToExcel(data: ExportData, filename: string = 'reports.xlsx') {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new()

      // Summary sheet
      const summaryData = [
        ['Metric', 'Value'],
        ['Total Revenue', data.summary.totalRevenue],
        ['Total Transactions', data.summary.totalTransactions],
        ['Average Transaction', data.summary.averageTransaction],
        ['Date Range', data.summary.dateRange],
        ['Restaurant', data.summary.restaurant]
      ]
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary')

      // Daily data sheet
      if (data.dailyData.length > 0) {
        const dailyWs = XLSX.utils.json_to_sheet(data.dailyData)
        XLSX.utils.book_append_sheet(wb, dailyWs, 'Daily Data')
      }

      // Status breakdown sheet
      if (data.statusData.length > 0) {
        const statusWs = XLSX.utils.json_to_sheet(data.statusData)
        XLSX.utils.book_append_sheet(wb, statusWs, 'Order Status')
      }

      // Category breakdown sheet
      if (data.categoryData.length > 0) {
        const categoryWs = XLSX.utils.json_to_sheet(data.categoryData)
        XLSX.utils.book_append_sheet(wb, categoryWs, 'Categories')
      }

      // Payment methods sheet
      if (data.paymentData.length > 0) {
        const paymentWs = XLSX.utils.json_to_sheet(data.paymentData)
        XLSX.utils.book_append_sheet(wb, paymentWs, 'Payment Methods')
      }

      // Save file
      XLSX.writeFile(wb, filename)
      return true
    } catch (error) {
      console.error('Excel export error:', error)
      return false
    }
  }

  static async exportToPDF(elementId: string, filename: string = 'reports.pdf') {
    try {
      const element = document.getElementById(elementId)
      if (!element) {
        throw new Error('Element not found for PDF export')
      }

      // Create canvas from element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })

      const imgWidth = 297
      const pageHeight = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Save PDF
      pdf.save(filename)
      return true
    } catch (error) {
      console.error('PDF export error:', error)
      return false
    }
  }

  static formatCurrencyForExport(amount: number, currencySymbol: string = 'USh'): string {
    return `${currencySymbol} ${amount.toLocaleString('en-UG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`
  }

  static prepareExportData(
    dailyData: any[],
    statusData: any[],
    categoryData: any[],
    paymentData: any[],
    summary: any,
    currencySymbol: string
  ): ExportData {
    return {
      dailyData: dailyData.map(day => ({
        ...day,
        formattedRevenue: this.formatCurrencyForExport(day.sales, currencySymbol),
        formattedAvgOrder: this.formatCurrencyForExport(day.avgOrderValue, currencySymbol)
      })),
      statusData: statusData.map(status => ({
        ...status,
        formattedRevenue: this.formatCurrencyForExport(status.revenue, currencySymbol)
      })),
      categoryData: categoryData.map(category => ({
        ...category,
        formattedValue: this.formatCurrencyForExport(category.value, currencySymbol)
      })),
      paymentData: paymentData.map(payment => ({
        ...payment,
        formattedValue: this.formatCurrencyForExport(payment.value, currencySymbol),
        formattedAvgTransaction: this.formatCurrencyForExport(payment.avgTransaction, currencySymbol)
      })),
      summary: {
        ...summary,
        formattedTotalRevenue: this.formatCurrencyForExport(summary.totalRevenue, currencySymbol),
        formattedAverageTransaction: this.formatCurrencyForExport(summary.averageTransaction, currencySymbol)
      }
    }
  }
}
