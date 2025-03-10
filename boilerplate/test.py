from jnius import autoclass
autoclass('java.lang.System').out.println('Hello world')

Build = autoclass('android.os.Build')
print(Build.DEVICE)  # デバイス名を表示

# android.content.Contextを試す
Context = autoclass('android.content.Context')
print(Context.BLUETOOTH_SERVICE)

# BluetoothAdapter = autoclass('android.bluetooth.BluetoothAdapter')
# BluetoothDevice = autoclass('android.bluetooth.BluetoothDevice')
# BluetoothSocket = autoclass('android.bluetooth.BluetoothSocket')
# UUID = autoclass('java.util.UUID')

# bluetooth_adapter = BluetoothAdapter.getDefaultAdapter()
# if bluetooth_adapter is None:
#   print("Bluetooth is not supported on this device.")
# else:
#   print("Bluetooth is supported on this device.")