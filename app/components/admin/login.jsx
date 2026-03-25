export default function logIn({
  
}) {

  return (
    <section className="login-section">
      <h2 className="login-title">Login</h2>

      <form className="login-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input type="text" id="username" name="username" required />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
        </div>

        <button type="submit" className="login-button">
          Log In
        </button>
      </form>
    </section>
  );

}