import resolve from "@rollup/plugin-node-resolve";
import babel from "rollup-plugin-babel";
import builtins from "@erquhart/rollup-plugin-node-builtins";
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";
import commonjs from "rollup-plugin-commonjs";
import pkg from "./package.json";

const external = Object.keys(pkg.dependencies)
  .concat(["crypto"]);
let banner = [
  "/**",
  ` * Copyright (c) ${new Date().getFullYear()}, Peculiar Ventures, All rights reserved.`,
  " */",
  "",
].join("\n");

const main = {
  input: "src/lib.ts",
  plugins: [
    typescript({
      check: true,
      clean: true,
      tsconfigOverride: {
        compilerOptions: {
          module: "es2015",
        }
      }
    }),
  ],
  external,
  output: [
    {
      banner,
      file: pkg.main,
      format: "cjs",
    },
    {
      banner,
      file: pkg.module,
      format: "es",
    },
  ],
};

function babelOptions(ie11) {
  const targets = ie11
    ? { ie: "11" }
    : { chrome: "60" };
  return {
    babelrc: false,
    runtimeHelpers: true,
    compact: false,
    comments: false,
    presets: [
      ["@babel/env", {
        targets,
        useBuiltIns: "entry",
        corejs: 3,
      }],
    ],
    plugins: [
      ["@babel/plugin-proposal-class-properties"],
      ["@babel/proposal-object-rest-spread"],
    ]
  }
}


//#region Browser
const browserExternals = {
  // "des.js": "des",
  "elliptic": "self.elliptic",
  "asmcrypto.js": "self.asmCrypto",
};

const browser = [
  {
    input: "src/shim.ts",
    plugins: [
      resolve({
        mainFields: ["jsnext", "module", "main"],
        preferBuiltins: true,
      }),
      builtins(),
      commonjs(),
      typescript({
        check: true,
        clean: true,
        tsconfigOverride: {
          compilerOptions: {
            module: "es2015",
          }
        }
      }),
    ],
    external: Object.keys(browserExternals),
    output: [
      {
        file: pkg["browser:es5"],
        format: "es",
        globals: browserExternals,
      }
    ]
  },
  // ES2015
  {
    input: pkg["browser:es5"],
    external: Object.keys(browserExternals),
    plugins: [
      babel(babelOptions(false)),
    ],
    output: [
      {
        banner,
        file: pkg["browser"],
        globals: browserExternals,
        format: "iife",
        name: "liner",
      },
      {
        banner,
        file: pkg["browser:min"],
        globals: browserExternals,
        format: "iife",
        name: "liner",
        plugins: [
          terser(),
        ]
      },
    ],
  },
  // ES5
  {
    input: pkg["browser:es5"],
    external: Object.keys(browserExternals),
    plugins: [
      babel(babelOptions(true)),
    ],
    output: [
      {
        banner,
        file: pkg["browser:es5"],
        globals: browserExternals,
        format: "iife",
        name: "liner",
      },
      {
        banner,
        file: pkg["browser:es5:min"],
        globals: browserExternals,
        format: "iife",
        name: "liner",
        plugins: [
          terser(),
        ]
      },
    ],
  },
];
//#endregion

export default [
  main,
  ...browser,
]