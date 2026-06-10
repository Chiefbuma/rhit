import { hashPassword } from '''@/lib/auth''';
import { NextResponse } from '''next/server''';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    if (!password) {
      return new NextResponse('Missing password', { status: 400 });
    }
    const hashedPassword = hashPassword(password);
    return new NextResponse(JSON.stringify({ hashedPassword }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
