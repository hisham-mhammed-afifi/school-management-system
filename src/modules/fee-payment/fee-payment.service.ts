import type { FeePaymentRepository } from './fee-payment.repository.ts';
import type { CreateFeePaymentInput, ListFeePaymentsQuery } from './fee-payment.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

const PAYABLE_STATUSES = new Set(['issued', 'partially_paid', 'overdue']);

export class FeePaymentService {
  private readonly repo: FeePaymentRepository;
  constructor(repo: FeePaymentRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListFeePaymentsQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const payment = await this.repo.findById(id);
    if (!payment) throw new AppError('Fee payment not found', 404, 'FEE_PAYMENT_NOT_FOUND');
    return payment;
  }

  async create(schoolId: string, receivedBy: string, input: CreateFeePaymentInput) {
    const invoice = await this.repo.getInvoiceWithPayments(input.invoiceId);
    if (!invoice) throw new AppError('Invoice not found', 404, 'FEE_INVOICE_NOT_FOUND');

    if (!PAYABLE_STATUSES.has(invoice.status)) {
      throw new AppError(
        'Can only record payment on issued, partially paid, or overdue invoices',
        400,
        'INVOICE_NOT_PAYABLE',
      );
    }

    const netAmount = Number(invoice.netAmount.toString());
    const existingPaid = await this.repo.getTotalPaidForInvoice(input.invoiceId);
    const totalAfterPayment = existingPaid + input.amountPaid;

    // Allow tiny tolerance for floating point
    if (totalAfterPayment > netAmount * 1.001) {
      throw new AppError(
        `Payment would exceed invoice net amount. Remaining balance: ${Math.round((netAmount - existingPaid) * 100) / 100}`,
        422,
        'OVERPAYMENT',
      );
    }

    const payment = await this.repo.create({
      school: { connect: { id: schoolId } },
      invoice: { connect: { id: input.invoiceId } },
      amountPaid: input.amountPaid,
      paymentDate: input.paymentDate,
      paymentMethod: input.paymentMethod,
      referenceNumber: input.referenceNumber ?? null,
      notes: input.notes ?? null,
      receivedByUser: { connect: { id: receivedBy } },
    });

    // Auto-update invoice status
    const newStatus = totalAfterPayment >= netAmount ? 'paid' : 'partially_paid';
    await this.repo.updateInvoiceStatus(input.invoiceId, newStatus);

    return payment;
  }
}
