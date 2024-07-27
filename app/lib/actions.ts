'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

const DASHBOARD_INVOICES_PATH = '/dashboard/invoices';

const createInvoice = async (formData: FormData) => {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
          INSERT INTO invoices (customer_id, amount, status, date)
          VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  revalidatePath(DASHBOARD_INVOICES_PATH);
  redirect(DASHBOARD_INVOICES_PATH);
};

const updateInvoice = async (id: string, formData: FormData) => {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;

  try {
    await sql`
              UPDATE invoices
              SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
              WHERE id = ${id}
            `;
  } catch (error) {
    console.log('update invoice error', error);
  }

  revalidatePath(DASHBOARD_INVOICES_PATH);
  redirect(DASHBOARD_INVOICES_PATH);
};

const deleteInvoice = async (id: string) => {
  throw new Error('Failed to Delete Invoice');
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath(DASHBOARD_INVOICES_PATH);
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    console.error('delete invoice error', error);
  }
};

export { createInvoice, deleteInvoice, updateInvoice };
