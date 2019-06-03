module.exports = api => {
  const isTest = api.env("test");
  const presets = isTest
    ? ["@babel/preset-react", "@babel/preset-typescript", "@babel/preset-env"]
    : ["@babel/preset-react", "@babel/preset-typescript", "minify"];

  return {
    presets,
    comments: false,
    sourceMaps: true,
    include: ["./src"],
    exclude: ["*.spec.tsx"]
  };
};
