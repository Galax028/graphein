# Graphein

## Scripts

This repository contains some useful scripts to ease development and testing. To
run a script, the command must be prefixed by
`cargo run -qp graphein-scripts -- `. For example, to run the command
`populate-db`, you would write the following:

```sh
$ cargo run -qp graphein-scripts -- populate-db \
>     --merchant-name "John Doe" \
>     --merchant-email "john@example.com" \
>     --open-time 08:00 \
>     --close-time 16:00
```

You can view the help and list of available scripts by running the following
command on your terminal in the root of the repository:

```sh
$ cargo run -qp graphein-scripts -- --help
```
