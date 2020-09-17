// ==UserScript==
// @name         My Bid
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  try to take over the world!
// @author       You
// @match        *://*.ebay.com/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/usoff82/UserScrips/master/ebaybid.js
// ==/UserScript==
var BidTimestamp;

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
    const DaysFmt = timeLeftStr.match(/(\d{1,2})\s?d.*\s(\d{1,2})\s?h.*/);
    const HoursFmt = timeLeftStr.match(/(\d{1,2})h\s(\d{1,2})m\s(\d{1,2})s/);
    const MinsFmt = timeLeftStr.match(/(\d{1,2})m\s(\d{1,2})s/);
    const SecsFmt = timeLeftStr.match(/(\d{1,2})s/);
    if (DaysFmt != null) {
      timeLeft = DaysFmt[1] * 24 * 60 * 60 + DaysFmt[2] * 60 * 60;
    } else if (HoursFmt != null) {
      timeLeft = HoursFmt[1] * 60 * 60 + HoursFmt[2] * 60 + HoursFmt[3] * 1;
    } else if (MinsFmt != null) {
      timeLeft = MinsFmt[1] * 60 + MinsFmt[2] * 1;
    } else if (SecsFmt != null) {
      timeLeft = SecsFmt[1] * 1;
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
      BidTimestamp = Date.now();
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
        console.log('Confirm: ' + document.getElementById("vi-cdown_timeLeft").innerText + ' / ' + Date.now() + ', ' + (Date.now() - BidTimestamp) + ' ms.');
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
    //document.getElementById("MaxBidId").value = Number(document.getElementById("MaxBidId").attributes.getNamedItem("aria-label").value.match(/\$([0-9]+[\.,0-9]*)/)[1]);
    document.getElementById("MaxBidId").value = Number(document.getElementById("w1-19-_mtb").innerText.match(/\$([0-9]+[\.,0-9]*)/)[1]);
  }
  /* Add event on max bid input field */
  checkElement('#MaxBidId')
    .then((element) => {
      document.getElementById("MaxBidId").addEventListener("dblclick", OnMaxBidId);
      /* Add controls */
      const div = document.createElement('div');
      div.innerHTML = '<div class="timeLeft" style="margin-top: 14px;"><input id="MyBidTime" class="notranslate MaxBidClass" type="text" autocomplete="off" size="5" maxlength="10" name="timebid" value="" aria-label="Time Bid"></div><div class="bidAmt">Bid time, sec.</div><button id="MyBidBtn" style="margin-top: 14px;">Put Delayed Bid</button> ';
      document.querySelector('div.vi-price').appendChild(div);
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
