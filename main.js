const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');

const pdfkit = require('pdfkit');
const fs = require('fs');

// const link = "https://www.youtube.com/playlist?list=PLFrw0PP8_HYjTmj3ywvBg9uNAbK0yTEXA"
const link = "https://www.youtube.com/playlist?list=PL6QREj8te1P6wX9m5KnicnDVEucbOPsqR"

let cTab 

console.log("ha ho raha h chalu");

(async function (){
    try {
        let browserOpen = puppeteer.launch({
            headless : false,
            defaultViewport : null,
            args : ['--start-maximized']
        })
        let browserInstance = await browserOpen;
        let alltabs = await browserInstance.pages();
        cTab = alltabs[0];
        await cTab.goto(link);
        await cTab.waitForSelector('.style-scope.yt-dynamic-sizing-formatted-string.yt-sans-28');
        let name =await cTab.evaluate(function(select){return document.querySelector(select).innerText}, '.style-scope.yt-dynamic-sizing-formatted-string.yt-sans-28')
        console.log(name);

        let allData = cTab.evaluate(getData, '.byline-item.style-scope.ytd-playlist-byline-renderer');
        console.log( (await allData).noOfVids, ",", (await allData).noOfViews ,",", (await allData).lastUpdate );

        let totalVideos = (await allData).noOfVids.split(" ")[0];
        console.log(totalVideos);

        let currentVideos = await getCVidLength();
        console.log(currentVideos);

        while(totalVideos - currentVideos > 20){
            await scrollToBottom();
            currentVideos = await getCVidLength();
        }

        let getList = await getStats();
        console.log(getList);

        let pdfDoc = new pdfkit;
        pdfDoc.pipe(fs.createWriteStream('playList3.pdf'));
        pdfDoc.text(JSON.stringify(getlist));
        pdfDoc.end();
        
    } catch(error){

    }
})()
console.log("ha ho gaya band");

function getData(selector){
    let allElements = document.querySelectorAll(selector);
    let noOfVids = allElements[0].innerText;
    let noOfViews = allElements[1].innerText;
    let lastUpdate = allElements[2].innerText;

    return{
        noOfVids,
        noOfViews,
        lastUpdate
    }
}

async function getCVidLength(){
    let length = await cTab.evaluate(getLength, '#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer');
    return length;
}


async function scrollToBottom (){
    await cTab.evaluate(goToBottom)
    function goToBottom(){
        window.scrollBy(0, window.length);
    }
}


async function getStats (){
    let list = cTab.evaluate(getNamenDuration, '#video-title', 'span.style-scope.ytd-thumbnail-overlay-time-status-renderer')
    return list;
}



function getLength (durationSelect){
    let durationElement = document.querySelectorAll(durationSelect);
    return durationElement.length;
}


function getNamenDuration(videoSelector, durationSelector){
    let videoElement = document.querySelectorAll(videoSelector)
    let durationElem = document.querySelectorAll(durationSelector)

    let currentList = [];

    for(let i =0; i<durationElem.length; i++){
        let videoTitle = "Video Title : "+videoElement[i].innerText;
        let duration = "Duration : "+durationElem[i].innerText;
        currentList.push(videoTitle, duration);
    }

    return currentList;
}
