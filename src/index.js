'use strict';
const Alexa = require("alexa-sdk");
const APP_ID = 'amzn1.ask.skill.5337a86a-9995-47da-8079-318d4d9f5e3d'
var AWS = require('aws-sdk');
var ua = require('universal-analytics');
var googleUA = 'UA-104151044-2'; //tracking ID

AWS.config.update({
  region: "us-east-1"
});

var docClient = new AWS.DynamoDB.DocumentClient();
var totalTips = process.env.TOTAL_TIP_COUNT;
var tipsHeard = [];

var speechOutput;
const welcomeOutput = "Hello, I am going to begin by asking you a few questions about yourself, to calculate how many years you have left to live. Please try to answer your questions with numbers, to help with my calculation. "
+ "Tell me to begin when you are ready. ";
var reprompt = "Just tell me when you're ready, to begin. ";
const myYearsLeftIntro = [
  "Okay. ",
  "Great. ",
  "Nice. ",
  "Alright. ",
  "Excellent. ",
  "Thank you! ",
  "Splendid! "
];

var cardTitle = '';
var cardContent = '';
var imageObj = {
    smallImageUrl: 'https://s3.amazonaws.com/mydaysleftlogo/yearsLeft(108x108)fixedshadow2.png',
    largeImageUrl: 'https://s3.amazonaws.com/mydaysleftlogo/yearsLeft(512x512)fixedshadow2.png'
};

