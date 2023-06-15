package main

import (
	_ "modernc.org/sqlite"

	"github.com/boojack/shortify/cmd"
)

func main() {
	err := cmd.Execute()
	if err != nil {
		panic(err)
	}
}
