// var UserServer = require("../../lib/launcher/UserServers");
// var UserApp = require("../../lib/launcher/UserApps");
// var userserver1 = null;
// var userapp1 = null;

// describe("UserApp", () => {
    
//     describe("Create UserServer1", () => {
//         var record;
//         beforeEach((done) => {
//             setTimeout(()=>{
//                 UserServer.create({
//                     uid: "chiken",
//                     server_name: "gorilla",
//                     private_key: 'priv',
//                     public_key: 'pub',
//                     provider: 'cargohost',
//                 }).then((response)=>{
//                    record = response;
//                    userserver1 = response;
//                    done();
//                 }).catch((err)=>{
//                     done();
//                 });
//             }, 2000);
//         });
//         afterEach((done)=>{
//             record = null;
//             done();
//         });
//         it(":", (done)=>{
//             expect(record).not.toBe(null);
//             expect(record.server_name).toEqual("gorilla");
//             done();
//         });
//     });
    
//     describe("Create UserApp1", () => {
//         var record;
//         beforeEach((done) => {
//             setTimeout(()=>{
//                 UserApp.create({
//                     uid: "chiken",
//                     app_name: "monkey",
//                     server: userserver1._id,
//                 }).then((response)=>{
//                   record = response;
//                   userapp1 = response;
//                   done();
//                 }).catch((err)=>{
//                     done();
//                 });
//             }, 2000);
//         });
//         afterEach(()=>{
//             record = null;
//         });
//         it(":", (done)=>{
//             expect(record).not.toBe(null);
//             expect(record.app_name).toEqual("monkey");
//             expect(record.enabled).toBe(true);
//             expect(record.template).toEqual("nodejs");
//             expect(record.port).toEqual("3000");
//             expect(record.template_variation).toEqual("v4");
//             done();
//         });
//     });
    
//     describe("FindAll", () => {
//         var record;
//         beforeEach((done) => {
//             setTimeout(()=>{
//                 UserApp.findAll().then((response)=>{
//                   record = response;
//                   done();
//                 }).catch((err)=>{
//                     done();
//                 });
//             }, 2000);
//         });
//         afterEach(()=>{
//             record = null;
//         });
//         it(":", (done)=>{
//             expect(record).not.toBe(null);
//             expect(record.length).toEqual(1);
//             expect(record[0].app_name).toEqual("monkey");
//             expect(record[0].server.server_name).toEqual('gorilla');
//             done();
//         });
//     });
    
//     describe("FindOne", () => {
//         var record;
//         beforeEach((done) => {
//             setTimeout(()=>{
//                 UserApp.findOne({app_name: 'monkey'}).then((response)=>{
//                   record = response;
//                   done();
//                 }).catch((err)=>{
//                     done();
//                 });
//             }, 2000);
//         });
//         afterEach(()=>{
//             record = null;
//         });
//         it(":", (done)=>{
//             expect(record).not.toBe(null);
//             expect(record.app_name).toEqual("monkey");
//             done();
//         });
//     });
    
//     describe("FindById", () => {
//         var record;
//         beforeEach((done) => {
//             setTimeout(()=>{
//                 UserApp.findById(userapp1._id).then((response)=>{
//                   record = response;
//                   done();
//                 }).catch((err)=>{
//                     done();
//                 });
//             }, 2000);
//         });
//         afterEach(()=>{
//             record = null;
//         });
//         it(":", (done)=>{
//             expect(record).not.toBe(null);
//             expect(record.app_name).toEqual("monkey");
//             done();
//         });
//     });
// });



// describe("Delete UserServers", () => {
    
//     describe("del UserServer1", () => {
//         var record;
//         beforeEach((done) => {
//             setTimeout(()=>{
//                 UserServer.delete({_id: userserver1._id}).then((response)=>{
//                   record = response;
//                   done();
//                 }).catch((err)=>{
//                     done();
//                 });
//             }, 2000);
//         });
//         afterEach(()=>{
//             record = null;
//         });
//         it(":", (done)=>{
//             expect(record).not.toBe(null);
//             expect(record.result).toEqual({ ok: 1, n: 1 });
//             done();
//         });
//     });
    
//     describe("del UserApp", () => {
//         var record;
//         beforeEach((done) => {
//             setTimeout(()=>{
//                 UserApp.delete({_id: userapp1._id}).then((response)=>{
//                   record = response;
//                   done();
//                 }).catch((err)=>{
//                     done();
//                 });
//             }, 2000);
//         });
//         afterEach(()=>{
//             record = null;
//         });
//         it(":", (done)=>{
//             expect(record).not.toBe(null);
//             expect(record.result).toEqual({ ok: 1, n: 1 });
//             done();
//         });
//     });
    
// });