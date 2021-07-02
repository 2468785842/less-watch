import * as vscode from 'vscode';
import * as path from 'path';

import { StatusBarUi } from './StatusBarUi';
import { OutputWindow } from './OutputWindow';
import * as LessCompiler from './LessCompiler';
import * as Configuration from "./Configuration";

export class AppModel {
  isWatching: boolean = false;

  static get basePath(): string | undefined {
    if (vscode.window.activeTextEditor) {
      return path.basename(vscode.window.activeTextEditor.document.fileName);
    }
  }

  public constructor() {
    StatusBarUi.init();
    AppModel.basePath;
  }

  public compileAllFiles(document: vscode.TextDocument, watchingMode: boolean = true): void {
    if (this.isWatching) {
      vscode.window.showInformationMessage('already watching...');
      return;
    }
    StatusBarUi.working();


    this.GenerateCssAndMap(document).then(() => {
      if (!watchingMode) {
        this.isWatching = true; // tricky to toggle status
      }
      this.toggleStatusUI();
    });
  }

  public async compileOnSave(document: vscode.TextDocument) {
    if (!this.isWatching) return;

    const currentFile: string = document.fileName;
    if (!currentFile.endsWith('.less')) return;
    OutputWindow.Show('Change Detected...', [path.basename(currentFile)]);

    this.GenerateCssAndMap(document).then(() => {
      OutputWindow.Show('Watching...', null);
    });

  }

  public stopWatching() {
    if (this.isWatching) {
      this.toggleStatusUI();
    }
    else {
      vscode.window.showInformationMessage('Not Watching...');
    }
  }

  public openOutputWindow(): void {

  }

  /**
   * 生成 Css 和 Map
   * @param popUpOutputWindow 
   * @returns 
   */
  private GenerateCssAndMap(document: vscode.TextDocument) {

    return new Promise(resolve => {
      const globalOptions: Configuration.EasyLessOptions = Configuration.getGlobalOptions(
        document
      );
      LessCompiler.compile(document.fileName, document.getText(), globalOptions);
      resolve(null);
    });
  }

  private toggleStatusUI() {
    this.isWatching = !this.isWatching;

    if (!this.isWatching) {
      StatusBarUi.notWatching();
      OutputWindow.Show('Less Watch Stop', null, true);
    }
    else {
      StatusBarUi.watching();
      OutputWindow.Show('Less Watching...', null, true);
    }

  }

  dispose() {
    StatusBarUi.dispose();
    OutputWindow.dispose();
  }
}