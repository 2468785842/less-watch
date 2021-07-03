import * as vscode from 'vscode';

export class StatusBarUi {
    private static _statusBarItem: vscode.StatusBarItem;
    private static get statusBarItem(): vscode.StatusBarItem {
        if (!StatusBarUi._statusBarItem) {
            StatusBarUi._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 200);
            this.statusBarItem.show();
        }
        return StatusBarUi._statusBarItem;
    }
    static init(): void {
        StatusBarUi.notWatching();
    }
    static watching(): void {
        StatusBarUi.statusBarItem.text = `$(telescope) watching...`;
        StatusBarUi.statusBarItem.color = 'inherit';
        StatusBarUi.statusBarItem.command = 'lessWatch.command.watchLessOff';
        StatusBarUi.statusBarItem.tooltip = 'stop watch of Less to CSS';
    }
    static notWatching(): void {
        StatusBarUi.statusBarItem.text = `$(eye) Watch Less`;
        StatusBarUi.statusBarItem.color = 'inherit';
        StatusBarUi.statusBarItem.command = 'lessWatch.command.watchLessOn';
        StatusBarUi.statusBarItem.tooltip = 'watch of Less to CSS';
    }
    static working(workingMsg: string = "Working on it..."): void {
        StatusBarUi.statusBarItem.text = `$(pulse) ${workingMsg}`;
        StatusBarUi.statusBarItem.tooltip = 'In case if it takes long time, Show output window and report.';
        StatusBarUi.statusBarItem.command = undefined;
    }
    // Quick status bar messages after compile success or error
    static compilationSuccess(isWatching: boolean): void {
        StatusBarUi.statusBarItem.text = `$(check) Success`;
        StatusBarUi.statusBarItem.color = '#33ff00';
        StatusBarUi.statusBarItem.command = undefined;
        if (isWatching) {
            setTimeout(function () {
                StatusBarUi.statusBarItem.color = 'inherit';
                StatusBarUi.watching();
            }, 4500);
        }
        else {
            StatusBarUi.notWatching();
        }
    }
    static compilationError(isWatching: boolean): void {
        StatusBarUi.statusBarItem.text = `$(x) Error`;
        StatusBarUi.statusBarItem.color = '#ff0033';
        StatusBarUi.statusBarItem.command = undefined;
        if (isWatching) {
            setTimeout(function () {
                StatusBarUi.statusBarItem.color = 'inherit';
                StatusBarUi.watching();
            }, 4500);
        }
        else {
            StatusBarUi.notWatching();
        }
    }

    static dispose(): void {
        StatusBarUi.statusBarItem.dispose();
    }

}