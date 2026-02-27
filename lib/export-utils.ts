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
      // Create workbook with styling
      const wb = XLSX.utils.book_new()

      // Title and metadata sheet
      const titleData = [
        ['Restaurant Analytics Report'],
        [''],
        [`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`],
        [`Period: ${data.summary.dateRange}`],
        [`Restaurant: ${data.summary.restaurant}`],
        ['']
      ]
      const titleWs = XLSX.utils.aoa_to_sheet(titleData)
      XLSX.utils.book_append_sheet(wb, titleWs, 'Report Info')

      // Summary sheet with enhanced formatting
      const summaryData = [
        ['Key Performance Metrics', ''],
        ['Total Revenue', data.summary.totalRevenue],
        ['Total Transactions', data.summary.totalTransactions],
        ['Average Transaction Value', data.summary.averageTransaction],
        ['Date Range', data.summary.dateRange],
        ['Restaurant', data.summary.restaurant],
        ['Report Generated', new Date().toISOString()]
      ]
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary')

      // Daily data sheet with enhanced headers
      if (data.dailyData.length > 0) {
        const dailyHeaders = [['Date', 'Revenue', 'Transactions', 'Average Order Value', 'Status']]
        const dailyRows = data.dailyData.map(day => [
          day.date || 'N/A',
          day.sales || 0,
          day.transactions || 0,
          day.avgOrderValue || 0,
          day.sales > 0 ? 'Good' : 'Low'
        ])
        const dailyData = [...dailyHeaders, ...dailyRows]
        const dailyWs = XLSX.utils.aoa_to_sheet(dailyData)
        XLSX.utils.book_append_sheet(wb, dailyWs, 'Daily Sales Data')
      }

      // Status breakdown sheet with enhanced headers
      if (data.statusData.length > 0) {
        const statusHeaders = [['Order Status', 'Count', 'Revenue', 'Performance']]
        const statusRows = data.statusData.map(status => [
          status.status || 'N/A',
          status.count || 0,
          status.revenue || 0,
          status.count > 10 ? 'Excellent' : status.count > 5 ? 'Good' : 'Needs Attention'
        ])
        const statusData = [...statusHeaders, ...statusRows]
        const statusWs = XLSX.utils.aoa_to_sheet(statusData)
        XLSX.utils.book_append_sheet(wb, statusWs, 'Order Status Analysis')
      }

      // Category breakdown sheet with enhanced headers
      if (data.categoryData.length > 0) {
        const categoryHeaders = [['Category', 'Revenue', 'Items Sold', 'Average Price', 'Performance']]
        const categoryRows = data.categoryData.map(category => [
          category.category || 'N/A',
          category.value || 0,
          category.items || 0,
          category.avgPrice || 0,
          category.value > 10000 ? 'Top Performer' : category.value > 5000 ? 'Good' : 'Average'
        ])
        const categoryData = [...categoryHeaders, ...categoryRows]
        const categoryWs = XLSX.utils.aoa_to_sheet(categoryData)
        XLSX.utils.book_append_sheet(wb, categoryWs, 'Category Performance')
      }

      // Payment methods sheet with enhanced headers
      if (data.paymentData.length > 0) {
        const paymentHeaders = [['Payment Method', 'Amount', 'Transaction Count', 'Average Transaction', 'Usage']]
        const paymentRows = data.paymentData.map(payment => [
          payment.method || 'N/A',
          payment.value || 0,
          payment.count || 0,
          payment.avgTransaction || 0,
          payment.value > 50000 ? 'Very Popular' : payment.value > 20000 ? 'Popular' : 'Standard'
        ])
        const paymentData = [...paymentHeaders, ...paymentRows]
        const paymentWs = XLSX.utils.aoa_to_sheet(paymentData)
        XLSX.utils.book_append_sheet(wb, paymentWs, 'Payment Methods Analysis')
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

      // Add print styles for better PDF appearance
      const originalStyle = (element as HTMLElement).getAttribute('style')
      ;(element as HTMLElement).setAttribute('style', `
        ${originalStyle || ''}
        background: white !important;
        color: black !important;
        padding: 20px !important;
        font-size: 12px !important;
        line-height: 1.4 !important;
      `)

      // Create canvas with enhanced settings
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: (element as HTMLElement).scrollWidth,
        height: (element as HTMLElement).scrollHeight,
        logging: false,
        removeContainer: true,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.body?.firstChild as HTMLElement
          if (clonedElement) {
            clonedElement.style.transform = 'scale(1)'
            clonedElement.style.transformOrigin = 'top left'
          }
        }
      })

      // Restore original style
      ;(element as HTMLElement).setAttribute('style', originalStyle || '')

      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
      })

      const imgWidth = 297 // A4 width in mm
      const pageHeight = 210 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      // Add header with title
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Restaurant Analytics Report', imgWidth / 2, 15, { align: 'center' })
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, imgWidth / 2, 25, { align: 'center' })
      pdf.text(`Period: ${elementId.includes('tax-profit') ? 'Financial Analysis' : 'Sales Analytics'}`, imgWidth / 2, 30, { align: 'center' })

      // Add image to PDF with proper positioning
      pdf.addImage(imgData, 'PNG', 0, 40, imgWidth, imgHeight)
      heightLeft -= pageHeight + 40

      // Add footer on each page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 40
        if (position > 0) {
          pdf.addPage()
          // Add footer
          pdf.setFontSize(8)
          pdf.setFont('helvetica', 'italic')
          pdf.text(`Page ${pdf.getNumberOfPages()}`, imgWidth - 20, pageHeight - 10, { align: 'right' })
          pdf.text(`Confidential - Restaurant Management System`, imgWidth / 2, pageHeight - 10, { align: 'center' })
        }
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Add footer to last page
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'italic')
      pdf.text(`Page ${pdf.getNumberOfPages()}`, imgWidth - 20, pageHeight - 10, { align: 'right' })
      pdf.text(`Confidential - Restaurant Management System`, imgWidth / 2, pageHeight - 10, { align: 'center' })

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
