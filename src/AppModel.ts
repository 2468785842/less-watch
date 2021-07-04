import * as vscode from 'vscode';
import * as path from 'path';
import * as glob from 'glob';

import { StatusBarUi } from './StatusBarUi';
import { OutputWindow } from './OutputWindow';
import { LessCompiler } from './LessCompiler';
import { getDocument } from './extension';

export class AppModel {

  private isWatching: boolean = false;

  public constructor() {
    StatusBarUi.init();
  }

  public compileAllFiles(watchingMode: boolean = true): void {

    if (watchingMode) {
      vscode.window.showInformationMessage('already watching...');
    }

    StatusBarUi.working();

    const excludes: Array<string> | undefined = LessCompiler.globalOptions.excludes;
    const rootPath: string | undefined = vscode.workspace.rootPath;

    if (excludes && rootPath) {

      if (!vscode.workspace.rootPath) throw "workspace Error";

      let basePath: string = vscode.workspace.rootPath;
      let compileListAsync: Promise<Error | void>[] = [];

      //glob搜索文件
      glob('**/*.less', { cwd: basePath, mark: true, ignore: excludes },
        (error: Error | null, fileList: string[]) => {

          if (error) throw "编译所有文件时出错!";

          fileList.forEach((val: string) => {
            compileListAsync.push(
              this.GenerateCssAndMap(path.join(basePath, val))
            );
          });
        }
      );

      Promise.all(compileListAsync).then(() => {
        if (watchingMode) {
          this.toggleStatusUI();
        }
      });
    }

  }

  public compileOnSave() {
    const document: vscode.TextDocument | undefined = getDocument();

    if (!this.isWatching || !document) return;

    const currentFile: string = document.fileName;

    if (!currentFile.endsWith('.less')) return;

    OutputWindow.Show('Change Detected...', [path.basename(currentFile)]);

    this.GenerateCssAndMap(currentFile).then(() => {
      OutputWindow.Show('Watching...', null);
    }, error => {
      OutputWindow.Show(error, ['Error In: ', path.basename(currentFile)]);
      StatusBarUi.compilationError(this.isWatching);
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
    LessCompiler.globalOptions.outputWindow = true;
  }

  /**
   * 生成 Css 和 Map
   */
  private GenerateCssAndMap(lessFile: string): Promise<Error | void> {

    return new Promise((resolve, reject) => {

      LessCompiler.compile(lessFile).then(() => {
        StatusBarUi.compilationSuccess(this.isWatching);
        resolve();
      }).catch(error => {
        StatusBarUi.compilationError(this.isWatching);
        reject(error);
      });

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

  public dispose() {
    StatusBarUi.dispose();
    OutputWindow.dispose();
  }

}