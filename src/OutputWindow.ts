import * as vscode from 'vscode';

export class OutputWindow {
    private static _msgChannel: vscode.OutputChannel;

    private static get MsgChannel() {
        if (!OutputWindow._msgChannel) {
            OutputWindow._msgChannel =
                vscode.window.createOutputChannel('Less Watch Compile');
        }

        return OutputWindow._msgChannel;
    }

    public static Show(
        msgHeadline: string,
        MsgBody: string[] | null,
        popUpToUI: boolean = false,
        addEndLine = true
    ) {
        if (msgHeadline) {
            OutputWindow.MsgChannel.appendLine(msgHeadline);
        }

        if (MsgBody) {
            MsgBody.forEach((msg) => {
                OutputWindow.MsgChannel.appendLine(msg);
            });
        }

        if (popUpToUI) {
            OutputWindow.MsgChannel.show(true);
        }

        if (addEndLine) {
            OutputWindow.MsgChannel.appendLine('--------------------');
        }
    }

    static dispose() {
        this.MsgChannel.dispose();
    }
}
