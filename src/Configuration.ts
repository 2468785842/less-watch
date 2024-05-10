import * as vscode from 'vscode';

export function getGlobalOptions(): LessWatchOptions {
    //默认设置
    const defaultOptions: LessWatchOptions = {
        plugins: [],
        relativeUrls: false,
        compress: true,
        ieCompat: true,
        out: '~/css',
        outExt: '.min.css',
        sourceMap: {
            outputSourceFiles: true,
            sourceMapFileInline: true
        },
        javascriptEnabled: false,
        outputWindow: true,
        excludes: ['**/node_modules/**', '**/out/**']
    };

    const configuredOptions: LessWatchOptions | undefined = vscode.workspace
        .getConfiguration('lessWatchCompile.settings')
        .get<LessWatchOptions>('compile');

    return {
        ...defaultOptions,
        ...configuredOptions
    };
}

export interface LessWatchOptions extends Less.Options {
    out: string;
    outExt: string;
    sourceMap: Less.SourceMapOption;
    relativeUrls: boolean;
    autoprefixer?: string | string[];
    javascriptEnabled: boolean;
    rootFileInfo?: Less.RootFileInfo;
    outputWindow: boolean;
    excludes: Array<string>;
}
