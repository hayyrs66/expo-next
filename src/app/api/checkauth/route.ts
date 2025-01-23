import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
  const tokenObj = req.cookies.get("auth_token");
  const token = tokenObj?.value;

  console.log("Token recibido:", token);

  if (!token) {
    console.error("No se encontró el token en las cookies.");
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const decoded = verify(token, JWT_SECRET);  
    console.log("Token decodificado:", decoded);
    return NextResponse.json({ user: decoded });
  } catch (err) {
    console.error("Error al verificar token:", err);
    return NextResponse.json(
      { error: "Token inválido o expirado" },
      { status: 401 }
    );
  }
}
