package api

type Signup struct {
	Email       string `json:"email"`
	DisplayName string `json:"displayName"`
	Password    string `json:"password"`
}

type Signin struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
