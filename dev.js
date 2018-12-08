const canbus = new (require('../').canbus)({})

const row = "  can0  19FFFB45   [8]  01 78 C8 57 02 C6 6F 17"
canbus.pipe(console.log)
canbus.write(row)