const handlers = {
  'LaunchRequest': function() {


    // Make sure this is a locally-scoped var within each intent function.
    var intentTrackingID = ua(googleUA, {https: true});
    // Google Analytics
    intentTrackingID.pageview("/").send();

    if(process.env.debugFlag){
      console.log('Launching LaunchRequest...')
      console.log('this.attributes["daysLeft"] = ' + this.attributes['daysLeft'])
    };
    if(this.attributes['daysLeft'] !== undefined) {
      if(process.env.debugFlag){console.log('this.attributes["tipsHeard"] = ' + this.attributes["tipsHeard"])};
      tipsHeard = this.attributes["tipsHeard"];
      if (tipsHeard === undefined) {
        tipsHeard = [];
      }

      // this.handler.response0.cardRenderer(cardTitle, cardTitle).setResponse();

      readItem(this, tipsHeard, function(obj, data) {
        if(process.env.debugFlag){console.log("data in readItem: " + data)};

        tipsHeard.push(data['Id']);
        obj.attributes['tipsHeard'] = tipsHeard;

        cardTitle = "Years Left: " + obj.attributes['averageYearsLeft'] + "\n";
        cardContent = 'Days left: ' + obj.attributes['daysLeft'] + '\nHere is your tip: ' + data['tipSimple']  + '\n...\nIf you enjoyed this skill, please rate it 5 stars in the Alexa skill store!\n...\n All you need to do is: \n1. Go to the "Skills" section on your Alexa app\n 2. Tap "Your Skills" in the top right corner\n3. Find "My Years Left" \n4. Scroll to the bottom and tap "Write a Review"\n5. Show support! \n...\n Enjoy your Years left! :)';

        // obj.emit(':tellWithCard', speechOutput, cardTitle, cardContent, imageObj);

        obj.response.cardRenderer(cardTitle, cardContent, imageObj);
        obj.response.speak("Welcome back, you have " + obj.attributes['averageYearsLeft'] + ' years left to live. <break time=".5s"/> which equals to ' + obj.attributes['daysLeft'] + " days left." +
          " Here is a tip, to help you live a longer and healthier life. " + data['tip'] + '<break time="1s"/> I added this tip, and more information, on your Alexa skill.' + "Please don't be afraid to come back for more tips. Thank you!");
        obj.emit(':responseReady');


        if(process.env.debugFlag){
          console.log("Tips so far: " + tipsHeard)
          console.log("TOTAL TIPS HEARD: " + tipsHeard.length)
        };
      });

      // this.emit(':tellWithCard', speechOutput, cardTitle, cardContent, imageObj);

    } else if (this.attributes['daysLeft'] == undefined) {
      if(process.env.debugFlag){console.log("Starting DaysLeftIntent...")}
      this.response.speak(welcomeOutput).listen(reprompt);

      this.emit(':responseReady');
    };
  },
  'DaysLeftIntent': function() {


    var filledSlots = delegateSlotCollection.call(this);
    console.log("filled slots: " + JSON.stringify(filledSlots));
    var speechOutput = randomPhrase(myYearsLeftIntro);

      var dateOfBirth=this.event.request.intent.slots.dateOfBirth.value;
      this.attributes['dateOfBirth'] = dateOfBirth;
      var weight=this.event.request.intent.slots.weight.value;
      this.attributes['weight'] = weight;
      var exercise=this.event.request.intent.slots.exercise.value;
      this.attributes['exercise'] = exercise;
      var smoke=this.event.request.intent.slots.smoke.value;
      this.attributes['smoke'] = smoke;
      var drivingAccident=this.event.request.intent.slots.drivingAccident.value;
      this.attributes['drivingAccident'] = drivingAccident;
      var drivingDUI=this.event.request.intent.slots.drivingDUI.value;
      this.attributes['drivingDUI'] = drivingDUI;
      var alcohol=this.event.request.intent.slots.alcohol.value;
      this.attributes['alcohol'] = alcohol;
      var stress=this.event.request.intent.slots.stress.value;
      this.attributes['stress'] = stress;
      var height=this.event.request.intent.slots.height.value;
      this.attributes['height'] = height;
      var sleep=this.event.request.intent.slots.sleep.value;
      this.attributes['sleep'] = sleep;
      var fastfood=this.event.request.intent.slots.fastfood.value;
      this.attributes['fastfood'] = fastfood;
      var doctorvisits=this.event.request.intent.slots.doctorvisits.value;
      this.attributes['doctorvisits'] = doctorvisits;

      var yearsLeft = 0;
      var today = new Date();
      var currentDate = today.getFullYear() + '-'
      + (today.getMonth()+1) + '-' + today.getDate();
      var age = parseInt(currentDate) - parseInt(dateOfBirth);
      var bodyMassIndex = (parseInt(weight)*703)/(parseInt(height)*parseInt(height));

                        // exercise condition

      if(parseInt(exercise) >= 2 && parseInt(exercise) <= 6) {
        yearsLeft += 3;
      } else if (parseInt(exercise) >= 7) {
        yearsLeft += 5;
      } else if (parseInt(exercise) == 1){
        yearsLeft += 1;
      } else {
        yearsLeft += 0;
      };
                          // stress condition
      if(parseInt(stress) <= 4) {
        yearsLeft += 1;
      } else if (parseInt(stress) >= 6) {
        yearsLeft -= 4;
      } else if (parseInt(stress) == 5) {
        yearsLeft -= 1;
      }

                          //smoking condition
      if(parseInt(smoke) == 0 || smoke == "none" || smoke == "i don't smoke") {
        yearsLeft += 2;
      } else if(parseInt(smoke) >= 2) {
        yearsLeft -= 8;
      };

                          //accident condition
      if(parseInt(drivingAccident) >= 4) {
        yearsLeft -= 4;
      } else if(parseInt(drivingAccident) >= 1) {
        yearsLeft += 0;
      } else {
        yearsLeft += 1;
      };
                          // DUI condition
      if(parseInt(drivingDUI) == 1 || 'once') {
        yearsLeft -= 6;
      } else if (parseInt(drivingDUI) > 1) {
        yearsLeft -= 12;
      } else {
        yearsLeft += 1;
      };

                          // BMI condition
      if(bodyMassIndex <= 18.5) {
        yearsLeft -=1;
      } else if(bodyMassIndex <= 29) {
        yearsLeft += 0;
      } else if(bodyMassIndex <= 39) {
        yearsLeft -= 3;
      } else {
        yearsLeft -= 10;
      };


      if(parseInt(sleep) == 7) {
        yearsLeft += 1;
      } else if(parseInt(sleep) >= 8) {
        yearsLeft += 2;
      } else if (parseInt(sleep) >= 5){
        yearsLeft -= 1;
      } else {
        yearsLeft -= 1;
      };

      if(parseInt(fastfood) > 3) {
        yearsLeft -= 2;
      } else if (parseInt(fastfood) <= 3 && parseInt(fastfood) > 0) {
        yearsLeft -= 1;
      } else {
        yearsLeft += 1;
      };

                          //alcohol condition
      if(parseInt(alcohol) == 0) {
        yearsLeft += 1;
      } else if(parseInt(alcohol) <= 4) {
        yearsLeft += 0;
      } else if(parseInt(alcohol) <= 6){
        yearsLeft -= 3;
      } else if(parseInt(alcohol) >= 7){
        yearsLeft -= 8;
      }

      if(parseInt(doctorvisits) == 1 || doctorvisits == "only when i need to") {
        yearsLeft += 1;
      } else if (parseInt(doctorvisits) >= 2) {
        yearsLeft += 2;
      } else {
        yearsLeft -= 1;
      };

      //////////////////////////////////////////////////////////
      var averageYearsLeft = (yearsLeft) + (Math.round((87 - age)));
      var daysLeft = (averageYearsLeft*365);
      if(this.attributes['tipsHeard'] !== undefined) {
        tipsHeard = this.attributes["tipsHeard"];
        if (tipsHeard === undefined) {
          tipsHeard = [];
        }
      }
      this.attributes["daysLeft"] = daysLeft.toString();
      this.attributes["averageYearsLeft"] = averageYearsLeft.toString();
      if(process.env.debugFlag){
        console.log("BMI = " + bodyMassIndex)
        console.log("AVERAGE YEARS LEFT: " + averageYearsLeft)
        console.log("APPROXIMATE DAYS LEFT: " + daysLeft)
        console.log("tipsHeard: " + tipsHeard)
      };
      speechOutput += "<break time=\".6s\"/>You have " + averageYearsLeft + " years left to live.<break time=\".8s\"/> that means that you have, " + daysLeft + " days left to live. "
      speechOutput += "If you would like to hear a tip, simply start the skill again.<break time=\"1s\"/> I'm here to help you.<break time=\".3s\"/>I want you to use the rest of your days wisely, <break time=\".3s\"/> and I hope that you do.<break time=\"1s\"/> Thank you."

      cardTitle = 'Come back for a tip! ';
      cardContent = 'Years Left: ' + averageYearsLeft + '\nDays Left: ' + daysLeft + '\n...' + '\nIf you enjoyed this skill, please rate it 5 stars in the Alexa skill store. That would really help out, Thank you!' + '\n...' + '\nHere are results are based off of the answers you provided: ' + '\nYear of Birth: ' + parseInt(dateOfBirth) + '\nHeight: ' + parseInt(height) + 'in' + '\nWeight:  '+ parseInt(weight) + 'lbs' + '\nExercise: ' + parseInt(exercise) + ' hours a week' + '\nSmoke: ' + parseInt(smoke) + ' packs of cigerettes a week' + '\nAlcohol: ' + parseInt(alcohol) + ' drinks a week' + '\nStress: ' + parseInt(stress) + '\nDriving Accidents: ' + parseInt(drivingAccident) + ' in the past 3 years' + "\nDUI's: " + parseInt(drivingDUI) + '\nFast Food: ' + parseInt(fastfood) + ' times a month' + '\nSleep: ' + parseInt(sleep) + ' hours a day' + '\nDoctor Visits: ' + parseInt(doctorvisits) + ' a year' + '\n...\n If your results are not what you expected. Simply say: "Alexa, ask My Years Left to begin" to reset your questions.';

      this.emit(':tellWithCard', speechOutput, cardTitle, cardContent, imageObj);


      // readItem(this, tipsHeard, function(obj, data) {
      //   tipsHeard.push(data['Id']);
      //   obj.attributes["tipsHeard"] = tipsHeard;
      //   if(process.env.debugFlag){console.log("data['tip']: " + data['tip'])};
      //
      //   // obj.emit(":tell", "Okay." + data['tip'] + " <break time=\".6s\"/>If you would like to hear more tips," +
      //   // "simply start the skill again.<break time=\"1s\"/> I'm here to help.<break time=\".3s\"/>I want you to use " +
      //   // "the rest of your days wisely, <break time=\".3s\"/> and I hope that you do.<break time=\"1s\"/> Thank you.");
      //   if(process.env.debugFlag){console.log("at the end of the second read item = " + tipsHeard)};
      // });

      if(process.env.debugFlag){console.log("tipsHeard after: " + tipsHeard)};
      this.response.speak(speechOutput);
      this.emit(":responseReady");
    },
    "AMAZON.HelpIntent": function() {
      speechOutput = "I'm going to ask you some questions, to be able to estimate how long you have to live. So just tell me when you're ready, to begin. ";
      this.response.speak(speechOutput).listen(reprompt);
      this.emit(':responseReady');
    },
    "AMAZON.StopIntent": function() {
      speechOutput = "Stopped";
      this.response.speak(speechOutput);
      this.emit(':responseReady');
    },
    "AMAZON.CancelIntent": function() {
      speechOutput = "Cancelled";
      this.response.speak(speechOutput);
      this.emit(':responseReady');
    },
    'Unhandled': function () {
      console.log("UNHANDLED");
    },
    'SessionEndedRequest': function() {
      speechOutput = "Session Ended";
      this.response.speak(speechOutput);
      console.log('session ended!');
      this.emit(':responseReady');
    }
};

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  alexa.appId = 'amzn1.ask.skill.5337a86a-9995-47da-8079-318d4d9f5e3d';
  alexa.dynamoDBTableName = 'myYearsLeft';
  alexa.registerHandlers(handlers);
  alexa.execute();
};


