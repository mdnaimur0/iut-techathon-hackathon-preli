/*
 * Office Energy Monitor — ESP32 Firmware
 * 
 * Reads the on/off state of 5 devices (2 fans + 3 lights) via slide switches,
 * measures current draw with an ACS712 sensor, and outputs a JSON payload
 * matching the software simulator's device shape.
 *
 * Hardware:
 *   - ESP32 DevKit V1
 *   - 3x LEDs (lights) with 220Ω resistors on GPIO 25, 26, 27
 *   - 2x Servos (fans) on GPIO 13, 14
 *   - 5x Slide switches (device state inputs) on GPIO 32-36
 *   - 1x ACS712 current sensor on GPIO 39 (analog input)
 *   - 1x Buzzer on GPIO 15 (alert output)
 *
 * Pin mapping (one room — e.g., "Work Room 1"):
 *   Light 1 (GPIO 25) | Switch: GPIO 32
 *   Light 2 (GPIO 26) | Switch: GPIO 33
 *   Light 3 (GPIO 27) | Switch: GPIO 34
 *   Fan 1   (GPIO 13) | Switch: GPIO 35
 *   Fan 2   (GPIO 14) | Switch: GPIO 36
 *   ACS712 OUT: GPIO 39 (ADC1_CH7)
 *   Buzzer: GPIO 15
 */

const int LIGHT_PINS[] = {25, 26, 27};
const int FAN_PINS[] = {13, 14};
const int SWITCH_PINS[] = {32, 33, 34, 35, 36};
const int ACS712_PIN = 39;
const int BUZZER_PIN = 15;

const int NUM_LIGHTS = 3;
const int NUM_FANS = 2;
const int NUM_DEVICES = NUM_LIGHTS + NUM_FANS;

// ACS712-5A: 185 mV/A, 5A max
const float ACS712_SENSITIVITY = 0.185;
const float ACS712_OFFSET = 2.5;
const float ADC_RESOLUTION = 3.3 / 4095.0;

// Device names matching the software model
const char* DEVICE_IDS[] = {
  "work1-light-1", "work1-light-2", "work1-light-3",
  "work1-fan-1", "work1-fan-2"
};
const char* DEVICE_NAMES[] = {
  "Light 1", "Light 2", "Light 3",
  "Fan 1", "Fan 2"
};
const char* DEVICE_TYPES[] = {
  "light", "light", "light",
  "fan", "fan"
};
const int DEVICE_WATTS[] = {
  15, 15, 15,
  60, 60
};

bool deviceStates[NUM_DEVICES] = {false};
unsigned long lastChanged[NUM_DEVICES] = {0};
float currentDraw = 0.0;

void setup() {
  Serial.begin(115200);

  for (int i = 0; i < NUM_LIGHTS; i++) {
    pinMode(LIGHT_PINS[i], OUTPUT);
    digitalWrite(LIGHT_PINS[i], LOW);
  }

  for (int i = 0; i < NUM_FANS; i++) {
    pinMode(FAN_PINS[i], OUTPUT);
    digitalWrite(FAN_PINS[i], LOW);
  }

  for (int i = 0; i < NUM_DEVICES; i++) {
    pinMode(SWITCH_PINS[i], INPUT_PULLUP);
  }

  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  Serial.println("Office Energy Monitor — ESP32 Started");
}

void readSwitches() {
  for (int i = 0; i < NUM_DEVICES; i++) {
    bool newState = (digitalRead(SWITCH_PINS[i]) == LOW);
    if (newState != deviceStates[i]) {
      deviceStates[i] = newState;
      lastChanged[i] = millis();

      if (i < NUM_LIGHTS) {
        digitalWrite(LIGHT_PINS[i], newState ? HIGH : LOW);
      } else {
        digitalWrite(FAN_PINS[i - NUM_LIGHTS], newState ? HIGH : LOW);
      }
    }
  }
}

float readCurrent() {
  long total = 0;
  const int samples = 100;
  for (int i = 0; i < samples; i++) {
    total += analogRead(ACS712_PIN);
    delayMicroseconds(200);
  }
  float voltage = (total / (float)samples) * ADC_RESOLUTION;
  float current = (voltage - ACS712_OFFSET) / ACS712_SENSITIVITY;
  return abs(current);
}

void outputJSON() {
  Serial.print("{");
  Serial.print("\"room\":\"work1\",");
  Serial.print("\"devices\":[");
  for (int i = 0; i < NUM_DEVICES; i++) {
    if (i > 0) Serial.print(",");
    Serial.print("{");
    Serial.print("\"id\":\""); Serial.print(DEVICE_IDS[i]); Serial.print("\",");
    Serial.print("\"name\":\""); Serial.print(DEVICE_NAMES[i]); Serial.print("\",");
    Serial.print("\"type\":\""); Serial.print(DEVICE_TYPES[i]); Serial.print("\",");
    Serial.print("\"status\":\""); Serial.print(deviceStates[i] ? "on" : "off"); Serial.print("\",");
    Serial.print("\"watts\":"); Serial.print(DEVICE_WATTS[i]); Serial.print(",");
    Serial.print("\"last_changed\":"); Serial.print(lastChanged[i]);
    Serial.print("}");
  }
  Serial.print("],");
  Serial.print("\"current_amps\":"); Serial.print(currentDraw, 3);
  Serial.print(",\"timestamp\":"); Serial.print(millis());
  Serial.println("}");
}

void loop() {
  readSwitches();
  currentDraw = readCurrent();
  outputJSON();
  delay(5000);
}
