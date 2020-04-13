const puppeteer = require("puppeteer")
const readline = require("readline")
const { green, magenta, red } = require("chalk")

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
})

rl.question(`${green("Please paste what text you'd like to plagiarize:")} \n`, async (text) => {
	try {
		/*
			Could use any request stdlib/package to fetch the response directly from the API (`https://quillbot.com/api/`)

		*/


		const inputSelector = "textarea.input-text"
		const sliderSelector = ".strength-slider"
		const buttonSelector = ".paraphrase-btn"
		const outputSelector = "div.output-container"

		if (text.length > 180){
			console.log(red("Truncating text since longer than 180, abort manually if truncation is unwished for"))
			text = text.slice(0, 177).concat("...")
		}

		const browser = await puppeteer.launch()

		const page = await browser.newPage()
		await page.goto("https://quillbot.com/")

		// Input the text in the text area
		await page.evaluate((value, selector) => document.querySelector(selector).value = value, text, inputSelector)

		// Set quill value to 5
		await page.evaluate((value, selector) => document.querySelector(selector).value = value, "5", sliderSelector)

		// Generate the result
		await page.click(buttonSelector)

		// Fetch the plagiarized value
		await page.waitForSelector(".word-seg")
		const plagiarizedResult = await page.evaluate(selector => {
			return Promise.resolve(
				Array.from(document.querySelector(selector).children)
					.filter(curr => curr.nodeName === "SPAN")
					.filter(curr => !Array.from(curr.classList).includes("punc-seg"))
					.map(curr => curr.innerText)
					.join(" ")
					.concat(".")
			)
		}, outputSelector)

		// Display result
		console.log(`\n${green("This was the result:")}\n${magenta(plagiarizedResult)}`)

		// Cleanup
		rl.close()
		browser.close()
	} catch (error) {
		console.log(`Error: ${error}`)
		process.exit(1)
	}
})