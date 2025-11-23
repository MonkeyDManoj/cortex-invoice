const WEBHOOK_URL = 'https://webhook.site/your-webhook-id';

export interface WebhookResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const sendImageToWebhook = async (imageUri: string): Promise<WebhookResponse> => {
  try {
    const formData = new FormData();

    const filename = imageUri.split('/').pop() || 'invoice.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    formData.append('timestamp', new Date().toISOString());
    formData.append('source', 'invoice-manager-app');

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('Webhook error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send image to webhook',
    };
  }
};