function delegateSlotCollection(){
    if(process.env.debugFlag){
      console.log("in delegateSlotCollection")
      console.log("current dialogState: " + this.event.request.dialogState);
      console.log("current event object: " + JSON.stringify(this.event))
      console.log("current event attributes: " + JSON.stringify(this.event.request.intent.slots))
    };
      if (this.event.request.dialogState === "STARTED") {
        if(process.env.debugFlag){
            console.log("in Beginning");
            console.log("this.event.request.intent: " + JSON.stringify(this.event.request.intent));
          };
        var updatedIntent=this.event.request.intent;
        //optionally pre-fill slots: update the intent object with slot values for which
        //you have defaults, then return Dialog.Delegate with this updated intent
        // in the updatedIntent property
        this.emit(":delegate", updatedIntent);
      } else if (this.event.request.dialogState !== "COMPLETED") {
        if(process.env.debugFlag){console.log("in not completed")};
        // return a Dialog.Delegate directive with no updatedIntent property.
        this.emit(":delegate");
      } else {
        if(process.env.debugFlag){
          console.log("in completed")
          console.log("returning: "+ JSON.stringify(this.event.request.intent))
        };
        // Dialog is now complete and all required slots should be filled,
        // so call your normal intent handler.
        return this.event.request.intent;
      }
}

