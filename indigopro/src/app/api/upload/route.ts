import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text;
  } catch {
    throw new Error('Failed to parse PDF');
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const filename = file.name;
    const ext = filename.split('.').pop()?.toLowerCase();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text = '';

    if (ext === 'pdf') {
      text = await extractTextFromPDF(buffer);
    } else if (['txt', 'md', 'markdown'].includes(ext ?? '')) {
      text = buffer.toString('utf-8');
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload .pdf, .txt, or .md files.' },
        { status: 400 }
      );
    }

    const wordCount = text.split(/\s+/).filter(Boolean).length;

    return NextResponse.json({ text, filename, wordCount });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
