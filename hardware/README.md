# Hardware Schematic — Wokwi ESP32 Circuit

## Overview

This directory contains a Wokwi-compatible circuit that demonstrates how office devices would be sensed and monitored in real life. The circuit models **one room** (Drawing Room) with 2 fans and 3 lights, each toggled by a physical slide switch.

## Components

| Component       | Quantity | Purpose                                                                              |
| :-------------- | :------: | :----------------------------------------------------------------------------------- |
| ESP32 DevKit V1 |    1     | Microcontroller — reads switch states, drives status LEDs, reports power over serial |
| Slide switch    |    5     | Manual on/off input for each device                                                  |
| 220Ω resistor   |    5     | Current limiting for status LEDs                                                     |
| LED (yellow)    |    3     | Status indicator for 3 lights                                                        |
| LED (blue)      |    2     | Status indicator for 2 fans                                                          |

## Pin Mapping

### Switch Inputs (INPUT_PULLDOWN)

| Device         |  GPIO   | Role          |
| :------------- | :-----: | :------------ |
| Light 1 switch | GPIO 13 | Digital input |
| Light 2 switch | GPIO 12 | Digital input |
| Light 3 switch | GPIO 14 | Digital input |
| Fan 1 switch   | GPIO 27 | Digital input |
| Fan 2 switch   | GPIO 26 | Digital input |

### LED Outputs

| Device  |  GPIO   | LED Color |
| :------ | :-----: | :-------- |
| Light 1 | GPIO 18 | Yellow    |
| Light 2 | GPIO 19 | Yellow    |
| Light 3 | GPIO 21 | Yellow    |
| Fan 1   | GPIO 22 | Blue      |
| Fan 2   | GPIO 23 | Blue      |

## How It Maps to the Software Model

The firmware reads each switch, mirrors the state to the corresponding LED, and emits a JSON payload every second:

```json
{
  "room": "Drawing Room",
  "devices": [
    { "name": "Light 1", "status": "on", "power": 15 },
    { "name": "Light 2", "status": "off", "power": 0 },
    { "name": "Light 3", "status": "on", "power": 15 },
    { "name": "Fan 1", "status": "on", "power": 60 },
    { "name": "Fan 2", "status": "off", "power": 0 }
  ],
  "totalPower": 90
}
```

- `status` — `"on"` when the switch is HIGH, `"off"` otherwise.
- `power` — rated wattage (lights: 15 W, fans: 60 W) when on, 0 when off.
- `totalPower` — sum of all device wattages in the room.

## Wiring Explanation

1. **Switches:** Each slide switch connects a GPIO pin to 3V3. The ESP32 uses `INPUT_PULLDOWN`, so an open switch reads LOW and a closed switch reads HIGH. The switch output drives the input pin; no external pull-down resistor is needed.

2. **Status LEDs:** Each LED is wired from its GPIO through a 220Ω resistor to GND. The firmware mirrors the switch state to the LED, giving immediate visual feedback of each device.

3. **Serial Output:** The ESP32 prints one JSON object per second at 115200 baud to the hardware serial monitor, enabling the backend to parse room-level power data.

## Running in Wokwi

1. Open [wokwi.com](https://wokwi.com)
2. Create a new ESP32 project
3. Copy `diagram.json` into the project
4. Copy `sketch.ino` as `main.ino`
5. Click "Start" to simulate

Toggle the slide switches to turn devices on/off. The serial monitor will print a JSON status report every second showing device states and total power draw.