function randomPhrase(array) {
  var i = 0;
  i = Math.floor(Math.random() * array.length);
  return(array[i]);
}

function readItem(obj, pastTips, callback) {
  var table = "Tips";
  var id = getRandomTipWithExclusions(totalTips, tipsHeard, obj).toString();
  var params = {
    TableName: table,
    Key:{
      "Id": id
    }
  };
  if(process.env.debugFlag){console.log("GetItem Params: ", JSON.stringify(params))};
  docClient.get(params, function(err, data) {
    if(err) {
      console.error("Unable to read item. Error JSON:", JSON.stringify(err));
    } else {
      if(process.env.debugFlag){console.log("GetItem succeeded:", JSON.stringify(data))};
      //
      callback(obj, data['Item']);
    }
  });
}

function getRandomTipWithExclusions(lengthOfArray = 0, arrayOfIndexesToExclude, obj) {
	var rand = 0;
	if (arrayOfIndexesToExclude.length == lengthOfArray) {
		arrayOfIndexesToExclude = [];
		obj.tipsHeard = [];
		if(process.env.debugFlag){
      console.log('RESET TIPSHEARD')
      console.log('TIPSHEARD = ' + obj.tipsHeard)
    };
	}
	var min = Math.ceil(1);
  var max = Math.floor(lengthOfArray);
	while (rand == 0 || arrayOfIndexesToExclude.includes(rand)) {
		rand = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log("random number from loop: " + rand);
	}
  return rand;
}

function isSlotValid(request, slotName){
        var slot = request.intent.slots[slotName];
        //console.log("request = "+JSON.stringify(request)); //uncomment if you want to see the request
        var slotValue;

        //if we have a slot, get the text and store it into speechOutput
        if (slot && slot.value) {
            //we have a value in the slot
            slotValue = slot.value.toLowerCase();
            return slotValue;
        } else {
            //we didn't get a value in the slot.
            return false;
        }
}
