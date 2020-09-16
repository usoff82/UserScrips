// ==UserScript==
// @name         My Bid
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *://*.ebay.com/*
// @grant        none
// ==/UserScript==


window.addEventListener('load', function () {
  /* Async function */
  function rafAsync() {
    return new Promise(resolve => {
      requestAnimationFrame(resolve); //faster than set time out
    });
  }


  /* Check element is exits*/
  function checkElement(selector) {
    if (document.querySelector(selector) === null) {
      return rafAsync().then(() => checkElement(selector));
    } else {
      return Promise.resolve(true);
    }
  }


  /* Convert time string to seconds*/
  function getTimeLeft(timeLeftStr) {
    let timeLeft = null;
    if (timeLeftStr.match(/(\d{1,2})\sday/) != null) {
      timeLeft = timeLeftStr.match(/(\d{1,2})\sday/)[1] * 24 * 60 * 60 + timeLeftStr.match(/(\d{1,2})\shour/)[1] * 60 * 60;
    } else if (timeLeftStr.match(/(\d{1,2})d/) != null) {
      timeLeft = timeLeftStr.match(/(\d{1,2})d/)[1] * 24 * 60 * 60 + timeLeftStr.match(/(\d{1,2})h/)[1] * 60 * 60;
    } else if (timeLeftStr.match(/(\d{1,2})h/) != null) {
      timeLeft = timeLeftStr.match(/(\d{1,2})h/)[1] * 60 * 60 + timeLeftStr.match(/(\d{1,2})m/)[1] * 60 + timeLeftStr.match(/(\d{1,2})s/)[1] * 1;
    }
    return timeLeft;
  }


  /* Timer function */
  function checkTime() {
    const timeLeftNum = getTimeLeft(document.getElementById("vi-cdown_timeLeft").innerText);
    const MyBidTime = document.getElementById("MyBidTime").value || timeLeftNum;
    //console.log('checkTime: ' + (timeLeftNum - MyBidTime));
    if (MyBidTime < timeLeftNum) {
      return rafAsync().then(() => checkTime());
    } else {
      console.log('checkTime: ' + document.getElementById("vi-cdown_timeLeft").innerText + ' / ' + Date.now());
      return Promise.resolve(true);
    }
  }


  /* Place Delayed Bid button */
  function PutDelayedBid() {
    function MyBid() {
      const MaxBidId = document.getElementById("MaxBidId");
      const bidBtn = document.getElementById("bidBtn_btn");

      const bidPrice = Number(document.getElementById("prcIsum_bidPrice").innerText.match(/\$([0-9]+[\.,0-9]*)/)[1]);
      let MinBidSum = Number(MaxBidId.attributes.getNamedItem("aria-label").value.match(/\$([0-9]+[\.,0-9]*)/)[1]);

      // корректировка минимальной ставки если она оказалась меньше текущей цены
      if (MinBidSum <= bidPrice || MinBidSum === null) {
        MinBidSum = Math.round((bidPrice || 0) * (101)) / 100;
      }

      const timeLeftNum = getTimeLeft(document.getElementById("vi-cdown_timeLeft").innerText);
      const MyBidTime = document.getElementById("MyBidTime");
      console.log('MyBid: ' + MinBidSum + ' <= ' + MaxBidId.value);
      if (MinBidSum <= MaxBidId.value) {
        console.log('MyBid: ' + document.getElementById("vi-cdown_timeLeft").innerText + ' / ' + Date.now());
        bidBtn.click();
      }
    }
    console.log('PutDelayedBid: ' + document.getElementById("vi-cdown_timeLeft").innerText + ' / ' + Date.now());
    document.getElementById("MyBidBtn").disabled = true;
    return checkTime()
      .then(() => {
        MyBid();
        document.getElementById("MyBidBtn").disabled = false;
      });
  }
  /* Add event on Place Bid button */
  checkElement('#MyBidBtn') //use whichever selector you want
    .then((element) => {
      document.getElementById("MyBidBtn").addEventListener("click", PutDelayedBid);
    });


  /* Place bid button */
  function OnBidBtn() {
    console.log("OnBidBtn: " + document.getElementById("vi-cdown_timeLeft").innerText + ' / ' + Date.now());
    checkElement('#confirm_button')
      .then((element) => {
        const confirmBtn = document.getElementById("confirm_button");
        console.log('Confirm: ' + document.getElementById("vi-cdown_timeLeft").innerText + ' / ' + Date.now());
        //confirmBtn.click();
      });
  }
  /* Add event on Place bid button */
  checkElement('#bidBtn_btn')
    .then((element) => {
      document.getElementById("bidBtn_btn").addEventListener("click", OnBidBtn);
    });


  /* Fill minimal bid on double click */
  function OnMaxBidId() {
    document.getElementById("MaxBidId").value = Number(document.getElementById("MaxBidId").attributes.getNamedItem("aria-label").value.match(/\$([0-9]+[\.,0-9]*)/)[1]);
  }
  /* Add event on max bid input field */
  checkElement('#MaxBidId')
    .then((element) => {
      document.getElementById("MaxBidId").addEventListener("dblclick", OnMaxBidId);
    });


  /* Fill time on double click */
  function OnMyBidTime() {
    document.getElementById("MyBidTime").value = getTimeLeft(document.getElementById("vi-cdown_timeLeft").innerText) - 5;
  }
  /* Add event on bid time input field */
  checkElement('#MyBidTime')
    .then((element) => {
      document.getElementById("MyBidTime").addEventListener("dblclick", OnMyBidTime);
    });
});


/* Add controls */
var div = document.createElement('div');
div.innerHTML = '<div class="timeLeft" style="margin-top: 14px;"><input id="MyBidTime" class="notranslate MaxBidClass" type="text" autocomplete="off" size="5" maxlength="10" name="timebid" value="" aria-label="Time Bid"></div><div class="bidAmt">Bid time, sec.</div><button id="MyBidBtn" style="margin-top: 14px;">Put Delayed Bid</button> ';
document.querySelector('div.vi-price').appendChild(div);
