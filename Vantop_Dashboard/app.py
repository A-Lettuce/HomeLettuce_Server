"""
Dashboard operativo Vantop
Backend Flask — todas las rutas API y configuración Google
"""

import os
import json
import secrets
from datetime import datetime, date, timedelta
from zoneinfo import ZoneInfo
from urllib.parse import urlparse

from flask import Flask, jsonify, request, render_template, redirect, session, url_for
from dotenv import load_dotenv
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-key")
app.config["SESSION_COOKIE_PATH"] = "/"
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = True

ZONA_HORARIA = ZoneInfo("America/Santiago")

# --- Configuración Google ---

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/calendar",
]

SHEETS_ID = os.getenv("GOOGLE_SHEETS_ID")
CALENDAR_ID = os.getenv("GOOGLE_CALENDAR_ID")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
OAUTH_TOKEN_PATH = os.getenv("OAUTH_TOKEN_PATH", "/home/vantop/vantop-token.json")

# Nombres de hojas y encabezados esperados
HOJA_CLIENTES = "Clientes"
HOJA_GASTOS = "Gastos"
ENCABEZADOS_CLIENTES = ["Cliente", "Teléfono", "Fecha viaje", "Ruta", "Monto", "Estado", "Reseña enviada"]
ENCABEZADOS_GASTOS = ["Fecha", "Categoría", "Monto", "Descripción"]


def _app_base_url():
    """Deriva la URL base pública del app desde GOOGLE_REDIRECT_URI.
    Ej: https://home-lettuce.com/vantop-dashboard/auth/callback
     -> https://home-lettuce.com/vantop-dashboard/
    """
    parsed = urlparse(GOOGLE_REDIRECT_URI)
    base_path = parsed.path.split("/auth/callback")[0]
    return f"{parsed.scheme}://{parsed.netloc}{base_path}/"


def _oauth_client_config():
    return {
        "web": {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [GOOGLE_REDIRECT_URI],
        }
    }


def get_google_credentials():
    """
    Carga el token OAuth2 desde disco, lo refresca si expiró.
    Devuelve Credentials válidas o None si no hay token.
    """
    if not os.path.exists(OAUTH_TOKEN_PATH):
        return None

    with open(OAUTH_TOKEN_PATH) as f:
        token_data = json.load(f)

    creds = Credentials.from_authorized_user_info(token_data, SCOPES)

    if not creds.valid:
        if creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                with open(OAUTH_TOKEN_PATH, "w") as f:
                    f.write(creds.to_json())
            except Exception as e:
                print(f"[oauth] Error al refrescar token: {e}")
                return None
        else:
            return None

    return creds


def servicio_sheets():
    """Devuelve cliente autenticado de Google Sheets."""
    creds = get_google_credentials()
    if creds is None:
        raise RuntimeError("Sin autorización OAuth. Visita /auth para conectar.")
    return build("sheets", "v4", credentials=creds)


def servicio_calendar():
    """Devuelve cliente autenticado de Google Calendar."""
    creds = get_google_credentials()
    if creds is None:
        raise RuntimeError("Sin autorización OAuth. Visita /auth para conectar.")
    return build("calendar", "v3", credentials=creds)


