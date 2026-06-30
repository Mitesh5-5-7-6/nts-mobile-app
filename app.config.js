const appJson = require("./app.json");

module.exports = ({ config }) => {
  const base = appJson.expo;
  return {
    ...config,
    ...base,
    android: {
      ...base.android,
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? base.android.googleServicesFile,
    },
  };
};
