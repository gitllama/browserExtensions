# BT

## デバック環境（デバイス側）

### nRF Connect for mobile使用

- ```Advertiser```
  - ```Advertiser data > ADD RECORD``` : ```Complete Local Name```
  - ```Options``` : ```Connectable```
  - ```Tx Power Level``` : 繋がらない場合は調整してみる
  - 接続後は```Configure GATT server```で設定された```sample coonfiguration```が参照される

### C# MAUI

```bash
# 「ワイヤレス デバッグ」のメニュー部分をクリックして詳細画面
# 端末のIPアドレスとワイヤレスデバッグ用のポート番号, pairing code
winget install Google.PlatformTools
adb pair 192.168.10.8:xxxxx
# Enter pairing code: yyyyyy
adb tcpip 41789 #usb繋いだ状態で
# restarting in TCP mode port: xxxxx
adb connect 192.168.10.8:xxxxx
# connected to 192.168.10.8:xxxxx
adb devices
# List of devices attached
# 192.168.10.8:xxxxx      device

adb usb # disconnect
```

### termux + python

bluetoothの権限取得できないので使えない

```bash
pkg update
pkg upgrade

# 必要? pkg install openjdk ndk-sysroot clang cython

pkg install python
python --version
# Python 3.10.6
pip --version
# pip 25.0.1

termux-setup-storage # 内部ストレージにリンクを貼る
cd strage
``` 

## 拡張機能側

JSでビーコン使いたいときは

```
chrome://flags > Experimental Web Platform features
navigator.bluetooth.requestLEScan
```