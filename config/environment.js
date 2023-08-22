const development = {
  name: "development",
  asset_path: "./assets",
  session_cookie_key: "something",
  db: "nodetalk",
  smtp: {
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "cheshtapal07@gmail.com",
      pass: "euyefnmonjllxqzu",
    },
  },
  google_client_id:
    "277064795300-bij1a3sa5e4mr48n904hcp9s0m333ib0.apps.googleusercontent.com",
  google_client_secret: "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",
  google_callback_url: "http://localhost:8000/users/auth/google/callback",
  jwt_secret: "nodetalk",
};

const production = {
  name: "production",
};

module.exports = development;
