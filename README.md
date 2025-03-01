# ブラウザ拡張機能

- PC側制御機能も持ったブラウザ拡張機能を作ろう
- スマートフォン向けの拡張機能を作ろう

## Description

- boilerplate

## Requirement

## Usage

## Install

- Chrome
  1. Chromeを開き、```chrome://extensions/``` にアクセス
  1. ```デベロッパーモード```を有効化
  1. ```パッケージ化されていない拡張機能を読み込む```をクリック
  1. 作成したプロジェクトのフォルダーを選択
  1. デバッグ時は```ビューを検証 Service Worker```からコンソールを表示
  1. ```詳細 > サイトの設定 > カメラ```を許可に変更
- Firefox
  1. Firefoxを開き、```about:debugging#/runtime/this-firefox``` にアクセス
  1. ```デベロッパーモード```を有効化
  1. ```パッケージ化されていない拡張機能を読み込む```をクリック
  1. 作成したプロジェクトのフォルダーを選択
  1. デバッグ時は拡張機能名横```調査```からコンソールを表示
- Firefox Developer Edition
  1. Firefoxを開き、```about:config``` にアクセス
  1. ```xpinstall.signatures.required```を```false```に設定。
- Android Edge Canary
  1. ```設定 > Microsoft Edgeについて```
  1. Edge Canary ```<バージョン番号>```を5回タップ
  1. ```設定画面 > 開発者向けオプション```
  1. ```Extension install by id / crx``` (Chromeの```拡張機能 > 拡張機能のパッケージ化```よりcrx取得できる)

## Licence

## Contribution