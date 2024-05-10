import * as fs from 'fs';
import * as less from 'less';
import * as mkpath from 'mkpath';
import * as path from 'path';
import * as vscode from 'vscode';
import * as Configuration from './Configuration';

import { LessDocumentResolverPlugin } from './LessDocumentResolverPlugin';
import { OutputWindow } from './OutputWindow';

import { getRootPath } from './extension';

/**
 * 便于编译文件
 */
export class LessCompiler {
    private static _globalOptions: Configuration.LessWatchOptions;

    /**
     * 全局设置
     */
    public static get globalOptions(): Configuration.LessWatchOptions {
        if (!LessCompiler._globalOptions) {
            const activeEditor: vscode.TextEditor | undefined =
                vscode.window.activeTextEditor;
            if (activeEditor) {
                LessCompiler._globalOptions = Configuration.getGlobalOptions();
            }
        }
        return LessCompiler._globalOptions;
    }

    // compile the given less file
    public static async compile(lessFile: string): Promise<void> {
        const out: string = LessCompiler.globalOptions.out;
        const extension: string = LessCompiler.globalOptions.outExt;
        const sourceMap: Less.SourceMapOption =
            LessCompiler.globalOptions.sourceMap;

        //替换特殊字符 . ~
        let cssFile: string = LessCompiler.interpolatePath(out, {
            ...path.parse(lessFile),
            ext: extension
        });

        const content: string = await this.readFilePromise(lessFile, 'utf-8');

        /************* generated sourceMap *************/
        let sourceMapFile: string | undefined;

        const lessPath: string = path.parse(lessFile).dir;
        const cssPath: string = path.parse(cssFile).dir;
        const lessRelativeToCss: string = path.relative(cssPath, lessPath);

        const sourceMapOptions = <Less.SourceMapOption>{
            ...sourceMap,
            sourceMapBasepath: lessPath,
            sourceMapRootpath: lessRelativeToCss
        };

        if (sourceMapOptions.sourceMapFileInline) {
            sourceMapFile = path.join(
                path.parse(cssFile).dir,
                path.parse(lessFile).name + extension + '.map'
            );
        }

        this.globalOptions.sourceMap = sourceMapOptions;

        /************* set plugins *************/
        this.globalOptions.plugins = [];
        if (this.globalOptions.autoprefixer) {
            const LessPluginAutoPrefix = require('less-plugin-autoprefix');
            const browsers: string[] = this.cleanBrowsersList(
                this.globalOptions.autoprefixer
            );
            const autoprefixPlugin = new LessPluginAutoPrefix({ browsers });

            this.globalOptions.plugins.push(autoprefixPlugin);
        }

        this.globalOptions.plugins.push(new LessDocumentResolverPlugin());

        this.globalOptions.paths = [path.parse(lessFile).dir];

        // set up the parser
        const output: Less.RenderOutput = await less.render(
            content,
            this.globalOptions
        );

        await this.writeFileContents(cssFile, output.css);
        OutputWindow.Show('Css Compilation Success:', [cssFile], false, false);

        if (output.map && sourceMapFile) {
            await this.writeFileContents(sourceMapFile, output.map);
            OutputWindow.Show(
                'Map Compilation Success:',
                [sourceMapFile],
                false,
                false
            );
        }
    }

    //-----------------------------------------------------------------------//

    static cleanBrowsersList(autoprefixOption: string | string[]): string[] {
        const browsers: string[] = Array.isArray(autoprefixOption)
            ? autoprefixOption
            : ('' + autoprefixOption).split(/,|;/);

        return browsers.map((browser) => browser.trim());
    }

    //replace ~ and . and / placeholder
    public static interpolatePath(
        outPath: string,
        parse: path.ParsedPath
    ): string {
        let out = path.join(outPath, parse.name + parse.ext);

        let interpolatePath: string = getRootPath();

        if (out.startsWith('~')) {
            interpolatePath = parse.dir;
        }

        if (out.startsWith('~') || out.startsWith('.')) {
            out = out.substr(1);
        }

        console.log(path.join(interpolatePath, out));
        return path.join(interpolatePath, out);
    }

    /**
     * 写入css
     */
    static writeFileContents(
        filepath: string,
        content: string
    ): Promise<Error | void> {
        return new Promise((resolve, reject) => {
            mkpath(path.dirname(filepath), (err) => {
                if (err) {
                    return reject(err);
                }

                fs.writeFile(filepath, content, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    }

    /**
     * 异步读取文件内容
     * @param filePath 绝对文件路径
     * @param encoding 编码
     * @returns 异步对象
     */
    public static readFilePromise(
        filePath: string,
        encoding: BufferEncoding
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(
                filePath,
                { encoding: encoding },
                (err: any, data: string) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                }
            );
        });
    }
}
