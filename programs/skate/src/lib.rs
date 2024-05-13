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

    pub fn post_msg(ctx: Context<OperatorAuth>, task_id: u64, message: String) -> Result<()> {
        let base_account = &mut ctx.accounts.base_account;
        let idx = base_account.messages.iter().position(|(id, _)| *id == task_id);
        if let Some(index) = idx {
            base_account.messages[index].1 = message.clone();
        } else {
            base_account.messages.push((task_id, message.clone()));
        }
        msg!("Message posted: Task ID {} with message: {}", task_id, message);
        Ok(())
    }

        pub fn get_msg(ctx: Context<OperatorAuth>, task_id: u64) -> Result<String> {
            let base_account = &ctx.accounts.base_account;
            match base_account.messages.iter().find(|&&(id, _)| id == task_id) {
                Some((_, msg)) => {
                    msg!("Message retrieved: Task ID {} with message: {}", task_id, msg);
                    Ok(msg.clone())
                },
                None => {
                    msg!("Failed to retrieve message: Task ID {} not found", task_id);
                    Err(ErrorCode::MessageNotFound.into())
                }
            }
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
    #[account(mut = false)] // Ensure that the base_account is not mutable
    pub base_account: Account<'info, BaseAccount>,
}


#[account]
pub struct BaseAccount {
    pub owner: Pubkey,
    pub operators: Vec<Pubkey>,
    pub messages: Vec<(u64, String)>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Message not found.")]
    MessageNotFound,
    #[msg("Operator not found.")]
    OperatorNotFound,
}
