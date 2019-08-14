const puppeteer = require('puppeteer');

async function start() {
    let args = process.argv.slice(2);
    let address = "ban_1pms431ob9qt87ar5wmxzt1kp5qxaax7kjduwtr8ihzu1f4dp3r4i4yh14ht"
    let threads = 6
    if(args.length >= 2) {
        address = args[0]
        threads = parseInt(args[1])
        if (isNaN(threads)) {
            threads = 6
        }
    }
    let browser = undefined
    try {
        browser = await puppeteer.launch({
            ignoreHTTPSErrors : true,
            // headless : false,
            args : ['--no-sandbox', '--disable-setuid-sandbox', '--disable-popup-blocking']
        });
        const page = await browser.newPage();
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        await page.goto("https://powerplant.banano.cc/?r=11878")
        await page.waitFor(2000)

        const addressEle = await page.$("input[name='address']")
        await addressEle.type(address, {delay: 10})
        await addressEle.type(String.fromCharCode(13));
        await page.waitFor(5000)

        let currThreadEle = await page.$("#web_threads")
        let t = parseInt(await page.evaluate(element => element.textContent, currThreadEle))

        if(!isNaN(t)) {
            console.log(t, threads)
            if (t > threads) {
                for(let i = 0; i < t - threads; i++) {
                    let btn = await page.$("input[onclick='web_decrease_threads()']")
                    await btn.click()
                    await page.waitFor(1000)
                }
            }else if (t < threads) {
                for(let i = 0; i < threads - t; i++) {
                    let btn = await page.$("input[onclick='web_increase_threads()']")
                    await btn.click()
                    await page.waitFor(1000)
                }
            }
        }

        await page.waitFor(2000)
        let btn = await page.$("input[onclick='web_client.start();']")
        await btn.click()
    }catch (e) {
        try {
            await browser.close()
        }catch (e) {
        }
        await start()
    }

}

start()