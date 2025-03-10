#r "nuget: Microsoft.Windows.SDK.Contracts, 10.0.26100.1742"

using System;
using System.Threading.Tasks;
using System.IO;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Devices.Bluetooth;
using Windows.Devices.Bluetooth.GenericAttributeProfile;

var gattServiceProviderResult = await GattServiceProvider.CreateAsync(new Guid("0001234-0000-1000-8000-00805F9B34FB"));
  if (gattServiceProviderResult.Error != BluetoothError.Success) {
    Console.WriteLine("GATT Serviceの起動に失敗(Bluetooth LE対応デバイスがない?)");
    return;
  }

var gattServiceProvider = gattServiceProviderResult.ServiceProvider;
