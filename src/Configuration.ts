import * as vscode from "vscode";

export function getGlobalOptions(): EasyLessOptions {
  //默认设置
  const defaultOptions: EasyLessOptions = {
    plugins: [],
    relativeUrls: false,
    compress: false,
    ieCompat: true,
    out: '~/css',
    outExt: '.min.css',
    sourceMap: true,
    sourceMapFileInline: true,
    javascriptEnabled: false,
    outputWindow: true,
    excludes: ['**/node_modules/**', '**/out/**']
  };

  const configuredOptions: EasyLessOptions | undefined = vscode.workspace
    .getConfiguration('lessWatchCompile.settings').get<EasyLessOptions>('compile');

  return {
    ...defaultOptions, ...configuredOptions
  };
}

export interface EasyLessOptions extends Less.Options {
  out?: string;
  outExt?: string;
  sourceMap?: any;
  relativeUrls?: boolean;
  sourceMapFileInline?: boolean;
  autoprefixer?: string | string[];
  javascriptEnabled?: boolean;
  rootFileInfo?: Less.RootFileInfo;
  outputWindow?: boolean;
  excludes?: Array<string>;
}