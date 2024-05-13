import * as anchor from "@coral-xyz/anchor";
import { SettlementApp } from "../target/types/settlement_app";
import { Keypair, PublicKey } from "@solana/web3.js";

describe("SettlementApp", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const payer = provider.wallet as anchor.Wallet;
    const program = anchor.workspace.SettlementApp as anchor.Program<SettlementApp>;

    const owner = payer.publicKey;
    const baseAccount = new Keypair();
    const operator = new Keypair();

    it("Initialize the base account and set the owner!", async () => {
        const transactionSignature = await program.methods
            .initialize(owner)
            .accounts({
                baseAccount: baseAccount.publicKey,
                user: payer.publicKey,
            })
            .signers([baseAccount])
            .rpc();

        console.log("Initialization Success!");
        console.log(`   Base Account: ${baseAccount.publicKey}`);
        console.log(`   Transaction Signature: ${transactionSignature}`);
    });

    it("Registers an operator", async () => {
        const transactionSignature = await program.methods
            .registerOperator(operator.publicKey)
            .accounts({
                baseAccount: baseAccount.publicKey
            })
            .signers([payer.payer]) // Assuming 'payer.payer' is a typo; should be simply 'payer'
            .rpc();

        console.log("Operator Registration Success!");
        console.log(`   Operator PublicKey: ${operator.publicKey}`);
        console.log(`   Transaction Signature: ${transactionSignature}`);
    });

    it("Deregisters an operator", async () => {
        // First, ensure the operator is registered
        await program.methods.registerOperator(operator.publicKey)
            .accounts({
                baseAccount: baseAccount.publicKey
            })
            .signers([payer.payer])
            .rpc();

        // Now, deregister the operator
        const transactionSignature = await program.methods
            .deregisterOperator(operator.publicKey)
            .accounts({
                baseAccount: baseAccount.publicKey
            })
            .signers([payer.payer])
            .rpc();

        console.log("Operator Deregistration Success!");
        console.log(`   Transaction Signature: ${transactionSignature}`);
    });

    it("Posts and retrieves a message", async () => {
        const taskId = new anchor.BN(1);
        const message = "Hello, Solana!";

        // Post the message
        await program.methods
            .postMsg(taskId, message)
            .accounts({
                baseAccount: baseAccount.publicKey,
                operator: operator.publicKey,
            })
            .signers([operator])
            .rpc();

        // Retrieve the message
        const retrievedMessage = await program.methods
            .getMsg(taskId)
            .accounts({
                baseAccount: baseAccount.publicKey,
            })
            .view();
        console.log("Message Retrieved:", retrievedMessage);
        console.log(`   Task ID: ${taskId}, Message: ${retrievedMessage}`);
    });
});
