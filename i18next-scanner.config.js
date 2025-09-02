module.exports = {
  input: [
    "./src/**/*.{ts,tsx}"
  ],
  output: "",
  options: {
    debug: true,
    removeUnusedKeys: true,
    func: {
      list: ["t"],
      extensions: [".ts", ".tsx"]
    },
    lngs: ["en"],
    defaultLng: "en",
    ns: ["common"],
    defaultNs: "common",
    resource: {
      loadPath: "./src/messages/{{lng}}/{{ns}}.json",
      savePath: "./src/messages/{{lng}}/{{ns}}.json",
      jsonIndent: 2
    }
  }
};

