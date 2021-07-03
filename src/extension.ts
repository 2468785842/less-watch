import * as vscode from 'vscode';
import { AppModel } from './AppModel';

let appModel: AppModel;

export function getDocument(): vscode.TextDocument | undefined {
	const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
	if (activeEditor) {
		return activeEditor.document;
	}
	return undefined;
}
export function activate(context: vscode.ExtensionContext) {

	appModel = new AppModel();


	const disposableCompileAll =
		vscode.commands.registerCommand('lessWatch.command.watchLessOn', () => {
			appModel.compileAllFiles();
		});

	const disposableStopWatching =
		vscode.commands.registerCommand('lessWatch.command.watchLessOff', () => {
			appModel.stopWatching();
		});

	const disposableOneTimeCompileLess =
		vscode.commands.registerCommand('lessWatch.command.oneTimeCompileLess', () => {
			appModel.compileAllFiles(false);
		});

	const disposableOpenOutputWindow =
		vscode.commands.registerCommand('lessWatch.command.openOutputWindow', () => {
			appModel.openOutputWindow();
		});

	const disposableOnDivSave =
		vscode.workspace.onDidSaveTextDocument(() => {
			appModel.compileOnSave();
		});

	context.subscriptions.push(
		disposableCompileAll,
		disposableStopWatching,
		disposableOneTimeCompileLess,
		disposableOpenOutputWindow,
		disposableOnDivSave
	);
}

export function deactivate() {
	if (appModel) {
		appModel.dispose();
	}
}
