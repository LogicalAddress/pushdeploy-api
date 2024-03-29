var User = require("../../lib/User");
var subModel = require("../../lib/launcher/Subscriptions");
var Payments = require("../../lib/launcher/Payments");
var config = require("../../config/app");
var emailManagement = require('../../lib/emailManagement');
var notifier = require('../../lib/launcher/notifier');

module.exports = function (app, io) {
	app.post('/stripe/notification', async function (req, res, next) {

        if(req.body.type === 'checkout.session.completed'){
            console.log('checkout.session.completed');
            try{
                let user = await User.findOne({uid: req.body.data.object.client_reference_id});
                if(!user.noSubscription && user.last_subscriptionId && user.last_subscriptionId.length){
                    //cancel previous sub here
                    try{
                        const stripe = require('stripe')(config.payment.stripeSecretKey)
                        stripe.subscriptions.del(user.last_subscriptionId);
                    }catch(error){
                        console.log("unable to cancel subscription, die silently..", error.message);
                    }
                }

                setTimeout(async() => {
                    //Wait for deleteSubscription webhook to fire
                    user = await User.update({update: { last_subscriptionId: req.body.data.object.subscription, noSubscription: false, primaryPlan: req.body.data.object.display_items[0].plan.id}, 
                    query: {uid: req.body.data.object.client_reference_id}});
                
                    await subModel.create({
                        uid: user.uid,
                        raw: JSON.stringify(req.body),
                        name: user.name,
                        plan: req.body.data.object.display_items[0].plan.id,
                        email: req.body.data.object.customer_email,
                        customerId: req.body.data.object.customer,
                        mobileNumber: user.mobileNumber,
                        amount: req.body.data.object.display_items[0].amount,
                        subscriptionId: req.body.data.object.subscription
                    });
                    return res.status(200).send("OK");
                }, 3000);
            }catch(error){
                notifier({
					status: 'system error',
					error: error.message,
					file: __filename,
					data: {
						ACTION: "PAYMENT",
						MESSAGE: 'SUBSCRIPTION PROBLEM',
						DATA: req.body
					}
				});
                return res.status(500).json({status: 'failure', message: error.message});
            };
        }else
        if(req.body.type === 'customer.subscription.created'){
            console.log('customer.subscription.created');
            try{
                let user = await subModel.update({
                    update: {
                        subscription_created: true
                    },
                    query: {
                        customerId: req.body.data.object.customer,
                        subscriptionId: req.body.data.object.id
                }});
                res.status(200).send("OK");
                return;
            }catch(error){
                notifier({
					status: 'system error',
					error: error.message,
					file: __filename,
					data: {
						ACTION: "PAYMENT",
						MESSAGE: 'SUBSCRIPTION PROBLEM',
						DATA: req.body
					}
				});
                return res.status(500).json({status: 'failure', message: error.message});
            }
        }else if(req.body.type === 'customer.subscription.deleted'){
            console.log('customer.subscription.deleted');
            try{
                res.status(200).send("OK");
            }catch(error){
                notifier({
					status: 'system error',
					error: error.message,
					file: __filename,
					data: {
						ACTION: "PAYMENT",
						MESSAGE: 'SUBSCRIPTION PROBLEM',
						DATA: req.body
					}
				});
                return res.status(500).json({status: 'failure', message: error.message});
            };
        }else if(req.body.type === 'customer.created'){
            console.log('customer.created');
            try{
                await User.update({update: { stripeCustomerId: req.body.data.object.id}, 
                query: {email: req.body.data.object.email}});
                return res.status(200).send("OK");
            }catch(error){
                notifier({
					status: 'system error',
					error: error.message,
					file: __filename,
					data: {
						ACTION: "PAYMENT",
						MESSAGE: 'SUBSCRIPTION PROBLEM',
						DATA: req.body
					}
				});
                return res.status(500).json({status: 'failure', message: error.message});
            };
        }else if(req.body.type === 'charge.succeeded'){
            console.log('charge.succeeded');
            try{
                // let user = await User.findOne({email: req.body.data.object.billing_details.email});
                let user = await User.update({update: { chargeFailed: false}, query: {email: req.body.data.object.billing_details.email}});
                await Payments.upsert({
                    update: {
                        status: "success",
                        customerId: req.body.data.object.customer,
                        amount: req.body.data.object.amount,
                        chargeSuccess: JSON.stringify(req.body),
                        email: req.body.data.object.billing_details.email,
                        uid: user.uid,
                        description: req.body.data.object.statement_descriptor,
                        receipt_url: req.body.data.object.receipt_url,
                    },
                    query: {
                        chargeReference: req.body.data.object.id
                }});
                res.status(200).send("OK");

                try{
                    let emailMeta = {
                        "templateName": "SubscriptionPaymentSuccess",
                        "transport" : "sendgrid",
                        "from" : "no-reply@pushdeploy.io", 
                        "to" : user.email,
                        "subject":"Pushdeploy Payment Success",
                        "emailbody" : {
                            Username: user.name,
                            amount: req.body.data.object.amount,
                            receipt_url: req.body.data.object.receipt_url,      
                        }
                    }     
                    let result = await emailManagement.sendEmail(emailMeta);
                    if(!result){
                        let retryTimes = 0;
                        let tiid = setInterval(async function(){
                            result = await emailManagement.sendEmail(emailMeta);
                            if(result || retryTimes >= 10){
                                clearInterval(tiid);
                                console.log("emailManagement", {result, retryTimes});
                                return;
                            }
                            retryTimes++;
                        }, 10000);
                    }
                    console.log("emailManagement", {result});
                }catch(error){
                    console.log("emailManagement", {error});
                }

                try{
                    io.to(user.uid).emit('PAYMENT_SUCCESS', req.body.data.object.amount);
                }catch(err){
                    console.log("socket.io failed", err.message);
                }

            }catch(error){
                notifier({
					status: 'system error',
					error: error.message,
					file: __filename,
					data: {
						ACTION: "PAYMENT",
						MESSAGE: 'SUBSCRIPTION PROBLEM',
						DATA: req.body
					}
				});
                return res.status(500).json({status: 'failure', message: error.message});
            }
        }else if(req.body.type === 'charge.pending'){
            console.log('customer.pending');
            try{
                let user = await User.findOne({email: req.body.data.object.email});
                await Payments.upsert({
                    update: {
                        status: "pending",
                        customerId: req.body.data.object.customer,
                        amount: req.body.data.object.amount,
                        chargePending: JSON.stringify(req.body),
                        email: req.body.data.object.billing_details.email,
                        uid: user.uid,
                        description: req.body.data.object.statement_descriptor,
                    },
                    query: {
                        chargeReference: req.body.data.object.id
                }});
                res.status(200).send("OK");
            }catch(error){
                return res.status(500).json({status: 'failure', message: error.message});
            }
            res.status(200).send("OK");
        }else if(req.body.type === 'charge.failed'){
            console.log('charge.failed');
            try{
                // let user = await User.findOne({email: req.body.data.object.billing_details.email});
                let user = await User.update({update: { chargeFailed: true, chargeFailedDate: new Date()}, query: {email: req.body.data.object.billing_details.email}});
                await Payments.upsert({
                    update: {
                        status: "failed",
                        customerId: req.body.data.object.customer,
                        amount: req.body.data.object.amount,
                        chargeFailure: JSON.stringify(req.body),
                        email: req.body.data.object.billing_details.email,
                        uid: user.uid,
                        description: req.body.data.object.statement_descriptor,
                    },
                    query: {
                        chargeReference: req.body.data.object.id
                }});
                notifier({
					status: 'system error',
					error: "payment problem",
					file: __filename,
					data: {
						ACTION: "PAYMENT",
						MESSAGE: 'SUBSCRIPTION PROBLEM',
						DATA: req.body
					}
				});
                res.status(200).send("OK");

                try{
                    let emailMeta = {
                        "templateName": "SubscriptionPaymentFailure",
                        "transport" : "sendgrid",
                        "from" : "no-reply@pushdeploy.io", 
                        "to" : user.email,
                        "subject":"Pushdeploy Subscription Failure",
                        "emailbody" : {
                            Username: user.name,
                            plan: user.primaryPlan,
                            description: req.body.data.object.statement_descriptor,
                            amount: req.body.data.object.amount,
                        }
                    }     
                    let result = await emailManagement.sendEmail(emailMeta);
                    if(!result){
                        let retryTimes = 0;
                        let tiid = setInterval(async function(){
                            result = await emailManagement.sendEmail(emailMeta);
                            if(result || retryTimes >= 10){
                                clearInterval(tiid);
                                console.log("emailManagement", {result, retryTimes});
                                return;
                            }
                            retryTimes++;
                        }, 10000);
                    }
                    console.log("emailManagement", {result});
                }catch(error){
                    console.log("emailManagement", {error});
                }

                try{
                    io.to(user.uid).emit('PAYMENT_FAILED', req.body.data.object.amount);
                }catch(err){
                    console.log("socket.io failed", err.message);
                }
                return;
            }catch(error){
                notifier({
					status: 'system error',
					error: error.message,
					file: __filename,
					data: {
						ACTION: "PAYMENT",
						MESSAGE: 'SUBSCRIPTION PROBLEM',
						DATA: req.body
					}
				});
                return res.status(500).json({status: 'failure', message: error.message});
            }
        }else{
            res.status(500).send("NOT OK. Unexpected event sent");
        }	
	});
};