
import math

def get_shutter_label(val):
    if val >= 1:
        if val >= 172800: # 2d
             return "2d 0h"
        if val >= 3600:
            h = val / 3600
            return f"{int(h)}h"
        if val >= 60:
            return f"{int(val/60)}m"
        return f"{int(val)}s"
    else:
        denom = int(round(1/val))
        return f"1/{denom}s"

shutters = []
# Fast: 1/64000 to 1/8000 (powers of 2)
cur = 64000
while cur > 8000:
    shutters.append(1.0/cur)
    cur = cur / 2

# Standard denominators
denoms = [8000, 4000, 2000, 1000, 500, 250, 125, 60, 30, 15, 8, 4, 2, 1]
for d in denoms:
    if d == 1: shutters.append(1)
    else: shutters.append(1.0/d)

# Slow
slow = [2, 4, 8, 15, 30]
shutters.extend(slow)

# Extended
extended = [60, 120, 240, 480, 900, 1800, 3600, 7200, 14400, 28800, 43200, 86400, 172800]
shutters.extend(extended)

print("export const PRESET_SHUTTERS = [")
for s in shutters:
    if s < 1:
        denom = int(round(1/s))
        print(f"  {{ value: 1/{denom}, label: '{get_shutter_label(s)}' }},")
    else:
        print(f"  {{ value: {s}, label: '{get_shutter_label(s)}' }},")
print("];")

print("export const PRESET_APERTURES = [")
vals = [0.5, 0.7, 0.95, 1.0, 1.1, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.5, 2.8, 3.2, 3.5, 4.0, 4.5, 5.0, 5.6, 6.3, 7.1, 8.0, 9.0, 10, 11, 13, 14, 16, 18, 20, 22, 25, 29, 32, 36, 40, 45, 51, 57, 64, 72, 81, 90, 101, 114, 128, 144, 161, 180, 203, 228, 256]
print(", ".join(map(str, vals)))
print("];")

print("export const PRESET_ISOS = [")
isos = [1, 3, 6, 12, 25, 50, 64, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6400, 8000, 10000, 12800, 16000, 20000, 25600, 51200, 102400, 204800, 409600, 509600]
print(", ".join(map(str, isos)))
print("];")
