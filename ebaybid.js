// ==UserScript==
// @name         My Bid
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.tampermonkey.net/index.php?version=4.11.6117&ext=fire&updated=true
// @grant        none
// ==/UserScript==


window.addEventListener('load', function () {

    function rafAsync() {
        return new Promise(resolve => {
            requestAnimationFrame(resolve); //faster than set time out
        });
    }

    function checkElement(selector) {
        if (document.querySelector(selector) === null) {
            return rafAsync().then(() => checkElement(selector));
        } else {
            return Promise.resolve(true);
        }
    }

    function getTimeLeft(timeLeftStr) {
        let timeLeft = null;
        if (timeLeftStr.match(/(\d{1,2})\sday/) != null) {
            timeLeft = timeLeftStr.match(/(\d{1,2})\sday/)[1] * 24 * 60 * 60 + timeLeftStr.match(/(\d{1,2})\shour/)[1] * 60 * 60;
        } else if (timeLeftStr.match(/(\d{1,2})h/) != null) {
            timeLeft = timeLeftStr.match(/(\d{1,2})h/)[1] * 60 * 60 + timeLeftStr.match(/(\d{1,2})m/)[1] * 60 + timeLeftStr.match(/(\d{1,2})s/)[1] * 1;
        }
        return timeLeft;
    }

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
            bidBtn.click();
        }
    }


    function checkTime() {
        const timeLeftNum = getTimeLeft(document.getElementById("vi-cdown_timeLeft").innerText);
        const MyBidTime = document.getElementById("MyBidTime").value;
        if (MyBidTime < timeLeftNum) {
            return rafAsync().then(() => checkTime());
        } else {
            console.log('Done!');
            return Promise.resolve(true);
        }
    }

    function PutMyBid() {
        console.log('PutBid ');
        document.getElementById("MyBidBtn").disabled = true;
        return checkTime()
            .then(() => {
            MyBid();
        });
    }

    function OnConfirm() {
        console.log("bidBtn");
        checkElement('#confirm_button') //use whichever selector you want
            .then((element) => {
            const confirmBtn = document.getElementById("confirm_button");
            console.info(confirmBtn.innerText);
            //confirmBtn.click();
        });
    }

    document.getElementById("bidBtn_btn").addEventListener("click", OnConfirm);
    document.getElementById("MyBidBtn").addEventListener("click", PutMyBid);
    console.info('1!!!!');
});


var div = document.createElement('div');
div.innerHTML = '<div class="timeLeft"><input id="MyBidTime" class="notranslate MaxBidClass" type="text" autocomplete="off" size="5" maxlength="10" name="timebid" value="" aria-label="Time Bid"></div><div class="bidAmt">Bid Time, s</div><button id="MyBidBtn">Bid</button> ';
document.querySelector('div.vi-price').appendChild(div);
