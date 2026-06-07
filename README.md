# HomeLettuce

Repositorio raíz del servidor doméstico alojado en una Raspberry Pi y expuesto públicamente en **home-lettuce.com** mediante un túnel Cloudflare.

## Estructura

```
HomeLettuce/
├── Home/                        # Página de inicio estática (HTML/CSS)
│   └── index.html
│
├── Vantop_Dashboard/            # Dashboard operativo personal (Flask + Google APIs)
│   ├── app.py                   # Backend: rutas API, OAuth Google
│   ├── templates/index.html     # UI principal
│   ├── static/                  # JS y CSS del dashboard
│   ├── requirements.txt
│   └── .env.example             # Variables requeridas (ver abajo)
│
└── deploy/                      # Configuración de infraestructura
    ├── nginx-home-lettuce.conf  # Nginx: sirve Home en / y proxea el dashboard en /vantop-dashboard/
    ├── vantop-dashboard.service # systemd: mantiene Flask corriendo
    └── cloudflared-home.service # systemd: túnel Cloudflare hacia home-lettuce.com
```

## Cómo funciona

```
Internet → Cloudflare Tunnel → Nginx (80) → /              → Home (HTML estático)
                                           → /vantop-dashboard/ → Flask :5000
```

## Variables de entorno (`Vantop_Dashboard/.env`)

Ver `.env.example`. Requiere credenciales de Google OAuth (Sheets + Calendar) y un `FLASK_SECRET_KEY`.

## Servicios systemd

```bash
sudo systemctl enable --now cloudflared-home     # Túnel Cloudflare
sudo systemctl enable --now vantop-dashboard     # Flask dashboard
```
