# SK Printing Facility

## Scripts

This repository contains some useful scripts to ease development and testing. To
run a script, the command must be prefixed by `cargo run -qp scripts -- `. For
example, to run the command `populate-db` you would write the following:

```sh
$ cargo run -qp scripts -- populate-db \
>     --merchant-name "John Doe" \
>     --merchant-email "john@example.com" \
>     --open-time 08:00 \
>     --close-time 16:00
```

You can view the help and list of available scripts by running the following
command on your terminal in the root of the repository:

```sh
$ cargo run -qp scripts -- --help
```

## Documentation

To compile documentation, make sure you have the [Rust toolchain] installed, then run the following
command on your terminal in the root of the repository:

```sh
$ cargo doc --no-deps
```

Then, you can read the compiled documentation locally by running:

```sh
$ cargo doc --open
```

or alternatively (this method can persist theme changes and other configs across doc pages):

```sh
$ cd target/doc && python3 -m http.server --bind 127.0.0.1 [PORT]
```

[Rust toolchain]: https://rustup.rs
