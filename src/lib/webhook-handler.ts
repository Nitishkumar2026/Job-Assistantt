import { processUserMessage } from './agents';

// This function simulates exactly how the server processes the JSON
export const handleIncomingWebhook = async (payload: any, apiKey: string) => {
    try {
        // 1. Validate Structure (Standard WhatsApp JSON)
        if (
            payload.object === "whatsapp_business_account" &&
            payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
        ) {
            const messageData = payload.entry[0].changes[0].value.messages[0];
            const contactData = payload.entry[0].changes[0].value.contacts?.[0];
            
            const from = messageData.from; // Phone Number
            const text = messageData.text?.body || "[Media/Audio Message]"; // Text content
            const name = contactData?.profile?.name || "Unknown User";

            console.log(`[Webhook Simulator] Processing message from ${name} (${from}): ${text}`);

            // 2. Pass to our AI Agents
            // We use the phone number from the webhook to identify the user
            const responses = await processUserMessage(from, text, apiKey);
            
            return {
                success: true,
                user: { name, phone: from },
                responses: responses
            };
        } else {
            throw new Error("Invalid WhatsApp Webhook JSON Format");
        }
    } catch (error: any) {
        console.error("Webhook Processing Failed:", error);
        return { success: false, error: error.message };
    }
};
