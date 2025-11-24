import { supabase } from '@/lib/supabase';

export interface ApprovalInvoice {
  id: string;
  user_id: string;
  image_url: string;
  status: 'processing' | 'completed' | 'failed';
  approval_status: 'pending' | 'approved' | 'rejected';
  webhook_response?: any;
  ocr_data?: any;
  uploaded_at: string;
  processed_at?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_comment?: string;
  created_at: string;
  updated_at: string;
  uploader?: {
    full_name: string;
    email: string;
  };
}

export interface AuditLogEntry {
  id: string;
  invoice_id: string;
  user_id: string;
  user_name: string;
  action: 'created' | 'edited' | 'approved' | 'rejected';
  changes?: any;
  comment?: string;
  created_at: string;
}

export interface DuplicateDetectionLog {
  id: string;
  invoice_id: string;
  detected_at: string;
  detected_by: string;
  overridden: boolean;
  overridden_by?: string;
  overridden_at?: string;
  override_reason?: string;
  created_at: string;
}

export interface ApprovalWebhookResponse {
  duplicate?: boolean;
  [key: string]: any;
}

export const getPendingInvoices = async (): Promise<ApprovalInvoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      uploader:app_users!user_id(full_name, email)
    `)
    .eq('approval_status', 'pending')
    .eq('status', 'completed')
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending invoices:', error);
    throw error;
  }

  return data || [];
};

export const getInvoiceForApproval = async (
  invoiceId: string
): Promise<ApprovalInvoice | null> => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      uploader:app_users!user_id(full_name, email)
    `)
    .eq('id', invoiceId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }

  return data;
};

export const updateInvoiceData = async (
  invoiceId: string,
  ocrData: any,
  userId: string,
  userName: string
): Promise<void> => {
  const oldInvoice = await getInvoiceForApproval(invoiceId);

  const { error } = await supabase
    .from('invoices')
    .update({ ocr_data: ocrData })
    .eq('id', invoiceId);

  if (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }

  await createAuditLog({
    invoice_id: invoiceId,
    user_id: userId,
    user_name: userName,
    action: 'edited',
    changes: {
      old: oldInvoice?.ocr_data,
      new: ocrData,
    },
  });
};

export const approveInvoice = async (
  invoiceId: string,
  userId: string,
  userName: string,
  ocrData?: any,
  overrideDuplicate?: boolean,
  overrideReason?: string
): Promise<ApprovalWebhookResponse> => {
  const updateData: any = {
    approval_status: 'approved',
    approved_by: userId,
    approved_at: new Date().toISOString(),
  };

  if (ocrData) {
    updateData.ocr_data = ocrData;
  }

  const { error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', invoiceId);

  if (error) {
    console.error('Error approving invoice:', error);
    throw error;
  }

  await createAuditLog({
    invoice_id: invoiceId,
    user_id: userId,
    user_name: userName,
    action: 'approved',
  });

  const webhookResponse = await sendApprovalWebhook(invoiceId, 'approved', ocrData);

  if (webhookResponse.duplicate && !overrideDuplicate) {
    await logDuplicateDetection(invoiceId, userId);
    throw { duplicate: true, webhookResponse };
  }

  if (webhookResponse.duplicate && overrideDuplicate) {
    await markDuplicateOverridden(invoiceId, userId, overrideReason);
  }

  return webhookResponse;
};

export const rejectInvoice = async (
  invoiceId: string,
  userId: string,
  userName: string,
  comment: string,
  ocrData?: any
): Promise<void> => {
  if (!comment || comment.trim() === '') {
    throw new Error('Comment is required when rejecting an invoice');
  }

  const updateData: any = {
    approval_status: 'rejected',
    approved_by: userId,
    approved_at: new Date().toISOString(),
    rejection_comment: comment,
  };

  if (ocrData) {
    updateData.ocr_data = ocrData;
  }

  const { error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', invoiceId);

  if (error) {
    console.error('Error rejecting invoice:', error);
    throw error;
  }

  await createAuditLog({
    invoice_id: invoiceId,
    user_id: userId,
    user_name: userName,
    action: 'rejected',
    comment,
  });

  await sendApprovalWebhook(invoiceId, 'rejected', ocrData, comment);
};

export const createAuditLog = async (entry: {
  invoice_id: string;
  user_id: string;
  user_name: string;
  action: 'created' | 'edited' | 'approved' | 'rejected';
  changes?: any;
  comment?: string;
}): Promise<void> => {
  const { error } = await supabase.from('invoice_audit_log').insert(entry);

  if (error) {
    console.error('Error creating audit log:', error);
    throw error;
  }
};

export const getAuditLog = async (
  invoiceId: string
): Promise<AuditLogEntry[]> => {
  const { data, error } = await supabase
    .from('invoice_audit_log')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching audit log:', error);
    throw error;
  }

  return data || [];
};

export const logDuplicateDetection = async (
  invoiceId: string,
  userId: string
): Promise<void> => {
  const { error } = await supabase.from('duplicate_detection_log').insert({
    invoice_id: invoiceId,
    detected_by: userId,
    detected_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error logging duplicate detection:', error);
    throw error;
  }
};

export const markDuplicateOverridden = async (
  invoiceId: string,
  userId: string,
  reason?: string
): Promise<void> => {
  const { error } = await supabase
    .from('duplicate_detection_log')
    .update({
      overridden: true,
      overridden_by: userId,
      overridden_at: new Date().toISOString(),
      override_reason: reason,
    })
    .eq('invoice_id', invoiceId)
    .eq('overridden', false)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error marking duplicate as overridden:', error);
    throw error;
  }
};

const sendApprovalWebhook = async (
  invoiceId: string,
  action: 'approved' | 'rejected',
  ocrData?: any,
  comment?: string
): Promise<ApprovalWebhookResponse> => {
  const WEBHOOK_URL = 'https://webhook.site/your-webhook-id/approval-submit';

  try {
    const payload = {
      invoice_id: invoiceId,
      action,
      ocr_data: ocrData,
      comment,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Approval webhook failed:', response.status);
      return { duplicate: false };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending approval webhook:', error);
    return { duplicate: false };
  }
};
