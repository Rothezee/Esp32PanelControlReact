# 📡 Información de Conexión ESP32

## 🌐 **URL del Servidor**
```
https://esp32panelcontrolreact.netlify.app
```

## 🔐 **Credenciales de Acceso**
- **Usuario**: `admin`
- **Contraseña**: `admin123`

## 📋 **Endpoints de la API**

### **Heartbeat (Latido)**
```
POST https://esp32panelcontrolreact.netlify.app/api/esp32/heartbeat
Content-Type: application/json

{
  "device_id": "ESP32_001"
}
```

### **Envío de Datos Genérico**
```
POST https://esp32panelcontrolreact.netlify.app/api/esp32/data
Content-Type: application/json

{
  "device_id": "ESP32_001",
  "coin": 5,
  "pesos": 25,
  "premios": 2,
  "banco": 15
}
```

### **Endpoints Específicos por Tipo de Dispositivo**

#### **Grúa/Máquina de Premios**
```
POST https://esp32panelcontrolreact.netlify.app/api/esp32/data
Content-Type: application/json

{
  "device_id": "ESP32_001",
  "pesos": 30,
  "coin": 3,
  "premios": 1,
  "banco": 20
}
```

#### **Expendedora**
```
POST https://esp32panelcontrolreact.netlify.app/api/esp32/expendedora/data
Content-Type: application/json

{
  "device_id": "EXPENDEDORA_1",
  "dato1": 50,  // fichas
  "dato2": 250  // dinero
}
```

#### **Videojuego**
```
POST https://esp32panelcontrolreact.netlify.app/api/esp32/videojuego/data
Content-Type: application/json

{
  "device_id": "Videojuego_1",
  "dato2": 8  // coin
}
```

#### **Ticketera**
```
POST https://esp32panelcontrolreact.netlify.app/api/esp32/ticketera/data
Content-Type: application/json

{
  "device_id": "Ticket_1",
  "dato2": 5,   // coin
  "dato5": 25   // tickets
}
```

## 🔧 **Código de Ejemplo para ESP32**

### **Configuración WiFi y HTTP**
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Configuración WiFi
const char* ssid = "TU_WIFI_SSID";
const char* password = "TU_WIFI_PASSWORD";

// URL del servidor
const char* serverURL = "https://esp32panelcontrolreact.netlify.app";

// ID único del dispositivo
String deviceID = "ESP32_001";

void setup() {
  Serial.begin(115200);
  
  // Conectar a WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando a WiFi...");
  }
  Serial.println("WiFi conectado!");
}
```

### **Función para Enviar Heartbeat**
```cpp
void sendHeartbeat() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(serverURL) + "/api/esp32/heartbeat");
    http.addHeader("Content-Type", "application/json");
    
    // Crear JSON
    StaticJsonDocument<200> doc;
    doc["device_id"] = deviceID;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Heartbeat enviado: " + response);
    } else {
      Serial.println("Error enviando heartbeat");
    }
    
    http.end();
  }
}
```

### **Función para Enviar Datos de Grúa**
```cpp
void sendGruaData(int pesos, int coin, int premios, int banco) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(serverURL) + "/api/esp32/data");
    http.addHeader("Content-Type", "application/json");
    
    // Crear JSON
    StaticJsonDocument<300> doc;
    doc["device_id"] = deviceID;
    doc["pesos"] = pesos;
    doc["coin"] = coin;
    doc["premios"] = premios;
    doc["banco"] = banco;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Datos enviados: " + response);
    } else {
      Serial.println("Error enviando datos");
    }
    
    http.end();
  }
}
```

### **Función para Enviar Datos de Expendedora**
```cpp
void sendExpendedoraData(int fichas, int dinero) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(serverURL) + "/api/esp32/expendedora/data");
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<200> doc;
    doc["device_id"] = deviceID;
    doc["dato1"] = fichas;
    doc["dato2"] = dinero;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      Serial.println("Datos expendedora enviados");
    }
    
    http.end();
  }
}
```

## ⏰ **Frecuencia Recomendada**
- **Heartbeat**: Cada 5 minutos (300 segundos)
- **Datos**: Cuando ocurra un evento (moneda insertada, premio entregado, etc.)
- **Timeout**: 10 segundos para requests HTTP

## 🆔 **IDs de Dispositivos Existentes**
- `ESP32_001` - Máquina 1 (Grúa)
- `ESP32_002` - Máquina 2 (Grúa)
- `EXPENDEDORA_1` - Expendedora 1
- `Videojuego_1` - Videojuego 1
- `Ticket_1` - Ticketera 1

## 🔍 **Verificación de Conexión**
Para verificar que tu dispositivo se conecta correctamente:

1. **Accede al dashboard**: https://esp32panelcontrolreact.netlify.app
2. **Inicia sesión** con las credenciales proporcionadas
3. **Verifica el estado** de tu dispositivo en el dashboard
4. **Revisa los reportes** para confirmar que los datos llegan correctamente

## 🚨 **Códigos de Respuesta HTTP**
- **200**: Datos recibidos correctamente
- **400**: Error en los datos enviados
- **500**: Error del servidor

## 📞 **Soporte**
Si tienes problemas de conexión:
1. Verifica que el ESP32 tenga conexión a internet
2. Confirma que el device_id sea único y esté registrado
3. Revisa los logs del Serial Monitor para errores HTTP
4. Asegúrate de que el JSON esté bien formateado