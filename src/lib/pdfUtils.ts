import * as pdfjs from 'pdfjs-dist';

// Use unpkg as it's more reliable for specific npm package versions
// and usually includes the build directory structure correctly.
const PDFJS_VERSION = '5.5.207'; 
const version = pdfjs.version || PDFJS_VERSION;

// Try to use the standard .js worker first as it's more compatible across CDNs
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

export const extractTextFromPDF = async (file: File): Promise<string> => {
  console.log("Starting PDF extraction for file:", file.name, "Size:", file.size);
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ 
      data: arrayBuffer,
      // If the worker fails to load, it might fall back to a "fake worker" 
      // which is slow but works. However, we want the real one.
    });
    
    const pdf = await loadingTask.promise;
    console.log("PDF loaded, pages:", pdf.numPages);
    
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Extracting text from page ${i}...`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => {
          if ('str' in item) return item.str;
          return '';
        })
        .join(' ');
      fullText += pageText + '\n';
    }

    console.log("PDF extraction complete. Total text length:", fullText.length);
    return fullText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    
    // Fallback: try one more time with a different worker URL if it's a worker error
    if (error instanceof Error && error.message.includes('worker')) {
      console.log("Retrying with alternative worker URL...");
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
      // We can't easily retry the whole function without recursion or a loop, 
      // but the next call will use the new URL.
    }
    
    throw new Error("Failed to extract text from PDF. Please ensure it's a valid PDF file.");
  }
};
