interface Profile {
  mode: string;
  version: string;
}

interface WorkspaceProfile {
  profile: Profile;
  disallowSignUp: boolean;
}
