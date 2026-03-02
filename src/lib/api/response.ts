import { NextResponse } from 'next/server';

export function apiError(
  message: string,
  status: number = 500
): NextResponse {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

export function apiSuccess<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(
    typeof data === 'object' && data !== null && 'success' in data
      ? data
      : { success: true, ...(typeof data === 'object' && data !== null ? data : { data }) },
    { status }
  );
}
