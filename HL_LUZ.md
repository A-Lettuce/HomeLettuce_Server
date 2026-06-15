# HL_LUZ — Monitoreo de consumo eléctrico

**Objetivo:** Medir el consumo eléctrico del hogar en tiempo real usando una pinza de corriente, un ESP32 como nodo WiFi, y la Raspberry Pi 5 como servidor central.

---

## Lista de compras

| Componente | Descripción | Precio aprox. (CLP) | Dónde comprar |
|---|---|---|---|
| SCT-013 100A | Pinza de corriente no invasiva | $4.500 | MercadoLibre |
| ESP32 DevKit v1 | Microcontrolador con WiFi integrado | $5.500 | MercadoLibre |
| MCP3008 | Convertidor analógico-digital (ADC, 8 canales) | $2.500 | MercadoLibre |
| Resistencias 10kΩ (x2) | Para circuito divisor de voltaje | $300 | MercadoLibre / tienda electrónica |
| Resistencia 33Ω (x1) | Para limitar corriente al ADC | $100 | MercadoLibre / tienda electrónica |
| Capacitor electrolítico 10µF | Para suavizar señal AC | $300 | MercadoLibre |
| Protoboard 400 puntos | Para armar el circuito sin soldar | $1.500 | MercadoLibre |
| Cables jumper macho-macho (x20) | Para conectar componentes en la protoboard | $1.000 | MercadoLibre |
| Fuente 5V micro-USB 1A+ | Para alimentar el ESP32 | $0–$2.000 | Cargador de celular viejo |

**Total estimado: ~$16.000–$18.000 CLP**

---

## Cómo funciona

El cable eléctrico principal de la casa genera un campo magnético proporcional a la corriente que pasa por él. El sensor SCT-013 es una pinza que rodea ese cable y genera una pequeña señal de voltaje AC proporcional a esa corriente, **sin cortar ni tocar el cable directamente**.

El ESP32 no puede leer señales analógicas de alta precisión directamente, así que el MCP3008 actúa como intermediario: convierte la señal analógica del sensor a valores digitales que el ESP32 puede procesar. El ESP32 calcula la potencia en watts y envía los datos a la Raspberry Pi 5 por WiFi usando el protocolo MQTT.

---

## Diagrama de conexiones

```
SCT-013 ──► [ Circuito divisor: R10k + R10k + C10µF ] ──► MCP3008 pin CH0
                                                            │
                                                       ESP32 (SPI)
                                                            │
                                                       WiFi → RPi 5
```

### Conexión MCP3008 → ESP32

| MCP3008 pin | ESP32 pin |
|---|---|
| VDD (pin 16) | 3.3V |
| VREF (pin 15) | 3.3V |
| AGND (pin 14) | GND |
| CLK (pin 13) | GPIO 18 (SCK) |
| DOUT (pin 12) | GPIO 19 (MISO) |
| DIN (pin 11) | GPIO 23 (MOSI) |
| CS (pin 10) | GPIO 5 (CS) |
| DGND (pin 9) | GND |
| CH0 (pin 1) | Salida del circuito divisor |

### Circuito divisor para SCT-013

Conecta entre el pin de salida del SCT-013 y GND:
- Resistencia 10kΩ desde salida SCT → nodo central
- Resistencia 10kΩ desde nodo central → GND
- Capacitor 10µF entre nodo central y GND
- Resistencia 33Ω en serie antes del CH0 del MCP3008

El nodo central (punto medio entre las dos R10k) va al CH0 del MCP3008.

---

## Software en el ESP32

### 1. Instalar Arduino IDE

Descarga desde https://www.arduino.cc/en/software

### 2. Agregar soporte para ESP32

En Arduino IDE → Preferencias → "URLs adicionales de gestor de tarjetas":
```
https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
```
Luego en Herramientas → Gestor de tarjetas → buscar "esp32" → instalar.

### 3. Instalar librería PubSubClient (MQTT)

Herramientas → Administrar bibliotecas → buscar "PubSubClient" → instalar.

### 4. Código para el ESP32

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <SPI.h>

// --- Configuración ---
const char* WIFI_SSID     = "TU_RED_WIFI";
const char* WIFI_PASSWORD = "TU_CONTRASEÑA";
const char* MQTT_SERVER   = "192.168.1.84"; // IP de tu RPi 5
const int   MQTT_PORT     = 1883;
const char* MQTT_TOPIC    = "hogar/luz/watts";

// --- Pines SPI para MCP3008 ---
const int CS_PIN = 5;

WiFiClient espClient;
PubSubClient client(espClient);

// Lee un canal del MCP3008 via SPI
int readMCP3008(int channel) {
  digitalWrite(CS_PIN, LOW);
  SPI.transfer(0x01);
  int highByte = SPI.transfer((0x08 + channel) << 4);
  int lowByte  = SPI.transfer(0x00);
  digitalWrite(CS_PIN, HIGH);
  return ((highByte & 0x03) << 8) + lowByte;
}

