import React from "react";
import cookie from "react-cookies";
import jwt from "jsonwebtoken";
//import { URLSearchParams } from "url";

const API = process.env.REACT_APP_API_LIVE;

const testLogins = {
  Admin: process.env.REACT_APP_ADMIN_TOKEN || "",
  Editor: process.env.REACT_APP_EDITOR_TOKEN || "",
  User: process.env.REACT_APP_USER_TOKEN || ""
};

export const LoginContext = React.createContext();

class LoginProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      login: this.login,
      logout: this.logout,
      user: {}
    };
  }

  login = (username, password) => {
    // This is foul and unsafe ... but when working offline / testmode ess oh kay
    if (testLogins[username]) {
      console.log("in the if", testLogins);
      this.validateToken(testLogins[username]);
    } else {
      console.log(username, "in the else");
      fetch(`${API}/signin`, {
        method: "post",
        mode: "cors",
        cache: "no-cache",
        headers: new Headers({
          Authorization: `Basic ${btoa(`${username}:${password}`)}`
        })
      })
        //console.log('outside the else', username)
        .then(response => response.text())
        .then(token => this.validateToken(token))
        .catch(console.error);
    }
  };

  validateToken = token => {
    console.log("this the token on line 49", token);
    try {
      let user = jwt.verify(token, process.env.REACT_APP_SECRET);
      console.log("all good");
      this.setLoginState(true, token, user);
    } catch (e) {
      this.setLoginState(false, null, {});
      console.log("The token is having issuse", e);
    }
  };

  logout = () => {
    this.setLoginState(false, null, {});
  };

  setLoginState = (loggedIn, token, user) => {
    cookie.save("auth", token);
    this.setState({ token, loggedIn, user });
  };

  // componentDidMount() {
  //   const qs = new URLSearchParams(window.location.search);
  //   const cookieToken = cookie.load("itWorks");
  //   const token = qs.get("token") || cookieToken || null;
  //   this.validateToken(token);
  // }

  render() {
    return (
      <LoginContext.Provider value={this.state}>
        {this.props.children}
      </LoginContext.Provider>
    );
  }
}

export default LoginProvider;
