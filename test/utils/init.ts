// tslint:disable: no-string-literal

import { Crypto } from "@peculiar/webcrypto";
import * as des from "des.js";
import * as elliptic from "elliptic";

const crypto = new Crypto();
const nativeGenerateKey = crypto.subtle.generateKey;
const nativeExportKey = crypto.subtle.exportKey;

// asmCrypto doesn't have key generation function and uses native generateKey with RSA-PSS
crypto.subtle.generateKey = async function () {
  if (arguments[0]?.name !== "RSA-PSS") {
    throw new Error("Function is broken for test cases");
  }
  return nativeGenerateKey.apply(this, arguments);
};

// asmCrypto doesn't have key generation function and uses native exportKey with RSA-PSS
crypto.subtle.exportKey = async function () {
  if (!(
    (arguments[0] === "pkcs8"
      || arguments[0] === "spki")
    && arguments[1].algorithm.name === "RSA-PSS"
  )) {
    throw new Error("Function is broken for test cases");
  }
  return nativeExportKey.apply(this, arguments);
};

[
  "decrypt", "encrypt",
  "wrapKey", "unwrapKey",
  "sign", "verify",
  "deriveBits", "deriveKey",
  "importKey",
  "digest",
].forEach((o) => {
  crypto.subtle[o] = async () => {
    throw new Error("Function is broken for test cases");
  };
});

global["self"] = {
  crypto,
  navigator: {
    userAgent: "NodeJS",
  },
  elliptic,
  des,
};
global["window"] = global["self"];

import "../../src/shim";

Object.assign(global, global["self"]);