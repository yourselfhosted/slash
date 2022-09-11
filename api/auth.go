package api

type Signup struct {
	Email    string `json:"email"`
	Name     string `json:"name"`
	Password string `json:"password"`
}

type Signin struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
