use darling::FromDeriveInput;
use proc_macro::{self, TokenStream};
use quote::quote;
use syn::{DeriveInput, Path, parse_macro_input, parse_str};

fn default_table_primary_key() -> Path {
    parse_str("::uuid::Uuid").unwrap()
}

#[derive(FromDeriveInput)]
#[darling(attributes(table))]
struct TableAttrs {
    name: String,
    #[darling(default = default_table_primary_key)]
    primary_key: Path,
}

pub(crate) fn table(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input);
    let TableAttrs { name, primary_key } = TableAttrs::from_derive_input(&input).unwrap();
    let DeriveInput { ident, .. } = input;

    let expanded = quote! {
        #[automatically_derived]
        impl ::graphein_common::database::Table for #ident {
            const TABLE_NAME: &'static str = #name;

            type PK = #primary_key;

            #[inline]
            #[must_use]
            fn id(self) -> Self::PK {
                self.id
            }
        }
    };

    expanded.into()
}
