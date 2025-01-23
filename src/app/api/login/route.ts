import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { serialize } from "cookie";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const JWT_SECRET = process.env.JWT_SECRET || "supersecreto";

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    console.log("Datos recibidos del cliente:", { username, password });

    if (!username || !password) {
      console.log("Faltan datos del cliente");
      return NextResponse.json(
        { error: "Por favor, proporciona usuario y contraseña." },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, user, password")
      .eq("user", username)
      .single();

    console.log("Resultado de la consulta a Supabase:", { user, error });

    if (error || !user) {
      console.log("Usuario no encontrado o error en la base de datos");
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos." },
        { status: 401 }
      );
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      console.log("Contraseña incorrecta");
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos." },
        { status: 401 }
      );
    }
    const token = generateToken({ id: user.id, username: user.user });

    console.log("Token generado:", token);

    const cookie = serialize("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600,
      path: "/",
    });

    console.log("Cookie creada:", cookie);

    return NextResponse.json(
      { message: "Inicio de sesión exitoso." },
      { headers: { "Set-Cookie": cookie } }
    );
  } catch (error) {
    console.error("Error en /api/login:", error);
    return NextResponse.json(
      { error: "Ocurrió un error inesperado." },
      { status: 500 }
    );
  }
}
