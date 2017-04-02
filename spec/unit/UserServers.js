var UserServer = require("../../lib/userspace/UserServers");
var userserver1 = null;

describe("Create UserServer", () => {
    describe("Verify", () => {
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
            expect(record.server_name).toEqual("gorilla");
            done();
        });
    });
});



describe("Delete UserServer", () => {
    describe("Verify", () => {
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
});