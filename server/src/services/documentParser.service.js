import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

export async function parseDocx(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

export async function parsePdf(filePath) {
  const dataBuffer = await import('fs').then(fs => fs.promises.readFile(filePath));
  const data = await pdfParse(dataBuffer);
  return data.text;
}

export async function parseDocument(filePath, mimetype) {
  if (mimetype === 'application/pdf') {
    return parsePdf(filePath);
  }
  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return parseDocx(filePath);
  }
  throw new Error(`Unsupported file type: ${mimetype}`);
}
