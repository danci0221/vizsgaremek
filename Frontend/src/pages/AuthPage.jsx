export default function AuthPage({
  authMode,
  authState,
  authBusy,
  emailCheckState,
  showPassword,
  signUpForm,
  signInForm,
  onSwitchMode,
  onSignUp,
  onSignIn,
  onEmailCheck,
  onShowPasswordChange,
  onSignUpFormChange,
  onSignInFormChange,
}) {
  return (
    <section className="auth" data-testid="auth-page">
      <div className="section-heading">
        <p className="eyebrow">Fiókkezelés</p>
        <h2 data-testid="auth-heading">
          {authMode === "signup" ? "Hozz létre új fiókot" : "Jelentkezz be a fiókodba"}
        </h2>
        <p className="auth-sub">
          Regisztráció után azonnal be is leszel jelentkeztetve a SportHub oldalon.
        </p>
      </div>

      <div className="auth-shell">
        <div className="auth-tabs" role="tablist" aria-label="Fiókműveletek">
          <button
            type="button"
            className={authMode === "signup" ? "active" : ""}
            data-testid="auth-signup-tab"
            onClick={() => onSwitchMode("signup")}
          >
            Regisztráció
          </button>
          <button
            type="button"
            className={authMode === "signin" ? "active" : ""}
            data-testid="auth-signin-tab"
            onClick={() => onSwitchMode("signin")}
          >
            Bejelentkezés
          </button>
        </div>

        {authState.type !== "idle" && <p className={`status ${authState.type}`}>{authState.message}</p>}

        {authMode === "signup" ? (
          <form className="auth-form" data-testid="auth-signup-form" onSubmit={onSignUp}>
            <label>
              Felhasználónév
              <input
                required
                minLength={3}
                autoComplete="username"
                value={signUpForm.username}
                onChange={(e) =>
                  onSignUpFormChange((prev) => ({ ...prev, username: e.target.value }))
                }
              />
            </label>
            <label>
              Email
              <input
                required
                type="email"
                autoComplete="email"
                value={signUpForm.email}
                onChange={(e) => {
                  onSignUpFormChange((prev) => ({ ...prev, email: e.target.value }));
                  onEmailCheck({ type: "idle", message: "" });
                }}
                onBlur={() => {
                  if (signUpForm.email.trim()) {
                    onEmailCheck(signUpForm.email);
                  }
                }}
              />
            </label>
            {emailCheckState.type !== "idle" && (
              <p className={`email-check ${emailCheckState.type}`}>{emailCheckState.message}</p>
            )}
            <label>
              Jelszó
              <div className="password-field">
                <input
                  required
                  type={showPassword.signup ? "text" : "password"}
                  minLength={6}
                  autoComplete="new-password"
                  value={signUpForm.password}
                  onChange={(e) =>
                    onSignUpFormChange((prev) => ({ ...prev, password: e.target.value }))
                  }
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    onShowPasswordChange((prev) => ({ ...prev, signup: !prev.signup }))
                  }
                >
                  {showPassword.signup ? "Elrejt" : "Mutat"}
                </button>
              </div>
            </label>
            <label>
              Jelszó újra
              <div className="password-field">
                <input
                  required
                  type={showPassword.signupConfirm ? "text" : "password"}
                  minLength={6}
                  autoComplete="new-password"
                  value={signUpForm.confirmPassword}
                  onChange={(e) =>
                    onSignUpFormChange((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    onShowPasswordChange((prev) => ({
                      ...prev,
                      signupConfirm: !prev.signupConfirm,
                    }))
                  }
                >
                  {showPassword.signupConfirm ? "Elrejt" : "Mutat"}
                </button>
              </div>
            </label>
            <button type="submit" className="cta" disabled={authBusy}>
              {authBusy ? "Regisztráció folyamatban..." : "Fiók létrehozása"}
            </button>
          </form>
        ) : (
          <form className="auth-form" data-testid="auth-signin-form" onSubmit={onSignIn}>
            <label>
              Felhasználónév vagy email
              <input
                required
                autoComplete="username"
                value={signInForm.identifier}
                onChange={(e) =>
                  onSignInFormChange((prev) => ({ ...prev, identifier: e.target.value }))
                }
              />
            </label>
            <label>
              Jelszó
              <div className="password-field">
                <input
                  required
                  type={showPassword.signin ? "text" : "password"}
                  autoComplete="current-password"
                  value={signInForm.password}
                  onChange={(e) =>
                    onSignInFormChange((prev) => ({ ...prev, password: e.target.value }))
                  }
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    onShowPasswordChange((prev) => ({ ...prev, signin: !prev.signin }))
                  }
                >
                  {showPassword.signin ? "Elrejt" : "Mutat"}
                </button>
              </div>
            </label>
            <button type="submit" className="cta" disabled={authBusy}>
              {authBusy ? "Bejelentkezés..." : "Bejelentkezés"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
