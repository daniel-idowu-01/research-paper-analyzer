import { NextResponse } from "next/server";

export function badRequest(error: string, details?: unknown) {
  return NextResponse.json({ error, details }, { status: 400 });
}

export function unauthorized(error = "Unauthorized") {
  return NextResponse.json({ error }, { status: 401 });
}

export function notFound(error: string) {
  return NextResponse.json({ error }, { status: 404 });
}

export function ok<T>(data: T, init?: { message?: string; status?: number }) {
  return NextResponse.json(
    {
      success: true,
      ...(init?.message ? { message: init.message } : {}),
      ...data,
    },
    { status: init?.status ?? 200 }
  );
}

export function serverError(error: string, details?: unknown) {
  return NextResponse.json({ error, details }, { status: 500 });
}
