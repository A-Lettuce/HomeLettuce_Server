# Vantop Dashboard

Panel de trabajo operativo para Vantop, servicio de transporte privado premium en Santiago de Chile.

**Stack:** Flask (Python) + HTML/CSS/JS vanilla  
**Datos:** Google Sheets y Google Calendar via service account  
**Acceso:** Protegido con htpasswd vía NGINX

---

## 1. Crear el Service Account en Google Cloud Console

1. Entra a [console.cloud.google.com](https://console.cloud.google.com)
2. Crea un proyecto nuevo (ej: `vantop-dashboard`) o usa uno existente
3. Ve a **APIs y servicios → Biblioteca**
4. Habilita las siguientes APIs:
   - **Google Sheets API**
   - **Google Calendar API**
5. Ve a **APIs y servicios → Credenciales**
6. Haz clic en **Crear credenciales → Cuenta de servicio**
7. Ponle un nombre (ej: `vantop-dashboard-sa`) y haz clic en **Listo**
8. Haz clic en la cuenta recién creada → pestaña **Claves**
9. **Agregar clave → Crear clave nueva → JSON**
10. Descarga el archivo JSON y guárdalo en un lugar seguro en el servidor (ej: `/home/cristian/vantop-credentials.json`)

---

## 2. Compartir el Sheet y el Calendar con el Service Account

El email del service account aparece en el archivo JSON descargado, campo `client_email`.  
Tiene el formato: `nombre@proyecto.iam.gserviceaccount.com`

**Google Sheets:**
1. Abre tu Google Spreadsheet en el navegador
2. Haz clic en **Compartir** (esquina superior derecha)
3. Pega el email del service account
4. Dale permiso de **Editor** (para que pueda crear hojas y agregar filas)
5. Haz clic en **Enviar**

**Google Calendar:**
1. Ve a [calendar.google.com](https://calendar.google.com)
2. En la columna izquierda, busca el calendario que quieres usar
3. Haz clic en los tres puntos → **Configuración y uso compartido**
4. Baja hasta **Compartir con personas específicas**
5. Agrega el email del service account con permiso de **Ver todos los detalles de los eventos**
6. Guarda los cambios

---

## 3. Instalar dependencias

```bash
cd vantop-dashboard/
pip install -r requirements.txt
```

Se recomienda usar un entorno virtual:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 4. Configurar el archivo .env

Copia el archivo de ejemplo y edítalo:

```bash
cp .env.example .env
nano .env
```

Completa los valores:

```env
GOOGLE_SHEETS_ID=1ABC...xyz          # ID del spreadsheet (está en la URL)
GOOGLE_CALENDAR_ID=cristian@gmail.com  # Email del calendario
GOOGLE_CREDENTIALS_JSON=/home/cristian/vantop-credentials.json
FLASK_SECRET_KEY=genera-un-string-aleatorio-aqui
```

**Cómo encontrar el ID del Spreadsheet:**  
La URL del sheet se ve así: `https://docs.google.com/spreadsheets/d/1ABC...xyz/edit`  
El ID es la parte entre `/d/` y `/edit`.

---

## 5. Correr el servidor

```bash
python app.py
```

Al iniciar, el servidor verifica que existan las hojas "Clientes" y "Gastos" en el Spreadsheet.  
Si no existen, las crea automáticamente con las columnas correctas.

El servidor queda disponible en `http://localhost:5000`.

---

## 6. Configurar NGINX con htpasswd

### Crear contraseña de acceso

```bash
sudo apt install apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd cristian
# Ingresa la contraseña cuando se solicite
```

### Configuración NGINX

Crea o edita el archivo de configuración del sitio:

```bash
sudo nano /etc/nginx/sites-available/vantop-dashboard
```

Contenido:

```nginx
server {
    listen 80;
    server_name home-lettuce.com;   # o la IP/dominio del servidor

    location / {
        auth_basic "Vantop Panel";
        auth_basic_user_file /etc/nginx/.htpasswd;

        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Habilitar el sitio y reiniciar NGINX:

```bash
sudo ln -s /etc/nginx/sites-available/vantop-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Correr Flask como servicio systemd

Crea el archivo de servicio:

```bash
sudo nano /etc/systemd/system/vantop-dashboard.service
```

Contenido (ajusta las rutas según corresponda):

```ini
[Unit]
Description=Vantop Dashboard
After=network.target

[Service]
User=cristian
WorkingDirectory=/home/cristian/Vantop_ClaudeCode/Vantop_Dashboard
ExecStart=/home/cristian/Vantop_ClaudeCode/Vantop_Dashboard/venv/bin/python app.py
Restart=always
EnvironmentFile=/home/cristian/Vantop_ClaudeCode/Vantop_Dashboard/.env

[Install]
WantedBy=multi-user.target
```

Activar e iniciar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable vantop-dashboard
sudo systemctl start vantop-dashboard
sudo systemctl status vantop-dashboard
```

---

## Estructura del Google Spreadsheet

El dashboard espera (y crea si no existen) dos hojas:

**Hoja "Clientes"** — columnas en orden:
| Cliente | Teléfono | Fecha viaje | Ruta | Monto | Estado | Reseña enviada |

**Hoja "Gastos"** — columnas en orden:
| Fecha | Categoría | Monto | Descripción |

Los valores de **Estado** reconocidos: `Cotizado`, `Confirmado`, `Realizado`, `Cancelado`

Las fechas pueden estar en formato `YYYY-MM-DD` o `DD/MM/YYYY`.

Los montos pueden estar como número (`95000`) o con formato (`$95.000`).
