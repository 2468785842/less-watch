import * as Configuration from "./Configuration";

const SUPPORTED_PER_FILE_OPTS = {
  main: true,
  out: true,
  outExt: true,
  sourceMap: true,
  sourceMapFileInline: true,
  compress: true,
  relativeUrls: true,
  ieCompat: true,
  autoprefixer: true,
  javascriptEnabled: true,
  math: true,
};

const ARRAY_OPTS: { [key: string]: any; } = {
  main: true,
};

export function parse(
  line: string,
  defaults: Configuration.EasyLessOptions
): Configuration.EasyLessOptions {
  // does line start with a comment?: //
  const commentMatch: RegExpExecArray | null = /^\s*\/\/\s*(.+)/.exec(line);
  if (!commentMatch) {
    return defaults;
  }

  const options: { [key: string]: any; } = { ...defaults };
  const optionLine: string = commentMatch[1];
  const seenKeys: { [key: string]: boolean; } = {};
  for (const item of optionLine.split(",")) {
    const i: number = item.indexOf(":");
    if (i < 0) {
      continue;
    }
    const key: string = item.substr(0, i).trim();
    if (!SUPPORTED_PER_FILE_OPTS.hasOwnProperty(key)) {
      continue;
    }

    let value: string = item.substr(i + 1).trim();
    if (value.match(/^(true|false|undefined|null|[0-9]+)$/)) {
      value = eval(value);
    }

    if (seenKeys[key] === true && ARRAY_OPTS[key]) {
      let existingValue: any = options[key];
      if (!Array.isArray(existingValue)) {
        existingValue = options[key] = [existingValue];
      }
      existingValue.push(value);
    } else {
      options[key] = value;
      seenKeys[key] = true;
    }
  }

  return options as Configuration.EasyLessOptions;
}