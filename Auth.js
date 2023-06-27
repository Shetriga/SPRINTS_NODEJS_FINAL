class Auth {
  constructor() {
    this.isLoggedIn = false;
  }

  login = () => {
    this.isLoggedIn = true;
  };

  getLoginStatus = () => {
    return this.isLoggedIn;
  };
}

module.exports = Auth;
