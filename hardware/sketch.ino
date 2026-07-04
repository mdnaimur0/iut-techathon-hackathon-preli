/*
  Office Room Monitoring System
  Board: ESP32 DevKit V1 (Wokwi Simulation)
*/

// ---------- Input pins: simulated optocoupler / AC-sensing outputs ----------
const int LIGHT1 = 13;
const int LIGHT2 = 12;
const int LIGHT3 = 14;
const int FAN1 = 27;
const int FAN2 = 26;

// ---------- Output pins: status LEDs ----------
const int LIGHT1_LED = 18;
const int LIGHT2_LED = 19;
const int LIGHT3_LED = 21;
const int FAN1_LED = 22;
const int FAN2_LED = 23;

// ---------- Power ratings, in watts ----------
const int LIGHT_POWER_W = 15;
const int FAN_POWER_W = 60;

// ---------- Device table (keeps loop() short and avoids repetition) ----------
const int DEVICE_COUNT = 5;
const char *DEVICE_NAMES[DEVICE_COUNT] = {"Light 1", "Light 2", "Light 3",
                                          "Fan 1", "Fan 2"};
const int INPUT_PINS[DEVICE_COUNT] = {LIGHT1, LIGHT2, LIGHT3, FAN1, FAN2};
const int LED_PINS[DEVICE_COUNT] = {LIGHT1_LED, LIGHT2_LED, LIGHT3_LED,
                                    FAN1_LED, FAN2_LED};
const int RATED_POWER[DEVICE_COUNT] = {LIGHT_POWER_W, LIGHT_POWER_W,
                                       LIGHT_POWER_W, FAN_POWER_W, FAN_POWER_W};

const char *ROOM_NAME = "Drawing Room";

void setup() {
  Serial.begin(115200);

  for (int i = 0; i < DEVICE_COUNT; i++) {
    pinMode(INPUT_PINS[i], INPUT_PULLDOWN);
    pinMode(LED_PINS[i], OUTPUT);
  }
}

void loop() {
  int state[DEVICE_COUNT];
  int power[DEVICE_COUNT];
  int totalPower = 0;

  // Read all five switches and update all LEDs
  for (int i = 0; i < DEVICE_COUNT; i++) {
    state[i] = digitalRead(INPUT_PINS[i]);
    digitalWrite(LED_PINS[i], state[i]);
    power[i] = (state[i] == HIGH) ? RATED_POWER[i] : 0;
    totalPower += power[i];
  }

  // Build and print one JSON status report
  Serial.print("{\"room\":\"");
  Serial.print(ROOM_NAME);
  Serial.print("\",\"devices\":[");

  for (int i = 0; i < DEVICE_COUNT; i++) {
    Serial.print("{\"name\":\"");
    Serial.print(DEVICE_NAMES[i]);
    Serial.print("\",\"status\":\"");
    Serial.print(state[i] == HIGH ? "on" : "off");
    Serial.print("\",\"power\":");
    Serial.print(power[i]);
    Serial.print("}");
    if (i < DEVICE_COUNT - 1) {
      Serial.print(",");
    }
  }

  Serial.print("],\"totalPower\":");
  Serial.print(totalPower);
  Serial.println("}");

  delay(1000);
}