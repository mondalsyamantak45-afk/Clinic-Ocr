const fs = require("fs");
const fixFile = (path) => {
  try {
    let content = fs.readFileSync(path, "utf16le");
    if (content.includes("export default")) {
       fs.writeFileSync(path, content, "utf8");
       console.log("Fixed " + path);
       return;
    }
  } catch(e) {}
  try {
    let content2 = fs.readFileSync(path, "utf8");
    let fixed = content2.replace(/\0/g, "");
    fs.writeFileSync(path, fixed, "utf8");
    console.log("Fixed " + path + " from utf8 with nulls");
  } catch(e) {}
};
fixFile("src/app/patients/[id]/page.tsx");
fixFile("src/app/prescriptions/[id]/page.tsx");