def asegurar_hojas():
    """
    Al iniciar, verifica que las hojas Clientes y Gastos existan en el Sheet.
    Si no existen, las crea con los encabezados correctos.
    """
    try:
        sheets = servicio_sheets()
        meta = sheets.spreadsheets().get(spreadsheetId=SHEETS_ID).execute()
        hojas_existentes = [h["properties"]["title"] for h in meta.get("sheets", [])]

        requests_crear = []
        encabezados_pendientes = []

        for titulo, encabezados in [
            (HOJA_CLIENTES, ENCABEZADOS_CLIENTES),
            (HOJA_GASTOS, ENCABEZADOS_GASTOS),
        ]:
            if titulo not in hojas_existentes:
                requests_crear.append({"addSheet": {"properties": {"title": titulo}}})
                encabezados_pendientes.append((titulo, encabezados))
                print(f"[init] Hoja '{titulo}' no encontrada, se creará.")

        if requests_crear:
            sheets.spreadsheets().batchUpdate(
                spreadsheetId=SHEETS_ID,
                body={"requests": requests_crear},
            ).execute()

            datos = []
            for titulo, encabezados in encabezados_pendientes:
                datos.append({
                    "range": f"{titulo}!A1",
                    "values": [encabezados],
                })
            sheets.spreadsheets().values().batchUpdate(
                spreadsheetId=SHEETS_ID,
                body={"valueInputOption": "RAW", "data": datos},
            ).execute()
            print("[init] Hojas creadas con encabezados.")
    except Exception as e:
        print(f"[init] Advertencia al verificar hojas: {e}")


def leer_hoja(nombre_hoja):
    """Lee todas las filas de una hoja y devuelve lista de dicts."""
    sheets = servicio_sheets()
    resultado = (
        sheets.spreadsheets()
        .values()
        .get(spreadsheetId=SHEETS_ID, range=f"{nombre_hoja}!A:Z")
        .execute()
    )
    filas = resultado.get("values", [])
    if not filas:
        return []
    encabezados = filas[0]
    return [
        {encabezados[i]: fila[i] if i < len(fila) else "" for i in range(len(encabezados))}
        for fila in filas[1:]
    ]


def agregar_fila(nombre_hoja, valores):
    """Agrega una fila al final de la hoja especificada."""
    sheets = servicio_sheets()
    sheets.spreadsheets().values().append(
        spreadsheetId=SHEETS_ID,
        range=f"{nombre_hoja}!A1",
        valueInputOption="USER_ENTERED",
        insertDataOption="INSERT_ROWS",
        body={"values": [valores]},
    ).execute()


def parsear_monto(texto):
    """Convierte '$95.000' o '95000' a entero. Devuelve 0 si no puede parsear."""
    if not texto:
        return 0
    limpio = str(texto).replace("$", "").replace(".", "").replace(",", "").strip()
    try:
        return int(float(limpio))
    except ValueError:
        return 0


def hoy_santiago():
    """Fecha de hoy en zona horaria de Santiago."""
    return datetime.now(ZONA_HORARIA).date()


# --- Rutas OAuth2 ---

@app.route("/auth")
def auth():
    """Inicia el flujo OAuth2 con Google."""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET or not GOOGLE_REDIRECT_URI:
        return "OAuth2 no configurado. Revisa las variables de entorno.", 500

    flow = Flow.from_client_config(
        _oauth_client_config(),
        scopes=SCOPES,
        redirect_uri=GOOGLE_REDIRECT_URI,
    )

    state = secrets.token_urlsafe(16)
    session["oauth_state"] = state

    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=state,
    )

    return redirect(auth_url)


@app.route("/auth/callback")
def auth_callback():
    """Recibe el código OAuth2, intercambia por tokens y guarda en disco."""
    state = request.args.get("state", "")
    if state != session.get("oauth_state", ""):
        return "Estado OAuth inválido. Intenta de nuevo visitando /auth.", 400

    flow = Flow.from_client_config(
        _oauth_client_config(),
        scopes=SCOPES,
        redirect_uri=GOOGLE_REDIRECT_URI,
        state=state,
    )

    # Construir la URL de respuesta usando el redirect URI configurado para
    # evitar discrepancias http/https detrás del proxy NGINX/Cloudflare
    auth_response = GOOGLE_REDIRECT_URI + "?" + request.query_string.decode("utf-8")
    flow.fetch_token(authorization_response=auth_response)

    creds = flow.credentials
    with open(OAUTH_TOKEN_PATH, "w") as f:
        f.write(creds.to_json())

    session.pop("oauth_state", None)
    print(f"[oauth] Token guardado en {OAUTH_TOKEN_PATH}")

    return redirect(_app_base_url())


