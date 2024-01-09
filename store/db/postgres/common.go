package postgres

import (
	"fmt"
	"strings"
)

func placeholder(n int) string {
	return "$" + fmt.Sprint(n)
}

func placeholders(n int) string {
	list := []string{}
	for i := 0; i < n; i++ {
		list = append(list, placeholder(i+1))
	}
	return strings.Join(list, ", ")
}
