# HL_GAS — Monitoreo y detección de gas

**Objetivo:** Detectar presencia y fugas de gas licuado (GLP) en el hogar usando un sensor MQ-6, un ESP32 como nodo WiFi, y la Raspberry Pi 5 como servidor central. Incluye alertas en tiempo real.

> **Importante:** Este sistema mide concentración de gas en el ambiente (seguridad y detección de fugas), **no el consumo volumétrico exacto** del medidor. Para consumo exacto se requiere un medidor de flujo de gas a presión, lo que debe instalar un técnico certificado por la SEC.

---

## Lista de compras

| Componente | Descripción | Precio aprox. (CLP) | Dónde comprar |
|---|---|---|---|
| MQ-6 | Sensor de gas licuado GLP (el de cocinas y calefont) | $3.000 | MercadoLibre |
| MQ-2 *(opcional)* | Sensor adicional: detecta humo, metano e hidrógeno también | $2.500 | MercadoLibre |
| ESP32 DevKit v1 | Microcontrolador con WiFi integrado | $5.500 | MercadoLibre |
| Resistencia 10kΩ (x1) | Para ajuste de umbral en salida analógica | $100 | MercadoLibre |
| Protoboard pequeña + cables jumper | Para conexiones | $1.500 | MercadoLibre |
| Caja ventilada o soporte abierto | El sensor necesita estar expuesto al aire. NO usar caja cerrada. | $0–$1.500 | MercadoLibre / Impresión 3D |
| Fuente 5V micro-USB 1A+ | Para alimentar el ESP32 | $0–$2.000 | Cargador viejo |

**Total estimado: ~$12.000–$16.000 CLP**

---

## Cómo funciona

El MQ-6 contiene un elemento sensor de óxido de metal (SnO2) que cambia su resistencia eléctrica según la concentración de gas GLP en el aire. A más gas → menor resistencia → mayor voltaje en la salida analógica.

El ESP32 lee ese voltaje, lo convierte a un valor numérico (0–4095 en 12 bits), y lo envía a la RPi 5 por WiFi. Si el valor supera un umbral configurable, dispara una alerta.

El sensor también tiene una salida digital (pin DO) que activa cuando supera un umbral físico ajustable con un potenciómetro. Útil como respaldo de hardware independiente del código.

---

## Conexión: MQ-6 → ESP32

| Pin MQ-6 | ESP32 pin | Descripción |
|---|---|---|
| VCC | 5V | Alimentación (el sensor necesita 5V, no 3.3V) |
| GND | GND | Tierra |
| AO (analógico) | GPIO 34 | Lectura de concentración (0–4095) |
| DO (digital) | GPIO 35 | Salida digital: HIGH cuando supera umbral |

> **Nota:** El MQ-6 se alimenta a 5V pero su salida AO es compatible con los pines ADC del ESP32 a 3.3V. Verificar que el voltaje máximo de salida del módulo que compres no supere 3.3V — la mayoría de los módulos con placa incluida ya tienen este divisor incorporado.

---

## Posición del sensor

El gas licuado GLP (propano/butano) es **más pesado que el aire**, por lo que se acumula en el suelo.

- Instalar el sensor a **30–50 cm del suelo**
- Cerca de la cocina, calefont o estanque de gas
- Nunca dentro de un gabinete cerrado — necesita circulación de aire
- Alejado de fuentes de calor directo (quemadores, horno)
- Con WiFi alcanzable desde esa ubicación

---

## Período de calentamiento

El MQ-6 requiere un período de calentamiento de **24–48 horas** la primera vez que se enciende para estabilizar su elemento sensor. Durante ese tiempo los valores serán inestables y elevados — es normal. Después de ese período inicial, cada encendido requiere solo ~1 minuto de calentamiento.

---

## Software en el ESP32

```cpp
#include <WiFi.h>
#include <PubSubClient.h>

// --- Configuración ---
const char* WIFI_SSID     = "TU_RED_WIFI";
const char* WIFI_PASSWORD = "TU_CONTRASEÑA";
const char* MQTT_SERVER   = "192.168.1.84"; // IP de tu RPi 5
const int   MQTT_PORT     = 1883;
const char* MQTT_TOPIC    = "hogar/gas/nivel";
const char* MQTT_ALERTA   = "hogar/gas/alerta";

// --- Pines ---
const int PIN_ANALOGICO = 34;
const int PIN_DIGITAL   = 35;

// --- Umbral de alerta (ajustar según calibración) ---
// 0 = aire limpio, 4095 = máxima concentración
// Valor típico de alerta: 800–1200
const int UMBRAL_ALERTA = 900;

WiFiClient espClient;
PubSubClient client(espClient);

void conectarWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void conectarMQTT() {
  while (!client.connected()) {
    client.connect("ESP32-Gas");
    delay(500);
  }
}

void setup() {
  pinMode(PIN_DIGITAL, INPUT);
  conectarWiFi();
  client.setServer(MQTT_SERVER, MQTT_PORT);
  conectarMQTT();

  // Esperar calentamiento inicial (60 segundos)
  delay(60000);
}

void loop() {
  if (!client.connected()) conectarMQTT();
  client.loop();

  int valorADC     = analogRead(PIN_ANALOGICO);
  int salidaDigital = digitalRead(PIN_DIGITAL);
  bool hayAlerta   = (valorADC > UMBRAL_ALERTA) || (salidaDigital == HIGH);

  // Nivel en porcentaje relativo al umbral (0–100+)
  float nivelPct = (float)valorADC / 4095.0 * 100.0;

  char payload[128];
  snprintf(payload, sizeof(payload),
    "{\"adc\":%d,\"nivel_pct\":%.1f,\"digital\":%d,\"alerta\":%s}",
    valorADC, nivelPct, salidaDigital, hayAlerta ? "true" : "false");

  client.publish(MQTT_TOPIC, payload);

  if (hayAlerta) {
    client.publish(MQTT_ALERTA, "{\"estado\":\"ALERTA\",\"mensaje\":\"Gas detectado sobre umbral\"}");
  }

  delay(3000); // Publicar cada 3 segundos (más frecuente por seguridad)
}
```

