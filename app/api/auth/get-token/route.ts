import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const accessToken = (await cookies()).get('accessToken')?.value || null;
    const refreshToken = (await cookies()).get('refreshToken')?.value || null;

    return NextResponse.json({ accessToken, refreshToken });
}
