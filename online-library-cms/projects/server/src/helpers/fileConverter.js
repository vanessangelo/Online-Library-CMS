const path = require("path");
module.exports = {
  setFromFileNameToDBValueBookCover(filename) {
    return `/src/Public/book/${filename}`;
  },
  getAbsolutePathPublicFileBookCover(filename) {
    return path.join(__dirname, "..", "Public", "book", filename);
  },
  convertFromDBtoRealPath(dbvalue) {
    return `${process.env.BASE_PATH}${dbvalue}`;
  },
  getFileNameFromDbValue(dbValue) {
    if (!dbValue || dbValue === "") {
      return "";
    }
    const split = dbValue.split("/");
    if (split.length < 5) {
      return "";
    }
    return split[4];
  },
};
