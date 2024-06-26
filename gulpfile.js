import browserSync from "browser-sync"
import del from "del"
import fs from "fs"
import { dest, parallel, series, src, watch } from "gulp"
import autoprefixer from "gulp-autoprefixer"
import cleanCSS from "gulp-clean-css"
import fileinclude from "gulp-file-include"
import groupCssMediaQueries from "gulp-group-css-media-queries"
import gulpIf from "gulp-if"
import imagemin from "gulp-imagemin"
import newer from "gulp-newer"
import notify from "gulp-notify"
import plumber from "gulp-plumber"
import rename from "gulp-rename"
import replace from "gulp-replace"
import gulpSass from "gulp-sass"
import sassGlob from "gulp-sass-glob"
import svgSprite from "gulp-svg-sprite"
import svgmin from "gulp-svgmin"
import webp from "gulp-webp"
import webpcss from "gulp-webpcss"
import zip from "gulp-zip"
import * as nodePath from "path"
import dartSass from "sass"
import webpackStream from "webpack-stream"
import versionNumber from "gulp-version-number" // Добавлен импорт версии

const rootFolder = nodePath.basename(nodePath.resolve())

const sass = gulpSass(dartSass)

const srcPath = "src/"
const distPath = "dist/"

const path = {
	build: {
		html: distPath,
		js: distPath + "assets/templates/js/",
		css: distPath + "assets/templates/css/",
		images: distPath + "assets/templates/img/",
		fonts: distPath + "assets/templates/fonts/",
		resources: distPath + "/",
		svgicons: distPath + "assets/templates/img/",
	},
	src: {
		html: srcPath + "*.html",
		js: srcPath + "assets/templates/js/main.js",
		css: srcPath + "assets/templates/styles/scss/main.scss",
		images: srcPath + "assets/templates/img/**/*.{jpg,png,svg,gif,ico}",
		webp: srcPath + "assets/templates/img/**/*.webp",
		fonts: srcPath + "assets/templates/fonts/**/*.{woff,woff2}",
		resources: srcPath + "assets/templates/resources/**/*.*",
		svgicons: srcPath + "assets/templates/svgicons/*.svg",
	},
	watch: {
		html: srcPath + "**/*.html",
		js: srcPath + "assets/templates/js/**/*.js",
		css: srcPath + "assets/templates/styles/scss/**/*.scss",
		images:
			srcPath +
			"assets/templates/img/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
		fonts: srcPath + "assets/templates/fonts/**/*.{woff,woff2}",
		resources: srcPath + "assets/templates/resources/**/*.*",
		svgicons: srcPath + "assets/templates/svgicons/*.svg",
	},
	clean: "./" + distPath,
}
let isProd = false

function server() {
	browserSync.init({
		server: {
			baseDir: "./" + distPath,
		},
		notify: false,
		online: true,
		port: 3000,
	})
}

