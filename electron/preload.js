const {readFileSync,  writeFileSync} = require("fs"); 
const {ipcRenderer} = require("electron");

ipc_send = (message_identifier, data) => ipcRenderer.send(message_identifier, data);
ipc_receive = (message_identifier, callback) => {
    ipcRenderer.on(message_identifier, (event, arg) => {
        callback(arg);
    })
}
ipc_response = (message_identifier, data) => ipcRenderer.on(message_identifier, (event, args) => {
    event.sender.send(message_identifier, data);
}) 

read_file = file_name => {return readFileSync(file_name)}; 
write_file = (file_name, data) => writeFileSync(file_name, data);

