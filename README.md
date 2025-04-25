# SK Printing Facility

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
