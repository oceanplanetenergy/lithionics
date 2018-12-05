# Lithionics BMS Communication

[Info PDF](https://lithionicsbattery.com/wp-content/uploads/2018/06/NeverDie-BMS-Advanced-CANbus-protocol-Rev8.0.00.R1-1.pdf)

| Message                 | PGN     | PGN    | Notes                                                          |
|-------------------------|---------|--------|----------------------------------------------------------------|
| REQUEST                 | 0xEA##  |        | BMS listens and responds to these messages                     |
| ADDRESS_CLAIM           | 0xEE##  |        | BMS will claim preset SA=0x45, but can be changed in config    |
| DM_RV                   | 0x1FECA |        | Diagnostic data as defined in RV-C specs                       |
| PRODUCT_ID              | 0xFEEB  |        | Single frame ID string = LI3*8**                               |
| DC_SOURCE_STATUS_1      | 0x1FFFD | 131069 | Battery Voltage and Current data                               |
| DC_SOURCE_STATUS_2      | 0x1FFFC | 131068 | Battery Temperature and SOC data                               |
| DC_SOURCE_STATUS_3      | 0x1FFFB | 131067 | provides remaining Ah capacity                                 |
| DC_SOURCE_STATUS_4      | 0x1FEC9 |        | provides desired charger state and charge specs                |
| DC_SOURCE_STATUS_6      | 0x1FEC7 |        | provides HVC and LVC status                                    |
| DC_SOURCE_STATUS_11     | 0x1FEA5 |        | provides more status bits, total Ah capacity and current Power |
| DC_SOURCE_COMMAND       | 0x1FEA4 |        | accepts ON/OFF/Charge-ON commands                              |
| PROP_LITHIONICS_COMMAND | 0xEF45  |        | accepts request for proprietary status data                    |
| PROP_LITHIONICS_STATUS  | 0xEF##  |        | provides proprietary status bits and other data                |

RV-C values are **little endian**.

## rvcDcSourceStatus1 0x1FFFD 131069 (8 bytes)

This message provides battery Voltage and Current data. Message is sent every 1 second.

| Byte |       Name      | Data Type | Default |                                       Value Definition                                      |
|:----:|:---------------:|:---------:|:-------:|:-------------------------------------------------------------------------------------------:|
| 0    | Instance        | uint8     | 1       | Battery instance or BAT_ID. Change in BMS config to allow multiple BMS systems on same bus. |
| 1    | Device Priority | uint8     | 120     | Device type as BMS, see RV- C specs for details                                             |
| 2-3  | Battery Voltage | uint16    | 13.8v   | Precision = 0.05V Example – 0x010E = 13.5V                                                  |
| 4-7  | Battery Current | uint32    | 0       | Amps of Discharge Current. Positive value = discharge - Negative value = charge             |

## Example
| Instance | Priority | Volts  | Amps Used            |
|----------|----------|--------|----------------------|
| 01       | 78       | 0x1401 | 0x00943577           |
| 1        | 120      | 276    | 2000000000           |
| -        | -        | * 0.05 | -2000000000, * 0.001 |
| 1        | 120      | 13.8   | 0                    |

## rvcDcSourceStatus2 0x1FFFC 131068 (7 bytes)

| Byte | Name            | Data Type | Default | Value Definition                                                                            |
|------|-----------------|-----------|---------|---------------------------------------------------------------------------------------------|
| 0    | Instance        | uint8     | 1       | Battery instance or BAT_ID. Change in BMS config to allow multiple BMS systems on same bus. |
| 1    | Device Priority | uint8     | 120     | Device type as BMS, see RV- C specs for details                                             |
| 2-3  | Battery Temp    | uint16    | 0       | Precision = 0.003125 °C Offset – 0 °C = 0x2220 (8736) Example – 0x2540 (9536) = 25 °C       |
| 4    | State of charge | uint 8    | 198     | Precision = 0.5% Example – 0xC8 = 100%                                                      |
| 5-6  | Time Remaining  | uint16    | 0       | Remaining Discharge Time                                                                    |

### Example
| Instance | Priority | Temp                    | SOC   | Time Minutes    |
|----------|----------|-------------------------|-------|-----------------|
| 01       | 78       | 0x8024                  | C6    | 0x64F1          |
| 1        | 120      | 9344                    | 198   | 61796           |
| -        | -        | -8736, (608) * 0.003125 | * 0.5 |                 |
| 1        | -        | 1.9                     | 99    | 30898 21.4 days |

## rvcDcSourceStatus3 0x1FFFB 131067 (6 bytes)

| Byte |             Name             | Data Type | Default | Unit |                                       Value Definition                                      |
|------|------------------------------|-----------|---------|------|---------------------------------------------------------------------------------------------|
| 0    | Instance                     | uint8     | 1       |      | Battery instance or BAT_ID. Change in BMS config to allow multiple BMS systems on same bus. |
| 1    | Device Priority              | uint8     | 120     |      | Device type as BMS, see RV- C specs for details                                             |
| 2    | State of Health              | uint8     | 100     | %    | Precision = 0.5%. always set to 100%                                                        |
| 3-4  | Remaining Discharge Capacity | uint16    | Ah      | Ah   | Precision = 1Ah Example – 0x015E = 350Ah                                                    |
| 5    | Remaining Relative Capacity  | uint8     |         | %    | Same as State of Charge data. Precision = 0.5%                                              |

### Example
| Instance | Priority | Health % | Ah   | SOC   |
|----------|----------|----------|------|-------|
| 01       | 78       | C8       | 5702 | C6    |
| 1        | 120      | 200      | 599  | 198   |
|          |          | * 0.5    |      | * 0.5 |
|          |          | 100      | 599  | 99    |
