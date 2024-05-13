use anchor_lang::prelude::*;

declare_id!("6WLn4dADBiEZ2DTwJwawyj9bti7Az3EATkgMzL8yE8dk");

#[program]
pub mod settlement_app {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, owner: Pubkey) -> Result<()> {
        let base_account = &mut ctx.accounts.base_account;
        base_account.owner = owner;
        Ok(())
    }

    pub fn register_operator(ctx: Context<Auth>, operator: Pubkey) -> Result<()> {
        let base_account = &mut ctx.accounts.base_account;
        if !base_account.operators.contains(&operator) {
            base_account.operators.push(operator);
        }
        Ok(())
    }

    pub fn deregister_operator(ctx: Context<Auth>, operator: Pubkey) -> Result<()> {
        let base_account = &mut ctx.accounts.base_account;
        let index = base_account.operators.iter().position(|&x| x == operator);
        if let Some(idx) = index {
            base_account.operators.remove(idx);
        } else {
            return Err(ErrorCode::OperatorNotFound.into());
        }
        Ok(())
    }

    pub fn post_msg(ctx: Context<OperatorAuth>, task_id: u64, message: String, sender: String) -> Result<()> {
        let base_account = &mut ctx.accounts.base_account;
        let signer = ctx.accounts.operator.key();
        let combined_message = format!("{}: {}: {}", sender, signer, message); // Concatenating sender, signer, and message

        let idx = base_account.messages.iter().position(|(id, _)| *id == task_id);
        if let Some(index) = idx {
            base_account.messages[index].1 = combined_message.clone();
        } else {
            base_account.messages.push((task_id, combined_message.clone()));
        }
        msg!("Message posted: Task ID {} with message: '{}'", task_id, combined_message);
        Ok(())
    }

    pub fn get_msg(ctx: Context<GetMessage>, task_id: u64) -> Result<String> {
        let messages = &ctx.accounts.base_account.messages;
        messages.iter()
            .find(|&&(id, _)| id == task_id)
            .map(|(_, msg)| {
                msg!("Message retrieved: Task ID {} with message: '{}'", task_id, msg);
                msg.clone()
            })
            .ok_or(ErrorCode::MessageNotFound.into())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 9000)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Auth<'info> {
    #[account(mut, has_one = owner)]
    pub base_account: Account<'info, BaseAccount>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct OperatorAuth<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
    pub operator: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetMessage<'info> {
    #[account(has_one = owner)]
    pub base_account: Account<'info, BaseAccount>,
    pub owner: Signer<'info>,
}

#[account]
pub struct BaseAccount {
    pub owner: Pubkey,
    pub operators: Vec<Pubkey>,
    pub messages: Vec<(u64, String)>, // Changed to store strings directly
}

#[error_code]
pub enum ErrorCode {
    #[msg("Message not found.")]
    MessageNotFound,
    #[msg("Operator not found.")]
    OperatorNotFound,
}