// Calcula corriente RMS a partir de muestras del ADC
float calcularCorrienteRMS() {
  long sumaCuadrados = 0;
  int muestras = 1000;
  for (int i = 0; i < muestras; i++) {
    int raw = readMCP3008(0);
    int centrado = raw - 512; // centrar en 0
    sumaCuadrados += centrado * centrado;
    delayMicroseconds(200);
  }
  float rms = sqrt((float)sumaCuadrados / muestras);
  // Factor de calibración: ajustar según medición real vs medidor
  float corriente = (rms / 1024.0) * 3.3 * 30.0;
  return corriente;
}

void conectarWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void conectarMQTT() {
  while (!client.connected()) {
    client.connect("ESP32-Luz");
    delay(500);
  }
}

void setup() {
  pinMode(CS_PIN, OUTPUT);
  SPI.begin();
  conectarWiFi();
  client.setServer(MQTT_SERVER, MQTT_PORT);
  conectarMQTT();
}

void loop() {
  if (!client.connected()) conectarMQTT();
  client.loop();

  float corriente = calcularCorrienteRMS();
  float watts     = corriente * 220.0; // Voltaje Chile = 220V
  float kwh       = watts / 1000.0;

  char payload[64];
  snprintf(payload, sizeof(payload), "{\"watts\":%.1f,\"kwh\":%.3f}", watts, kwh);
  client.publish(MQTT_TOPIC, payload);

  delay(5000); // Enviar cada 5 segundos
}
```

---

## Software en la Raspberry Pi 5

### 1. Instalar Mosquitto (broker MQTT)

```bash
sudo apt update
sudo apt install -y mosquitto mosquitto-clients
sudo systemctl enable mosquitto
sudo systemctl start mosquitto
```

### 2. Verificar que llegan datos del ESP32

```bash
mosquitto_sub -h localhost -t "hogar/luz/watts"
```
Deberías ver mensajes JSON cada 5 segundos.

### 3. Instalar InfluxDB (base de datos de series de tiempo)

```bash
wget -q https://repos.influxdata.com/influxdata-archive_compat.key
echo '23a1c8836f0afc5ed24e0486339d7cc8f6790b83886c4c96995b88a061c5bb5d influxdata-archive_compat.key' | sha256sum -c && cat influxdata-archive_compat.key | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/influxdata-archive_compat.gpg > /dev/null
echo 'deb [signed-by=/etc/apt/trusted.gpg.d/influxdata-archive_compat.gpg] https://repos.influxdata.com/debian stable main' | sudo tee /etc/apt/sources.list.d/influxdata.list
sudo apt update && sudo apt install -y influxdb2
sudo systemctl enable influxdb
sudo systemctl start influxdb
```

### 4. Instalar Grafana (dashboard)

```bash
sudo apt install -y grafana
sudo systemctl enable grafana-server
sudo systemctl start grafana-server
```
Acceder en: `http://192.168.1.84:3000` (usuario: admin, contraseña: admin)

### 5. Script Python para guardar datos MQTT → InfluxDB

```python
# /opt/homelettuce/sensores/luz_mqtt_to_influx.py
import paho.mqtt.client as mqtt
import json
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

INFLUX_URL   = "http://localhost:8086"
INFLUX_TOKEN = "TU_TOKEN_INFLUXDB"
INFLUX_ORG   = "homelettuce"
INFLUX_BUCKET = "sensores"

influx = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)
write_api = influx.write_api(write_options=SYNCHRONOUS)

def on_message(client, userdata, msg):
    data = json.loads(msg.payload.decode())
    point = (
        Point("electricidad")
        .field("watts", data["watts"])
        .field("kwh", data["kwh"])
    )
    write_api.write(bucket=INFLUX_BUCKET, record=point)
    print(f"Guardado: {data['watts']}W")

mqttc = mqtt.Client()
mqttc.on_message = on_message
mqttc.connect("localhost", 1883)
mqttc.subscribe("hogar/luz/watts")
mqttc.loop_forever()
```

Instalar dependencias:
```bash
pip3 install paho-mqtt influxdb-client
```

Correr como servicio systemd:
```bash
sudo nano /etc/systemd/system/hl-luz.service
```
```ini
[Unit]
Description=HomeLettuce - Sensor Luz
After=network.target mosquitto.service

[Service]
ExecStart=/usr/bin/python3 /opt/homelettuce/sensores/luz_mqtt_to_influx.py
Restart=always
User=pi

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl enable hl-luz
sudo systemctl start hl-luz
```

---

## Calibración

El factor `30.0` en el código del ESP32 es el ratio de transformación del SCT-013 (100A / 3.3V ≈ 30). Para calibrar con precisión:

1. Conecta un electrodoméstico de potencia conocida (ej. una estufa de 1000W)
2. Lee el valor que manda el ESP32
3. Ajusta el factor multiplicador hasta que el valor coincida con la potencia real

---

## Notas importantes

- El SCT-013 se coloca en **uno solo** de los cables del par fase/neutro, no en ambos a la vez
- Si tienes instalación trifásica, necesitas un sensor por fase
- El ESP32 debe estar dentro del rango WiFi del router
- Los datos son potencia instantánea (watts). Para calcular kWh acumulados, intégralos en InfluxDB con Flux queries
