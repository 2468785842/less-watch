# less-watch 

## description

listen less file compilation to css
(监视Less文件 实时编译成css)

## use
select less file then click statusbar right of `watch less` listen
(选择less文件
点击状态栏右侧的`watch less`开始监听)
## setting
  - out(设置输出文件夹):
    ```json
      "out": "[placeholder]/css"
    ```
    - placeholder(占位符):
      - `./` or `/`: relative workspace path (相对于workspace根目录)
      - `~/`: relative .less file location folder (相对于less文件所在目录)
  - outExt(设置拓展名):
    ```json
      "outExt": ".min.css"
    ```
  - excludes（不需要扫描的文件夹):
    ```json
      "excludes: [
        "**/node_modules/**"//rules see glob
      ]
    ```
  - sourceMap(.map文件设置):
    ```json
      "sourceMap": {
        "outputSourceFiles": true,
        "sourceMapFileInline": true
      }
    ```
    - outputSourceFiles: 是否输出.map文件
    - sourceMapFileInline: 是否在编译后的css文件末尾追加.map文件uri
  - compress(压缩css文件):
    - default: true

## vscode Command
  - 使用<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>p</kbd>快捷键打开输入框
    - 输入`Watch Less On`: 开启监听
    - 输入`Watch Less Off`: 关闭监听
    - 输入`Open Less Watch Output Window`: 打开输出信息
    - 输入`Compile All Less`: 编译文件夹下所有.less文件