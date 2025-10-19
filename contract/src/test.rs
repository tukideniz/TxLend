#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, Symbol};

#[test]
fn test_define_and_get() {
    let env = Env::default();
    let contract_id = env.register_contract(None, DefinitionContract);
    let client = DefinitionContractClient::new(&env, &contract_id);

    let lender = Address::generate(&env);
    let borrower = Address::generate(&env);
    let item = Symbol::new(&env, "kitap");

    // Mock auth for lender
    env.mock_all_auths();

    // Tanım yap
    client.define_borrower(&lender, &item, &borrower);

    // Kontrol et
    let result = client.get_current_definition(&item);
    assert_eq!(result, Some(borrower));
}

#[test]
fn test_undefine() {
    let env = Env::default();
    let contract_id = env.register_contract(None, DefinitionContract);
    let client = DefinitionContractClient::new(&env, &contract_id);

    let lender = Address::generate(&env);
    let borrower = Address::generate(&env);
    let item = Symbol::new(&env, "alet");

    env.mock_all_auths();

    // Tanım yap
    client.define_borrower(&lender, &item, &borrower);

    // Tanımı kaldır
    client.undefine_borrower(&lender, &item);

    // Artık yok olmalı
    let result = client.get_current_definition(&item);
    assert_eq!(result, None);
}



