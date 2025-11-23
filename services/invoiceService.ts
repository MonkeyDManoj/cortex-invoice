import { supabase } from '@/lib/supabase';

export interface Invoice {
  id: string;
  user_id: string;
  image_url: string;
  status: 'processing' | 'completed' | 'failed';
  webhook_response?: any;
  ocr_data?: any;
  uploaded_at: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export const createInvoice = async (
  userId: string,
  imageUrl: string
): Promise<Invoice | null> => {
  const { data, error } = await supabase
    .from('invoices')
    .insert({
      user_id: userId,
      image_url: imageUrl,
      status: 'processing',
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }

  return data;
};

export const updateInvoiceWithWebhookResponse = async (
  invoiceId: string,
  webhookResponse: any,
  ocrData?: any
): Promise<void> => {
  const updateData: any = {
    webhook_response: webhookResponse,
    status: webhookResponse.success ? 'completed' : 'failed',
    processed_at: new Date().toISOString(),
  };

  if (ocrData) {
    updateData.ocr_data = ocrData;
  }

  const { error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', invoiceId);

  if (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }
};

export const getUserInvoices = async (userId: string): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }

  return data || [];
};

export const getInvoiceById = async (invoiceId: string): Promise<Invoice | null> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }

  return data;
};
