var UserServer = require("../../lib/launcher/UserServers");
var UserApp = require("../../lib/launcher/UserApps");
var userserver1 = null;
var userserver2 = null;

describe("UserServer1", () => {
    
    describe("Create", () => {
        var record;
        beforeEach((done) => {
            setTimeout(()=>{
                UserServer.create({
                    uid: "gorilla",
                    server_name: "gorilla",
                    private_key: 'priv',
                    public_key: 'pub',
                    provider: 'cargohost',
                }).then((response)=>{
                   record = response;
                   userserver1 = response;
                   done();
                }).catch((err)=>{
                    done();
                });
            }, 2000);
        });
        afterEach(()=>{
            record = null;
        });
        it(":", (done)=>{
            expect(record).not.toBe(null);
            expect(record.uid).not.toBe(null);
            expect(record.uid).toEqual("gorilla");
            expect(record.server_name).toEqual("gorilla");
            done();
        });
    });
    
    
    describe("Create with UID Missing", () => {
        var record;
        beforeEach((done) => {
            setTimeout(()=>{
                UserServer.create({
                    server_name: "gorilla",
                    private_key: 'priv',
                    public_key: 'pub',
                    provider: 'cargohost',
                }).then((response)=>{
                  record = response;
                  userserver1 = response;
                  done();
                }).catch((err)=>{
                    done();
                });
            }, 2000);
        });
        afterEach(()=>{
            record = null;
        });
        it(":", (done)=>{
            expect(record).toBe(null);
            done();
        });
    });
    
    describe("FindAll", () => {
        var record;
        beforeEach((done) => {
            setTimeout(()=>{
                UserServer.findAll().then((response)=>{
                   record = response;
                   done();
                }).catch((err)=>{
                    done();
                });
            }, 2000);
        });
        afterEach(()=>{
            record = null;
        });
        it(":", (done)=>{
            expect(record).not.toBe(null);
            expect(record.length).toEqual(1);
            expect(record[0].server_name).toEqual("gorilla");
            done();
        });
    });
    
    describe("FindOne", () => {
        var record;
        beforeEach((done) => {
            // setTimeout(()=>{
                UserServer.findOne({server_name: 'gorilla'}).then((response)=>{
                   record = response;
                   done();
                }).catch((err)=>{
                    done();
                });
            // }, 2000);
        });
        afterEach(()=>{
            record = null;
        });
        it(":", (done)=>{
            expect(record).not.toBe(null);
            expect(record.server_name).toEqual("gorilla");
            done();
        });
    });
    
    describe("FindOne", () => {
        var record;
        beforeEach((done) => {
            // setTimeout(()=>{
                UserServer.findOne({server_name: 'gorillax'}).then((response)=>{
                   record = response;
                   done();
                }).catch((err)=>{
                    done();
                });
            // }, 2000);
        });
        afterEach(()=>{
            record = null;
        });
        it(":", (done)=>{
            expect(record).toBe(null);
            done();
        });
    });
    
    describe("FindById", () => {
        var record;
        beforeEach((done) => {
            setTimeout(()=>{
                UserServer.findById(userserver1._id).then((response)=>{
                   record = response;
                   done();
                }).catch((err)=>{
                    done();
                });
            }, 2000);
        });
        afterEach(()=>{
            record = null;
        });
        it(":", (done)=>{
            expect(record).not.toBe(null);
            expect(record.server_name).toEqual("gorilla");
            done();
        });
    });
});

describe("UserServer2", () => {
    
    describe("Create", () => {
        var record;
        beforeEach((done) => {
            setTimeout(()=>{
                UserServer.create({
                    uid: "gorilla2",
                    server_name: "gorilla2",
                    private_key: 'priv',
                    public_key: 'pub',
                    provider: 'cargohost',
                }).then((response)=>{
                   record = response;
                   userserver2 = response;
                   done();
                }).catch((err)=>{
                    done();
                });
            }, 2000);
        });
        afterEach(()=>{
            record = null;
        });
        it(":", (done)=>{
            expect(record).not.toBe(null);
            expect(record.server_name).toEqual("gorilla2");
            done();
        });
    });
    
    describe("FindAll", () => {
        var record;
        beforeEach((done) => {
            setTimeout(()=>{
                UserServer.findAll().then((response)=>{
                   record = response;
                   done();
                }).catch((err)=>{
                    done();
                });
            }, 2000);
        });
        afterEach(()=>{
            record = null;
        });
        it(":", (done)=>{
            expect(record).not.toBe(null);
            expect(record.length).toEqual(2);
            expect(record[0].server_name).toEqual("gorilla");
            expect(record[1].server_name).toEqual("gorilla2");
            done();
        });
    });
    
    describe("FindOne", () => {
        var record;
        beforeEach((done) => {
            setTimeout(()=>{
                UserServer.findOne({server_name: 'gorilla2'}).then((response)=>{
                   record = response;
                   done();
                }).catch((err)=>{
                    done();
                });
            }, 2000);
        });
        afterEach(()=>{
            record = null;
        });
        it(":", (done)=>{
            expect(record).not.toBe(null);
            expect(record.server_name).toEqual("gorilla2");
            done();
        });
    });
    
    describe("FindById", () => {
        var record;
        beforeEach((done) => {
            setTimeout(()=>{
                UserServer.findById(userserver2._id).then((response)=>{
                   record = response;
                   done();
                }).catch((err)=>{
                    done();
                });
            }, 2000);
        });
        afterEach(()=>{
            record = null;
        });
        it(":", (done)=>{
            expect(record).not.toBe(null);
            expect(record.server_name).toEqual("gorilla2");
            done();
        });
    });
});



describe("Delete UserServers", () => {
    describe("del UserServer1", () => {
        var record;
        beforeEach((done) => {
            setTimeout(()=>{
                UserServer.delete({_id: userserver1._id}).then((response)=>{
                   record = response;
                   done();
                }).catch((err)=>{
                    done();
                });
            }, 2000);
        });
        afterEach(()=>{
            record = null;
        });
        it(":", (done)=>{
            expect(record).not.toBe(null);
            expect(record.result).toEqual({ ok: 1, n: 1 });
            done();
        });
    });
    
    describe("del userserver2", () => {
        var record;
        beforeEach((done) => {
            setTimeout(()=>{
                UserServer.delete({_id: userserver2._id}).then((response)=>{
                   record = response;
                   done();
                }).catch((err)=>{
                    done();
                });
            }, 2000);
        });
        afterEach(()=>{
            record = null;
        });
        it(":", (done)=>{
            expect(record).not.toBe(null);
            expect(record.result).toEqual({ ok: 1, n: 1 });
            done();
        });
    });
});