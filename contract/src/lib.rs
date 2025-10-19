#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, symbol_short};

#[contracttype]
pub enum DataKey {
    Item(Symbol),
}

#[contract]
pub struct DefinitionContract;

#[contractimpl]
impl DefinitionContract {
    /// Ödünç veren kişi, bir eşyanın sorumluluğunu bir başkasına tanımlar
    /// Sadece lender kendi cüzdanıyla bu işlemi yapabilir (require_auth)
    pub fn define_borrower(
        env: Env,
        lender: Address,
        item_name: Symbol,
        borrower: Address,
    ) {
        // KRİTİK: Sadece lender bu işlemi yapabilir
        lender.require_auth();

        // Eşyanın sorumlusunu kaydet
        let key = DataKey::Item(item_name);
        env.storage().instance().set(&key, &borrower);
    }

    /// Ödünç veren kişi, eşya geri geldiğinde tanımı kaldırır
    /// Sadece lender kendi cüzdanıyla bu işlemi yapabilir (require_auth)
    pub fn undefine_borrower(
        env: Env,
        lender: Address,
        item_name: Symbol,
    ) {
        // KRİTİK: Sadece lender bu işlemi yapabilir
        lender.require_auth();

        // Kaydı sil
        let key = DataKey::Item(item_name);
        env.storage().instance().remove(&key);
    }

    /// Bir eşyanın şu anki sorumlusunu sorgula
    /// Herkes okuyabilir
    pub fn get_current_definition(env: Env, item_name: Symbol) -> Option<Address> {
        let key = DataKey::Item(item_name);
        env.storage().instance().get(&key)
    }
}

mod test;



