#![forbid(unsafe_code)]
#![warn(clippy::pedantic)]

use proc_macro::TokenStream;

mod derive_table;

#[proc_macro_derive(Table, attributes(table))]
pub fn table(input: TokenStream) -> TokenStream {
    derive_table::table(input)
}
