import * as fs from "fs";
import * as less from "less";
import * as mkpath from "mkpath";
import * as path from "path";
import * as vscode from "vscode";
import * as Configuration from "./Configuration";


import { LessDocumentResolverPlugin } from "./LessDocumentResolverPlugin";
import { OutputWindow } from "./OutputWindow";

/**
 * 便于编译文件
 */
export class LessCompiler {

  private static _globalOptions: Configuration.LessWatchOptions | undefined;

  /**
   * 全局设置
   */
  public static get globalOptions(): Configuration.LessWatchOptions {
    if (!LessCompiler._globalOptions) {
      const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
      if (activeEditor) {
        LessCompiler._globalOptions = Configuration.getGlobalOptions();
      }
    }
    return LessCompiler._globalOptions || {};
  }

  // compile the given less file
  public static async compile(lessFile: string): Promise<void> {

    const out: string | undefined = LessCompiler.globalOptions.out;
    const extension: string | undefined = LessCompiler.globalOptions.outExt;
    const sourceMap: Less.SourceMapOption | undefined = LessCompiler.globalOptions.sourceMap;

    //判断设置是否定义
    if (!out) throw "(setting) out is undefined";
    if (!extension) throw "(setting) outExt is undefined";
    if (!sourceMap) throw "(setting) sourceMap is undefined";

    //替换特殊字符 . ~
    let cssFile: string = LessCompiler.interpolatePath(out, {
      ...path.parse(lessFile), ext: extension
    });

    const content = await this.readFilePromise(lessFile, "utf-8");

    /************* generated sourceMap *************/
    let sourceMapFile: string | undefined;

    const lessPath: string = path.parse(lessFile).dir;
    const cssPath: string = path.parse(cssFile).dir;
    const lessRelativeToCss: string = path.relative(cssPath, lessPath);

    const sourceMapOptions = <Less.SourceMapOption>{
      ...sourceMap,
      sourceMapBasepath: lessPath,
      sourceMapRootpath: lessRelativeToCss,
    };

    if (sourceMapOptions.sourceMapFileInline) {
      sourceMapFile = path.join(path.parse(cssFile).dir, path.parse(lessFile).name + extension + ".map");
    }

    this.globalOptions.sourceMap = sourceMapOptions;

    /************* set plugins *************/
    this.globalOptions.plugins = [];
    if (this.globalOptions.autoprefixer) {
      const LessPluginAutoPrefix = require("less-plugin-autoprefix");
      const browsers: string[] = this.cleanBrowsersList(this.globalOptions.autoprefixer);
      const autoprefixPlugin = new LessPluginAutoPrefix({ browsers });

      this.globalOptions.plugins.push(autoprefixPlugin);
    }

    this.globalOptions.plugins.push(new LessDocumentResolverPlugin());

    // set up the parser
    const output: Less.RenderOutput = await less.render(content, this.globalOptions);

    await this.writeFileContents(cssFile, output.css);
    OutputWindow.Show('Css Compilation Success:', [cssFile], false, false);

    if (output.map && sourceMapFile) {
      await this.writeFileContents(sourceMapFile, output.map);
      OutputWindow.Show('Map Compilation Success:', [sourceMapFile], false, false);
    }

  }

  //-----------------------------------------------------------------------//

  static cleanBrowsersList(autoprefixOption: string | string[]): string[] {
    const browsers: string[] = Array.isArray(autoprefixOption)
      ? autoprefixOption
      : ("" + autoprefixOption).split(/,|;/);

    return browsers.map((browser) => browser.trim());
  }

  public static interpolatePath(outPath: string, parse: path.ParsedPath): string {
    let out = path.join(outPath, parse.name + parse.ext);

    if (!vscode.workspace.rootPath) throw "placeholder replace Error";

    if (out.startsWith("~")) {
      out = out.replace(/\~/g, parse.dir);
    } else if (out.startsWith(".")) {
      out = out.replace(/\./g, vscode.workspace.rootPath);
    } else {
      out = vscode.workspace.rootPath + out;
    }

    return path.join(out);
  }

  /**
   * 写入css
   */
  static writeFileContents(this: void, filepath: string, content: any): Promise<any> {
    return new Promise((resolve, reject) => {
      mkpath(path.dirname(filepath), (err) => {
        if (err) {
          return reject(err);
        }

        fs.writeFile(filepath, content.toString(), (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(void 0);
          }
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
  static readFilePromise(filePath: string, encoding: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, encoding, (err: any, data: string) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  /**
   * 判断设置是否定义
   */
  static settingIsDefined<T>(setting: T | undefined, errorMsg: string): setting is T {
    if (!setting) {
      throw errorMsg;
    }
    return setting !== undefined;
  }

}