package util

import (
	"testing"
)

func TestValidateEmail(t *testing.T) {
	tests := []struct {
		email string
		want  bool
	}{
		{
			email: "t@gmail.com",
			want:  true,
		},
		{
			email: "@yourselfhosted.com",
			want:  false,
		},
		{
			email: "1@gmail",
			want:  true,
		},
	}
	for _, test := range tests {
		result := ValidateEmail(test.email)
		if result != test.want {
			t.Errorf("Validate Email %s: got result %v, want %v.", test.email, result, test.want)
		}
	}
}

func TestValidateURI(t *testing.T) {
	tests := []struct {
		uri  string
		want bool
	}{
		{
			uri:  "https://localhsot:3000",
			want: true,
		},
		{
			uri:  "https://yourselfhosted.com",
			want: true,
		},
		{
			uri:  "google.com",
			want: false,
		},
		{
			uri:  "i don't know",
			want: false,
		},
	}
	for _, test := range tests {
		result := ValidateURI(test.uri)
		if result != test.want {
			t.Errorf("Validate URI %s: got result %v, want %v.", test.uri, result, test.want)
		}
	}
}
