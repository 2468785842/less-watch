import * as vscode from 'vscode';
import { AppModel } from './AppModel';
let appModel: AppModel;
export function activate(context: vscode.ExtensionContext) {

	appModel = new AppModel();

	const disposableCompileAll =
		vscode.commands.registerCommand('lessWatch.command.watchLessOn', () => {
			const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
			if (activeEditor) {
				const document = activeEditor.document;
				if (document.fileName.endsWith(".less")) {
					document.save();
					appModel.compileAllFiles(document);
				}
			}
		});

	const disposableStopWatching =
		vscode.commands.registerCommand('lessWatch.command.watchLessOff', () => {
			appModel.stopWatching();
		});

	const disposableOneTimeCompileSass =
		vscode.commands.registerCommand('lessWatch.command.oneTimeCompileLess', () => {
			const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
			if (activeEditor) {
				appModel.compileAllFiles(activeEditor.document, false);
			}
		});

	const disposableOpenOutputWindow =
		vscode.commands.registerCommand('lessWatch.command.openOutputWindow', () => {
			appModel.openOutputWindow();
		});

	const disposableOnDivSave =
		vscode.workspace.onDidSaveTextDocument(() => {

			const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
			if (activeEditor) {
				appModel.compileOnSave(activeEditor.document);
			}
		});

	context.subscriptions.push(
		disposableCompileAll,
		disposableStopWatching,
		disposableOneTimeCompileSass,
		disposableOpenOutputWindow,
		disposableOnDivSave
	);
}

export function deactivate() {
	if (appModel) {
		appModel.dispose();
	}
}
