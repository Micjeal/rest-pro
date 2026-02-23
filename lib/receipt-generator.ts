import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { getCurrency, formatCurrency } from './currencies'

interface ReceiptData {
  id: string
  number: string
  date: string
  amount: number
  paymentMethod: string
  itemCount: number
  cashier: string
  customerName?: string
  tableName?: string
  currencyCode?: string
  items?: Array<{
    name: string
    quantity: number
    price: number
    subtotal: number
  }>
}

export class ReceiptGenerator {
  static async generatePDFReceipt(receipt: ReceiptData): Promise<void> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [58, 100] // Receipt printer dimensions
    })

    // Get currency information
    const currency = getCurrency(receipt.currencyCode || 'UGX')
    const currencySymbol = currency?.symbol || 'USh'

    // Set font
    pdf.setFont('helvetica')
    
    let yPosition = 10

    // Header
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('RESTAURANT', 29, yPosition, { align: 'center' })
    yPosition += 8

    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.text('123 Main St', 29, yPosition, { align: 'center' })
    yPosition += 5
    pdf.text('City, State 12345', 29, yPosition, { align: 'center' })
    yPosition += 5
    pdf.text('Tel: (555) 123-4567', 29, yPosition, { align: 'center' })
    yPosition += 8

    // Separator line
    pdf.setLineWidth(0.1)
    pdf.line(5, yPosition, 53, yPosition)
    yPosition += 5

    // Receipt info
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`Receipt: ${receipt.number}`, 5, yPosition)
    yPosition += 4
    pdf.text(`Date: ${new Date(receipt.date).toLocaleDateString()}`, 5, yPosition)
    yPosition += 4
    pdf.text(`Time: ${new Date(receipt.date).toLocaleTimeString()}`, 5, yPosition)
    yPosition += 4

    if (receipt.tableName) {
      pdf.text(`Table: ${receipt.tableName}`, 5, yPosition)
      yPosition += 4
    }

    if (receipt.customerName) {
      pdf.text(`Customer: ${receipt.customerName}`, 5, yPosition)
      yPosition += 4
    }

    yPosition += 3

    // Separator line
    pdf.setLineWidth(0.1)
    pdf.line(5, yPosition, 53, yPosition)
    yPosition += 5

    // Items (if available)
    if (receipt.items && receipt.items.length > 0) {
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Items:', 5, yPosition)
      yPosition += 4

      receipt.items.forEach((item) => {
        pdf.setFont('helvetica', 'normal')
        pdf.text(`${item.quantity}x ${item.name}`, 5, yPosition)
        yPosition += 3
        pdf.text(`${currencySymbol}${formatCurrency(item.subtotal, receipt.currencyCode || 'UGX').replace(/[^0-9]/g, '')}`, 45, yPosition, { align: 'right' })
        yPosition += 4
      })
    } else {
      pdf.setFontSize(8)
      pdf.text(`Items: ${receipt.itemCount}`, 5, yPosition)
      yPosition += 4
    }

    yPosition += 3

    // Separator line
    pdf.setLineWidth(0.1)
    pdf.line(5, yPosition, 53, yPosition)
    yPosition += 5

    // Totals
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Subtotal:', 5, yPosition)
    pdf.text(`${currencySymbol}${formatCurrency(receipt.amount, receipt.currencyCode || 'UGX').replace(/[^0-9]/g, '')}`, 45, yPosition, { align: 'right' })
    yPosition += 4

    pdf.text('Tax (10%):', 5, yPosition)
    pdf.text(`${currencySymbol}${formatCurrency(receipt.amount * 0.1, receipt.currencyCode || 'UGX').replace(/[^0-9]/g, '')}`, 45, yPosition, { align: 'right' })
    yPosition += 4

    pdf.setFontSize(10)
    pdf.text('TOTAL:', 5, yPosition)
    pdf.text(`${currencySymbol}${formatCurrency(receipt.amount * 1.1, receipt.currencyCode || 'UGX').replace(/[^0-9]/g, '')}`, 45, yPosition, { align: 'right' })
    yPosition += 6

    // Separator line
    pdf.setLineWidth(0.1)
    pdf.line(5, yPosition, 53, yPosition)
    yPosition += 5

    // Payment info
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Payment: ${receipt.paymentMethod}`, 5, yPosition)
    yPosition += 4
    pdf.text(`Cashier: ${receipt.cashier}`, 5, yPosition)
    yPosition += 6

    // Footer
    pdf.setFontSize(6)
    pdf.text('Thank you for your business!', 29, yPosition, { align: 'center' })
    yPosition += 4
    pdf.text('Please come again', 29, yPosition, { align: 'center' })

    // Save the PDF
    pdf.save(`${receipt.number}.pdf`)
  }

  static async generateDetailedReceipt(receipt: ReceiptData): Promise<void> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Get currency information
    const currency = getCurrency(receipt.currencyCode || 'UGX')
    const currencySymbol = currency?.symbol || 'USh'

    // Set font
    pdf.setFont('helvetica')
    
    let yPosition = 20

    // Header
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('RESTAURANT RECEIPT', 105, yPosition, { align: 'center' })
    yPosition += 15

    // Restaurant info
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text('123 Main Street, City, State 12345', 105, yPosition, { align: 'center' })
    yPosition += 6
    pdf.text('Phone: (555) 123-4567 | Email: info@restaurant.com', 105, yPosition, { align: 'center' })
    yPosition += 15

    // Receipt details box
    pdf.setDrawColor(0)
    pdf.setLineWidth(0.5)
    pdf.rect(20, yPosition, 170, 40)
    yPosition += 8

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`Receipt Number: ${receipt.number}`, 30, yPosition)
    yPosition += 8
    pdf.text(`Date: ${new Date(receipt.date).toLocaleDateString()}`, 30, yPosition)
    yPosition += 8
    pdf.text(`Time: ${new Date(receipt.date).toLocaleTimeString()}`, 30, yPosition)
    yPosition += 8
    pdf.text(`Cashier: ${receipt.cashier}`, 30, yPosition)

    yPosition += 20

    // Customer info
    if (receipt.customerName || receipt.tableName) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Customer Information:', 20, yPosition)
      yPosition += 8

      pdf.setFont('helvetica', 'normal')
      if (receipt.customerName) {
        pdf.text(`Name: ${receipt.customerName}`, 30, yPosition)
        yPosition += 6
      }
      if (receipt.tableName) {
        pdf.text(`Table: ${receipt.tableName}`, 30, yPosition)
        yPosition += 6
      }
      yPosition += 10
    }

    // Items table
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Order Details:', 20, yPosition)
    yPosition += 10

    // Table headers
    pdf.setDrawColor(0)
    pdf.setLineWidth(0.3)
    pdf.line(20, yPosition, 190, yPosition)
    yPosition += 6

    pdf.setFontSize(10)
    pdf.text('Item', 25, yPosition)
    pdf.text('Quantity', 100, yPosition)
    pdf.text('Price', 140, yPosition)
    pdf.text('Subtotal', 170, yPosition)
    yPosition += 8

    pdf.line(20, yPosition, 190, yPosition)
    yPosition += 6

    // Items
    if (receipt.items && receipt.items.length > 0) {
      receipt.items.forEach((item) => {
        pdf.setFont('helvetica', 'normal')
        pdf.text(item.name, 25, yPosition)
        pdf.text(item.quantity.toString(), 100, yPosition)
        pdf.text(`${currencySymbol}${formatCurrency(item.price, receipt.currencyCode || 'UGX').replace(/[^0-9]/g, '')}`, 140, yPosition)
        pdf.text(`${currencySymbol}${formatCurrency(item.subtotal, receipt.currencyCode || 'UGX').replace(/[^0-9]/g, '')}`, 170, yPosition)
        yPosition += 6
      })
    } else {
      pdf.text(`Total Items: ${receipt.itemCount}`, 25, yPosition)
      yPosition += 6
    }

    yPosition += 6
    pdf.line(20, yPosition, 190, yPosition)
    yPosition += 10

    // Totals
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Payment Summary:', 140, yPosition)
    yPosition += 8

    pdf.setFont('helvetica', 'normal')
    pdf.text('Subtotal:', 140, yPosition)
    pdf.text(`${currencySymbol}${formatCurrency(receipt.amount, receipt.currencyCode || 'UGX').replace(/[^0-9]/g, '')}`, 170, yPosition)
    yPosition += 6

    pdf.text('Tax (10%):', 140, yPosition)
    pdf.text(`${currencySymbol}${formatCurrency(receipt.amount * 0.1, receipt.currencyCode || 'UGX').replace(/[^0-9]/g, '')}`, 170, yPosition)
    yPosition += 6

    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('TOTAL:', 140, yPosition)
    pdf.text(`${currencySymbol}${formatCurrency(receipt.amount * 1.1, receipt.currencyCode || 'UGX').replace(/[^0-9]/g, '')}`, 170, yPosition)
    yPosition += 10

    // Payment method
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Payment Method: ${receipt.paymentMethod}`, 140, yPosition)
    yPosition += 20

    // Footer
    pdf.setFontSize(8)
    pdf.text('Thank you for dining with us!', 105, yPosition, { align: 'center' })
    yPosition += 6
    pdf.text('Your business is greatly appreciated', 105, yPosition, { align: 'center' })
    yPosition += 6
    pdf.text('Visit us again soon!', 105, yPosition, { align: 'center' })

    // Save the PDF
    pdf.save(`receipt-${receipt.number}-detailed.pdf`)
  }
}
