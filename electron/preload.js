const {readFileSync,  writeFileSync} = require("fs"); 

let fio; 

read_file = file_name => {
    return readFileSync(file_name);
} 

write_file = (file_name, data) => {
    writeFileSync(file_name, data);
}