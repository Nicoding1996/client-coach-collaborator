// server/utils/invoiceUtils.js
import Invoice from '../models/Invoice.js'; // Import the Invoice model to check count/uniqueness

/**
 * Generates a unique invoice number.
 * Example basic strategy: INV-0001, INV-0002 etc. based on document count.
 * WARNING: This simple count-based method is NOT robust for high concurrency
 * or guaranteeing absolute uniqueness across restarts/deletions without
 * more complex logic or a dedicated sequence generator.
 * Consider libraries or database features for production uniqueness.
 *
 * @returns {Promise<string>} A formatted invoice number (e.g., "INV-0001")
 */
export const generateInvoiceNumber = async () => {
    try {
        // Find the count of existing invoices to create a simple sequential number
        // Using estimatedDocumentCount is often faster than countDocuments if exact count isn't critical
        const count = await Invoice.estimatedDocumentCount();
        const nextNumber = count + 1;

        // Format it (e.g., INV-0001)
        const formattedNumber = `INV-${String(nextNumber).padStart(4, '0')}`;

        // OPTIONAL BUT RECOMMENDED FOR MORE ROBUSTNESS:
        // Check if this generated number *already* exists (e.g., after deletions)
        // let checkNumber = formattedNumber;
        // let attempts = 0;
        // while (await Invoice.findOne({ invoiceNumber: checkNumber }) && attempts < 5) {
        //    console.warn(`Invoice number ${checkNumber} collision detected. Generating next.`);
        //    attempts++;
        //    const nextAttemptNumber = count + 1 + attempts;
        //    checkNumber = `INV-${String(nextAttemptNumber).padStart(4, '0')}`;
        // }
        // if (attempts >= 5) {
        //     throw new Error("Failed to generate a unique invoice number after multiple attempts.");
        // }
        // return checkNumber; // Return the potentially regenerated number

        return formattedNumber; // Return the simple formatted number

    } catch (error) {
        console.error("Error generating invoice number:", error);
        // Provide a fallback or re-throw the error
        // Using timestamp ensures uniqueness but isn't user-friendly
        return `INV-ERR-${Date.now()}`;
    }
};

// You can add other invoice-related utility functions here in the future
// export const calculateInvoiceTotal = (lineItems) => { ... };