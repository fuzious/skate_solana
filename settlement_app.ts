/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/settlement_app.json`.
 */
export type SettlementApp = {
  "address": "6WLn4dADBiEZ2DTwJwawyj9bti7Az3EATkgMzL8yE8dk",
  "metadata": {
    "name": "settlementApp",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "deregisterOperator",
      "discriminator": [
        229,
        98,
        238,
        100,
        57,
        56,
        156,
        124
      ],
      "accounts": [
        {
          "name": "baseAccount",
          "writable": true
        },
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "baseAccount"
          ]
        }
      ],
      "args": [
        {
          "name": "operator",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "getMsg",
      "discriminator": [
        229,
        11,
        192,
        6,
        117,
        192,
        145,
        21
      ],
      "accounts": [
        {
          "name": "baseAccount"
        },
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "baseAccount"
          ]
        }
      ],
      "args": [
        {
          "name": "taskId",
          "type": "u64"
        }
      ],
      "returns": "string"
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "baseAccount",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "owner",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "postMsg",
      "discriminator": [
        73,
        64,
        183,
        16,
        112,
        158,
        78,
        62
      ],
      "accounts": [
        {
          "name": "baseAccount",
          "writable": true
        },
        {
          "name": "operator",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "taskId",
          "type": "u64"
        },
        {
          "name": "message",
          "type": "string"
        },
        {
          "name": "sender",
          "type": "string"
        }
      ]
    },
    {
      "name": "registerOperator",
      "discriminator": [
        49,
        242,
        151,
        125,
        212,
        136,
        31,
        89
      ],
      "accounts": [
        {
          "name": "baseAccount",
          "writable": true
        },
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "baseAccount"
          ]
        }
      ],
      "args": [
        {
          "name": "operator",
          "type": "pubkey"
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "messageNotFound",
      "msg": "Message not found."
    },
    {
      "code": 6001,
      "name": "operatorNotFound",
      "msg": "Operator not found."
    }
  ]
};
