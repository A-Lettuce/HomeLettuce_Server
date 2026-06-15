# HL_AGUA — Monitoreo de consumo de agua

**Objetivo:** Medir el consumo de agua del hogar en litros usando un caudalímetro, un ESP32 como nodo WiFi, y la Raspberry Pi 5 como servidor central.

---

## Lista de compras

### Electrónica

| Componente | Descripción | Precio aprox. (CLP) | Dónde comprar |
|---|---|---|---|
| YF-S201 | Caudalímetro de efecto Hall, 1-30 L/min, rosca 1/2" | $4.000 | MercadoLibre |
| ESP32 DevKit v1 | Microcontrolador con WiFi integrado | $5.500 | MercadoLibre |
| Resistencia 10kΩ (x1) | Pull-up para señal del sensor | $100 | MercadoLibre |
| Caja estanca IP65 (10×10cm) | Protección del ESP32 en ambiente húmedo | $3.500 | MercadoLibre / Sodimac |
| Protoboard pequeña + cables jumper | Para conexiones internas en la caja | $1.500 | MercadoLibre |
| Fuente 5V micro-USB 1A+ | Para alimentar el ESP32 | $0–$2.000 | Cargador viejo |
| Cable USB 1-2m | Para llevar energía desde enchufe cercano | $1.000 | MercadoLibre |

### Gasfitería

| Componente | Descripción | Precio aprox. (CLP) | Dónde comprar |
|---|---|---|---|
| Fitting rosca macho 1/2" (x2) | Adapta el sensor a la cañería | $1.500 | Sodimac / Easy |
| Llave de paso esfera 1/2" | Queda instalada, permite cortar el agua | $3.500 | Sodimac / Easy |
| Teflón (1 rollo) | Sellante para uniones roscadas | $500 | Sodimac / Easy |
| Pasta sellante para agua | Refuerzo extra para uniones | $800 | Sodimac / Easy |

**Total estimado: ~$22.000–$24.000 CLP**

> **Nota:** Si necesitas un gasfíter solo para el corte e instalación del sensor, calcula ~$25.000–$40.000 adicionales por una hora de trabajo.

---

## Cómo funciona

El YF-S201 contiene una pequeña turbina (hélice) y un sensor de efecto Hall. Cuando el agua fluye, hace girar la turbina. Cada giro genera un pulso eléctrico. El ESP32 cuenta esos pulsos: **aproximadamente 450 pulsos = 1 litro** (varía entre unidades, se calibra en el paso final).

El ESP32 acumula los pulsos, calcula litros, y envía el dato a la Raspberry Pi 5 por WiFi usando MQTT.

---

## Diagrama de instalación

### Posición en la cañería

```
[Medidor agua]──► [Llave de paso] ──► [YF-S201] ──► [resto de la casa]
                  (nueva, queda fija)   (sensor)
```

Instalar en la cañería de **entrada principal** de agua fría, antes de la derivación al calefont y a los baños. Así mides el 100% del consumo.

### Conexión eléctrica: YF-S201 → ESP32

| Cable del YF-S201 | ESP32 pin |
|---|---|
| Rojo (VCC) | 5V |
| Negro (GND) | GND |
| Amarillo (señal) | GPIO 4 |

Además: conectar una resistencia 10kΩ entre el cable amarillo (señal) y el pin 5V. Esto es el pull-up que estabiliza la señal.

### Diagrama de caja estanca

```
┌─────────────────────────┐
│  Caja IP65               │
│  ┌───────┐               │
│  │ ESP32 │               │
│  └───────┘               │
│  Cable USB →  [ enchufe ]│
│  Cables YF-S201 →  [sensor en cañería, fuera de la caja]
└─────────────────────────┘
```

---

## Instalación física paso a paso

1. **Cierra la llave de paso general** de la casa (típicamente cerca del medidor de agua en la calle o en el antejardín)
2. **Abre una llave de agua** dentro de la casa para liberar la presión residual
3. **Marca el punto de corte** en la cañería de entrada. Deja al menos 15 cm de espacio para insertar el sensor + fittings
4. **Corta la cañería** con sierra de arco o cortador de tubos. Limpia bien las rebabas
5. **Instala la llave de paso** nueva primero (con teflón en las roscas), orientada de modo que quede accesible para futuras mantenciones
6. **Instala el YF-S201** a continuación, respetando la dirección de flujo indicada por la flecha impresa en el cuerpo del sensor
7. **Conecta con fittings roscados** al tramo siguiente de cañería. Envuelve bien cada rosca con teflón (3-4 vueltas) y aplica pasta sellante
8. **Abre la llave de paso** lentamente y revisa que no haya goteras en ninguna unión. Si gotea, cierra y aprieta más el fitting
9. **Abre la llave general** de la calle
10. **Coloca el ESP32** en la caja estanca cerca del sensor y pasa los cables del sensor por un prensaestopas (agujero de la caja con sello de goma)

---

## Software en el ESP32

### Código

