
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { token, type } = await request.json();

        if (type === 'access' || type === 'accessToken') {
            const response = NextResponse.json({ message: 'Access token saved successfully' });
            response.headers.set('Set-Cookie', `accessToken=${token}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; Path=/; SameSite=Lax`);
            return response;
        }

        if (type === 'refreshToken') {
            const response = NextResponse.json({ message: 'Refresh token saved successfully' });
            response.headers.set('Set-Cookie', `refreshToken=${token}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; Path=/; SameSite=Lax`);
            return response;
        }

        return NextResponse.json({ message: 'Token type not supported' }, { status: 400 });
    } catch (error) {
        console.error('Error in save-token route:', error);
        return NextResponse.json({ message: 'Failed to save token' }, { status: 500 });
    }
}
