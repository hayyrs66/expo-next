import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST() {
  try {
    const cookie = serialize("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    });

    return NextResponse.json(
      { message: "Sesión cerrada exitosamente." },
      { headers: { "Set-Cookie": cookie } }
    );
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al cerrar sesión." },
      { status: 500 }
    );
  }
}
