import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file: File | null = data.get('file') as unknown as File;
  const studentId = data.get('studentId');
  const documentType = data.get('documentType');

  if (!file || !studentId || !documentType) {
    return NextResponse.json({ success: false, error: 'Missing required fields.' });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Save the file to the server
  const filePath = join(process.cwd(), 'public', 'documents', file.name);
  await writeFile(filePath, buffer);

  // Create a new record in the database
  await query(
    'INSERT INTO portal_student_documents (student_id, document_type, file_path) VALUES ($1, $2, $3)',
    [studentId, documentType, `/documents/${file.name}`]
  );

  return NextResponse.json({ success: true });
}