@app.route("/auth/status")
def auth_status():
    """Devuelve JSON indicando si el token OAuth existe y es válido."""
    creds = get_google_credentials()
    conectado = creds is not None and creds.valid
    return jsonify({"conectado": conectado})


# --- Rutas principales ---

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/resumen")
def api_resumen():
    """
    Métricas del bloque superior:
    - servicios_hoy: count de eventos de Google Calendar hoy
    - proximo_servicio: hora del próximo evento del día
    - ingresos_hoy: suma de Monto donde Fecha=hoy y Estado=Realizado
    - leads_pendientes: count de filas donde Estado=Cotizado
    """
    try:
        hoy = hoy_santiago()

        cal = servicio_calendar()
        inicio_dia = datetime.combine(hoy, datetime.min.time()).replace(tzinfo=ZONA_HORARIA)
        fin_dia = datetime.combine(hoy, datetime.max.time()).replace(tzinfo=ZONA_HORARIA)

        eventos_resp = cal.events().list(
            calendarId=CALENDAR_ID,
            timeMin=inicio_dia.isoformat(),
            timeMax=fin_dia.isoformat(),
            singleEvents=True,
            orderBy="startTime",
        ).execute()
        eventos = eventos_resp.get("items", [])

        servicios_hoy = len(eventos)

        ahora = datetime.now(ZONA_HORARIA)
        proximo_servicio = None
        for evento in eventos:
            inicio = evento.get("start", {}).get("dateTime") or evento.get("start", {}).get("date")
            if inicio:
                try:
                    dt = datetime.fromisoformat(inicio)
                    if dt.tzinfo is None:
                        dt = dt.replace(tzinfo=ZONA_HORARIA)
                    if dt >= ahora:
                        proximo_servicio = dt.strftime("%H:%M")
                        break
                except ValueError:
                    pass

        clientes = leer_hoja(HOJA_CLIENTES)
        hoy_str = hoy.strftime("%Y-%m-%d")

        ingresos_hoy = 0
        leads_pendientes = 0
        for fila in clientes:
            fecha_fila = fila.get("Fecha viaje", "").strip()
            estado = fila.get("Estado", "").strip()

            fecha_match = False
            for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"):
                try:
                    fecha_match = datetime.strptime(fecha_fila, fmt).date() == hoy
                    if fecha_match:
                        break
                except ValueError:
                    continue

            if fecha_match and estado.lower() == "realizado":
                ingresos_hoy += parsear_monto(fila.get("Monto", "0"))

            if estado.lower() == "cotizado":
                leads_pendientes += 1

        return jsonify({
            "servicios_hoy": servicios_hoy,
            "proximo_servicio": proximo_servicio or "—",
            "ingresos_hoy": ingresos_hoy,
            "leads_pendientes": leads_pendientes,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/clientes", methods=["GET"])
def api_clientes_get():
    """Lista completa de clientes desde la hoja Clientes."""
    try:
        clientes = leer_hoja(HOJA_CLIENTES)
        return jsonify(clientes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/clientes", methods=["POST"])
def api_clientes_post():
    """
    Agrega un nuevo cliente al Sheet.
    Body JSON: { cliente, telefono, fecha_viaje, ruta, monto, estado, resena_enviada }
    """
    try:
        datos = request.get_json()
        fila = [
            datos.get("cliente", ""),
            datos.get("telefono", ""),
            datos.get("fecha_viaje", ""),
            datos.get("ruta", ""),
            datos.get("monto", ""),
            datos.get("estado", "Cotizado"),
            datos.get("resena_enviada", "No"),
        ]
        agregar_fila(HOJA_CLIENTES, fila)
        return jsonify({"ok": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/calendario")
def api_calendario():
    """
    Eventos de hoy y mañana desde Google Calendar.
    Devuelve: { hoy: [...], manana: [...] }
    Cada evento: { hora, titulo, estado }
    """
    try:
        cal = servicio_calendar()
        hoy = hoy_santiago()
        manana = hoy + timedelta(days=1)

        def obtener_eventos_dia(fecha):
            inicio = datetime.combine(fecha, datetime.min.time()).replace(tzinfo=ZONA_HORARIA)
            fin = datetime.combine(fecha, datetime.max.time()).replace(tzinfo=ZONA_HORARIA)
            resp = cal.events().list(
                calendarId=CALENDAR_ID,
                timeMin=inicio.isoformat(),
                timeMax=fin.isoformat(),
                singleEvents=True,
                orderBy="startTime",
            ).execute()
            eventos = []
            for ev in resp.get("items", []):
                inicio_ev = ev.get("start", {}).get("dateTime") or ev.get("start", {}).get("date")
                hora = "—"
                if inicio_ev:
                    try:
                        dt = datetime.fromisoformat(inicio_ev)
                        if dt.tzinfo is None:
                            dt = dt.replace(tzinfo=ZONA_HORARIA)
                        hora = dt.strftime("%H:%M")
                    except ValueError:
                        pass

                titulo = ev.get("summary", "Sin título")
                descripcion = ev.get("description", "").lower()
                titulo_lower = titulo.lower()
                if "pendiente" in titulo_lower or "pendiente" in descripcion:
                    estado = "Pendiente"
                else:
                    estado = "Confirmado"

                eventos.append({
                    "hora": hora,
                    "titulo": titulo,
                    "estado": estado,
                    "descripcion": ev.get("description", ""),
                })
            return eventos

        return jsonify({
            "hoy": obtener_eventos_dia(hoy),
            "manana": obtener_eventos_dia(manana),
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/finanzas")
def api_finanzas():
    """
    Ingresos y gastos del mes actual.
    Devuelve: { ingresos_mes, gastos_mes, margen }
    """
    try:
        hoy = hoy_santiago()
        mes_actual = hoy.month
        anio_actual = hoy.year

        def es_este_mes(fecha_str):
            for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"):
                try:
                    d = datetime.strptime(fecha_str.strip(), fmt).date()
                    return d.month == mes_actual and d.year == anio_actual
                except ValueError:
                    continue
            return False

        clientes = leer_hoja(HOJA_CLIENTES)
        ingresos_mes = sum(
            parsear_monto(f.get("Monto", "0"))
            for f in clientes
            if f.get("Estado", "").strip().lower() == "realizado"
            and es_este_mes(f.get("Fecha viaje", ""))
        )

        gastos_data = leer_hoja(HOJA_GASTOS)
        gastos_mes = sum(
            parsear_monto(f.get("Monto", "0"))
            for f in gastos_data
            if es_este_mes(f.get("Fecha", ""))
        )

        return jsonify({
            "ingresos_mes": ingresos_mes,
            "gastos_mes": gastos_mes,
            "margen": ingresos_mes - gastos_mes,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/gastos", methods=["GET"])
def api_gastos_get():
    """Últimas 10 filas de la hoja Gastos."""
    try:
        gastos = leer_hoja(HOJA_GASTOS)
        return jsonify(gastos[-10:])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/gastos", methods=["POST"])
def api_gastos_post():
    """
    Registra un nuevo gasto en el Sheet.
    Body JSON: { fecha, categoria, monto, descripcion }
    """
    try:
        datos = request.get_json()
        fila = [
            datos.get("fecha", hoy_santiago().strftime("%Y-%m-%d")),
            datos.get("categoria", ""),
            datos.get("monto", ""),
            datos.get("descripcion", ""),
        ]
        agregar_fila(HOJA_GASTOS, fila)
        return jsonify({"ok": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    if SHEETS_ID and os.path.exists(OAUTH_TOKEN_PATH):
        asegurar_hojas()
    else:
        print("[init] Sin token OAuth o SHEETS_ID — saltando verificación de hojas.")

    app.run(host="0.0.0.0", port=5000, debug=False)