```cpp
#include <WiFi.h>
#include <PubSubClient.h>

// --- Configuración ---
const char* WIFI_SSID     = "TU_RED_WIFI";
const char* WIFI_PASSWORD = "TU_CONTRASEÑA";
const char* MQTT_SERVER   = "192.168.1.84"; // IP de tu RPi 5
const int   MQTT_PORT     = 1883;
const char* MQTT_TOPIC    = "hogar/agua/litros";

// --- Pin y calibración ---
const int SENSOR_PIN        = 4;
const float PULSOS_POR_LITRO = 450.0; // Ajustar en calibración

volatile long contadorPulsos = 0;
float litrosTotales           = 0.0;

WiFiClient espClient;
PubSubClient client(espClient);

// Interrupción: se ejecuta en cada pulso del sensor
void IRAM_ATTR contarPulso() {
  contadorPulsos++;
}

void conectarWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void conectarMQTT() {
  while (!client.connected()) {
    client.connect("ESP32-Agua");
    delay(500);
  }
}

void setup() {
  pinMode(SENSOR_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(SENSOR_PIN), contarPulso, FALLING);
  conectarWiFi();
  client.setServer(MQTT_SERVER, MQTT_PORT);
  conectarMQTT();
}

void loop() {
  if (!client.connected()) conectarMQTT();
  client.loop();

  // Leer y resetear contador de forma segura
  noInterrupts();
  long pulsos = contadorPulsos;
  contadorPulsos = 0;
  interrupts();

  float litrosEnPeriodo = pulsos / PULSOS_POR_LITRO;
  litrosTotales += litrosEnPeriodo;

  char payload[128];
  snprintf(payload, sizeof(payload),
    "{\"litros_periodo\":%.3f,\"litros_total\":%.2f,\"pulsos\":%ld}",
    litrosEnPeriodo, litrosTotales, pulsos);
  client.publish(MQTT_TOPIC, payload);

  delay(5000); // Publicar cada 5 segundos
}
```

---

## Software en la Raspberry Pi 5

> Asume que ya tienes Mosquitto, InfluxDB y Grafana instalados desde HL_LUZ.

### Script Python para guardar datos MQTT → InfluxDB

```python
# /opt/homelettuce/sensores/agua_mqtt_to_influx.py
import paho.mqtt.client as mqtt
import json
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

INFLUX_URL    = "http://localhost:8086"
INFLUX_TOKEN  = "TU_TOKEN_INFLUXDB"
INFLUX_ORG    = "homelettuce"
INFLUX_BUCKET = "sensores"

influx = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)
write_api = influx.write_api(write_options=SYNCHRONOUS)

def on_message(client, userdata, msg):
    data = json.loads(msg.payload.decode())
    point = (
        Point("agua")
        .field("litros_periodo", data["litros_periodo"])
        .field("litros_total",   data["litros_total"])
        .field("pulsos",         data["pulsos"])
    )
    write_api.write(bucket=INFLUX_BUCKET, record=point)
    print(f"Guardado: {data['litros_periodo']:.3f} L (total: {data['litros_total']:.2f} L)")

mqttc = mqtt.Client()
mqttc.on_message = on_message
mqttc.connect("localhost", 1883)
mqttc.subscribe("hogar/agua/litros")
mqttc.loop_forever()
```

### Servicio systemd

```bash
sudo nano /etc/systemd/system/hl-agua.service
```
```ini
[Unit]
Description=HomeLettuce - Sensor Agua
After=network.target mosquitto.service

[Service]
ExecStart=/usr/bin/python3 /opt/homelettuce/sensores/agua_mqtt_to_influx.py
Restart=always
User=pi

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl enable hl-agua
sudo systemctl start hl-agua
```

### Verificar datos en tiempo real

```bash
mosquitto_sub -h localhost -t "hogar/agua/litros"
```
Abre una llave de agua: deberías ver los pulsos aumentar en tiempo real.

---

## Calibración

El valor `450.0` (pulsos por litro) es el valor típico del YF-S201, pero varía entre unidades. Para calibrar:

1. Busca un recipiente de volumen conocido (ej. botella de 2 litros)
2. Abre la llave y llena el recipiente completamente
3. Observa cuántos pulsos contó el ESP32 para esos 2 litros
4. Divide: `PULSOS_POR_LITRO = pulsos_contados / 2.0`
5. Actualiza el valor en el código y vuelve a cargar al ESP32

---

## Notas importantes

- El YF-S201 soporta hasta 30 L/min y presiones de hasta 1.75 MPa, suficiente para instalaciones domiciliarias estándar en Chile
- La flecha en el cuerpo del sensor indica la dirección del flujo. Instalarlo al revés no daña el sensor pero da lecturas incorrectas
- El sensor no es apto para agua caliente. Instalar siempre en la línea de agua fría, antes del calefont
- La caja estanca IP65 protege la electrónica de la humedad ambiental, pero los cables del sensor que van hacia afuera deben sellar bien los orificios de entrada
- Si el contador llega a números muy altos sin haber abierto ninguna llave, puede indicar una micro-gotería en alguna parte de la instalación — dato valioso por sí solo
