/**
 * File-based backup/restore.
 *
 * AsyncStorage lives inside the app's private sandbox, which the OS wipes
 * when the app is uninstalled — so a backup has to end up somewhere
 * outside that sandbox to survive a reinstall. On native this means
 * writing a file and handing it to the share sheet (Drive, Files, email,
 * etc.); on web it means triggering a normal browser download. Restore is
 * the mirror image: a document/file picker reads the backup back in.
 */

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { exportAllData } from './storage';

function backupFileName(): string {
  const date = new Date().toISOString().split('T')[0];
  return `spendwise-backup-${date}.json`;
}

/**
 * Writes a backup file and hands it off to the OS share sheet (native) or
 * triggers a browser download (web), so the user can save it somewhere
 * that survives an app reinstall.
 */
export async function backupToFile(): Promise<void> {
  const json = await exportAllData();
  if (!json) {
    throw new Error('Nothing to back up yet.');
  }

  if (Platform.OS === 'web') {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = backupFileName();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  const fileUri = `${FileSystem.cacheDirectory}${backupFileName()}`;
  await FileSystem.writeAsStringAsync(fileUri, json);

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing isn\'t available on this device.');
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/json',
    dialogTitle: 'Save SpendWise Backup',
  });
}

/**
 * Lets the user pick a previously saved backup file and returns its raw
 * text content. Doesn't touch storage — callers should validate/confirm
 * before actually applying it via `importAllData`. Returns null if the
 * user cancels the picker.
 */
export async function pickBackupFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  const asset = result.assets[0];
  return Platform.OS === 'web'
    ? await (await fetch(asset.uri)).text()
    : await FileSystem.readAsStringAsync(asset.uri);
}