---

## Software en la Raspberry Pi 5

> Asume que ya tienes Mosquitto, InfluxDB y Grafana instalados desde HL_LUZ.

### Script Python con alertas

```python
# /opt/homelettuce/sensores/gas_mqtt_to_influx.py
import paho.mqtt.client as mqtt
import json
import subprocess
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

INFLUX_URL    = "http://localhost:8086"
INFLUX_TOKEN  = "TU_TOKEN_INFLUXDB"
INFLUX_ORG    = "homelettuce"
INFLUX_BUCKET = "sensores"

influx = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)
write_api = influx.write_api(write_options=SYNCHRONOUS)

def enviar_notificacion(mensaje):
    # Notificación en la RPi (requiere notify-send si hay pantalla)
    # Puedes reemplazar esto por un webhook a Telegram, ntfy.sh, etc.
    print(f"⚠️  ALERTA: {mensaje}")
    # subprocess.run(["notify-send", "GAS DETECTADO", mensaje])

def on_message(client, userdata, msg):
    data = json.loads(msg.payload.decode())

    if msg.topic == "hogar/gas/alerta":
        enviar_notificacion(data.get("mensaje", "Gas detectado"))
        return

    # Guardar en InfluxDB
    point = (
        Point("gas")
        .field("adc",       data["adc"])
        .field("nivel_pct", data["nivel_pct"])
        .field("digital",   data["digital"])
        .field("alerta",    1 if data["alerta"] else 0)
    )
    write_api.write(bucket=INFLUX_BUCKET, record=point)

    estado = "⚠️  ALERTA" if data["alerta"] else "OK"
    print(f"Gas: {data['nivel_pct']:.1f}% ({data['adc']} ADC) — {estado}")

mqttc = mqtt.Client()
mqttc.on_message = on_message
mqttc.connect("localhost", 1883)
mqttc.subscribe("hogar/gas/nivel")
mqttc.subscribe("hogar/gas/alerta")
mqttc.loop_forever()
```

### Servicio systemd

```bash
sudo nano /etc/systemd/system/hl-gas.service
```
```ini
[Unit]
Description=HomeLettuce - Sensor Gas
After=network.target mosquitto.service

[Service]
ExecStart=/usr/bin/python3 /opt/homelettuce/sensores/gas_mqtt_to_influx.py
Restart=always
User=pi

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl enable hl-gas
sudo systemctl start hl-gas
```

### Verificar datos en tiempo real

```bash
mosquitto_sub -h localhost -t "hogar/gas/#"
```

---

## Alertas por Telegram (recomendado)

Para recibir alertas en el celular cuando se detecta gas:

1. Crear un bot en Telegram hablando con @BotFather → obtén un `TOKEN`
2. Obtén tu `CHAT_ID` enviándole un mensaje al bot y consultando `https://api.telegram.org/botTOKEN/getUpdates`
3. Reemplaza la función `enviar_notificacion` en el script Python:

```python
import requests

TELEGRAM_TOKEN   = "TU_TOKEN_BOT"
TELEGRAM_CHAT_ID = "TU_CHAT_ID"

def enviar_notificacion(mensaje):
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    requests.post(url, json={
        "chat_id": TELEGRAM_CHAT_ID,
        "text": f"⚠️ HomeLettuce — GAS DETECTADO\n{mensaje}"
    })
```

---

## Calibración del umbral

En aire limpio, el MQ-6 típicamente devuelve valores entre 200–400 ADC. Para calibrar:

1. Deja el sensor encendido 2 minutos en aire limpio
2. Observa el valor base en los logs: `mosquitto_sub -h localhost -t "hogar/gas/nivel"`
3. El `UMBRAL_ALERTA` debe ser ~2× el valor base en aire limpio
4. Para verificar la alerta, acerca brevemente un encendedor (sin encender llama) y comprueba que el valor sube

---

## Notas importantes

- **No instalar en espacios completamente cerrados sin ventilación** — el sensor necesita renovación de aire para funcionar correctamente
- Si el valor ADC está siempre en máximo (4095), puede indicar interferencia eléctrica, sensor defectuoso, o que el voltaje de salida supera 3.3V y está saturando el pin del ESP32
- El MQ-6 tiene una vida útil de aproximadamente 5 años en uso continuo
- Para una instalación de seguridad real y certificada, consultar la normativa SEC Chile y considerar detectores certificados en paralelo
- Este sistema es complementario a las medidas de seguridad estándar: ventilación del recinto, revisión periódica de conexiones, y detector de gas certificado
