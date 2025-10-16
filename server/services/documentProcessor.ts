import { extractText as unpdfExtractText, getDocumentProxy } from 'unpdf';
import mammoth from "mammoth";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { db } from "../db";
import { knowledgeBaseDocuments } from "@shared/schema";
import { eq } from "drizzle-orm";
import { storeDocumentChunks } from "./pineconeService";


// Extract text from PDF
// Extract text from PDF using unpdf
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  console.log("📄 Extracting text from PDF now...");
  const uint8Array = new Uint8Array(buffer);
  const pdf = await getDocumentProxy(uint8Array);
  const { text } = await unpdfExtractText(pdf);
  console.log("✅ Extracted text from PDF, length:", text.length);
  return text.join('\n');  // Join with newlines to preserve paragraph structure
}

// Extract text from DOCX
async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

// Split text into chunks
async function chunkText(text: string): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200, // Overlap to maintain context between chunks
  });

  const chunks = await splitter.splitText(text);
  return chunks;
}

// Main processing function
export async function processDocument(
  documentId: number,
  fileBuffer: Buffer,
  contentType: string,
): Promise<void> {
  try {
    // Update status to processing
    await db
      .update(knowledgeBaseDocuments)
      .set({ status: "processing" })
      .where(eq(knowledgeBaseDocuments.id, documentId));

    // Extract text based on file type
    let text: string;

    if (contentType === "application/pdf") {
      text = await extractTextFromPDF(fileBuffer);
    } else if (
      contentType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      text = await extractTextFromDOCX(fileBuffer);
    } else if (contentType === "text/plain") {
      text = fileBuffer.toString("utf-8");
    } else {
      throw new Error(`Unsupported file type: ${contentType}`);
    }

    // Clean and validate text
    text = text.trim();
    if (!text || text.length < 50) {
      throw new Error("Extracted text is too short or empty");
    }

    // Split into chunks
    const chunks = await chunkText(text);

    // Prepare chunks with indices
    const chunksWithIndex = chunks.map((text, index) => ({
      text,
      index,
    }));

    // Store in Pinecone
    await storeDocumentChunks(documentId, chunksWithIndex);

    // Update document status to completed
    await db
      .update(knowledgeBaseDocuments)
      .set({
        status: "completed",
        chunksCount: chunks.length,
      })
      .where(eq(knowledgeBaseDocuments.id, documentId));

    console.log(
      `✅ Document ${documentId} processed successfully: ${chunks.length} chunks`,
    );
  } catch (error: any) {
    console.error(`❌ Error processing document ${documentId}:`, error);

    // Update status to failed with error message
    await db
      .update(knowledgeBaseDocuments)
      .set({
        status: "failed",
        error: error.message,
      })
      .where(eq(knowledgeBaseDocuments.id, documentId));

    throw error;
  }
}
