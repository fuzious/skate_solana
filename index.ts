import 'dotenv/config'
import * as anchor from "@coral-xyz/anchor";
import { SettlementApp } from "./settlement_app";
import {Keypair, PublicKey} from "@solana/web3.js";
import fs from "fs";
import path from "path";

const KEYPAIR_PATH = path.join(__dirname, 'keypairs');
const idl = JSON.parse(fs.readFileSync('./settlement_app.json', 'utf8'));

// Helper functions to save and load keypairs
function saveKeypair(keypair, filename) {
    const keypairPath = path.join(KEYPAIR_PATH, filename);
    fs.writeFileSync(keypairPath, JSON.stringify(Array.from(keypair.secretKey)));
}

function loadKeypair(filename) {
    const keypairPath = path.join(KEYPAIR_PATH, filename);
    if (fs.existsSync(keypairPath)) {
        // @ts-ignore
        const secretKeyUint8Array = new Uint8Array(JSON.parse(fs.readFileSync(keypairPath)));
        return Keypair.fromSecretKey(secretKeyUint8Array);
    }
    return new Keypair();
}

async function main() {
    // Ensure the keypairs directory exists
    if (!fs.existsSync(KEYPAIR_PATH)) {
        fs.mkdirSync(KEYPAIR_PATH);
    }

    // Set up the provider and program
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = new anchor.Program<SettlementApp>(idl, provider) as anchor.Program<SettlementApp>;
    const payer = provider.wallet as anchor.Wallet;

    // Attempt to load keypairs or create new ones
    let baseAccount = loadKeypair('baseAccount.json');
    let operator = loadKeypair('operator.json');

    // Accept user input to choose an action
    const args = process.argv.slice(2);
    const action = args[0];

    switch (action) {
        case "initialize":
            await initializeBaseAccount();
            break;
        case "register":
            await registerOperator();
            break;
        case "deregister":
            await deregisterOperator();
            break;
        case "postMessage":
            const taskId = new anchor.BN(args[1]);
            const sender = args[2];
            const message = args[3];
            await postMessage(taskId, sender, message);
            break;
        case "getMessage":
            const taskIdRetrieve = new anchor.BN(args[1]);
            await getMessage(taskIdRetrieve);
            break;
        default:
            console.log("Invalid action specified");
    }

    async function initializeBaseAccount() {
        // Save the new base account keypair if not previously saved
        if (!fs.existsSync(path.join(KEYPAIR_PATH, 'baseAccount.json'))) {
            saveKeypair(baseAccount, 'baseAccount.json');
        }

        // @ts-ignore
        const transactionSignature = await program.methods
            .initialize(payer.publicKey)
            .accounts({
                baseAccount: baseAccount.publicKey,
                user: payer.publicKey,
            })
            .signers([baseAccount])
            .rpc();

        console.log("Initialization Success!");
        console.log(`   Base Account: ${baseAccount.publicKey}`);
        console.log(`   Transaction Signature: ${transactionSignature}`);
    }

    async function registerOperator() {
        // Save the new operator keypair if not previously saved
        if (!fs.existsSync(path.join(KEYPAIR_PATH, 'operator.json'))) {
            saveKeypair(operator, 'operator.json');
        }

        const transactionSignature = await program.methods
            .registerOperator(operator.publicKey)
            .accounts({
                baseAccount: baseAccount.publicKey
            })
            .signers([payer.payer])
            .rpc();

        console.log("Operator Registration Success!");
        console.log(`   Operator PublicKey: ${operator.publicKey}`);
        console.log(`   Transaction Signature: ${transactionSignature}`);
    }

    async function deregisterOperator() {
        const transactionSignature = await program.methods
            .deregisterOperator(operator.publicKey)
            .accounts({
                baseAccount: baseAccount.publicKey
            })
            .signers([payer.payer])
            .rpc();

        console.log("Operator Deregistration Success!");
        console.log(`   Transaction Signature: ${transactionSignature}`);
    }

    async function postMessage(taskId, sender, message) {
        console.log(`Operator Public Key: ${operator.publicKey.toString()}`);
        console.log(taskId,sender,message)
        const transactionSignature = await program.methods
            .postMsg(taskId, sender, message)
            .accounts({
                baseAccount: baseAccount.publicKey,
                operator: operator.publicKey,
            })
            .signers([operator])
            .rpc();

        console.log("Message Posted Successfully");
        console.log(`Transaction Signature: ${transactionSignature}`);
    }

    async function getMessage(taskId) {
        const retrievedMessage = await program.methods
            .getMsg(taskId)
            .accounts({
                baseAccount: baseAccount.publicKey,
            })
            .view();  // Assuming .view() is appropriate; switch back to .rpc() if needed for state changes.

        // Assuming retrievedMessage is a buffer or Uint8Array; if it's a hex string, convert as follows:
        const messageString = Buffer.from(retrievedMessage, 'hex').toString();

        console.log("Message Retrieved:", messageString);
        // console.log(`Transaction Signature: ${signature}`);
    }
}

main().catch(err => console.error(err));