function html() {
	return src(path.src.html)
		.pipe(plumber())
		.pipe(fileinclude())
		.pipe(replace(/@img\//g, "assets/templates/img/"))
		.pipe(
			gulpIf(
				isProd,
				versionNumber({
					value: "%DT%",
					append: {
						key: "_v",
						cover: 0,
						to: ["css", "js"],
					},
					output: {
						file: "version.json",
					},
				})
			)
		)
		.pipe(dest(path.build.html))
		.pipe(browserSync.stream())
}

function css() {
	return src(path.src.css, { sourcemaps: !isProd })
		.pipe(
			plumber({
				errorHandler: function (err) {
					notify.onError({
						title: "SCSS Error",
						message: "Error: <%= error.message %>",
					})(err)
					this.emit("end")
				},
			})
		)
		.pipe(sassGlob())
		.pipe(sass())
		.pipe(replace(/@img\//g, "../img/"))
		.pipe(gulpIf(isProd, groupCssMediaQueries()))
		.pipe(
			webpcss({
				webpClass: ".webp",
				noWebpClass: ".no-webp",
			})
		)

		.pipe(
			gulpIf(
				isProd,
				autoprefixer({ overrideBrowserslist: ["last 10 versions"], grid: true })
			)
		)
		.pipe(cleanCSS({ level: 2 }))
		.pipe(rename({ suffix: ".min" }))
		.pipe(dest(path.build.css, { sourcemaps: !isProd }))
		.pipe(browserSync.stream())
}

function js() {
	return src(path.src.js)
		.pipe(
			plumber({
				errorHandler: function (err) {
					notify.onError({
						title: "JS Error",
						message: "Error: <%= error.message %>",
					})(err)
					this.emit("end")
				},
			})
		)
		.pipe(
			webpackStream({
				mode: isProd ? "production" : "development",
				output: {
					filename: "main.min.js",
				},
				module: {
					rules: [
						{
							test: /\.m?js$/,
							exclude: /node_modules/,
							use: {
								loader: "babel-loader",
								options: {
									presets: [
										[
											"@babel/preset-env",
											{
												targets: "> 0.5%, last 2 versions, not dead",
											},
										],
									],
								},
							},
						},
					],
				},
				devtool: !isProd ? "source-map" : false,
			})
		)
		.on("error", function (err) {
			console.error("WEBPACK ERROR", err)
			this.emit("end")
		})
		.pipe(dest(path.build.js))
		.pipe(browserSync.stream())
}

function images() {
	return src(path.src.images, { encoding: false })
		.pipe(newer(path.build.images, { encoding: false }))
		.pipe(webp())
		.pipe(dest(path.build.images, { encoding: false }))
		.pipe(src(path.src.images, { encoding: false }))
		.pipe(newer(path.build.images, { encoding: false }))
		.pipe(
			gulpIf(
				isProd,
				imagemin({
					progressive: true,
					svgoPlugins: [{ removeViewBox: false }],
					interlaced: true,
					optimizationLevel: 3, // 0 to 7
				})
			)
		)
		.pipe(dest(path.build.images, { encoding: false }))
		.pipe(browserSync.stream())
}

function fonts() {
	return src(path.src.fonts)
		.pipe(dest(path.build.fonts))
		.pipe(browserSync.stream())
}

function fontStyle() {
	let fontsFile = `${srcPath}assets/templates/styles/scss/fonts.scss`
	fs.readdir(path.build.fonts, function (err, fontsFiles) {
		if (fontsFiles) {
			if (!fs.existsSync(fontsFile)) {
				// Если файла нет, создаем его
				fs.writeFile(fontsFile, "", cb)
				let newFileOnly
				for (var i = 0; i < fontsFiles.length; i++) {
					let fontFileName = fontsFiles[i].split(".")[0]
					if (newFileOnly !== fontFileName) {
						let fontName = fontFileName.split("-")[0]
							? fontFileName.split("-")[0]
							: fontFileName
						let fontWeight = fontFileName.split("-")[1]
							? fontFileName.split("-")[1]
							: fontFileName

						if (fontWeight.toLowerCase() === "thin") {
							fontWeight = 100
						} else if (fontWeight.toLowerCase() === "extralight") {
							fontWeight = 200
						} else if (fontWeight.toLowerCase() === "light") {
							fontWeight = 300
						} else if (fontWeight.toLowerCase() === "medium") {
							fontWeight = 500
						} else if (fontWeight.toLowerCase() === "semibold") {
							fontWeight = 600
						} else if (fontWeight.toLowerCase() === "bold") {
							fontWeight = 700
						} else if (
							fontWeight.toLowerCase() === "extrabold" ||
							fontWeight.toLowerCase() === "heavy"
						) {
							fontWeight = 800
						} else if (fontWeight.toLowerCase() === "black") {
							fontWeight = 900
						} else {
							fontWeight = 400
						}

						fs.appendFile(
							fontsFile,
							`@font-face {
                                font-family: ${fontName};
                                font-display: swap;
                                src: url("../fonts/${fontFileName}.woff2") format("woff2"),
                                    url("../fonts/${fontFileName}.woff") format("woff");
                                font-weight: ${fontWeight};
                                font-style: normal;
                            }\r\n`,
							cb
						)
						newFileOnly = fontFileName
					}
				}
			}
		}
	})

	return src(`${srcPath}`)
	function cb() {}
}

function svgSprites() {
	return src(path.src.svgicons)
		.pipe(
			svgmin({
				js2svg: {
					pretty: true,
				},
			})
		)

		.pipe(
			svgSprite({
				mode: {
					stack: {
						sprite: "../sprite.svg",
					},
				},
			})
		)
		.pipe(dest(path.build.svgicons))
		.pipe(browserSync.stream())
}

function resources() {
	return src(path.src.resources)
		.pipe(dest(path.build.resources))
		.pipe(browserSync.stream())
}

function clean() {
	return del(path.clean)
}
function toProd(done) {
	isProd = true
	done()
}

function startWatch() {
	watch([path.watch.html], html)
	watch([path.watch.css], css)
	watch([path.watch.js], js)
	watch([path.watch.images], images)
	watch([path.watch.fonts], fonts)
	watch([path.watch.svgicons], svgSprites)
	watch([path.watch.resources], resources)
}

export {
	clean,
	css,
	fonts,
	html,
	images,
	js,
	resources,
	server,
	startWatch,
	svgSprites,
}

export default series(
	clean,
	html,
	css,
	js,
	images,
	fonts,
	fontStyle,
	resources,
	svgSprites,
	parallel(startWatch, server)
)
export let build = series(
	toProd,
	clean,
	html,
	css,
	js,
	images,
	fonts,
	fontStyle,
	resources,
	svgSprites
)

function zipFiles() {
	del.sync("./" + rootFolder + ".zip")
	return src(distPath + "/**/*.*", {})
		.pipe(zip(rootFolder + ".zip"))
		.pipe(dest("./"))
}
export { zipFiles }
