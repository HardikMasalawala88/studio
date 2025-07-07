import axios from 'axios';

const loginApi = {
  login: (data) => {
    const payload = {
      username: data.username || data.Username,
      password: data.password || data.Password,
    };
    return axios.post('http://127.0.0.1:8000/account/login', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
};

export default loginApi;
