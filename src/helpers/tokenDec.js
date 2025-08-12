import { jwtDecode } from "jwt-decode";

const tokenDec = (token = localStorage.getItem("token")) => {
  try {
    const decoded = jwtDecode(token);
    if (Date.now() >= decoded.exp * 1000) {
      return false;
    }
    return decoded.payload;
  } catch (error) {
    return null;
  }
};

export default tokenDec;
