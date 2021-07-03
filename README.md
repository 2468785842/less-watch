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