fn main() {
    println!("cargo:rerun-if-changed=.sqlx/migrations");
}
