# Hardware Schematic — Wokwi ESP32 Circuit

## Overview

This directory contains a Wokwi-compatible circuit that demonstrates how the office devices would be wired and sensed in real life. The circuit models **one room** (Work Room 1) with 2 fans and 3 lights.

## Components

| Component | Quantity | Purpose |
|:----------|:--------:|:--------|
| ESP32 DevKit V1 | 1 | Microcontroller — reads switch states, controls outputs, reads current |
| LED (yellow) | 3 | Represent 3 lights in the room |
| Servo motor | 2 | Represent 2 fans (spins when ON) |
| 220Ω resistor | 3 | Current limiting for LEDs |
| Slide switch | 5 | Manual on/off input for each device |
| ACS712 current sensor | 1 | Measures total current draw of the room |
| Buzzer | 1 | Audio alert for after-hours or overload conditions |

## Pin Mapping

| Device | GPIO (Output/Input) | Function |
|:-------|:-------------------:|:---------|
| Light 1 | GPIO 25 | LED output |
| Light 2 | GPIO 26 | LED output |
| Light 3 | GPIO 27 | LED output |
| Fan 1 | GPIO 13 | Servo PWM output |
| Fan 2 | GPIO 14 | Servo PWM output |
| Switch 1-5 | GPIO 32-36 | Digital input (pull-up) |
| ACS712 OUT | GPIO 39 | Analog input (ADC1_CH7) |
| Buzzer | GPIO 15 | Digital output |

## How It Maps to the Software Model

The firmware reads the physical switch states and outputs a JSON payload that matches the software simulator's device shape:

```json
{
  "room": "work1",
  "devices": [
    {"id": "work1-light-1", "name": "Light 1", "type": "light", "status": "on", "watts": 15},
    {"id": "work1-light-2", "name": "Light 2", "type": "light", "status": "off", "watts": 15},
    {"id": "work1-light-3", "name": "Light 3", "type": "light", "status": "on", "watts": 15},
    {"id": "work1-fan-1", "name": "Fan 1", "type": "fan", "status": "on", "watts": 60},
    {"id": "work1-fan-2", "name": "Fan 2", "type": "fan", "status": "off", "watts": 60}
  ],
  "current_amps": 0.45,
  "timestamp": 12345
}
```

## Wiring Explanation

1. **Lights (LEDs):** Each LED is connected to an ESP32 GPIO pin through a 220Ω current-limiting resistor. When the GPIO goes HIGH, the light turns ON — mirroring the `status: "on"` state in the software.

2. **Fans (Servos):** Servo motors are driven by PWM signals from the ESP32. When the corresponding switch is ON, the servo spins continuously, representing a running fan.

3. **Switches:** Each device has a slide switch connected to a GPIO pin with internal pull-up. When the switch is closed (LOW), the device is ON. This simulates the physical act of toggling a light or fan.

4. **ACS712 Current Sensor:** The sensor sits on the main power line and measures the total current draw of all devices in the room. The ESP32 reads the analog output and converts it to amperes, providing real power consumption data that maps to the `watts` field in the software model.

5. **Buzzer:** Activated by the ESP32 when alert conditions are detected (e.g., all devices ON after hours), providing a physical audio warning.

## Running in Wokwi

1. Open [wokwi.com](https://wokwi.com)
2. Create a new ESP32 project
3. Copy `diagram.json` into the project
4. Copy `sketch.ino` as `main.ino`
5. Click "Start" to simulate

The serial output will print a JSON payload every 5 seconds showing the current device states and current draw.
